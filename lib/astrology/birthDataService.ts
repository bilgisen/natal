// lib/astrology/birthDataService.ts
'use client';

import { QueryClient } from '@tanstack/react-query';
import { astroQueryKeys } from './queryKeys';
import { createNormalizedNatalChart } from '@/app/actions/createNormalizedNatalChart';
import { AstroChartData } from './chartUtils';

// Note: ChartData interface defined but not currently used in this file
// interface ChartData {
//   chartId: string;
//   birthData: {
//     name: string;
//     asc: {
//       name: string;
//       quality: string;
//       element: string;
//       sign: string;
//       sign_num: number;
//       position: number;
//       abs_pos: number;
//       emoji: string;
//       point_type: string;
//       house?: string;
//       retrograde?: boolean;
//     };
//     // Add other planet data points
//     [key: string]: Record<string, unknown> | string;
//   };
//   rawResponse: Record<string, unknown>;
//   natalChart?: {
//     // Add natal chart specific properties
//     [key: string]: unknown;
//   };
//   planets?: Array<{
//     name: string;
//     sign: string;
//     position: number;
//     house: number;
//     retrograde: boolean;
//     emoji: string;
//   }>;
//   houses?: Array<{
//     houseNumber: number;
//     sign: string;
//     cuspPosition: number;
//     emoji: string;
//   }>;
//   lunarPhase?: {
//     degreesBetweenSunMoon: number;
//     moonPhase: string;
//     sunPhase: string;
//     moonEmoji: string;
//     moonPhaseName: string;
//   } | null;
// }

export class BirthDataService {
  private queryClient: QueryClient;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Fetch or calculate birth chart data
  async getBirthChartData(profileId: string, forceRefresh = false): Promise<AstroChartData> {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cachedData = this.queryClient.getQueryData<AstroChartData>(astroQueryKeys.chartData(profileId));
      if (cachedData) return cachedData;
    }

