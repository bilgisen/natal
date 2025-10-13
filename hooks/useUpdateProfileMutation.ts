// hooks/useUpdateProfileMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, createProfile, deleteProfile } from '@/lib/api/profile';
import { toast } from 'sonner';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data, variables) => {
      // Invalidate and refetch the updated profile and profiles list
      queryClient.invalidateQueries({ queryKey: ['profile', variables.profileId] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    },
  });
}

export function useCreateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfile,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all profiles
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create profile');
      console.error('Error creating profile:', error);
    },
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: (data, variables) => {
      // Invalidate all profiles
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete profile');
      console.error('Error deleting profile:', error);
    },
  });
}