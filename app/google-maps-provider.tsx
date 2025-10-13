// app/google-maps-provider.tsx
'use client';

import { LoadScript, LoadScriptProps } from "@react-google-maps/api";
import { ReactNode, useEffect, useState, useMemo } from "react";

interface GoogleMapsProviderProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
}

export function GoogleMapsProvider({ 
  children, 
  loadingFallback = <div>Loading Google Maps...</div>,
  errorFallback = (error: Error) => {
    console.error('Google Maps error:', error);
    return <div>Error loading Google Maps. Please try again later.</div>;
  }
}: GoogleMapsProviderProps) {
  const [isError, setIsError] = useState<Error | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  // Log the API key status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!apiKey) {
        console.error('Google Maps API key is not configured. Please check your .env file.');
      } else {
        console.log('Google Maps API key loaded successfully');
      }
    }
  }, [apiKey]);

  // Handle script loading errors
  const handleError = (error: Error) => {
    console.error('Error loading Google Maps script:', error);
    setIsError(error);
  };

  // Move useMemo before any conditional returns
  const loadScriptProps: LoadScriptProps | null = useMemo(() => {
    if (!apiKey) {
      return null; // Return null instead of throwing during build time
    }

    return {
      id: 'google-maps-script',
      googleMapsApiKey: apiKey,
      libraries: ["places"],
      onError: handleError,
      loadingElement: loadingFallback || <div>Loading Google Maps...</div>,
      onLoad: () => console.log('Google Maps script loaded successfully'),
    };
  }, [apiKey, loadingFallback]);

  // If no API key is provided, render children without Google Maps during build time
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Maps API key is not configured. Maps functionality will be disabled.');
    }
    return <>{children}</>;
  }

  // If there was an error loading the script, show the error fallback
  if (isError) {
    return errorFallback ? errorFallback(isError) : <>{children}</>;
  }

  return (
    <LoadScript {...loadScriptProps!}>
      {children}
    </LoadScript>
  );
}