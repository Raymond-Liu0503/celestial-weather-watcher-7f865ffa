import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Clock, Droplets, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  description: string;
  cloudCover: number;
  humidity: number;
  windSpeed: number;
  hourlyData: Array<{
    time: string;
    temperature: number;
    cloudCover: number;
    humidity: number;
  }>;
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
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,cloudcover,windspeed_10m&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      // Get current hour and next 12 hours for night viewing
      const currentHour = new Date().getHours();
      const nightHours = [];
      
      for (let i = 0; i < 12; i++) {
        const hourIndex = (currentHour + i) % 24;
        if (hourIndex < data.hourly.time.length) {
          nightHours.push({
            time: new Date(data.hourly.time[hourIndex]).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              hour12: true 
            }),
            temperature: Math.round(data.hourly.temperature_2m[hourIndex]),
            cloudCover: data.hourly.cloudcover[hourIndex] || 0,
            humidity: data.hourly.relativehumidity_2m[hourIndex] || 0,
          });
        }
      }
      
      setWeatherData({
        temperature: Math.round(data.current_weather.temperature),
        description: getWeatherDescription(data.current_weather.weathercode),
        cloudCover: data.hourly.cloudcover[0] || 0,
        humidity: data.hourly.relativehumidity_2m[0] || 0,
        windSpeed: data.current_weather.windspeed,
        hourlyData: nightHours,
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
    if (!weatherData) return <Cloud className="w-6 h-6" />;
    
    if (weatherData.cloudCover > 70) {
      return <CloudRain className="w-6 h-6 text-slate-400" />;
    } else if (weatherData.cloudCover > 30) {
      return <Cloud className="w-6 h-6 text-slate-300" />;
    } else {
      return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  if (!location) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white h-full">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
          <Cloud className="w-12 h-12 mb-4 text-slate-500" />
          <p className="text-slate-400 text-sm">Search for a location to view weather data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white hover:bg-slate-900/60 transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          {getWeatherIcon()}
          <div>
            <div>Current Weather</div>
            <p className="text-slate-400 text-sm font-normal truncate">{location.name}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-slate-800/50 rounded"></div>
            <div className="h-4 bg-slate-800/50 rounded w-2/3"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-12 bg-slate-800/50 rounded"></div>
              <div className="h-12 bg-slate-800/50 rounded"></div>
              <div className="h-12 bg-slate-800/50 rounded"></div>
            </div>
          </div>
        ) : weatherData ? (
          <>
            {/* Temperature and Description */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-2xl font-bold text-white">{weatherData.temperature}°C</span>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm capitalize mb-4">{weatherData.description}</p>
            
            {/* Weather Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <Cloud className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="text-sm font-medium">{weatherData.cloudCover}%</div>
                <div className="text-xs text-slate-500">Clouds</div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-sm font-medium">{Math.round(weatherData.humidity)}%</div>
                <div className="text-xs text-slate-500">Humidity</div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <Wind className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-sm font-medium">{Math.round(weatherData.windSpeed)}</div>
                <div className="text-xs text-slate-500">km/h</div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-center py-8 text-sm">No weather data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
