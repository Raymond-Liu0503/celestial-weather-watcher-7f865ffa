
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

interface StargazingConditions {
  rating: number; // 1-10 scale
  factors: {
    moonPhase: number;
    cloudCover: number;
    humidity: number;
    visibility: string;
  };
  recommendation: string;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  stargazingConditions: StargazingConditions | null;
  setStargazingConditions: (conditions: StargazingConditions) => void;
  getUserLocation: () => void;
  isGettingLocation: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stargazingConditions, setStargazingConditions] = useState<StargazingConditions | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const locationData = {
            name: data.address?.city || data.address?.town || data.address?.village || 'Current Location',
            lat: latitude,
            lon: longitude,
          };
          
          setLocation(locationData);
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocation({
            name: 'Current Location',
            lat: latitude,
            lon: longitude,
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
        setIsGettingLocation(false);
      }
    );
  };

  // Auto-get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ 
      location, 
      setLocation, 
      isLoading, 
      setIsLoading, 
      stargazingConditions, 
      setStargazingConditions,
      getUserLocation,
      isGettingLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};
