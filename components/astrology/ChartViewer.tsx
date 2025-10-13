// components/astrology/ChartViewer.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { AstroChartData, ChartViewerData, formatChartData } from '@/lib/astrology/chartUtils';

interface ChartViewerProps {
  chartData: ChartViewerData | AstroChartData;
  width?: number;
  height?: number;
}

interface AstroChartInstance {
  radix: (data: { planets: Record<string, [number]>; cusps: number[] }) => void;
  destroy?: () => void;
}

export function ChartViewer({ 
  chartData: rawChartData, 
  width = 600, 
  height = 600 
}: ChartViewerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<AstroChartInstance | null>(null);
  const chartId = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Format the chart data if needed
    let formattedData: AstroChartData;
    
    try {
      // Check if we need to format the data
      if ('planets' in rawChartData && 'cusps' in rawChartData) {
        // Data is already in AstroChart format
        formattedData = rawChartData as AstroChartData;
      } else {
        // Data needs to be formatted
        formattedData = formatChartData(rawChartData as ChartViewerData);
      }
      
      setError(null);
      
      // Clean up previous chart instance if it exists
      if (chartInstance.current) {
        chartContainerRef.current.innerHTML = '';
      }

      // Create a container div for the chart if it doesn't exist
      let chartElement = document.getElementById(chartId.current);
      if (!chartElement) {
        chartElement = document.createElement('div');
        chartElement.id = chartId.current;
        chartContainerRef.current.appendChild(chartElement);
      }

      // Dynamically import the chart library to avoid SSR issues
      import('@astrodraw/astrochart').then(({ default: AstroChart }) => {
        try {
          // Initialize chart with the container ID
          chartInstance.current = new AstroChart(chartId.current, width, height);

          // Draw the chart with the formatted data
          chartInstance.current.radix({
            planets: formattedData.planets,
            cusps: formattedData.cusps
          });
        } catch (err) {
          console.error('Error drawing chart:', err);
          setError(`Error drawing chart: ${err instanceof Error ? err.message : String(err)}`);
        }
      }).catch(err => {
        console.error('Error loading AstroChart:', err);
        setError('Failed to load chart library. Please try again later.');
      });
    } catch (err) {
      console.error('Error processing chart data:', err);
      setError(`Error processing chart data: ${err instanceof Error ? err.message : 'Invalid data format'}`);
    }

    // Cleanup function
    return () => {
      const chartContainer = chartContainerRef.current;
      if (chartContainer) {
        chartContainer.innerHTML = '';
      }
      chartInstance.current = null;
    };
  }, [rawChartData, width, height]);

  const [showDebug, setShowDebug] = useState(false);
  
  // Get formatted data for debug output
  let formattedData: AstroChartData | null = null;
  let dataError: string | null = null;
  
  try {
    if ('planets' in rawChartData && 'cusps' in rawChartData) {
      formattedData = rawChartData as AstroChartData;
    } else {
      formattedData = formatChartData(rawChartData as ChartViewerData);
    }
  } catch (err) {
    dataError = `Error formatting data: ${err instanceof Error ? err.message : String(err)}`;
  }

  return (
    <div className="relative w-full">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md">
              <h3 className="font-medium text-red-800 dark:text-red-200">Chart Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Please check the console for more details.
              </p>
            </div>
          </div>
        ) : null}
        <div
          ref={chartContainerRef}
          className="w-full h-full"
          style={{ minHeight: `${height}px` }}
        />
      </div>
      
      {/* Debug Toggle Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showDebug ? 'Hide' : 'Show'} Chart Data
        </button>
      </div>
      
      {/* Debug Output */}
      {showDebug && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs overflow-auto max-h-96">
          <h3 className="font-mono font-bold mb-2 text-sm">Chart Data:</h3>
          {dataError ? (
            <div className="text-red-500">{dataError}</div>
          ) : formattedData ? (
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(
                {
                  planets: formattedData.planets,
                  cusps: formattedData.cusps,
                  rawChartData: rawChartData
                },
                (key, value) => {
                  // Handle circular references and format the output
                  if (typeof value === 'function') return '[Function]';
                  if (value instanceof HTMLElement) return '[HTMLElement]';
                  if (value === undefined) return 'undefined';
                  return value;
                },
                2
              )}
            </pre>
          ) : (
            <div>No chart data available</div>
          )}
        </div>
      )}
    </div>
  );
}