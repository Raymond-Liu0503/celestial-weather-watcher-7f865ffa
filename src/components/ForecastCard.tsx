
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
      return <Cloud className="w-4 h-4 text-slate-300" />;
    } else {
      return <CloudRain className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!location) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white h-full">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
          <Calendar className="w-12 h-12 mb-4 text-slate-500" />
          <p className="text-slate-400 text-sm">Search for location</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white hover:bg-slate-900/60 transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <Calendar className="w-6 h-6 text-blue-400" />
          <div>
            <div>5-Day Forecast</div>
            <p className="text-slate-400 text-sm font-normal truncate">{location.name}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-800/50 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/20 rounded-lg hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(day.cloudCover)}
                  <div>
                    <p className="font-medium text-sm">{day.date}</p>
                    <p className="text-slate-500 text-xs">{day.cloudCover}% clouds</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{day.maxTemp}°/{day.minTemp}°</p>
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
