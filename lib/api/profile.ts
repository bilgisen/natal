// lib/api/profile.ts
import { Profile } from '@/types/profile';
import { ProfileFormValues } from '@/schemas/profile.schema';

export interface BirthPlace {
  id: string;
  country: string;
  city: string;
  lat: string;
  lon: string;
  tz: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileWithBirthPlace extends Omit<Profile, 'birthPlace'> {
  birthPlace: BirthPlace | null;
}

export async function getProfile(userId: string): Promise<ProfileWithBirthPlace> {
  const response = await fetch(`/api/profiles/${userId}/main`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
}

export async function getProfiles(userId: string): Promise<ProfileWithBirthPlace[]> {
  const response = await fetch(`/api/profiles/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch profiles');
  }
  return response.json();
}

// Tip tanımlarını doğru şekilde belirtelim
export type UpdateProfileParams = {
  profileId: string;
} & ProfileFormValues;

export type CreateProfileParams = {
  isMainProfile?: boolean;
} & ProfileFormValues;

export async function updateProfile(params: UpdateProfileParams): Promise<ProfileWithBirthPlace> {
  const { profileId, ...data } = params;
  const response = await fetch(`/api/profiles/${profileId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}

export async function createProfile(params: CreateProfileParams): Promise<ProfileWithBirthPlace> {
  const response = await fetch(`/api/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to create profile');
  }

  return response.json();
}

export async function deleteProfile(profileId: string) {
  const response = await fetch(`/api/profiles/${profileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete profile');
  }

  return response.json();
}

export async function getProfileById(profileId: string): Promise<ProfileWithBirthPlace> {
  const response = await fetch(`/api/profiles/detail/${profileId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile by ID');
  }
  return response.json();
}