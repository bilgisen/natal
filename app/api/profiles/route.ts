// api/profiles/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { profiles, birthPlaces, astrologicalData } from '@/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { createNormalizedNatalChart } from '@/lib/astrologer';
import { calculateBirthTimeStamps } from '@/lib/astrology/timeUtils'; // Updated import for time calculation utility

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

// Helper to get the current user session
async function getCurrentSession() {
  const cookie = (await headers()).get('cookie') || '';
  const session: Session = await auth.api.getSession({
    headers: new Headers({ 'cookie': cookie })
  });
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function GET() {
  try {
    const session = await getCurrentSession();
    
    // Sort by creation date in descending order (newest first)
    const userProfiles = await db.query.profiles.findMany({
      where: eq(profiles.userId, session.user.id),
      with: {
        birthPlace: true
      },
      orderBy: [desc(profiles.createdAt)]
    });

    return NextResponse.json(userProfiles);
  } catch (error: unknown) {
    console.error('Error fetching profiles:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const data = await request.json();
    
    if (!data.birthPlaceData) {
      return NextResponse.json(
        { error: 'Birth place data is required' },
        { status: 400 }
      );
    }

    // Check if birth place already exists
    let birthPlaceId: string;
    const existingPlace = await db.query.birthPlaces.findFirst({
      where: and(
        eq(birthPlaces.city, data.birthPlaceData.city),
        eq(birthPlaces.country, data.birthPlaceData.country)
      )
    });

    if (existingPlace) {
      birthPlaceId = existingPlace.id;
    } else {
      const [newPlace] = await db
        .insert(birthPlaces)
        .values({
          city: data.birthPlaceData.city,
          country: data.birthPlaceData.country,
          lat: data.birthPlaceData.lat.toString(),
          lon: data.birthPlaceData.lng.toString(),
          tz: data.birthPlaceData.tz || 'UTC',
        })
        .returning();
      birthPlaceId = newPlace.id;
    }

    // Create profile
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: session.user.id,
        displayName: data.displayName || null,
        birthDate: data.birthDate,
        birthTime: data.birthTime || '00:00',
        birthPlaceId,
        gender: data.gender || null,
        profileCategory: data.profileCategory || 'self',
        timezone: data.birthPlaceData?.tz || 'UTC',
      })
      .returning();

    // Get astrological data if birth place data is available
    try {
      if (data.birthPlaceData) {
        const result = await createNormalizedNatalChart(
          {
            subjectName: data.displayName || 'User',
            subjectBirthDate: new Date(data.birthDate),
            subjectBirthTime: data.birthTime || '00:00',
            subjectBirthPlace: `${data.birthPlaceData.city}, ${data.birthPlaceData.country}`,
            subjectBirthPlaceData: {
              city: data.birthPlaceData.city,
              country: data.birthPlaceData.country,
              lat: parseFloat(data.birthPlaceData.lat),
              lng: parseFloat(data.birthPlaceData.lng),
              tz: data.birthPlaceData.tz || 'UTC',
            },
            systemId: 1,
            zodiacType: 'Tropical',
            housesSystem: 'Placidus',
            perspectiveType: 'Apparent Geocentric',
          },
          session.user.id,
          birthPlaceId,
          newProfile.id
        );

        // Store snapshot for UI compatibility (ProfilePage reads profile.astrologicalData)
        if (result?.birthData) {
          const bd = result.birthData as Record<string, unknown>;

          // Calculate proper time values instead of using external API values
          const timeStamps = calculateBirthTimeStamps(
            new Date(data.birthDate),
            data.birthTime || '00:00',
            data.birthPlaceData.tz || 'UTC'
          );

          await db.insert(astrologicalData).values({
            profileId: newProfile.id,
            chartData: {
              // core fields
              name: bd.name,
              year: bd.year,
              month: bd.month,
              day: bd.day,
              hour: bd.hour,
              minute: bd.minute,
              city: bd.city,
              nation: bd.nation,
              lng: bd.lng,
              lat: bd.lat,
              tz_str: bd.tz_str,
              zodiac_type: bd.zodiac_type,
              local_time: timeStamps.localTime, // Use calculated value
              utc_time: timeStamps.utcTime,     // Use calculated value
              julian_day: timeStamps.julianDay, // Use calculated value
              // planets
              sun: bd.sun,
              moon: bd.moon,
              mercury: bd.mercury,
              venus: bd.venus,
              mars: bd.mars,
              jupiter: bd.jupiter,
              saturn: bd.saturn,
              uranus: bd.uranus,
              neptune: bd.neptune,
              pluto: bd.pluto,
              chiron: bd.chiron,
              // points
              asc: bd.asc,
              dsc: bd.dsc,
              mc: bd.mc,
              ic: bd.ic,
              // houses
              first_house: bd.first_house,
              second_house: bd.second_house,
              third_house: bd.third_house,
              fourth_house: bd.fourth_house,
              fifth_house: bd.fifth_house,
              sixth_house: bd.sixth_house,
              seventh_house: bd.seventh_house,
              eighth_house: bd.eighth_house,
              ninth_house: bd.ninth_house,
              tenth_house: bd.tenth_house,
              eleventh_house: bd.eleventh_house,
              twelfth_house: bd.twelfth_house,
              // nodes
              mean_node: bd.mean_node,
              true_node: bd.true_node,
              // lunar phase
              lunar_phase: bd.lunar_phase,
            },
            rawData: bd,
          });
        }
      }
    } catch (error) {
      console.error('Error getting astrological data:', error);
      // Continue with profile creation even if astro API fails
    }

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating profile:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: 'A profile with these details already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
