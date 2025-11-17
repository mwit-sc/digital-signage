import { NextResponse } from 'next/server';

const API_URL = 'https://api.airvisual.com/v2/city';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

type ApiResponse = {
  status: "success" | "fail";
  data: {
    city: string;
    state: string;
    country: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
    current: {
      pollution: {
        ts: string; // ISO timestamp
        aqius: number; // AQI (US)
        mainus: string; // Main pollutant (US)
        aqicn: number; // AQI (China)
        maincn: string; // Main pollutant (China)
      };
      weather: {
        ts: string; // ISO timestamp
        tp: number; // Temperature (°C)
        pr: number; // Pressure (hPa)
        hu: number; // Humidity (%)
        ws: number; // Wind speed (m/s)
        wd: number; // Wind direction (°)
        ic: string; // Weather icon code
      };
    };
  };
};

// Cache storage
let cache: {
  data: ApiResponse | undefined;
  timestamp: number;
} = {
  data: undefined,
  timestamp: 0
};

export async function GET() {
  try {
    if (!process.env.IQAIR_KEY) {
      return NextResponse.json(
        { error: 'Missing AIRVISUAL_API_KEY environment variable' },
        { status: 500 }
      );
    }

    const now = Date.now();
    const cacheAge = now - cache.timestamp;

    // Check if we have valid cached data (less than 30 minutes old)
    if (cache.data && cacheAge < CACHE_DURATION_MS) {
      console.log(`Returning cached air quality data (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
      return NextResponse.json({
        ...cache.data,
        cached: true,
        cacheAge: `${Math.round(cacheAge / 1000 / 60)} minutes`,
        lastFetch: new Date(cache.timestamp)
      }, { status: 200 });
    }

    // Cache is expired or doesn't exist, fetch fresh data
    console.log('Cache expired or not found, fetching fresh air quality data');
    
    const apiDest = new URL(API_URL);
    apiDest.searchParams.set('city', 'Nakhon-pathom');
    apiDest.searchParams.set('state', 'Nakhon-pathom');
    apiDest.searchParams.set('country', 'Thailand');
    apiDest.searchParams.set('key', process.env.IQAIR_KEY);

    console.log('Fetching air quality data from', apiDest.toString());
    const response = await fetch(apiDest, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });

    if (!response.ok) {
      // If the API call fails but we have stale cache, return that with a warning
      if (cache.data) {
        console.log('API call failed, returning stale cache');
        return NextResponse.json({
          ...cache.data,
          cached: true,
          stale: true,
          lastFetch: new Date(cache.timestamp),
          apiError: `${response.status} ${response.statusText}`
        }, { status: 200 });
      }
      
      return NextResponse.json(
        { error: `Failed to fetch air quality data: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Update cache
    cache = {
      data: data,
      timestamp: now
    };
    
    return NextResponse.json({
      ...data,
      cached: false,
      lastFetch: new Date(now)
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    
    // If there's an error but we have stale cache, return that with a warning
    if (cache.data) {
      return NextResponse.json({
        ...cache.data,
        cached: true,
        stale: true,
        lastFetch: new Date(cache.timestamp),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { error: 'An error occurred while fetching air quality data' },
      { status: 500 }
    );
  }
}