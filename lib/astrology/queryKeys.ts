// lib/astrology/queryKeys.ts
export const astroQueryKeys = {
  all: ['astro'] as const,
  birthData: (profileId: string) => 
    [...astroQueryKeys.all, 'birthData', { profileId }] as const,
  chartData: (profileId: string) =>
    [...astroQueryKeys.birthData(profileId), 'chart'] as const,
  aiAnalysis: (profileId: string, options?: { detailLevel?: 'basic' | 'detailed' }) =>
    [...astroQueryKeys.birthData(profileId), 'ai-analysis', options] as const,
  pdfExport: (profileId: string) =>
    [...astroQueryKeys.birthData(profileId), 'pdf-export'] as const,
};
