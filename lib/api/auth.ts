// lib/api/auth.ts
import { authClient } from '@/lib/auth-client';

export async function requireAuth(userId: string) {
  const session = await authClient.getSession();
  
  if (!session?.data?.user) {
    throw new Error('Unauthorized: No session found');
  }
  
  if (session.data.user.id !== userId) {
    throw new Error('Unauthorized: User ID mismatch');
  }
  
  return session.data.user;
}

export async function getCurrentUser() {
  const session = await authClient.getSession();
  
  if (!session?.data?.user) {
    return null;
  }
  
  return session.data.user;
}