// lib/astrology/useBirthData.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { astroQueryKeys } from './queryKeys';
import { birthDataService } from './birthDataService';

export function useBirthChart(profileId: string, options = {}) {
  return useQuery({
    queryKey: astroQueryKeys.chartData(profileId),
    queryFn: () => birthDataService.getBirthChartData(profileId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
}

export function useAIAnalysis(
  profileId: string, 
  options: { 
    detailLevel?: 'basic' | 'detailed',
    enabled?: boolean 
  } = {}
) {
  const { detailLevel = 'basic', enabled = true } = options;
  
  return useQuery({
    queryKey: astroQueryKeys.aiAnalysis(profileId, { detailLevel }),
    queryFn: () => birthDataService.getAIAnalysis(profileId, { detailLevel }),
    enabled: !!profileId && enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

interface GeneratePdfOptions {
  enabled?: boolean;
}

export function useGeneratePdf(profileId: string, options: GeneratePdfOptions = {}) {
  return useQuery({
    queryKey: astroQueryKeys.pdfExport(profileId),
    queryFn: () => birthDataService.generatePdfExport(profileId),
    enabled: options.enabled ?? false, // Don't run on mount by default
    gcTime: 0, // Don't cache the blob
    staleTime: 0, // Always consider the data stale
  });
}

// Hook to refresh birth data
export function useRefreshBirthData() {
  const queryClient = useQueryClient();
  
  return (profileId: string) => {
    return queryClient.invalidateQueries({
      queryKey: astroQueryKeys.birthData(profileId),
    });
  };
}