    try {
      // Fetch the birth data from your API
      const response = await fetch(`/api/profiles/${profileId}/birth-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch birth data');
      }
      
      const birthData = await response.json();
      
      // Calculate the chart data using the server action
      const result = await createNormalizedNatalChart(
        birthData,
        birthData.userId || 'unknown',
        birthData.birthPlaceId || null,
        profileId
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create normalized natal chart');
      }
      
      // Transform the data to match AstroChartData
      const chartData = this.transformToAstroChartData(result.data);
      
      // Update the cache
      this.queryClient.setQueryData(astroQueryKeys.chartData(profileId), chartData);
      
      return chartData;
    } catch (error) {
      console.error('Error in getBirthChartData:', error);
      throw error;
    }
  }

  // Get AI analysis of the birth chart
  async getAIAnalysis(
    profileId: string, 
    options: { 
      detailLevel: 'basic' | 'detailed',
      forceRefresh?: boolean 
    } = { detailLevel: 'basic', forceRefresh: false }
  ) {
    // Check cache first if not forcing refresh
    if (!options.forceRefresh) {
      const cachedData = this.queryClient.getQueryData(astroQueryKeys.aiAnalysis(profileId, options));
      if (cachedData) return cachedData;
    }
    
    try {
      // First, try to get the existing analysis from the database if not forcing refresh
      if (!options.forceRefresh) {
        const existingAnalysis = await this.fetchStoredAnalysis(profileId, options.detailLevel);
        if (existingAnalysis) {
          this.queryClient.setQueryData(astroQueryKeys.aiAnalysis(profileId, options), existingAnalysis);
          return existingAnalysis;
        }
      }
      
      // Get the chart data first
      const chartData = await this.getBirthChartData(profileId);
      
      // Fetch the birth data from the API
      const response = await fetch(`/api/profiles/${profileId}/birth-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch birth data');
      }
      const birthData = await response.json();
      
      // Extract the necessary data from the birth data response (see app/api/profiles/[profileId]/birth-data/route.ts)
      const { subjectName, subjectBirthDate, subjectBirthTime, subjectBirthPlaceData, userId, birthPlaceId } = birthData;
      
      // Prepare the birth data for the AI analysis
      const formattedBirthData = {
        name: subjectName,
        birthDate: subjectBirthDate,
        birthTime: subjectBirthTime,
        birthPlace: subjectBirthPlaceData ? {
          id: birthPlaceId,
          name: subjectBirthPlaceData.city || 'Unknown',
          lat: subjectBirthPlaceData.lat ?? null,
          lng: subjectBirthPlaceData.lng ?? null,
          timezone: subjectBirthPlaceData.tz || 'UTC',
        } : null,
        userId,
      };
      
      // Ensure we have houses data
      const houses = chartData.cusps?.map((cusp, index) => ({
        houseNumber: index + 1,
        sign: this.getSignFromPosition(cusp),
        cuspPosition: cusp,
        emoji: '🏠'
      })) || [];
      
      // Call your AI analysis API with the correct structure
      const aiResponse = await fetch('/api/ai/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartData: {
            birthData: {
              ...formattedBirthData,
              // Include key points with sign and position for server-side logging and prompt
              sun: (() => {
                const pos = chartData.planets?.sun?.[0];
                return typeof pos === 'number'
                  ? { sign: this.getSignFromPosition(pos), position: pos }
                  : undefined;
              })(),
              moon: (() => {
                const pos = chartData.planets?.moon?.[0];
                return typeof pos === 'number'
                  ? { sign: this.getSignFromPosition(pos), position: pos }
                  : undefined;
              })(),
              asc: (() => {
                const pos = chartData.planets?.asc?.[0];
                return typeof pos === 'number'
                  ? { sign: this.getSignFromPosition(pos), position: pos }
                  : undefined;
              })(),
            },
            planets: Object.entries(chartData.planets || {}).map(([name, [position]]) => ({
              name,
              position,
              sign: this.getSignFromPosition(position),
              house: this.getHouseForPosition(position, houses),
              emoji: this.getPlanetEmoji(name)
            })),
            houses,
            lunarPhase: null // Will be filled in if available
          },
          options: { detailLevel: options.detailLevel },
          profileId,
        }),
      });
      
      if (!aiResponse.ok) {
        // Try to extract error JSON; if not, fall back to text
        let errorDetail: Record<string, unknown> = {};
        const ct = aiResponse.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          errorDetail = await aiResponse.json().catch(() => ({}));
        } else {
          const text = await aiResponse.text().catch(() => '');
          errorDetail = { error: text || 'Failed to get AI analysis' };
        }
        throw new Error((errorDetail as { error?: string }).error || 'Failed to get AI analysis');
      }
      
      // Prefer JSON; if not JSON, fall back to text and wrap
      let analysis: unknown;
      const contentType = aiResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        analysis = await aiResponse.json();
      } else {
        const text = await aiResponse.text();
        // If response is SSE-like or plain text, surface as analysis text
        analysis = { analysis: text };
      }
      
      // Normalize to a displayable string for the UI
      const displayAnalysis = typeof analysis === 'string'
        ? analysis
        : (analysis as { analysis?: string })?.analysis ?? (() => {
            try { return JSON.stringify(analysis, null, 2); } catch { return String(analysis); }
          })();

      // Cache the result
      this.queryClient.setQueryData(astroQueryKeys.aiAnalysis(profileId, options), displayAnalysis);
      
      // Store the analysis in the database
      await this.storeAnalysis(profileId, displayAnalysis, options.detailLevel);
      
      return displayAnalysis;
    } catch (error) {
      console.error('Error in getAIAnalysis:', error);
      throw error;
    }
  }
  
  // Fetch stored analysis from the database
  private async fetchStoredAnalysis(profileId: string, detailLevel: string) {
    try {
      const response = await fetch(`/api/profiles/${profileId}/analysis?detailLevel=${detailLevel}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching stored analysis:', error);
      return null;
    }
  }

  // Store analysis in the database
  private async storeAnalysis(profileId: string, analysis: string, detailLevel: string) {
    try {
      await fetch(`/api/profiles/${profileId}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, detailLevel }),
      });
    } catch (error) {
      console.error('Error storing analysis:', error);
    }
  }

  // Generate PDF export
  async generatePdfExport(profileId: string) {
    // Get the chart data
    const chartData = await this.getBirthChartData(profileId);
    
    // Call your PDF generation API
    const response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chartData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    
    return response.blob();
  }

  // Invalidate all queries for a profile
  invalidateProfileData(profileId: string) {
    return this.queryClient.invalidateQueries({
      queryKey: astroQueryKeys.birthData(profileId),
    });
  }

  /**
   * Transforms the raw chart data into the format expected by AstroDraw
   */
  private transformToAstroChartData(data: unknown): AstroChartData {
    // Cast data to proper type for safe property access
    const dataRecord = data as Record<string, unknown>;
    const birthData = dataRecord?.birthData as Record<string, unknown>;

    // List of all planet keys we want to include in the chart
    const planetKeys = [
      'sun', 'moon', 'mercury', 'venus', 'mars',
      'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
      'chiron', 'true_node', 'mean_node', 'north_node', 'south_node',
      'asc', 'mc', 'ic', 'dsc' // Include angles as well
    ];

    // Format planets data
    const planets = planetKeys.reduce<Record<string, [number]>>((acc, key) => {
      const planetData = birthData?.[key];
      if (planetData && typeof planetData === 'object' && planetData !== null && 'position' in planetData) {
        // Ensure position is a number between 0 and 360
        let position = Number((planetData as { position: unknown }).position) % 360;
        if (position < 0) position += 360; // Ensure positive value
        acc[key] = [position];
      }
      return acc;
    }, {});

    // Extract house cusps (first 12 houses)
    const cusps = [
      (birthData as Record<string, { position?: unknown }>)?.first_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.second_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.third_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.fourth_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.fifth_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.sixth_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.seventh_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.eighth_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.ninth_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.tenth_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.eleventh_house?.position,
      (birthData as Record<string, { position?: unknown }>)?.twelfth_house?.position
    ].map((position = 0) => {
      // Ensure position is a number between 0 and 360
      let pos = Number(position) % 360;
      if (pos < 0) pos += 360;
      return pos;
    });

    return { planets, cusps };
  }

  // Helper method to get sign from position (0-360 degrees)
  private getSignFromPosition(position: number): string {
    const signs = [
      'Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir',
      'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'
    ];
    const signIndex = Math.floor(position / 30) % 12;
    return signs[signIndex] || 'Ari';
  }

  // Helper method to get house for a given position
  private getHouseForPosition(position: number, houses: Array<{houseNumber: number, cuspPosition: number}>): number {
    if (!houses.length) return 1;
    
    // Find the first house where the position is less than the next house's cusp
    for (let i = 0; i < houses.length; i++) {
      const nextHouseIndex = (i + 1) % houses.length;
      const currentCusp = houses[i].cuspPosition;
      const nextCusp = houses[nextHouseIndex].cuspPosition;
      
      if (currentCusp <= nextCusp) {
        if (position >= currentCusp && position < nextCusp) {
          return houses[i].houseNumber;
        }
      } else {
        // Handle the case where the cusp wraps around 360/0
        if (position >= currentCusp || position < nextCusp) {
          return houses[i].houseNumber;
        }
      }
    }
    
    return 1; // Default to 1st house if position not found
  }

  // Helper method to get emoji for a planet
  private getPlanetEmoji(planetName: string): string {
    const emojis: Record<string, string> = {
      'sun': '☀️',
      'moon': '🌙',
      'mercury': '☿',
      'venus': '♀️',
      'mars': '♂️',
      'jupiter': '♃',
      'saturn': '♄',
      'uranus': '♅',
      'neptune': '♆',
      'pluto': '♇',
      'asc': '↑',
      'mc': 'MC',
      'ic': 'IC',
      'dsc': 'DSC'
    };
    
    return emojis[planetName.toLowerCase()] || '⭐';
  }
}

export let birthDataService: BirthDataService;

export function initBirthDataService(queryClient: QueryClient) {
  birthDataService = new BirthDataService(queryClient);
  return birthDataService;
}
