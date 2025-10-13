// lib/astrologer/mapping/toBirthData.ts
import { birthDataSchema } from '@/schemas/astro.schema';
import type { BirthDataResponse, CelestialBody, House } from '../api/types';

export function toBirthData(rawApiResponse: BirthDataResponse | { data: BirthDataResponse['data'] }) {
  let birthData: BirthDataResponse['data'] = rawApiResponse as unknown as BirthDataResponse['data'];
  if (rawApiResponse && typeof rawApiResponse === 'object' && 'data' in rawApiResponse) {
    birthData = (rawApiResponse as BirthDataResponse).data;
  }

  const formatted = {
    name: birthData.name || '',
    year: birthData.year || new Date().getFullYear(),
    month: birthData.month || 1,
    day: birthData.day || 1,
    hour: birthData.hour || 0,
    minute: birthData.minute || 0,
    city: birthData.city || '',
    nation: birthData.nation || '',
    lng: birthData.lng || 0,
    lat: birthData.lat || 0,
    tz_str: birthData.tz_str || 'UTC',
    zodiac_type: birthData.zodiac_type || 'Tropic',
    local_time: birthData.local_time || 0,
    utc_time: birthData.utc_time || 0,
    julian_day: birthData.julian_day || 0,
    sun: birthData.sun,
    moon: birthData.moon,
    mercury: birthData.mercury,
    venus: birthData.venus,
    mars: birthData.mars,
    jupiter: birthData.jupiter,
    saturn: birthData.saturn,
    uranus: birthData.uranus,
    neptune: birthData.neptune,
    pluto: birthData.pluto,
    chiron: birthData.chiron,
    asc: birthData.asc || (birthData as { ascendant?: CelestialBody }).ascendant,
    dsc: birthData.dsc || (birthData as { descendant?: CelestialBody }).descendant,
    mc: birthData.mc || (birthData as { medium_coeli?: CelestialBody }).medium_coeli,
    ic: birthData.ic || (birthData as { imum_coeli?: CelestialBody }).imum_coeli,
    first_house: birthData.first_house || (birthData as { houses?: House[] }).houses?.[0],
    second_house: birthData.second_house || (birthData as { houses?: House[] }).houses?.[1],
    third_house: birthData.third_house || (birthData as { houses?: House[] }).houses?.[2],
    fourth_house: birthData.fourth_house || (birthData as { houses?: House[] }).houses?.[3],
    fifth_house: birthData.fifth_house || (birthData as { houses?: House[] }).houses?.[4],
    sixth_house: birthData.sixth_house || (birthData as { houses?: House[] }).houses?.[5],
    seventh_house: birthData.seventh_house || (birthData as { houses?: House[] }).houses?.[6],
    eighth_house: birthData.eighth_house || (birthData as { houses?: House[] }).houses?.[7],
    ninth_house: birthData.ninth_house || (birthData as { houses?: House[] }).houses?.[8],
    tenth_house: birthData.tenth_house || (birthData as { houses?: House[] }).houses?.[9],
    eleventh_house: birthData.eleventh_house || (birthData as { houses?: House[] }).houses?.[10],
    twelfth_house: birthData.twelfth_house || (birthData as { houses?: House[] }).houses?.[11],
    mean_node: birthData.mean_node,
    true_node: birthData.true_node,
    mean_south_node: (birthData as { mean_south_node?: CelestialBody }).mean_south_node,
    true_south_node: (birthData as { true_south_node?: CelestialBody }).true_south_node,
    lunar_phase: birthData.lunar_phase || {
      degrees_between_s_m: 0,
      moon_phase: 0,
      sun_phase: 0,
      moon_emoji: '🌑',
      moon_phase_name: 'New Moon',
    },
  };

  return birthDataSchema.parse(formatted);
}
