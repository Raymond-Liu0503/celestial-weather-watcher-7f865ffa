
import React, { useEffect, useState } from 'react';
import { Cloud, Thermometer, Eye, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';

interface WeatherData {
  temperature: number;
  humidity: number;
  visibility: number;
  cloudCover: number;
  description: string;
}

const WeatherCard = () => {
  const { location, setStargazingConditions } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    if (!location) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/current?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,visibility,cloud_cover&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      const weatherData = {
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        visibility: Math.round(data.current.visibility / 1000), // Convert to km
        cloudCover: data.current.cloud_cover || 0,
        description: getWeatherDescription(data.current.cloud_cover || 0),
      };
      
      setWeather(weatherData);
      
      // Calculate stargazing conditions
      const rating = calculateStargazingRating(weatherData);
      setStargazingConditions({
        rating,
        factors: {
          cloudCover: weatherData.cloudCover,
          humidity: weatherData.humidity,
          visibility: weatherData.visibility,
        },
      });
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (cloudCover: number) => {
    if (cloudCover < 20) return 'Clear skies';
    if (cloudCover < 50) return 'Partly cloudy';
    if (cloudCover < 80) return 'Cloudy';
    return 'Overcast';
  };

  const calculateStargazingRating = (data: WeatherData) => {
    let score = 10;
    
    // Cloud cover impact (most important)
    score -= (data.cloudCover / 100) * 6;
    
    // Humidity impact
    if (data.humidity > 80) score -= 2;
    else if (data.humidity > 60) score -= 1;
    
    // Visibility impact
    if (data.visibility < 5) score -= 2;
    else if (data.visibility < 10) score -= 1;
    
    return Math.max(1, Math.min(10, Math.round(score)));
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="p-4 text-center flex flex-col items-center justify-center">
          <Cloud className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-gray-300 text-sm">Search for location</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="w-5 h-5 text-blue-400" />
          Weather
        </CardTitle>
        <p className="text-gray-300 text-xs truncate">{location.name}</p>
      </CardHeader>
      <CardContent className="pb-3">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-6 bg-white/20 rounded"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 bg-white/20 rounded"></div>
              <div className="h-8 bg-white/20 rounded"></div>
            </div>
          </div>
        ) : weather ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{weather.temperature}°C</div>
              <p className="text-xs text-gray-400">{weather.description}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-white/5 rounded">
                <Droplets className="w-3 h-3 mx-auto mb-1 text-blue-400" />
                <div className="font-semibold">{weather.humidity}%</div>
                <div className="text-gray-400">Humidity</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded">
                <Eye className="w-3 h-3 mx-auto mb-1 text-green-400" />
                <div className="font-semibold">{weather.visibility}km</div>
                <div className="text-gray-400">Visibility</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded">
                <Cloud className="w-3 h-3 mx-auto mb-1 text-gray-400" />
                <div className="font-semibold">{weather.cloudCover}%</div>
                <div className="text-gray-400">Clouds</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-center py-2 text-sm">No weather data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
