"use client";

import React, { useEffect, createContext, useContext, useState } from "react";
import useSWR from "swr";
import type { ApiResponse } from "@/lib/air-quality";

interface AirQualityContextType {
  data: ApiResponse;
  isLoading: boolean;
  error: Error | null;
}

const AirQualityContext = createContext<AirQualityContextType | null>(null);

interface AirQualityProviderProps {
  initialData: ApiResponse;
  children: React.ReactNode;
}

export function AirQualityProvider({ initialData, children }: AirQualityProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: fetchedData, error, mutate } = useSWR<ApiResponse>(
    "/api/air-quality",
    async (url: string) => {
      try {
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch air quality data:", error);
        throw error;
      }
    },
    {
      fallbackData: initialData,
      refreshInterval: 60 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30 * 1000,
      errorRetryInterval: 30 * 1000,
      errorRetryCount: 3,
      onSuccess: () => {
        setIsLoading(false);
      },
    }
  );

  useEffect(() => {
    const forceRefresh = setInterval(() => {
      mutate();
    }, 5 * 60 * 1000);

    return () => clearInterval(forceRefresh);
  }, [mutate]);

  const contextValue: AirQualityContextType = {
    data: fetchedData || initialData,
    isLoading,
    error
  };

  return (
    <AirQualityContext.Provider value={contextValue}>
      {children}
    </AirQualityContext.Provider>
  );
}

export function useAirQuality() {
  const context = useContext(AirQualityContext);
  if (!context) {
    throw new Error('useAirQuality must be used within AirQualityProvider');
  }
  return context;
}