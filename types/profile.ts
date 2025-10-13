import type { AstroChart } from '@/schemas/astro.schema';

type BirthPlace = {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
};

export enum ProfileCategory {
  SELF = 'self',
  FAMILY = 'family',
  FRIENDS = 'friends',
  COLLEAGUES = 'colleagues',
  OTHER = 'other'
}

export type Profile = {
  id: string;
  userId: string;
  displayName?: string;
  birthDate: string;
  birthTime: string;
  birthPlace?: string | BirthPlace;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  profileCategory: ProfileCategory;
  createdAt: string;
  updatedAt: string;
  astrologicalData?: {
    chartData: AstroChart;
    createdAt: string | Date;
  } | null;
};

export type ProfileWithUser = Profile & {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};
