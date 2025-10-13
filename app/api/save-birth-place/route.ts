// app/api/save-birth-place/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { birthPlaces } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { city, country, lat, lng, tz } = await request.json();

    if (!city || !country || lat === undefined || lng === undefined || !tz) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if a birth place with the same city and country exists
    const existingBirthPlace = await db.query.birthPlaces.findFirst({
      where: and(
        eq(birthPlaces.city, city),
        eq(birthPlaces.country, country)
      )
    });

    const birthPlaceData = {
      city,
      country,
      lat: lat.toString(),
      lon: lng.toString(),
      tz,
      updatedAt: new Date(),
    };

    if (existingBirthPlace) {
      // Update existing record
      await db
        .update(birthPlaces)
        .set(birthPlaceData)
        .where(eq(birthPlaces.id, existingBirthPlace.id));
    } else {
      // Create new record
      await db.insert(birthPlaces).values(birthPlaceData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving birth place:', error);
    return NextResponse.json(
      { error: 'Failed to save birth place' },
      { status: 500 }
    );
  }
}
