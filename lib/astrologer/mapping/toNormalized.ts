// lib/astrologer/mapping/toNormalized.ts
import { type BirthData } from '@/schemas/astro.schema';
import { db } from '@/db/drizzle';
import { astrologySystems } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Extend BirthData type to include additional properties
type ExtendedBirthData = BirthData & {
  houses_system_identifier?: string;
  perspective_type?: string;
  sidereal_mode?: string | null;
};

export async function toNormalizedData(
  birthData: ExtendedBirthData,
  profileId: string,
  userId: string,
  birthPlaceId: string | null = null // Make birthPlaceId optional and default to null
) {
  const systemKey = 'placidus';

  const system = await db
    .select({ id: astrologySystems.id })
    .from(astrologySystems)
    .where(eq(astrologySystems.key, systemKey))
    .limit(1);

  let systemId: number | undefined = system[0]?.id;
  if (!systemId) {
    // Try to create the default system if it's missing (idempotent behavior)
    try {
      const inserted = await db
        .insert(astrologySystems)
        .values({ key: 'placidus', name: 'Placidus' })
        .returning({ id: astrologySystems.id });
      systemId = inserted[0]?.id;
    } catch {
      // If a race or unique constraint happens, re-read
      const reread = await db
        .select({ id: astrologySystems.id })
        .from(astrologySystems)
        .where(eq(astrologySystems.key, systemKey))
        .limit(1);
      systemId = reread[0]?.id;
    }
  }

  if (!systemId) throw new Error('Astrology system not found');

  const natalChart = {
    profileId,
    ownerUserId: userId,
    subjectName: birthData.name,
    subjectBirthDate: new Date(birthData.year, birthData.month - 1, birthData.day),
    subjectBirthTime: `${birthData.hour.toString().padStart(2, '0')}:${birthData.minute
      .toString()
      .padStart(2, '0')}` as string,
    // Only include birthPlaceId if it's a valid string
    subjectBirthPlaceId: birthPlaceId || undefined,
    systemId,
    zodiacType: birthData.zodiac_type === 'Tropic' ? 'Tropical' : 'Sidereal',
    housesSystem:
      birthData.houses_system_identifier === 'P'
        ? 'Placidus'
        : birthData.houses_system_identifier || 'Placidus',
    perspectiveType: birthData.perspective_type || 'Apparent Geocentric',
    siderealMode: birthData.sidereal_mode ?? null,
    sunSign: birthData.sun.sign,
    ascendant: birthData.asc.sign,
    moonSign: birthData.moon.sign,
    calculatedAt: new Date(),
    calculationProvider: 'astrologer-api',
  } as const;

  const planetKeys = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'chiron',
  ] as const;

  const planets = planetKeys
    .filter((key) => birthData[key as keyof BirthData])
    .map((key) => {
      const p = birthData[key as keyof BirthData];
      if (!p || typeof p !== 'object' || !('name' in p)) {
        throw new Error(`Invalid planet data for key: ${key}`);
      }
      const houseNum = p.house ? parseInt(String(p.house).replace('House_', '')) : 0;
      return {
        planetName: p.name,
        sign: p.sign,
        position: p.position,
        absPosition: p.abs_pos,
        house: Number.isFinite(houseNum) ? houseNum : 0,
        element: p.element,
        quality: p.quality,
        retrograde: Boolean(p.retrograde),
        emoji: p.emoji,
      };
    });

  const houseKeys = [
    'first_house',
    'second_house',
    'third_house',
    'fourth_house',
    'fifth_house',
    'sixth_house',
    'seventh_house',
    'eighth_house',
    'ninth_house',
    'tenth_house',
    'eleventh_house',
    'twelfth_house',
  ] as const;

  const houses = houseKeys.map((key, i) => {
    const h = birthData[key as keyof BirthData];
    if (!h || typeof h !== 'object' || !('name' in h)) {
      throw new Error(`Invalid house data for key: ${key}`);
    }
    return {
      houseNumber: i + 1,
      sign: h.sign,
      cuspPosition: h.position,
      emoji: h.emoji,
    };
  });

  const lunarPhase = birthData.lunar_phase
    ? {
        degreesBetweenSunMoon: birthData.lunar_phase.degrees_between_s_m,
        moonPhase: birthData.lunar_phase.moon_phase,
        sunPhase: birthData.lunar_phase.sun_phase,
        moonEmoji: birthData.lunar_phase.moon_emoji,
        moonPhaseName: birthData.lunar_phase.moon_phase_name,
      }
    : null;

  return { natalChart, planets, houses, lunarPhase };
}
