
import React, { useEffect, useState } from 'react';
import { Camera, MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';

interface AstroLocation {
  name: string;
  distance: number;
  darkSkyRating: number;
  description: string;
  coordinates: { lat: number; lon: number };
}

const AstrophotographyCard = () => {
  const { location, stargazingConditions } = useLocation();
  const [astroLocations, setAstroLocations] = useState<AstroLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      findAstrophotographyLocations();
    }
  }, [location]);

  const findAstrophotographyLocations = async () => {
    if (!location) return;
    
    setLoading(true);
    
    try {
      // Generate suggested locations based on the user's location
      // In a real app, this would query a database of dark sky locations
      const suggestions = generateLocationSuggestions(location);
      setAstroLocations(suggestions);
      
    } catch (error) {
      console.error('Error finding astrophotography locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLocationSuggestions = (userLocation: { lat: number; lon: number; name: string }) => {
    // This is a simplified version - in reality, you'd have a database of dark sky locations
    const suggestions: AstroLocation[] = [
      {
        name: 'National Park Observatory',
        distance: calculateDistance(userLocation.lat, userLocation.lon, userLocation.lat + 0.5, userLocation.lon + 0.3),
        darkSkyRating: 9,
        description: 'Designated Dark Sky area with minimal light pollution',
        coordinates: { lat: userLocation.lat + 0.5, lon: userLocation.lon + 0.3 }
      },
      {
        name: 'Mountain Peak Lookout',
        distance: calculateDistance(userLocation.lat, userLocation.lon, userLocation.lat - 0.3, userLocation.lon + 0.4),
        darkSkyRating: 8,
        description: 'High elevation site with excellent horizon views',
        coordinates: { lat: userLocation.lat - 0.3, lon: userLocation.lon + 0.4 }
      },
      {
        name: 'Rural Observatory Site',
        distance: calculateDistance(userLocation.lat, userLocation.lon, userLocation.lat + 0.2, userLocation.lon - 0.6),
        darkSkyRating: 7,
        description: 'Remote location away from city lights',
        coordinates: { lat: userLocation.lat + 0.2, lon: userLocation.lon - 0.6 }
      },
      {
        name: 'Desert Viewing Area',
        distance: calculateDistance(userLocation.lat, userLocation.lon, userLocation.lat - 0.4, userLocation.lon - 0.2),
        darkSkyRating: 9,
        description: 'Dry climate with exceptional atmospheric clarity',
        coordinates: { lat: userLocation.lat - 0.4, lon: userLocation.lon - 0.2 }
      },
      {
        name: 'Lakeside Dark Zone',
        distance: calculateDistance(userLocation.lat, userLocation.lon, userLocation.lat + 0.6, userLocation.lon - 0.1),
        darkSkyRating: 6,
        description: 'Peaceful location with good northern sky access',
        coordinates: { lat: userLocation.lat + 0.6, lon: userLocation.lon - 0.1 }
      }
    ];

    // Sort by a combination of dark sky rating and proximity
    return suggestions
      .map(loc => ({
        ...loc,
        score: (loc.darkSkyRating / 10) * 0.7 + (100 / (loc.distance + 10)) * 0.3
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ score, ...loc }) => loc);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const openInMaps = (coordinates: { lat: number; lon: number }) => {
    const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lon}`;
    window.open(url, '_blank');
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="p-8 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">Search for a location to find astrophotography sites</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Camera className="w-8 h-8 text-purple-400" />
          Astrophotography Locations
        </CardTitle>
        <p className="text-gray-300 text-sm">Near {location.name}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white/20 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {astroLocations.map((loc, index) => (
              <div 
                key={index} 
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => openInMaps(loc.coordinates)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <h4 className="font-semibold">{loc.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className={`w-4 h-4 ${getRatingColor(loc.darkSkyRating)}`} />
                    <span className={`text-sm font-medium ${getRatingColor(loc.darkSkyRating)}`}>
                      {loc.darkSkyRating}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{loc.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{loc.distance} km away</span>
                  <span className="text-blue-400 hover:text-blue-300">View on map →</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {stargazingConditions && (
          <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <p className="text-sm text-blue-200">
              💡 Current conditions rating: {stargazingConditions.rating}/10
              {stargazingConditions.rating >= 7 ? ' - Great night for astrophotography!' : ' - Consider waiting for clearer skies.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AstrophotographyCard;
