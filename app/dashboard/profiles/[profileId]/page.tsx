'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Globe, Compass, Home, Gauge, Target, GitCommitHorizontal, 
  GitBranch, Circle, Activity, Sparkles
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Astrology Components
import { ChartViewer } from '@/components/astrology/ChartViewer';
import { PlanetCard } from '@/components/astrology/PlanetCard';
import { PointCard } from '@/components/astrology/PointCard';
import { HouseCard } from '@/components/astrology/HouseCard';
import AstroInfo from '@/components/astrology/astro_info';
import ProfileChat from './ProfileChat';

// Hooks and Types
import { useBirthChart } from '@/lib/astrology/useBirthData';
import { authClient } from '@/lib/auth-client';
import { Profile } from '@/types/profile';
import { AstroChartData } from '@/lib/astrology/chartUtils';
import { calculateBirthTimeStamps } from '@/lib/astrology/timeUtils';

// Planet icons mapping
// Note: This was defined but not used in the current implementation

export default function ProfilePage() {
  const { profileId } = useParams<{ profileId: string }>();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the birth chart hook
  const { 
    data: chartData, 
    isLoading: isLoadingChart, 
    error: chartError,
    refetch: refetchChart 
  } = useBirthChart(profileId as string, {
    // Only fetch if we have a profile with birth data
    enabled: !!profile?.birthDate && !!profile.birthPlace,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
      });

      if (response.status === 401) {
        // Unauthorized - redirect to sign in
        router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
        return;
      }

      if (response.status === 403) {
        // Forbidden - user doesn't have permission
        throw new Error('You do not have permission to view this profile');
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
          toast.error('You do not have permission to view this profile');
          router.push('/dashboard/profiles');
        }
      };
      checkPermission();
    }
  }, [isPending, session, router, profileId, fetchProfile]);

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
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

  if (!profile) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-6">
          <h2 className="text-2xl font-semibold mb-4">Profile not found</h2>
          <p className="text-muted-foreground mb-6">The requested profile could not be found.</p>
          <Button asChild>
            <Link href="/dashboard/profiles">
              Back to Profiles
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Build basic and detailed context for Chatbot
  const chart = profile.astrologicalData?.chartData as AstroChartData | undefined;
  const basicCtx = {
    name: profile.displayName ?? null,
    birthDate: profile.birthDate ?? null,
    birthTime: null as string | null, // not directly available at this level
    birthPlace: chart ? { city: chart.city, nation: chart.nation, lat: chart.lat, lng: chart.lng } : null,
    timezone: chart?.tz_str ?? null,
    sunSign: chart?.sun?.sign ?? chart?.sun_sign ?? null,
    moonSign: chart?.moon?.sign ?? chart?.moon_sign ?? null,
    ascendant: chart?.asc?.sign ?? null,
  };
  const detailedCtx = {
    profile,
    chartData: chart ?? null,
  };

  return (
    <div className="container mx-auto p-8 ">
      <div className="mb-0">

        {/* Heading */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="mb-2">
              <h1 className="text-2xl font-bold tracking-tight">{profile.displayName}</h1>
            </div>
            <div>
              <p className="text-md text-muted-foreground">
                Astrological data and Calculated birth chart snapshot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/profiles">
                View All Profiles
              </Link>
            </Button>
            <Button className='bg-primary text-primary-foreground'>
              <Link href={`/dashboard/profiles/${profileId}/edit`}>
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-0">
        
        {/* Astrological Data */}
        {profile.astrologicalData?.chartData && (
          <div className="mt-1">


            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-2">
                <TabsTrigger value="insights" className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Insights</TabsTrigger>
                <TabsTrigger value="chart" className="flex items-center gap-2"><Compass className="h-4 w-4" /> Chart</TabsTrigger>
                <TabsTrigger value="planets" className="flex items-center gap-2"><Circle className="h-4 w-4" /> Planets</TabsTrigger>
                <TabsTrigger value="points" className="flex items-center gap-2"><Target className="h-4 w-4" /> Points</TabsTrigger>
                <TabsTrigger value="houses" className="flex items-center gap-2"><Home className="h-4 w-4" /> Houses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="insights" className="space-y-6">
                <div className="bg-card">
                  <AstroInfo
                    profileId={profileId}
                    className="w-full"
                    detailLevel="basic"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="chart" className="space-y-6">
                <div className="rounded-lg border p-4">
                  {isLoadingChart ? (
                    <div className="h-[600px] flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : chartError ? (
                    <div className="h-[600px] flex flex-col items-center justify-center text-center p-4">
                      <p className="text-red-500 mb-4">Error loading chart data</p>
                      <Button variant="outline" onClick={() => refetchChart()}>
                        Retry
                      </Button>
                    </div>
                  ) : chartData ? (
                    <ChartViewer chartData={chartData as AstroChartData} />
                  ) : (
                    <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                      No chart data available
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="planets" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <PlanetCard planet={profile.astrologicalData.chartData.sun} name="Sun" />
                  <PlanetCard planet={profile.astrologicalData.chartData.moon} name="Moon" />
                  <PlanetCard planet={profile.astrologicalData.chartData.mercury} name="Mercury" />
                  <PlanetCard planet={profile.astrologicalData.chartData.venus} name="Venus" />
                  <PlanetCard planet={profile.astrologicalData.chartData.mars} name="Mars" />
                  <PlanetCard planet={profile.astrologicalData.chartData.jupiter} name="Jupiter" />
                  <PlanetCard planet={profile.astrologicalData.chartData.saturn} name="Saturn" />
                  <PlanetCard planet={profile.astrologicalData.chartData.uranus} name="Uranus" />
                  <PlanetCard planet={profile.astrologicalData.chartData.neptune} name="Neptune" />
                  <PlanetCard planet={profile.astrologicalData.chartData.pluto} name="Pluto" />
                  {profile.astrologicalData.chartData.chiron && (
                    <PlanetCard planet={profile.astrologicalData.chartData.chiron} name="Chiron" />
                  )}
                  {profile.astrologicalData.chartData.true_node && (
                    <PlanetCard planet={profile.astrologicalData.chartData.true_node} name="North Node" />
                  )}
                  {profile.astrologicalData.chartData.mean_node && (
                    <PlanetCard planet={profile.astrologicalData.chartData.mean_node} name="Mean Node" />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="points" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <PointCard point={profile.astrologicalData.chartData.asc} name="Ascendant (AC)" />
                  <PointCard point={profile.astrologicalData.chartData.dsc} name="Descendant (DC)" />
                  <PointCard point={profile.astrologicalData.chartData.mc} name="Medium Coeli (MC)" />
                  <PointCard point={profile.astrologicalData.chartData.ic} name="Imum Coeli (IC)" />
                </div>
              </TabsContent>

              <TabsContent value="houses" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <HouseCard house={profile.astrologicalData.chartData.first_house} number={1} />
                  <HouseCard house={profile.astrologicalData.chartData.second_house} number={2} />
                  <HouseCard house={profile.astrologicalData.chartData.third_house} number={3} />
                  <HouseCard house={profile.astrologicalData.chartData.fourth_house} number={4} />
                  <HouseCard house={profile.astrologicalData.chartData.fifth_house} number={5} />
                  <HouseCard house={profile.astrologicalData.chartData.sixth_house} number={6} />
                  <HouseCard house={profile.astrologicalData.chartData.seventh_house} number={7} />
                  <HouseCard house={profile.astrologicalData.chartData.eighth_house} number={8} />
                  <HouseCard house={profile.astrologicalData.chartData.ninth_house} number={9} />
                  <HouseCard house={profile.astrologicalData.chartData.tenth_house} number={10} />
                  <HouseCard house={profile.astrologicalData.chartData.eleventh_house} number={11} />
                  <HouseCard house={profile.astrologicalData.chartData.twelfth_house} number={12} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Birth Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span>{new Date(profile.birthDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Time:</span>
                      <span>
                        {(() => {
                          try {
                            // Combine birthDate and birthTime for proper display
                            if (profile.birthDate && profile.birthTime) {
                              const [hours, minutes] = profile.birthTime.split(':');
                              const dateWithTime = new Date(profile.birthDate);
                              dateWithTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                              return dateWithTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });
                            }
                            return 'N/A';
                          } catch (error) {
                            console.error('Error formatting birth time:', error);
                            return 'N/A';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span>{profile.astrologicalData.chartData.city}, {profile.astrologicalData.chartData.nation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span>{profile.astrologicalData.chartData.lat.toFixed(4)}° N, {profile.astrologicalData.chartData.lng.toFixed(4)}° E</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Zodiac:</span>
                      <Badge variant="outline">{profile.astrologicalData.chartData.zodiac_type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Lunar Phase</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.astrologicalData?.chartData?.lunar_phase ? (
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">
                        {profile.astrologicalData.chartData.lunar_phase.moon_emoji || '🌑'}
                      </div>
                      <div>
                        <div className="text-lg font-medium">
                          {profile.astrologicalData.chartData.lunar_phase.moon_phase_name || 'New Moon'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sun-Moon Angle: {profile.astrologicalData.chartData.lunar_phase.degrees_between_s_m?.toFixed(2) || '0.00'}°
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Illumination: {((profile.astrologicalData?.chartData?.lunar_phase?.moon_phase || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Lunar phase data not available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Chart Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Local Time:</span>
                      <span>
                        {(() => {
                          try {
                            // Check if stored time values are valid (not 0 or 1970 epoch)
                            const chartData = profile.astrologicalData?.chartData;
                            if (chartData?.local_time && chartData.local_time > 1000) {
                              // Use stored value if valid
                              return new Date(chartData.local_time * 1000).toLocaleString();
                            } else if (profile.birthDate && profile.birthTime) {
                              // Calculate from birth data if stored values are invalid
                              const timeStamps = calculateBirthTimeStamps(
                                new Date(profile.birthDate),
                                profile.birthTime,
                                chartData?.tz_str || 'UTC'
                              );
                              return new Date(timeStamps.localTime * 1000).toLocaleString();
                            }
                            return 'N/A';
                          } catch (error) {
                            console.error('Error formatting local time:', error);
                            return 'N/A';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitCommitHorizontal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">UTC Time:</span>
                      <span>
                        {(() => {
                          try {
                            // Check if stored time values are valid (not 0 or 1970 epoch)
                            const chartData = profile.astrologicalData?.chartData;
                            if (chartData?.utc_time && chartData.utc_time > 1000) {
                              // Use stored value if valid
                              return new Date(chartData.utc_time * 1000).toISOString().replace('T', ' ').substring(0, 19);
                            } else if (profile.birthDate && profile.birthTime) {
                              // Calculate from birth data if stored values are invalid
                              const timeStamps = calculateBirthTimeStamps(
                                new Date(profile.birthDate),
                                profile.birthTime,
                                chartData?.tz_str || 'UTC'
                              );
                              return new Date(timeStamps.utcTime * 1000).toISOString().replace('T', ' ').substring(0, 19);
                            }
                            return 'N/A';
                          } catch (error) {
                            console.error('Error formatting UTC time:', error);
                            return 'N/A';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Julian Day:</span>
                      <span>
                        {(() => {
                          try {
                            // Check if stored Julian Day is valid (not 0)
                            const chartData = profile.astrologicalData?.chartData;
                            if (chartData?.julian_day && chartData.julian_day > 2400000) {
                              // Use stored value if valid
                              return chartData.julian_day.toFixed(6);
                            } else if (profile.birthDate && profile.birthTime) {
                              // Calculate from birth data if stored value is invalid
                              const timeStamps = calculateBirthTimeStamps(
                                new Date(profile.birthDate),
                                profile.birthTime,
                                chartData?.tz_str || 'UTC'
                              );
                              return timeStamps.julianDay.toFixed(6);
                            }
                            return 'N/A';
                          } catch (error) {
                            console.error('Error formatting Julian Day:', error);
                            return 'N/A';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Time Zone:</span>
                      <span>{profile.astrologicalData.chartData.tz_str}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Chart calculated at {new Date(profile.astrologicalData.createdAt).toLocaleString()}
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

      </div>
      {/* Inline Astrology Chat (context-aware) */}
      <ProfileChat
        profileId={profileId as string}
        displayName={profile.displayName}
        basicContextJson={JSON.stringify(basicCtx, null, 2)}
        detailedContextJson={JSON.stringify(detailedCtx, null, 2)}
      />
    </div>
  );
}
