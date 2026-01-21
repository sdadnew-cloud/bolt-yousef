
import { useState } from 'react';
import { Button } from '~/components/ui/Button';

export function WeatherTool() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: 52.52, longitude: 13.41 }), // Berlin coordinates
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeather(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <Button onClick={getWeather} disabled={loading}>
        {loading ? 'Getting weather...' : 'Get Weather for Berlin'}
      </Button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {weather && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Current Weather in Berlin</h3>
          <p>Temperature: {weather.current_weather.temperature}°C</p>
          <p>Wind Speed: {weather.current_weather.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
}
