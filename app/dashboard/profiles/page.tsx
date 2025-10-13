'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ProfileCard } from '@/components/profiles/profile-card';
import { ProfileWithBirthPlace } from '@/lib/api/profile';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileWithBirthPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/dashboard/profiles'));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const checkAuthAndFetchProfiles = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/dashboard/profiles'));
          return;
        }
        await fetchProfiles();
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/auth/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchProfiles();
  }, [router, fetchProfiles]);

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      // Refresh the profiles list
      await fetchProfiles();
      toast.success('Profile deleted successfully');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profiles...</p>
      </div>
    );
  }

  // If no profiles exist yet, show the empty state
  if (profiles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <h1 className="text-2xl font-bold">You haven&apos;t set up your profile yet</h1>
          <p className="text-muted-foreground">Create your first profile to get started</p>
          <Button asChild>
            <Link href="/dashboard/profiles/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Profile
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Sort profiles by category: self, family, friends, colleagues, other
  const sortedProfiles = [...profiles].sort((a, b) => {
    const categoryOrder = { 'self': 0, 'family': 1, 'friends': 2, 'colleagues': 3, 'other': 4 };
    return categoryOrder[a.profileCategory] - categoryOrder[b.profileCategory];
  });

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">
            Manage your profile and those of your connections
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profiles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Profile
          </Link>
        </Button>
      </div>

      {/* All Profiles Section */}
      {sortedProfiles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {sortedProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isMain={profile.profileCategory === 'self'}
              onDelete={handleDeleteProfile}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">You haven&apos;t set up your profile yet</p>
          <Button asChild>
            <Link href="/dashboard/profiles/new?type=self">
              Create My Profile
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
