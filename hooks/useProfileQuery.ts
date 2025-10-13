// hooks/useProfileQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getProfile, getProfiles } from '@/lib/api/profile';
import { ProfileWithBirthPlace } from '@/lib/api/profile';

export function useProfileQuery(userId: string) {
  return useQuery<ProfileWithBirthPlace, Error>({
    queryKey: ['profile', userId, 'main'],
    queryFn: () => getProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
}

export function useAllProfilesQuery(userId: string) {
  return useQuery<ProfileWithBirthPlace[], Error>({
    queryKey: ['profiles', userId],
    queryFn: () => getProfiles(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
}