'use client';

import { useEffect, useState } from 'react';
import { PlanetCard } from './PlanetCard';
import { type AstroPoint } from '@/schemas/astro.schema';

interface CurrentTransitsWidgetProps {
  className?: string;
}

interface CurrentTransitsData {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  nation: string;
  lng: number;
  lat: number;
  tz_str: string;
  zodiac_type: 'Tropic' | 'Sidereal';
  local_time: string;
  utc_time: string;
  julian_day: number;
  sun: AstroPoint;
  moon: AstroPoint;
  mercury: AstroPoint;
  venus: AstroPoint;
  mars: AstroPoint;
  jupiter: AstroPoint;
  saturn: AstroPoint;
  uranus: AstroPoint;
  neptune: AstroPoint;
  pluto: AstroPoint;
  chiron: AstroPoint;
  asc: AstroPoint;
  dsc: AstroPoint;
  mc: AstroPoint;
  ic: AstroPoint;
  first_house: AstroPoint;
  second_house: AstroPoint;
  third_house: AstroPoint;
  fourth_house: AstroPoint;
  fifth_house: AstroPoint;
  sixth_house: AstroPoint;
  seventh_house: AstroPoint;
  eighth_house: AstroPoint;
  ninth_house: AstroPoint;
  tenth_house: AstroPoint;
  eleventh_house: AstroPoint;
  twelfth_house: AstroPoint;
  mean_node: AstroPoint;
  true_node: AstroPoint;
  lunar_phase: {
    degrees_between_s_m: number;
    moon_phase: number;
    sun_phase: number;
    moon_emoji: string;
    moon_phase_name: string;
  };
}

export function CurrentTransitsWidget({ className }: CurrentTransitsWidgetProps) {
  const [data, setData] = useState<CurrentTransitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentTransits() {
      try {
        // Fetch from API - caching is handled server-side
        const response = await fetch('/api/current-transits', {
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch current transits');
        }

        const result = await response.json();

        if (result.data) {
          setData(result.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (typeof window !== 'undefined') {
      fetchCurrentTransits();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-5xl mx-auto">
        <div className="h-4 bg-muted rounded w-32 mb-2 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-muted-foreground py-8 max-w-5xl mx-auto">
        {error || 'No data available'}
      </div>
    );
  }

  const currentDate = new Date(data.year, data.month - 1, data.day).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className={`max-w-5xl mx-auto text-center space-y-8 ${className}`}>
      <div>
        <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
          Current Transits <span className="text-lg">{data.lunar_phase.moon_emoji}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data.lunar_phase.moon_phase_name} • {currentDate} • {data.city}, {data.nation}
        </p>
      </div>

      {/* Lunar Phase */}
      <div className="p-3 bg-muted/50 rounded-lg inline-block text-left">
        <div className="flex items-center gap-2">
          <span className="text-xl">{data.lunar_phase.moon_emoji}</span>
          <div>
            <p className="font-medium">{data.lunar_phase.moon_phase_name}</p>
            <p className="text-sm text-muted-foreground">
              Moon phase: {data.lunar_phase.moon_phase.toFixed(1)}°
            </p>
          </div>
        </div>
      </div>

      {/* Planets Grid */}
      <div className="space-y-3">
        <h4 className="font-medium">Planets</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          <PlanetCard planet={data.sun} name="Sun" />
          <PlanetCard planet={data.moon} name="Moon" />
          <PlanetCard planet={data.mercury} name="Mercury" />
          <PlanetCard planet={data.venus} name="Venus" />
          <PlanetCard planet={data.mars} name="Mars" />
          <PlanetCard planet={data.jupiter} name="Jupiter" />
          <PlanetCard planet={data.saturn} name="Saturn" />
          <PlanetCard planet={data.uranus} name="Uranus" />
          <PlanetCard planet={data.neptune} name="Neptune" />
          <PlanetCard planet={data.pluto} name="Pluto" />
          {data.chiron && <PlanetCard planet={data.chiron} name="Chiron" />}
        </div>
      </div>

      {/* Nodes */}
      {(data.mean_node || data.true_node) && (
        <div className="space-y-3 text-left">
          <h4 className="font-medium text-center">Nodes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.mean_node && <PlanetCard planet={data.mean_node} name="Mean Node" />}
            {data.true_node && <PlanetCard planet={data.true_node} name="True Node" />}
          </div>
        </div>
      )}
    </div>
  );
}
