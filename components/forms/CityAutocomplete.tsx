// components/forms/CityAutocomplete.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { toast } from 'sonner';

interface Suggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface CityAutocompleteProps {
  onSelect: (data: {
    city: string;
    country: string;
    lat: number;
    lng: number;
    timezoneId: string;
  }) => void;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  language?: string;
}

const CityAutocomplete = React.forwardRef<HTMLInputElement, CityAutocompleteProps>(function CityAutocomplete({
  onSelect,
  value = '',
  onChange,
  onBlur,
  error,
  disabled,
  placeholder = 'Search for a city...',
  className = '',
  language = 'en'
}, _ref) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    ready,
    suggestions: { status, data },
    setValue: setPlacesValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(cities)'],
      language: language,
      componentRestrictions: { country: '' },
    },
    debounce: 300,
    cache: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  // Sync the input value with the form value
  useEffect(() => {
    if (value !== undefined && value !== inputRef.current?.value) {
      setPlacesValue(value, false);
    }
  }, [value, setPlacesValue]);

  // Handle click outside to clear suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        clearSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearSuggestions]);

  const fetchTimezone = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(`/api/timezone?lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.timeZoneId || 'UTC';
    } catch (error) {
      console.error('Error fetching timezone:', error);
      return 'UTC';
    }
  };

  const handleSelect = async (suggestion: Suggestion) => {
    const { description, place_id } = suggestion;

    // Update the input value immediately for better UX
    setPlacesValue(description, false);
    if (onChange) {
      onChange(description);
    }
    clearSuggestions();

    setIsLoading(true);
    const loadingToast = toast.loading('Fetching location details...');

    try {
      const results = await getGeocode({ 
        placeId: place_id,
        language: language 
      });
      
      if (!results?.[0]) {
        throw new Error('No results found for the selected location');
      }

      const { lat, lng } = await getLatLng(results[0]);

      // Validate coordinates
      if (lat === 0 && lng === 0) {
        throw new Error('Invalid coordinates received from Google Maps');
      }

      // Get address components
      const address = results[0].address_components;
      const countryComp = address.find(comp => comp.types.includes('country'));
      const cityComp = address.find(comp => 
        comp.types.includes('locality') || 
        comp.types.includes('administrative_area_level_1')
      );
      
      const cityName = cityComp?.long_name || description.split(',')[0].trim();
      const countryName = countryComp?.long_name || '';
      const timezoneId = await fetchTimezone(lat, lng);

      // Update the form with the selected location
      onSelect({ city: cityName, country: countryName, lat, lng, timezoneId });
      
      toast.dismiss(loadingToast);
      toast.success('Location selected');
    } catch (error) {
      console.error('Error getting location details:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to get location details. Please try again.');
      
      // Reset the input on error
      if (onChange) onChange('');
      setPlacesValue('', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPlacesValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (status === 'OK' && data.length > 0) {
        handleSelect(data[0]);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={onBlur}
          disabled={!ready || disabled || isLoading}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-md transition-colors duration-200
            border ${error ? 'border-red-500' : 'border-input'}
            bg-background text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isLoading ? 'opacity-70' : ''}
            ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : undefined}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-primary"></div>
          </div>
        )}
      </div>
      
      {error && (
        <p id="error-message" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
      
      {status === 'OK' && data.length > 0 && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <div
                key={place_id}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-2 cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div className="font-medium">{main_text}</div>
                <div className="text-sm text-muted-foreground">{secondary_text}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

CityAutocomplete.displayName = 'CityAutocomplete';

export { CityAutocomplete };
