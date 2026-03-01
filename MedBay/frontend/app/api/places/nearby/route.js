import { NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const type = searchParams.get('type');
  const radius = searchParams.get('radius') || 5000; // Default 5km radius

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: 'Google Places API key is not configured' },
      { status: 500 }
    );
  }

  console.log('Places API Request:', { lat, lng, type, radius });
  console.log('API Key configured:', GOOGLE_PLACES_API_KEY ? 'Yes' : 'No');

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();
    
    console.log('Places API Response Status:', data.status);
    if (data.error_message) {
      console.log('Places API Error Message:', data.error_message);
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API Error: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}