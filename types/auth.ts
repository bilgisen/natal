// types/auth.ts
export interface BetterAuthUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  banned: boolean | null;
  role?: string;
  banReason?: string | null;
  banExpires?: Date | null;
}

export interface BetterAuthSession {
  user: BetterAuthUser;
  // other session properties
  accessToken?: string;
  expires?: string;
}

export interface BetterAuthSessionResult {
  data: BetterAuthSession | null;
  isLoading: boolean;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: (data: any) => Promise<BetterAuthSession | null>;
  // other session properties
}
