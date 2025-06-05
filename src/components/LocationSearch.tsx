
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from '../contexts/LocationContext';
import { toast } from '@/hooks/use-toast';

const LocationSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setLocation, setIsLoading, getUserLocation, isGettingLocation } = useLocation();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a location",
        description: "Enter a city name or address to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        toast({
          title: "Location not found",
          description: "Please try a different search term",
          variant: "destructive",
        });
        return;
      }
      
      const locationData = {
        name: data[0].display_name.split(',')[0],
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
      
      setLocation(locationData);
      
      toast({
        title: "Location found!",
        description: `Now showing celestial data for ${locationData.name}`,
      });
      
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Search failed",
        description: "Unable to search for location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900/30 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search any location on Earth..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/50 h-12 text-base"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-6 h-12 shadow-lg"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={getUserLocation}
            disabled={isGettingLocation}
            variant="outline"
            className="bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isGettingLocation ? 'Getting Location...' : 'Use My Current Location'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;
