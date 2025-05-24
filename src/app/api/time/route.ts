import { NextResponse } from 'next/server';

// For App Router (Next.js 13+)
export async function GET() {
  try {
    // Get current server time with high precision
    const serverTime = new Date();
    
    // Add headers to prevent caching and ensure real-time response
    const response = new NextResponse(serverTime.toISOString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    return response;
  } catch (error) {
    console.error('Time API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}