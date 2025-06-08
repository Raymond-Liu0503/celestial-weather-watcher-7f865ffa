
import React, { useEffect, useState } from 'react';
import { Camera, MapPin, Star, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from '../contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';

interface AstroLocation {
  id: string;
  name: string;
  distance: number;
  dark_sky_rating: number;
  description: string;
  coordinates: { lat: number; lon: number };
  created_at: string;
}

const AstrophotographyCard = () => {
  const { location, stargazingConditions } = useLocation();
  const [astroLocations, setAstroLocations] = useState<AstroLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<AstroLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number>(200); // Default 200km
  const [showFilters, setShowFilters] = useState(false);

  const distanceOptions = [
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 200, label: '200' },
    { value: 500, label: '500' },
    { value: 1000, label: 'All' }
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
      // Fetch locations from Supabase
      const { data, error } = await supabase
        .from('astro_locations')
        .select('*')
        .order('dark_sky_rating', { ascending: false });

      if (error) throw error;

      // Calculate distances and add them to the locations with proper type casting
      const locationsWithDistance = data.map(loc => {
        // Safely cast the coordinates from Json to the expected type
        const coordinates = loc.coordinates as { lat: number; lon: number };
        
        return {
          ...loc,
          coordinates,
          distance: calculateDistance(
            location.lat,
            location.lon,
            coordinates.lat,
            coordinates.lon
          )
        } as AstroLocation;
      });

      setAstroLocations(locationsWithDistance);
      
    } catch (error) {
      console.error('Error finding astrophotography locations:', error);
    } finally {
      setLoading(false);
    }
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
        <CardContent className="p-4 text-center">
          <Camera className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-slate-300 text-sm">Search for a location to find astrophotography sites</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-md border-slate-700/50 text-white hover:bg-slate-800/50 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="w-5 h-5 text-purple-400" />
          Astrophotography
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-slate-300 text-xs truncate">{location.name}</p>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 text-xs px-2 py-1 h-6"
          >
            <Filter className="w-3 h-3 mr-1" />
            Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {/* Distance Filter */}
        {showFilters && (
          <div className="mb-3 p-2 bg-slate-800/30 rounded border border-slate-600">
            <h4 className="text-xs text-slate-400 mb-2">Distance (km)</h4>
            <div className="flex flex-wrap gap-1">
              {distanceOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setDistanceFilter(option.value)}
                  variant={distanceFilter === option.value ? "default" : "outline"}
                  size="sm"
                  className={`text-xs px-2 py-1 h-6 min-w-0 flex-shrink-0 ${
                    distanceFilter === option.value
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {filteredLocations.length} of {astroLocations.length} locations
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-800/20 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-400 text-xs">No locations found within selected distance.</p>
                <Button
                  onClick={() => setDistanceFilter(1000)}
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 text-xs px-2 py-1 h-6"
                >
                  Show all locations
                </Button>
              </div>
            ) : (
              filteredLocations.slice(0, 3).map((loc) => (
                <div 
                  key={loc.id} 
                  className="bg-slate-800/20 rounded p-2 hover:bg-slate-800/40 transition-colors cursor-pointer border border-slate-700/30"
                  onClick={() => openInMaps(loc.coordinates)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      <h4 className="font-semibold text-sm truncate">{loc.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className={`w-3 h-3 ${getRatingColor(loc.dark_sky_rating)}`} />
                      <span className={`text-xs font-medium ${getRatingColor(loc.dark_sky_rating)}`}>
                        {loc.dark_sky_rating}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-1 truncate">{loc.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">{loc.distance} km away</span>
                    <span className="text-blue-400 hover:text-blue-300">View →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {stargazingConditions && (
          <div className="mt-3 p-2 bg-blue-500/20 rounded border border-blue-400/30">
            <p className="text-xs text-blue-200">
              💡 Current rating: {stargazingConditions.rating}/10
              {stargazingConditions.rating >= 7 ? ' - Great night!' : ' - Wait for clearer skies.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AstrophotographyCard;
