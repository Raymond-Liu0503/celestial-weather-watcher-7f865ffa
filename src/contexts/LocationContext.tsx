
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
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

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoading, setIsLoading }}>
      {children}
    </LocationContext.Provider>
  );
};
