import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { eq, and } from 'drizzle-orm';
import { profiles, birthPlaces } from '@/db/schema';
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
    const userId = session.user.id;

    // Find the profile to ensure it belongs to the user
    const profile = await db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.id, params.profileId),
        eq(profiles.userId, userId)
      ))
      .leftJoin(birthPlaces, eq(profiles.birthPlaceId, birthPlaces.id))
      .limit(1)
      .then(results => results[0]);

    if (!profile) {
      return new NextResponse('Profile not found', { status: 404 });
    }

    // Format birth date if it exists
    const formattedBirthDate = profile.profiles?.birthDate 
      ? new Date(profile.profiles.birthDate).toISOString().split('T')[0]
      : null;

    // Return the profile data with birth information
    return NextResponse.json({
      subjectName: profile.profiles?.displayName || '',
      subjectBirthDate: formattedBirthDate,
      subjectBirthTime: profile.profiles?.birthTime,
      subjectBirthPlaceData: profile.birth_places ? {
        city: profile.birth_places.city,
        country: profile.birth_places.country,
        lat: profile.birth_places.lat ? Number(profile.birth_places.lat) : null,
        lng: profile.birth_places.lon ? Number(profile.birth_places.lon) : null,
        tz: profile.birth_places.tz,
      } : null,
      userId: profile.profiles?.userId,
      birthPlaceId: profile.profiles?.birthPlaceId
    });

  } catch (error: unknown) {
    console.error('Error fetching birth data:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
