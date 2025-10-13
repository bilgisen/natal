'use server';

import { db } from '@/lib/server-db';
import { birthPlaces } from '@/db/schema';

export async function saveBirthPlace({
  userId,
  city,
  country,
  lat,
  lng,
  tz
}: {
  userId: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
}) {
  // Server-side validation
  if (!userId || !city || !country || !tz) {
    throw new Error('Missing required parameters for birth place');
  }

  // Create or find existing birth place
  const [birthPlace] = await db
    .insert(birthPlaces)
    .values({
      country,
      city,
      lat: lat.toString(),
      lon: lng.toString(),
      tz,
    })
    .onConflictDoUpdate({
      target: [birthPlaces.city, birthPlaces.country],
      set: {
        lat: lat.toString(),
        lon: lng.toString(),
        tz,
      },
    })
    .returning({ id: birthPlaces.id });

  return { id: birthPlace.id };
}