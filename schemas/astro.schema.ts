// schemas/astro.schema.ts
import { z } from 'zod';

// Point schema per API response (planets, points, houses)
export const astroPointSchema = z.object({
  name: z.string(),
  quality: z.string(),
  element: z.string(),
  sign: z.string(),
  sign_num: z.number(),
  position: z.number(),
  abs_pos: z.number(),
  emoji: z.string(),
  point_type: z.string(),
  house: z.string().nullable().optional(), // Houses have null for this field
  retrograde: z.boolean().nullable().optional(), // Houses have null for this field
});

// Lunar phase schema
export const lunarPhaseSchema = z.object({
  degrees_between_s_m: z.number(),
  moon_phase: z.number(),
  sun_phase: z.number(),
  moon_emoji: z.string(),
  moon_phase_name: z.string(),
});

// Birth data response schema - matches API specification exactly
export const birthDataSchema = z.object({
  name: z.string(),
  year: z.number(),
  month: z.number(),
  day: z.number(),
  hour: z.number(),
  minute: z.number(),
  city: z.string(),
  nation: z.string(),
  lng: z.number(),
  lat: z.number(),
  tz_str: z.string(),
  zodiac_type: z.enum(['Tropic', 'Sidereal']),
  local_time: z.number().optional(), 
  utc_time: z.number().optional(),
  julian_day: z.number(),

  // Planets
  sun: astroPointSchema,
  moon: astroPointSchema,
  mercury: astroPointSchema,
  venus: astroPointSchema,
  mars: astroPointSchema,
  jupiter: astroPointSchema,
  saturn: astroPointSchema,
  uranus: astroPointSchema,
  neptune: astroPointSchema,
  pluto: astroPointSchema,
  chiron: astroPointSchema.optional(),

  // Axial cusps - using short names as per API spec
  asc: astroPointSchema,
  dsc: astroPointSchema,
  mc: astroPointSchema,
  ic: astroPointSchema,

  // Houses
  first_house: astroPointSchema,
  second_house: astroPointSchema,
  third_house: astroPointSchema,
  fourth_house: astroPointSchema,
  fifth_house: astroPointSchema,
  sixth_house: astroPointSchema,
  seventh_house: astroPointSchema,
  eighth_house: astroPointSchema,
  ninth_house: astroPointSchema,
  tenth_house: astroPointSchema,
  eleventh_house: astroPointSchema,
  twelfth_house: astroPointSchema,

  // Nodes
  mean_node: astroPointSchema.optional(),
  true_node: astroPointSchema.optional(),

  // Lunar phase
  lunar_phase: lunarPhaseSchema,
});

export type BirthData = z.infer<typeof birthDataSchema>;

// Main chart data schema exactly as response
export const astroChartSchema = z.object({
  name: z.string(),
  year: z.number(),
  month: z.number(),
  day: z.number(),
  hour: z.number(),
  minute: z.number(),
  city: z.string(),
  nation: z.string(),
  lng: z.number(),
  lat: z.number(),
  tz_str: z.string(),
  zodiac_type: z.enum(['Tropic', 'Sidereal']).default('Tropic'),
  local_time: z.number().optional(), 
  utc_time: z.number().optional(), 
  julian_day: z.number(),

  // Planets
  sun: astroPointSchema,
  moon: astroPointSchema,
  mercury: astroPointSchema,
  venus: astroPointSchema,
  mars: astroPointSchema,
  jupiter: astroPointSchema,
  saturn: astroPointSchema,
  uranus: astroPointSchema,
  neptune: astroPointSchema,
  pluto: astroPointSchema,
  chiron: astroPointSchema.optional(), 

  // Points (axial cusps) - API uses short names
  asc: astroPointSchema,
  dsc: astroPointSchema,
  mc: astroPointSchema,
  ic: astroPointSchema, 

  // Houses
  first_house: astroPointSchema,
  second_house: astroPointSchema,
  third_house: astroPointSchema,
  fourth_house: astroPointSchema,
  fifth_house: astroPointSchema,
  sixth_house: astroPointSchema,
  seventh_house: astroPointSchema,
  eighth_house: astroPointSchema,
  ninth_house: astroPointSchema,
  tenth_house: astroPointSchema,
  eleventh_house: astroPointSchema,
  twelfth_house: astroPointSchema,

  // Nodes
  mean_node: astroPointSchema.optional(),
  true_node: astroPointSchema.optional(),
  mean_south_node: astroPointSchema.optional(),
  true_south_node: astroPointSchema.optional(),

  // Lunar phase
  lunar_phase: lunarPhaseSchema,
});
export type AstroChart = z.infer<typeof astroChartSchema>;
export type AstroPoint = z.infer<typeof astroPointSchema>;
export type LunarPhase = z.infer<typeof lunarPhaseSchema>;