import { NextResponse } from 'next/server';

const API_URL = 'https://api.airvisual.com/v2/city';

export const runtime = "edge";

export async function GET() {
  try {
    if (!process.env.IQAIR_KEY) {
        return NextResponse.json(
            { error: 'Missing AIRVISUAL_API_KEY environment variable' },
            { status: 500 }
        );
    }

    const apiDest = new URL(API_URL);
    apiDest.searchParams.set('city', 'Salaya');
    apiDest.searchParams.set('state', 'Nakhon-pathom');
    apiDest.searchParams.set('country', 'Thailand');
    apiDest.searchParams.set('key', process.env.IQAIR_KEY);

    const response = await fetch(apiDest, {
      next: { revalidate: 900 }, // Revalidate every 15 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch air quality data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while fetching air quality data' },
      { status: 500 }
    );
  }
}
