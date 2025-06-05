
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
        description: `Now showing data for ${locationData.name}`,
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
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter city name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
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
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;
