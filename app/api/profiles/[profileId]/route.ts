import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb, type Database } from '@/lib/server-db';
import { profiles, birthPlaces } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';

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

export async function GET(
  request: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getCurrentSession();

    // Use (getDb() as Database).query.profiles with explicit typing if needed
    const profile = await (getDb() as Database).query.profiles.findFirst({
      where: and(
        eq(profiles.id, params.profileId),
        eq(profiles.userId, session.user.id)
      ),
      with: {
        birthPlace: true,
        astrologicalData: true,
      }
    }) as any;

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Ensure birthPlace is properly serialized
    const serializedProfile = {
      ...profile,
      birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : null,
      birthPlace: profile.birthPlace ? {
        id: (profile.birthPlace as any).id,
        city: (profile.birthPlace as any).city,
        country: (profile.birthPlace as any).country,
        lat: (profile.birthPlace as any).lat,
        lng: (profile.birthPlace as any).lon,
        tz: (profile.birthPlace as any).tz
      } : null,
      astrologicalData: profile.astrologicalData ? {
        chartData: (profile.astrologicalData as any).chartData,
        createdAt: (profile.astrologicalData as any).createdAt,
      } : null,
    };

    return NextResponse.json(serializedProfile);
  } catch (error: unknown) {
    console.error('Error fetching profile:', error);
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

// Handle both PUT and PATCH methods for updating profiles
async function handleUpdateProfile(
  request: Request,
  context: { params: Promise<{ profileId: string }> },
  isPatch: boolean = false
) {
  const params = await context.params;
  try {
    const session = await getCurrentSession();
    const data = await request.json();
    
    // Check if profile exists and belongs to user
    const existingProfile = await (getDb() as Database).query.profiles.findFirst({
      where: and(
        eq(profiles.id, params.profileId),
        eq(profiles.userId, session.user.id)
      )
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    let birthPlaceId = existingProfile.birthPlaceId;
    
    // Handle birth place updates if provided
    if (data.birthPlaceData) {
      const existingPlace = await (getDb() as Database).query.birthPlaces.findFirst({
        where: and(
          eq(birthPlaces.city, data.birthPlaceData.city),
          eq(birthPlaces.country, data.birthPlaceData.country)
        )
      });

      if (existingPlace) {
        birthPlaceId = (existingPlace as any).id;
      } else {
        const [newPlace] = await (getDb() as Database)
          .insert(birthPlaces)
          .values({
            city: data.birthPlaceData.city,
            country: data.birthPlaceData.country,
            lat: data.birthPlaceData.lat.toString(),
            lon: data.birthPlaceData.lng.toString(),
            tz: data.birthPlaceData.tz || 'UTC',
          })
          .returning();
        birthPlaceId = (newPlace as any).id;
      }
    }

    // Prepare update data
    const baseData = {
      displayName: data.displayName,
      birthDate: data.birthDate,
      birthTime: data.birthTime || '00:00',
      birthPlaceId,
      gender: data.gender,
      profileCategory: data.profileCategory || 'self',
      timezone: data.birthPlaceData?.tz || 'UTC',
      updatedAt: new Date()
    };

    // For PATCH, only include provided fields
    const updateData = isPatch 
      ? Object.fromEntries(
          Object.entries(baseData).filter(([, v]) => v !== undefined)
        )
      : baseData;

    // Update the profile
    await (getDb() as Database)
      .update(profiles)
      .set(updateData)
      .where(
        and(
          eq(profiles.id, params.profileId),
          eq(profiles.userId, session.user.id)
        )
      );

    // Get the updated profile with relations
    const updatedProfileWithRelations = await (getDb() as Database).query.profiles.findFirst({
      where: eq(profiles.id, params.profileId),
      with: {
        birthPlace: true,
        astrologicalData: true
      }
    });

    if (!updatedProfileWithRelations) {
      throw new Error('Failed to fetch updated profile');
    }

    // Ensure proper serialization
    const serializedProfile = {
      ...updatedProfileWithRelations,
      birthDate: updatedProfileWithRelations.birthDate 
        ? new Date(updatedProfileWithRelations.birthDate).toISOString().split('T')[0] 
        : null,
      birthPlace: updatedProfileWithRelations.birthPlace ? {
        id: (updatedProfileWithRelations.birthPlace as any).id,
        city: (updatedProfileWithRelations.birthPlace as any).city,
        country: (updatedProfileWithRelations.birthPlace as any).country,
        lat: (updatedProfileWithRelations.birthPlace as any).lat,
        lng: (updatedProfileWithRelations.birthPlace as any).lon,
        tz: (updatedProfileWithRelations.birthPlace as any).tz
      } : null,
      astrologicalData: updatedProfileWithRelations.astrologicalData ? {
        chartData: (updatedProfileWithRelations.astrologicalData as any).chartData,
        createdAt: (updatedProfileWithRelations.astrologicalData as any).createdAt,
      } : null
    };

    return NextResponse.json(serializedProfile);
  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  return handleUpdateProfile(request, context, false);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  return handleUpdateProfile(request, context, true);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  const params = await context.params;
  try {
    const session = await getCurrentSession();

    // Check if profile exists and belongs to user
    const existingProfile = await (getDb() as Database).query.profiles.findFirst({
      where: and(
        eq(profiles.id, params.profileId),
        eq(profiles.userId, session.user.id)
      )
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Delete the profile
    await (getDb() as Database)
      .delete(profiles)
      .where(eq(profiles.id, params.profileId));

    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    console.error('Error deleting profile:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}