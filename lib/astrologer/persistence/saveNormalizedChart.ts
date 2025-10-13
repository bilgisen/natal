// lib/astrologer/persistence/saveNormalizedChart.ts
import { db } from '@/db/drizzle';
import { natalCharts, astroPlanets, astroHouses, lunarPhases } from '@/db/schema';

export async function saveNormalizedChart({
  natalChart,
  planets,
  houses,
  lunarPhase,
}: {
  natalChart: {
    profileId: string;
    ownerUserId: string;
    subjectName: string;
    subjectBirthDate: Date;
    subjectBirthTime: string;
    subjectBirthPlaceId?: string;
    systemId: number;
    zodiacType: string;
    housesSystem: string;
    perspectiveType: string;
    siderealMode: string | null;
    sunSign: string;
    ascendant: string;
    moonSign: string;
    calculatedAt: Date;
    calculationProvider: string;
  };
  planets: {
    planetName: string;
    sign: string;
    position: number;
    absPosition: number;
    house: number;
    element: string;
    quality: string;
    retrograde: boolean;
    emoji: string;
  }[];
  houses: {
    houseNumber: number;
    sign: string;
    cuspPosition: number;
    emoji: string;
  }[];
  lunarPhase: {
    degreesBetweenSunMoon: number;
    moonPhase: number;
    sunPhase: number;
    moonEmoji: string;
    moonPhaseName: string;
  } | null;
}) {
  const [chart] = await db
    .insert(natalCharts)
    .values(natalChart)
    .returning({ id: natalCharts.id });

  if (planets && planets.length > 0) {
    await db.insert(astroPlanets).values(
      planets.map((p) => ({ ...p, natalChartId: chart.id }))
    );
  }

  if (houses && houses.length > 0) {
    await db.insert(astroHouses).values(
      houses.map((h) => ({ ...h, natalChartId: chart.id }))
    );
  }

  if (lunarPhase) {
    await db.insert(lunarPhases).values({
      ...lunarPhase,
      natalChartId: chart.id,
    });
  }

  return chart.id;
}
