
import React from 'react';
import { Star, Eye, Droplets, Cloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';

const StargazingCard = () => {
  const { location, stargazingConditions } = useLocation();

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingBackground = (rating: number) => {
    if (rating >= 8) return 'bg-green-500/20 border-green-400/30';
    if (rating >= 6) return 'bg-yellow-500/20 border-yellow-400/30';
    if (rating >= 4) return 'bg-orange-500/20 border-orange-400/30';
    return 'bg-red-500/20 border-red-400/30';
  };

  const getRecommendation = (rating: number) => {
    if (rating >= 8) return 'Excellent for stargazing!';
    if (rating >= 6) return 'Good stargazing conditions';
    if (rating >= 4) return 'Fair conditions';
    return 'Poor conditions tonight';
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="p-4 text-center flex flex-col items-center justify-center">
          <Star className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-gray-300 text-sm">Search for location</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-purple-400" />
          Stargazing
        </CardTitle>
        <p className="text-gray-300 text-xs truncate">{location.name}</p>
      </CardHeader>
      <CardContent className="pb-3">
        {stargazingConditions ? (
          <div className="space-y-3">
            <div className={`text-center p-3 rounded-lg border ${getRatingBackground(stargazingConditions.rating)}`}>
              <div className={`text-2xl font-bold ${getRatingColor(stargazingConditions.rating)}`}>
                {stargazingConditions.rating}/10
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {getRecommendation(stargazingConditions.rating)}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center p-1.5 bg-white/5 rounded">
                <Cloud className="w-3 h-3 mx-auto mb-1 text-blue-400" />
                <div className="font-semibold">{stargazingConditions.factors.cloudCover}%</div>
                <div className="text-gray-400">Clouds</div>
              </div>
              <div className="text-center p-1.5 bg-white/5 rounded">
                <Droplets className="w-3 h-3 mx-auto mb-1 text-cyan-400" />
                <div className="font-semibold">{stargazingConditions.factors.humidity}%</div>
                <div className="text-gray-400">Humidity</div>
              </div>
              <div className="text-center p-1.5 bg-white/5 rounded">
                <Eye className="w-3 h-3 mx-auto mb-1 text-green-400" />
                <div className="font-semibold">{stargazingConditions.factors.visibility}km</div>
                <div className="text-gray-400">Visibility</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StargazingCard;
