// app/api/timezone/route.ts
import { NextResponse } from "next/server";

// Type definitions for Google Time Zone API response
interface GoogleTimezoneResponse {
  status: string;
  timeZoneId?: string;
  timeZoneName?: string;
  rawOffset?: number;
  dstOffset?: number;
  errorMessage?: string;
}

// Type for our API response
interface TimezoneApiResponse {
  timeZoneId: string;
  timeZoneName: string;
  rawOffset: number;
  dstOffset: number;
  error?: string;
}

// Cache for timezone responses (in-memory, consider Redis for production)
const timezoneCache = new Map<string, TimezoneApiResponse>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  // Accept both 'lng' and 'lon' as parameter names for longitude
  const lng = searchParams.get("lng") || searchParams.get("lon");

  // Generate cache key
  const cacheKey = `${lat},${lng}`;
  
  console.log('Timezone API request:', { lat, lng, url: req.url });

  // Check cache first
  const cachedResponse = timezoneCache.get(cacheKey);
  if (cachedResponse) {
    console.log('Serving timezone from cache for:', cacheKey);
    return NextResponse.json(cachedResponse);
  }

  try {
    // Validate parameters
    if (!lat || !lng) {
      return NextResponse.json(
        { 
          error: 'Latitude and longitude are required',
          timeZoneId: 'UTC',
          timeZoneName: 'Coordinated Universal Time',
          rawOffset: 0,
          dstOffset: 0
        } satisfies TimezoneApiResponse,
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { 
          error: 'Invalid latitude or longitude',
          timeZoneId: 'UTC',
          timeZoneName: 'Coordinated Universal Time',
          rawOffset: 0,
          dstOffset: 0
        } satisfies TimezoneApiResponse,
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return NextResponse.json(
        { 
          error: 'Coordinates out of valid range',
          timeZoneId: 'UTC',
          timeZoneName: 'Coordinated Universal Time',
          rawOffset: 0,
          dstOffset: 0
        } satisfies TimezoneApiResponse,
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          timeZoneId: 'UTC',
          timeZoneName: 'Coordinated Universal Time',
          rawOffset: 0,
          dstOffset: 0
        } satisfies TimezoneApiResponse,
        { status: 500 }
      );
    }

    const url = new URL('https://maps.googleapis.com/maps/api/timezone/json');
    url.searchParams.append('location', `${latNum},${lngNum}`);
    url.searchParams.append('timestamp', timestamp.toString());
    url.searchParams.append('key', apiKey);

    console.log('Fetching timezone from Google API for:', { lat: latNum, lng: lngNum });
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Maps API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Error fetching timezone data',
          timeZoneId: 'UTC',
          timeZoneName: 'Coordinated Universal Time',
          rawOffset: 0,
          dstOffset: 0
        } satisfies TimezoneApiResponse,
        { status: response.status }
      );
    }

    const data: GoogleTimezoneResponse = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Google Maps API returned error:', data);
      return NextResponse.json(
        { 
          error: data.errorMessage || 'Failed to get timezone data',
          timeZoneId: 'UTC',
          timeZoneName: 'Coordinated Universal Time',
          rawOffset: 0,
          dstOffset: 0
        } satisfies TimezoneApiResponse,
        { status: 400 }
      );
    }

    const result: TimezoneApiResponse = {
      timeZoneId: data.timeZoneId || 'UTC',
      timeZoneName: data.timeZoneName || 'Coordinated Universal Time',
      rawOffset: data.rawOffset || 0,
      dstOffset: data.dstOffset || 0
    };

    // Cache the successful response
    timezoneCache.set(cacheKey, result);
    if (timezoneCache.size > 1000) {
      // Prevent memory leaks by limiting cache size
      const firstKey = timezoneCache.keys().next().value;
      if (firstKey) {
        timezoneCache.delete(firstKey);
      }
    }

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in timezone API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timeZoneId: 'UTC',
        timeZoneName: 'Coordinated Universal Time',
        rawOffset: 0,
        dstOffset: 0
      } satisfies TimezoneApiResponse,
      { status: 500 }
    );
  }
}