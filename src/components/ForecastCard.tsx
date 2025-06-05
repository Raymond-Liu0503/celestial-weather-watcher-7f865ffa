
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
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=temperature_2m_max,temperature_2m_min,cloudcover_mean&timezone=auto&forecast_days=7`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const data = await response.json();
      
      const forecastData = data.daily.time.map((date: string, index: number) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
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
      return <Sun className="w-6 h-6 text-yellow-400" />;
    } else if (cloudCover < 50) {
      return <Cloud className="w-6 h-6 text-gray-300" />;
    } else {
      return <CloudRain className="w-6 h-6 text-gray-400" />;
    }
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">Search for a location to view forecast</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-8 h-8 text-blue-400" />
          7-Day Forecast
        </CardTitle>
        <p className="text-gray-300 text-sm">{location.name}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-white/20 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(day.cloudCover)}
                  <div>
                    <p className="font-medium">{day.date}</p>
                    <p className="text-sm text-gray-400">{day.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{day.maxTemp}°/{day.minTemp}°</p>
                  <p className="text-sm text-gray-400">{day.cloudCover}% clouds</p>
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
