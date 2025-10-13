'use client';

import { useImperativeHandle, forwardRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { birthDataService } from '@/lib/astrology/birthDataService';

interface AstroInfoProps {
  profileId: string;
  className?: string;
  detailLevel?: 'basic' | 'detailed';
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface AstroInfoRef {
  refresh: () => Promise<void>;
  invalidateCache: () => Promise<void>;
  generateAnalysis: () => Promise<void>;
}

const AstroInfo = forwardRef<AstroInfoRef, AstroInfoProps>(function AstroInfo({
  profileId,
  className = '',
  detailLevel = 'basic',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes default
}, ref) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate analysis function
  const generateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const freshAnalysis = await birthDataService.getAIAnalysis(profileId, { detailLevel, forceRefresh: true });

      // Cache the fresh analysis
      await fetch(`/api/profiles/${profileId}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: freshAnalysis, detailLevel }),
      });

      // Refetch to get the cached data
      await refetch();
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Query for AI analysis with Redis caching
  const {
    data: analysis,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['astro-info', profileId, detailLevel],
    queryFn: async () => {
      // Only try to get from Redis cache - don't auto-generate
      const cachedResponse = await fetch(`/api/profiles/${profileId}/analysis?detailLevel=${detailLevel}`);
      if (cachedResponse.ok) {
        const cachedData = await cachedResponse.json();
        if (cachedData.analysis) {
          return cachedData.analysis;
        }
      }

      // If no cached analysis exists, return null to show "not generated yet" state
      // Generation should happen when profile is created, not here
      return null;
    },
    enabled: !!profileId,
    staleTime: autoRefresh ? refreshInterval : 5 * 60 * 1000, // 5 minutes or based on autoRefresh setting
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Expose refresh, cache invalidation, and generation methods
  useImperativeHandle(ref, () => ({
    refresh: handleRefresh,
    invalidateCache: async () => {
      // Invalidate cache by calling the API endpoint
      try {
        await fetch(`/api/cache/invalidate-astro-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId }),
        });
        // Then refetch the data
        await refetch();
      } catch (error) {
        console.error('Error invalidating cache:', error);
      }
    },
    generateAnalysis
  }));

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Astrology Insights
          </CardTitle>
          <CardDescription>
            Generating personalized astrology analysis...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-sm text-muted-foreground">
              Analyzing birth chart...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Sparkles className="h-5 w-5" />
            Astrology Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Unable to generate astrology insights
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing || isFetching}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } // Close the error if block

  // Show "not generated yet" state
  if (analysis === null && !isLoading && !error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Astrology Insights
          </CardTitle>
          <CardDescription>
            AI-powered personalized birth chart analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Astrology analysis has not been generated yet for this profile.
            </p>
            <Button
              onClick={generateAnalysis}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } // Close the "not generated yet" if block

  // Show analysis content
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Astrology Insights
        </CardTitle>
        <CardDescription>
          AI-powered personalized birth chart analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {(() => {
              if (typeof analysis === 'string') return analysis;
              if (analysis && typeof analysis === 'object') {
                // Prefer .analysis field if present (server JSON), else stringify
                return (analysis as { analysis?: string }).analysis ?? (() => {
                  try { return JSON.stringify(analysis, null, 2); } catch { return String(analysis); }
                })();
              }
              return '';
            })()}
          </div>
        </div>
        {autoRefresh && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Auto-refreshing every {Math.round(refreshInterval / 60000)} minutes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default AstroInfo;
