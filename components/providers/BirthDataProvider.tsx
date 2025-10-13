// components/providers/BirthDataProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { initBirthDataService } from '@/lib/astrology/birthDataService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Initialize the service
initBirthDataService(queryClient);

export function BirthDataProvider({ children }: { children: ReactNode }) {
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
