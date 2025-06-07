
import React, { useEffect, useState } from 'react';
import { Calendar, CloudRain, Sun, Cloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  cloudCover: number;
  description: string;
}

const ForecastCard = () => {
  const { location } = useLocation();
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      fetchForecastData();
    }
  }, [location]);

  const fetchForecastData = async () => {
    if (!location) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=temperature_2m_max,temperature_2m_min,cloudcover_mean&timezone=auto&forecast_days=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const data = await response.json();
      
      const forecastData = data.daily.time.map((date: string, index: number) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        maxTemp: Math.round(data.daily.temperature_2m_max[index]),
        minTemp: Math.round(data.daily.temperature_2m_min[index]),
        cloudCover: data.daily.cloudcover_mean[index] || 0,
        description: getWeatherDescription(data.daily.cloudcover_mean[index] || 0),
      }));
      
      setForecast(forecastData);
      
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (cloudCover: number) => {
    if (cloudCover < 20) return 'Clear';
    if (cloudCover < 50) return 'Partly Cloudy';
    if (cloudCover < 80) return 'Cloudy';
    return 'Overcast';
  };

  const getWeatherIcon = (cloudCover: number) => {
    if (cloudCover < 20) {
      return <Sun className="w-4 h-4 text-yellow-400" />;
    } else if (cloudCover < 50) {
      return <Cloud className="w-4 h-4 text-gray-300" />;
    } else {
      return <CloudRain className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white h-full">
        <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
          <Calendar className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-gray-300 text-sm">Search for location</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-blue-400" />
          5-Day Forecast
        </CardTitle>
        <p className="text-gray-300 text-xs truncate">{location.name}</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-white/20 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                <div className="flex items-center gap-2">
                  {getWeatherIcon(day.cloudCover)}
                  <div>
                    <p className="font-medium">{day.date}</p>
                    <p className="text-gray-400 text-xs">{day.cloudCover}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{day.maxTemp}°/{day.minTemp}°</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastCard;
