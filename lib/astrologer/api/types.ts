// lib/astrologer/api/types.ts
import { z } from 'zod';
import type { natalChartFormSchema } from '@/schemas/profile.schema';

export type NatalChartForm = z.infer<typeof natalChartFormSchema>;

export type BirthDataRequest = {
  subject: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    longitude: number;
    latitude: number;
    city: string;
    nation: string;
    timezone: string;
    name: string;
    zodiac_type: 'Tropic' | 'Sidereal';
    sidereal_mode: string | null;
    perspective_type: string;
    houses_system_identifier: string;
  };
  theme: string;
  language: string;
  wheel_only: boolean;
};

export type CelestialBody = {
  name: string;
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  sign: string;
  sign_num: number;
  position: number;
  abs_pos: number;
  emoji: string;
  point_type: 'Planet' | 'Angle';
  house: string;
  retrograde: boolean;
};

export type House = {
  name: string;
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  sign: string;
  sign_num: number;
  position: number;
  abs_pos: number;
  emoji: string;
  point_type: 'House';
  house: string;
  retrograde: boolean;
};

export type LunarPhase = {
  degrees_between_s_m: number;
  moon_phase: number;
  sun_phase: number;
  moon_emoji: string;
  moon_phase_name: string;
};

export type CurrentTransitsResponse = {
  status: string;
  data: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    city: string;
    nation: string;
    lng: number;
    lat: number;
    tz_str: string;
    zodiac_type: 'Tropic' | 'Sidereal';
    local_time: string;
    utc_time: string;
    julian_day: number;
    sun: CelestialBody;
    moon: CelestialBody;
    mercury: CelestialBody;
    venus: CelestialBody;
    mars: CelestialBody;
    jupiter: CelestialBody;
    saturn: CelestialBody;
    uranus: CelestialBody;
    neptune: CelestialBody;
    pluto: CelestialBody;
    chiron: CelestialBody;
    asc: CelestialBody;
    dsc: CelestialBody;
    mc: CelestialBody;
    ic: CelestialBody;
    first_house: House;
    second_house: House;
    third_house: House;
    fourth_house: House;
    fifth_house: House;
    sixth_house: House;
    seventh_house: House;
    eighth_house: House;
    ninth_house: House;
    tenth_house: House;
    eleventh_house: House;
    twelfth_house: House;
    mean_node: CelestialBody;
    true_node: CelestialBody;
    lunar_phase: LunarPhase;
  };
};

export type BirthDataResponse = {
  status: string;
  data: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    city: string;
    nation: string;
    lng: number;
    lat: number;
    tz_str: string;
    zodiac_type: 'Tropic' | 'Sidereal';
    local_time: number;
    utc_time: number;
    julian_day: number;
    sun: CelestialBody;
    moon: CelestialBody;
    mercury: CelestialBody;
    venus: CelestialBody;
    mars: CelestialBody;
    jupiter: CelestialBody;
    saturn: CelestialBody;
    uranus: CelestialBody;
    neptune: CelestialBody;
    pluto: CelestialBody;
    chiron: CelestialBody;
    asc: CelestialBody;
    dsc: CelestialBody;
    mc: CelestialBody;
    ic: CelestialBody;
    first_house: House;
    second_house: House;
    third_house: House;
    fourth_house: House;
    fifth_house: House;
    sixth_house: House;
    seventh_house: House;
    eighth_house: House;
    ninth_house: House;
    tenth_house: House;
    eleventh_house: House;
    twelfth_house: House;
    mean_node: CelestialBody;
    true_node: CelestialBody;
    lunar_phase: LunarPhase;
  };
};
