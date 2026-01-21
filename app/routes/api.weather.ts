
import { json, type ActionFunction } from '@remix-run/cloudflare';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { latitude, longitude } = (await request.json()) as any;

    if (!latitude || !longitude) {
      return json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather fetch failed:', errorText);

      return json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }

    const weatherData = await weatherResponse.json();

    return json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
      },
      { status: 500 },
    );
  }
};
