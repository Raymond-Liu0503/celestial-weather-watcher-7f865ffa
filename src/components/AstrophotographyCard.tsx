import React, { useEffect, useState } from 'react';
import { Camera, MapPin, Star, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [filteredLocations, setFilteredLocations] = useState<AstroLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number>(200); // Default 200km
  const [showFilters, setShowFilters] = useState(false);

  const distanceOptions = [
    { value: 50, label: 'Within 50km' },
    { value: 100, label: 'Within 100km' },
    { value: 200, label: 'Within 200km' },
    { value: 500, label: 'Within 500km' },
    { value: 1000, label: 'No limit' }
  ];

  useEffect(() => {
    if (location) {
      findAstrophotographyLocations();
    }
  }, [location]);

  useEffect(() => {
    // Filter locations based on distance
    const filtered = astroLocations.filter(loc => 
      distanceFilter >= 1000 || loc.distance <= distanceFilter
    );
    setFilteredLocations(filtered);
  }, [astroLocations, distanceFilter]);

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
      },
      {
        name: 'Remote Mountain Reserve',
        distance: calculateDistance(userLocation.lat, userLocation.lon, userLocation.lat + 1.2, userLocation.lon + 0.8),
        darkSkyRating: 10,
        description: 'Pristine dark skies at high altitude',
        coordinates: { lat: userLocation.lat + 1.2, lon: userLocation.lon + 0.8 }
      },
      {
        name: 'Coastal Observatory',
        distance: calculateDistance(userLocation.lat, userLocation.lon, userLocation.lat - 0.8, userLocation.lon + 1.1),
        darkSkyRating: 7,
        description: 'Ocean views with minimal eastern light pollution',
        coordinates: { lat: userLocation.lat - 0.8, lon: userLocation.lon + 1.1 }
      }
    ];

    // Sort by a combination of dark sky rating and proximity
    return suggestions
      .map(loc => ({
        ...loc,
        score: (loc.darkSkyRating / 10) * 0.7 + (100 / (loc.distance + 10)) * 0.3
      }))
      .sort((a, b) => b.score - a.score)
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
      <Card className="bg-slate-900/50 backdrop-blur-md border-slate-700/50 text-white">
        <CardContent className="p-8 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-300">Search for a location to find astrophotography sites</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-md border-slate-700/50 text-white hover:bg-slate-800/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Camera className="w-8 h-8 text-purple-400" />
          Astrophotography Locations
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-slate-300 text-sm">Near {location.name}</p>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Distance Filter */}
        {showFilters && (
          <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-600">
            <h4 className="text-sm text-slate-400 mb-2">Distance Filter</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {distanceOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setDistanceFilter(option.value)}
                  variant={distanceFilter === option.value ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${
                    distanceFilter === option.value
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Showing {filteredLocations.length} of {astroLocations.length} locations
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-800/20 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No locations found within selected distance.</p>
                <Button
                  onClick={() => setDistanceFilter(1000)}
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  Show all locations
                </Button>
              </div>
            ) : (
              filteredLocations.map((loc, index) => (
                <div 
                  key={index} 
                  className="bg-slate-800/20 rounded-lg p-4 hover:bg-slate-800/40 transition-colors cursor-pointer border border-slate-700/30"
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
                  <p className="text-sm text-slate-400 mb-2">{loc.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{loc.distance} km away</span>
                    <span className="text-blue-400 hover:text-blue-300">View on map →</span>
                  </div>
                </div>
              ))
            )}
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
