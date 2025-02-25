import { NextResponse } from 'next/server';

const API_URL = 'https://api.airvisual.com/v2/city';

let lastFetch: {
  data: unknown;
  timestamp: number;
} = {
  data: undefined,
  timestamp: 0,
};

export async function GET() {
  try {
    if (!process.env.IQAIR_KEY) {
        return NextResponse.json(
            { error: 'Missing AIRVISUAL_API_KEY environment variable' },
            { status: 500 }
        );
    }
    if ((new Date(lastFetch.timestamp).getHours() == new Date(Date.now()).getHours()) && (new Date(lastFetch.timestamp).getDate() == new Date(Date.now()).getDate())) {
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
      timestamp: Date.now(),
    };
    
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while fetching air quality data' },
      { status: 500 }
    );
  }
}
