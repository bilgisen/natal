// lib/astrology/chartUtils.ts

// Interface for planet data in the chart
interface PlanetData {
  position: number;
  name?: string;
  quality?: string;
  element?: string;
  sign?: string;
  sign_num?: number;
  abs_pos?: number;
  emoji?: string;
  point_type?: string;
  house?: string;
  retrograde?: boolean;
  // Add other properties as needed
  [key: string]: unknown;
}

// Interface for house data in the chart
interface HouseData {
  position: number;
  name?: string;
  quality?: string;
  element?: string;
  sign?: string;
  sign_num?: number;
  emoji?: string;
  // Add other properties as needed
  [key: string]: unknown;
}

// Interface for the chart data structure
export interface ChartViewerData {
  // Planet data
  sun: PlanetData;
  moon: PlanetData;
  mercury: PlanetData;
  venus: PlanetData;
  mars: PlanetData;
  jupiter: PlanetData;
  saturn: PlanetData;
  uranus: PlanetData;
  neptune: PlanetData;
  pluto: PlanetData;
  chiron?: PlanetData;
  true_node?: PlanetData;
  mean_node?: PlanetData;
  // Points
  asc: PlanetData;
  dsc: PlanetData;
  mc: PlanetData;
  ic: PlanetData;
  // Houses
  first_house: HouseData;
  second_house: HouseData;
  third_house: HouseData;
  fourth_house: HouseData;
  fifth_house: HouseData;
  sixth_house: HouseData;
  seventh_house: HouseData;
  eighth_house: HouseData;
  ninth_house: HouseData;
  tenth_house: HouseData;
  eleventh_house: HouseData;
  twelfth_house: HouseData;
  // Add other properties as needed
  [key: string]: unknown;
}

// Interface for the chart data expected by AstroDraw
export interface AstroChartData {
  planets: Record<string, [number]>;
  cusps: number[];
  // Location data for display purposes
  city?: string;
  nation?: string;
  lat?: number;
  lng?: number;
  tz_str?: string;
  zodiac_type?: string;
  // Sign data for backward compatibility
  sun_sign?: string;
  moon_sign?: string;
  // Direct access properties for convenience
  sun?: { sign?: string; position?: number };
  moon?: { sign?: string; position?: number };
  asc?: { sign?: string; position?: number };
  birthData?: {
    name?: string;
    asc?: {
      name?: string;
      quality?: string;
      element?: string;
      sign?: string;
      sign_num?: number;
      position?: number;
      abs_pos?: number;
      emoji?: string;
      point_type?: string;
    };
    sun?: { sign?: string; position?: number };
    moon?: { sign?: string; position?: number };
    [key: string]: unknown;
  };
  houses?: Array<{
    houseNumber: number;
    sign: string;
    cuspPosition: number;
    emoji: string;
  }>;
  lunarPhase?: {
    degreesBetweenSunMoon: number;
    moonPhase: string;
    sunPhase: string;
    moonEmoji: string;
    moonPhaseName: string;
  } | null;
  // Time calculation data
  local_time?: number;
  utc_time?: number;
  julian_day?: number;
}

/**
 * Formats the chart data for AstroDraw
 * @param chartData The raw chart data from the API
 * @returns Formatted data for AstroDraw
 */
export function formatChartData(chartData: ChartViewerData): AstroChartData {
  // List of all planet keys we want to include in the chart
  const planetKeys = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'chiron', 'true_node', 'mean_node', 'north_node', 'south_node',
    'asc', 'mc', 'ic', 'dsc' // Include angles as well
  ];

  // Format planets data
  const planets = planetKeys.reduce<Record<string, [number]>>((acc, key) => {
    const planetData = chartData[key];
    if (planetData && typeof planetData === 'object' && 'position' in planetData) {
      // Ensure position is a number between 0 and 360
      let position = Number(planetData.position) % 360;
      if (position < 0) position += 360; // Ensure positive value
      acc[key] = [position];
    }
    return acc;
  }, {});

  // Extract house cusps (first 12 houses)
  const cusps = [
    chartData.first_house?.position || 0,
    chartData.second_house?.position || 0,
    chartData.third_house?.position || 0,
    chartData.fourth_house?.position || 0,
    chartData.fifth_house?.position || 0,
    chartData.sixth_house?.position || 0,
    chartData.seventh_house?.position || 0,
    chartData.eighth_house?.position || 0,
    chartData.ninth_house?.position || 0,
    chartData.tenth_house?.position || 0,
    chartData.eleventh_house?.position || 0,
    chartData.twelfth_house?.position || 0
  ].map(position => {
    // Ensure position is a number between 0 and 360
    let pos = Number(position) % 360;
    if (pos < 0) pos += 360;
    return pos;
  });

  return { planets, cusps };
}

/**
 * Validates if the chart data is in the expected format
 * @param data The data to validate
 * @returns true if the data is valid, false otherwise
 */
export function validateChartData(data: unknown): data is ChartViewerData {
  if (!data || typeof data !== 'object') return false;

  const chartData = data as Record<string, Record<string, unknown>>;

  // Check for required planet data
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  for (const planet of requiredPlanets) {
    const planetData = chartData[planet];
    if (!planetData || typeof planetData.position !== 'number') {
      console.warn(`Missing or invalid data for planet: ${planet}`);
      return false;
    }
  }

  // Check for required houses
  for (let i = 1; i <= 12; i++) {
    const houseKey = `${i === 1 ? 'first' : i === 2 ? 'second' : i === 3 ? 'third' :
                    i === 4 ? 'fourth' : i === 5 ? 'fifth' : i === 6 ? 'sixth' :
                    i === 7 ? 'seventh' : i === 8 ? 'eighth' : i === 9 ? 'ninth' :
                    i === 10 ? 'tenth' : i === 11 ? 'eleventh' : 'twelfth'}_house`;

    const houseData = chartData[houseKey];
    if (!houseData || typeof houseData.position !== 'number') {
      console.warn(`Missing or invalid data for house: ${houseKey}`);
      return false;
    }
  }

  return true;
}
