import { NextResponse } from 'next/server';

const API_URL = 'https://api.airvisual.com/v2/city';

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

let lastFetch: {
  data: ApiResponse | undefined;
} = {
  data: undefined,
};

export async function GET() {
  try {
    if (!process.env.IQAIR_KEY) {
        return NextResponse.json(
            { error: 'Missing AIRVISUAL_API_KEY environment variable' },
            { status: 500 }
        );
    }
    const cachedDate = new Date(lastFetch?.data?.data.current.pollution.ts || "0");
    const now = new Date(Date.now());
    if (lastFetch.data && (cachedDate.getDate() === now.getDate() && cachedDate.getHours() === now.getHours())) {
      console.log('Returning cached air quality data');
      return NextResponse.json(lastFetch.data, { status: 200 });
    }

    const apiDest = new URL(API_URL);
    apiDest.searchParams.set('city', 'Salaya');
    apiDest.searchParams.set('state', 'Nakhon-pathom');
    apiDest.searchParams.set('country', 'Thailand');
    apiDest.searchParams.set('key', process.env.IQAIR_KEY);

    console.log('Fetching air quality data from', apiDest.toString());
    const response = await fetch(apiDest);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch air quality data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    lastFetch = {
      data,
    };
    
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while fetching air quality data' },
      { status: 500 }
    );
  }
}
