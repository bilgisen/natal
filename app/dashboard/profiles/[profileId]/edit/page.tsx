'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/profiles/profile-form';
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Profile } from "@/types/profile"
import { Separator } from "@/components/ui/separator";

export default function EditProfilePage() {
  const { profileId } = useParams<{ profileId: string }>();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        // Unauthorized - redirect to sign in
        router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
        return;
      }

      if (response.status === 403) {
        // Forbidden - user doesn't have permission
        throw new Error('You do not have permission to edit this profile');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      throw err; // Re-throw to be caught by the caller
    } finally {
      setLoading(false);
    }
  }, [profileId, router]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (session?.user) {
      const checkPermission = async () => {
        try {
          await fetchProfile();
        } catch (error) {
          console.error('Error checking permissions:', error);
          toast.error('You do not have permission to edit this profile');
          router.push('/dashboard/profiles');
        }
      };
      checkPermission();
    }
  }, [isPending, session, router, profileId, fetchProfile]);

  if (isPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error || 'Profile not found'}</p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/profiles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profiles
              </Link>
            </Button>
            {session && (
              <Button asChild>
                <Link href="/dashboard/profiles/new">
                  Create New Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4 mb-6">
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Edit {profile?.displayName || 'Profile'}&apos;s Profile
              </h1>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/profiles/${profileId}`}>
                    Back to Profile
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/profiles">
                    All Profiles
                  </Link>
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Update the profile information below
            </p>
            <Separator />
          </div>
        </div>
        <div className="w-full py-4">
          <ProfileForm
            profileId={profileId}
            defaultValues={{
              ...profile,
              birthDate: profile.birthDate ? new Date(profile.birthDate) : new Date(),
              birthTime: profile.birthTime || '00:00',
              birthPlace: typeof profile.birthPlace === 'string' 
                ? profile.birthPlace 
                : profile.birthPlace?.city || '',
              birthPlaceData: profile.birthPlace && typeof profile.birthPlace === 'object' 
                ? {
                    city: profile.birthPlace.city || '',
                    country: profile.birthPlace.country || '',
                    lat: profile.birthPlace.lat ? Number(profile.birthPlace.lat) : 0,
                    lng: profile.birthPlace.lng ? Number(profile.birthPlace.lng) : 0,
                    tz: profile.birthPlace.tz || 'UTC',
                  }
                : {
                    city: '',
                    country: '',
                    lat: 0,
                    lng: 0,
                    tz: 'UTC',
                  },
              profileCategory: profile.profileCategory || 'self',
              gender: profile.gender || 'prefer-not-to-say',
            }}
            onSuccess={() => {
              toast.success('Profile updated successfully');
              router.push(`/dashboard/profiles/${profileId}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
