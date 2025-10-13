'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { ProfileForm } from '@/components/profiles/profile-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProfileFormValues } from '@/schemas/profile.schema';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<ProfileFormValues>>({
    displayName: '',
    birthDate: new Date(),
    birthTime: '00:00',
    gender: 'prefer-not-to-say',
  });

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (!sessionData?.data?.user) {
          router.push('/auth/signin');
          return;
        }
        
        if (sessionData.data) {
          const type = searchParams.get('type') || 'me';
          setDefaultValues(prev => ({
            ...prev,
            displayName: type === 'me' ? sessionData.data?.user?.name || '' : ''
          }));
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/auth/signin');
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-24 mb-4" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Separator className="my-6" />
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  const type = searchParams.get('type') || 'me';
  const isMe = type === 'me';
  const title = isMe ? 'Create Astro Profile' : 'Add New Astro Profile';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/profiles">
            Back to Profiles
          </Link>
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-6">Set up an astro profile to get started
      </p>

      <Separator className="my-6" />

      <div className="w-full p-4">
        <ProfileForm 
          defaultValues={defaultValues}
          onSuccess={() => router.push('/dashboard/profiles')}
          variant="primary"
        />
      </div>
    </div>
  );
}
