'use client';

import { ProfileForm } from '@/components/user/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
}

interface Session {
  user: User;
  // Add other session properties if needed
}

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await authClient.getSession();
        
        if (error || !data?.user) {
          router.push('/sign-in?callbackUrl=/dashboard/profile');
          return;
        }
        
        setSession({
          user: {
            id: data.user.id,
            name: data.user.name || '',
            email: data.user.email || '',
            emailVerified: data.user.emailVerified || false,
            image: data.user.image || null,
          }
        });
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/sign-in?callbackUrl=/dashboard/profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-primary">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email || ''}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {session?.user && (
            <ProfileForm 
              defaultValues={{
                // Map the user data to match ProfileForm's expected structure
                // Add other fields if they exist in your form
                // For example, if you have a birthDate field in your form:
                // birthDate: session.user.birthDate ? new Date(session.user.birthDate) : undefined,
              }} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
