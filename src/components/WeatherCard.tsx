
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  description: string;
  cloudCover: number;
  humidity: number;
  windSpeed: number;
}

const WeatherCard = () => {
  const { location } = useLocation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
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
      // Using OpenWeatherMap-like mock data for demonstration
      // In a real app, you'd use an actual weather API
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,cloudcover,windspeed_10m&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      setWeatherData({
        temperature: Math.round(data.current_weather.temperature),
        description: getWeatherDescription(data.current_weather.weathercode),
        cloudCover: data.hourly.cloudcover[0] || 0,
        humidity: data.hourly.relativehumidity_2m[0] || 0,
        windSpeed: data.current_weather.windspeed,
      });
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: "Weather data unavailable",
        description: "Unable to fetch weather information for this location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (code: number) => {
    const descriptions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
    };
    return descriptions[code] || 'Unknown';
  };

  const getWeatherIcon = () => {
    if (!weatherData) return <Cloud className="w-8 h-8" />;
    
    if (weatherData.cloudCover > 70) {
      return <CloudRain className="w-8 h-8 text-gray-400" />;
    } else if (weatherData.cloudCover > 30) {
      return <Cloud className="w-8 h-8 text-gray-300" />;
    } else {
      return <Sun className="w-8 h-8 text-yellow-400" />;
    }
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="p-8 text-center">
          <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">Search for a location to view weather data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {getWeatherIcon()}
          Weather Conditions
        </CardTitle>
        <p className="text-gray-300 text-sm">{location.name}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-white/20 rounded"></div>
              <div className="h-16 bg-white/20 rounded"></div>
            </div>
          </div>
        ) : weatherData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold">{weatherData.temperature}°C</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-300 capitalize">{weatherData.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-1">Cloud Cover</h4>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-gray-300" />
                  <span className="text-xl font-semibold">{weatherData.cloudCover}%</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-1">Humidity</h4>
                <span className="text-xl font-semibold">{Math.round(weatherData.humidity)}%</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-center py-4">No weather data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
