interface Pollution {
  ts: string;
  aqius: number;
  mainus: string;
  aqicn: number;
  maincn: string;
}

interface Weather {
  ts: string;
  tp: number;
  pr: number;
  hu: number;
  ws: number;
  wd: number;
  ic: string;
}

interface Current {
  pollution: Pollution;
  weather: Weather;
}

interface Location {
  type: string;
  coordinates: number[];
}

interface AirQualityData {
  city: string;
  state: string;
  country: string;
  location: Location;
  current: Current;
}

export interface ApiResponse {
  status: "success" | "error";
  data: AirQualityData;
  lastFetch?: Date;
  cached?: boolean;
  stale?: boolean;
}

const dummyData: ApiResponse = {
  status: "success",
  data: {
    city: "Salaya",
    state: "Nakhon Pathom",
    country: "Thailand",
    location: {
      type: "Point",
      coordinates: [100.3, 13.8],
    },
    current: {
      pollution: {
        ts: new Date().toISOString(),
        aqius: 85,
        mainus: "p2",
        aqicn: 85,
        maincn: "p2",
      },
      weather: {
        ts: new Date().toISOString(),
        tp: 28,
        pr: 1013,
        hu: 65,
        ws: 3.2,
        wd: 180,
        ic: "01d",
      },
    },
  },
};

const API_URL = 'https://api.airvisual.com/v2/city';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

// Server-side cache
let serverCache: {
  data: ApiResponse | undefined;
  timestamp: number;
} = {
  data: undefined,
  timestamp: 0
};

async function fetchFromAirVisualAPI(): Promise<ApiResponse> {
  const apiKey = process.env.IQAIR_KEY;

  if (!apiKey) {
    throw new Error('Missing IQAIR_KEY environment variable');
  }

  const apiDest = new URL(API_URL);
  apiDest.searchParams.set('city', 'Salaya');
  apiDest.searchParams.set('state', 'Nakhon-pathom');
  apiDest.searchParams.set('country', 'Thailand');
  apiDest.searchParams.set('key', apiKey);

  const response = await fetch(apiDest, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data,
    lastFetch: new Date(),
    cached: false
  };
}

export async function getAirQualityData(): Promise<ApiResponse> {
  try {
    const now = Date.now();
    const cacheAge = now - serverCache.timestamp;

    // Check if we have valid cached data (less than 30 minutes old)
    if (serverCache.data && cacheAge < CACHE_DURATION_MS) {
      console.log(`Returning cached air quality data (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
      return {
        ...serverCache.data,
        cached: true,
        lastFetch: new Date(serverCache.timestamp)
      };
    }

    // Cache is expired or doesn't exist, fetch fresh data
    console.log('Cache expired or not found, fetching fresh air quality data');

    const freshData = await fetchFromAirVisualAPI();

    // Update cache
    serverCache = {
      data: freshData,
      timestamp: now
    };

    // Validate and clean data
    if (freshData?.status === "success") {
      const weather = freshData.data.current.weather;
      if (weather.tp < -10 || weather.tp > 50 || isNaN(weather.tp)) {
        return {
          ...freshData,
          data: {
            ...freshData.data,
            current: {
              ...freshData.data.current,
              weather: {
                ...weather,
                tp: dummyData.data.current.weather.tp
              }
            }
          }
        };
      }
      return freshData;
    }

    return dummyData;
  } catch (error) {
    console.error("Failed to fetch air quality data:", error);

    // If there's an error but we have stale cache, return that
    if (serverCache.data) {
      return {
        ...serverCache.data,
        cached: true,
        stale: true,
        lastFetch: new Date(serverCache.timestamp)
      };
    }

    return dummyData;
  }
}