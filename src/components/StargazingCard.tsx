
import React, { useEffect, useState } from 'react';
import { Star, Eye, CloudRain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';

interface StargazingData {
  rating: number;
  moonPhase: string;
  moonIllumination: number;
  cloudCover: number;
  humidity: number;
  recommendation: string;
  bestTime: string;
}

const StargazingCard = () => {
  const { location, setStargazingConditions } = useLocation();
  const [stargazingData, setStargazingData] = useState<StargazingData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      analyzeStargazingConditions();
    }
  }, [location]);

  const analyzeStargazingConditions = async () => {
    if (!location) return;
    
    setLoading(true);
    
    try {
      // Get weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=cloudcover,relativehumidity_2m&timezone=auto&forecast_days=1`
      );
      
      const weatherData = await weatherResponse.json();
      
      // Calculate moon phase
      const moonData = calculateMoonPhase(new Date());
      
      // Analyze conditions
      const cloudCover = weatherData.hourly.cloudcover[0] || 0;
      const humidity = weatherData.hourly.relativehumidity_2m[0] || 0;
      
      const analysis = analyzeConditions(cloudCover, humidity, moonData.illumination);
      
      const stargazingAnalysis = {
        rating: analysis.rating,
        moonPhase: moonData.phase,
        moonIllumination: moonData.illumination,
        cloudCover,
        humidity,
        recommendation: analysis.recommendation,
        bestTime: analysis.bestTime,
      };
      
      setStargazingData(stargazingAnalysis);
      
      // Update context with stargazing conditions
      setStargazingConditions({
        rating: analysis.rating,
        factors: {
          moonPhase: moonData.illumination,
          cloudCover,
          humidity,
          visibility: analysis.visibility,
        },
        recommendation: analysis.recommendation,
      });
      
    } catch (error) {
      console.error('Error analyzing stargazing conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMoonPhase = (date: Date) => {
    const lunationLength = 29.530588853;
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const age = daysSinceKnownNewMoon % lunationLength;
    const phasePercent = age / lunationLength;
    
    let phase: string;
    let illumination: number;
    
    if (phasePercent < 0.125) {
      phase = 'New Moon';
      illumination = 0;
    } else if (phasePercent < 0.25) {
      phase = 'Waxing Crescent';
      illumination = phasePercent * 4 * 50;
    } else if (phasePercent < 0.375) {
      phase = 'First Quarter';
      illumination = 50;
    } else if (phasePercent < 0.5) {
      phase = 'Waxing Gibbous';
      illumination = 50 + (phasePercent - 0.25) * 4 * 50;
    } else if (phasePercent < 0.625) {
      phase = 'Full Moon';
      illumination = 100;
    } else if (phasePercent < 0.75) {
      phase = 'Waning Gibbous';
      illumination = 100 - (phasePercent - 0.5) * 4 * 50;
    } else if (phasePercent < 0.875) {
      phase = 'Last Quarter';
      illumination = 50;
    } else {
      phase = 'Waning Crescent';
      illumination = 50 - (phasePercent - 0.75) * 4 * 50;
    }
    
    return { phase, illumination: Math.round(Math.max(0, Math.min(100, illumination))) };
  };

  const analyzeConditions = (cloudCover: number, humidity: number, moonIllumination: number) => {
    let rating = 10;
    let factors = [];
    
    // Cloud cover impact (most important)
    if (cloudCover > 80) {
      rating -= 6;
      factors.push('heavy cloud cover');
    } else if (cloudCover > 50) {
      rating -= 4;
      factors.push('moderate cloud cover');
    } else if (cloudCover > 20) {
      rating -= 2;
      factors.push('some clouds');
    }
    
    // Moon illumination impact
    if (moonIllumination > 80) {
      rating -= 3;
      factors.push('bright moon');
    } else if (moonIllumination > 50) {
      rating -= 2;
      factors.push('moderate moonlight');
    }
    
    // Humidity impact (affects atmospheric clarity)
    if (humidity > 80) {
      rating -= 1;
      factors.push('high humidity');
    }
    
    rating = Math.max(1, Math.min(10, rating));
    
    let recommendation = '';
    let visibility = '';
    let bestTime = '';
    
    if (rating >= 8) {
      recommendation = 'Excellent conditions for stargazing! Perfect night for astrophotography.';
      visibility = 'Excellent';
      bestTime = moonIllumination < 30 ? 'All night' : 'After midnight when moon sets';
    } else if (rating >= 6) {
      recommendation = 'Good conditions for stargazing. Some compromises but still worthwhile.';
      visibility = 'Good';
      bestTime = 'Late evening to early morning';
    } else if (rating >= 4) {
      recommendation = 'Fair conditions. Bright objects like planets and moon will be visible.';
      visibility = 'Fair';
      bestTime = 'When skies are clearest';
    } else {
      recommendation = 'Poor conditions for stargazing. Consider waiting for clearer skies.';
      visibility = 'Poor';
      bestTime = 'Wait for better conditions';
    }
    
    return { rating, recommendation, visibility, bestTime };
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 8) return 'bg-green-500/20 border-green-500/30';
    if (rating >= 6) return 'bg-yellow-500/20 border-yellow-500/30';
    if (rating >= 4) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (!location) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white h-full">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
          <Star className="w-12 h-12 mb-4 text-slate-500" />
          <p className="text-slate-400 text-sm">Search for a location to analyze stargazing conditions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white hover:bg-slate-900/60 transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <Star className="w-6 h-6 text-yellow-400" />
          <div>
            <div>Stargazing Tonight</div>
            <p className="text-slate-400 text-sm font-normal truncate">{location.name}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-slate-800/50 rounded"></div>
            <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-slate-800/50 rounded"></div>
              <div className="h-12 bg-slate-800/50 rounded"></div>
            </div>
          </div>
        ) : stargazingData ? (
          <>
            {/* Rating Display */}
            <div className={`text-center p-4 rounded-lg border ${getRatingBg(stargazingData.rating)}`}>
              <div className={`text-3xl font-bold mb-1 ${getRatingColor(stargazingData.rating)}`}>
                {stargazingData.rating}/10
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {stargazingData.recommendation}
              </p>
            </div>
            
            {/* Conditions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/30 rounded-lg p-3">
                <h4 className="text-xs text-slate-500 mb-1">Moon Phase</h4>
                <div className="text-sm font-medium">{stargazingData.moonPhase}</div>
                <div className="text-xs text-slate-400">{stargazingData.moonIllumination}% lit</div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-3">
                <h4 className="text-xs text-slate-500 mb-1">Cloud Cover</h4>
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-slate-400" />
                  <span className="text-sm font-medium">{stargazingData.cloudCover}%</span>
                </div>
              </div>
            </div>
            
            {/* Best Time */}
            <div className="bg-slate-800/30 rounded-lg p-3">
              <h4 className="text-xs text-slate-500 mb-1">Best Viewing Time</h4>
              <span className="text-sm font-medium">{stargazingData.bestTime}</span>
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-center py-8 text-sm">No stargazing data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StargazingCard;
