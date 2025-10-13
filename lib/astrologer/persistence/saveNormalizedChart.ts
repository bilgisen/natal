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
    subjectBirthDate: Date; // Expected as Date object initially
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
    calculatedAt: Date; // Expected as Date object initially
    calculationProvider: string;
  };
  planets: {
    planetName: string;
    sign: string;
    position: number; // Expected as number initially
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
    cuspPosition: number; // Expected as number initially
    emoji: string;
  }[];
  lunarPhase: {
    degreesBetweenSunMoon: number; // Expected as number initially
    moonPhase: number;
    sunPhase: number;
    moonEmoji: string;
    moonPhaseName: string;
  } | null;
}) {
  // Prepare the natal chart data, converting Date objects and numbers to the format expected by the DB schema
  // subjectBirthDate is converted to a string (YYYY-MM-DD)
  // calculatedAt is kept as a Date object (assuming the schema expects Date for timestamps)
  const chartData = {
    ...natalChart,
    subjectBirthDate: natalChart.subjectBirthDate.toISOString().split('T')[0],
    // Keep calculatedAt as a Date object for the database timestamp field
    // Do not convert to string here if the schema expects a Date object
    calculatedAt: natalChart.calculatedAt, // Pass the Date object directly
  };

  const [chart] = await db
    .insert(natalCharts)
    .values(chartData) // Pass the pre-processed data matching the schema
    .returning({ id: natalCharts.id });

  if (planets && planets.length > 0) {
    // Convert number fields to strings as required by the astroPlanets schema
    // Assuming 'position' and 'absPosition' are stored as strings in the DB.
    await db.insert(astroPlanets).values(
      planets.map((p) => ({
        natalChartId: chart.id, // Add the foreign key first
        planetName: p.planetName,
        sign: p.sign,
        position: p.position.toString(), // Convert number to string
        absPosition: p.absPosition.toString(), // Convert number to string
        house: p.house, // Keep as number if the schema expects a number, otherwise convert: p.house.toString()
        element: p.element,
        quality: p.quality,
        retrograde: p.retrograde,
        emoji: p.emoji,
      }))
    );
  }

  if (houses && houses.length > 0) {
    // Convert number fields to strings as required by the astroHouses schema
    // Assuming 'cuspPosition' is stored as a string in the DB.
    await db.insert(astroHouses).values(
      houses.map((h) => ({
        natalChartId: chart.id, // Add the foreign key first
        houseNumber: h.houseNumber, // Keep as number if the schema expects a number, otherwise convert
        sign: h.sign,
        cuspPosition: h.cuspPosition.toString(), // Convert number to string
        emoji: h.emoji,
      }))
    );
  }

  if (lunarPhase) {
    // Convert number fields to strings as required by the lunarPhases schema
    // Assuming 'degreesBetweenSunMoon', 'moonPhase', 'sunPhase' are stored as strings in the DB.
    await db.insert(lunarPhases).values({
      natalChartId: chart.id, // Add the foreign key first
      degreesBetweenSunMoon: lunarPhase.degreesBetweenSunMoon.toString(), // Convert number to string
      moonPhase: lunarPhase.moonPhase.toString(), // Convert number to string
      sunPhase: lunarPhase.sunPhase.toString(), // Convert number to string
      moonEmoji: lunarPhase.moonEmoji,
      moonPhaseName: lunarPhase.moonPhaseName,
    });
  }

  return chart.id;
}