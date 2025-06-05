
import React from 'react';
import LocationSearch from '../components/LocationSearch';
import WeatherCard from '../components/WeatherCard';
import MoonPhaseCard from '../components/MoonPhaseCard';
import ForecastCard from '../components/ForecastCard';
import StargazingCard from '../components/StargazingCard';
import AstrophotographyCard from '../components/AstrophotographyCard';
import PhotoAnalysisCard from '../components/PhotoAnalysisCard';
import { LocationProvider } from '../contexts/LocationContext';

const Index = () => {
  return (
    <LocationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Celestial Dashboard
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover weather conditions, lunar cycles, and astrophotography opportunities for any location on Earth
            </p>
          </div>

          {/* Location Search */}
          <div className="mb-8">
            <LocationSearch />
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Current Conditions Row */}
            <WeatherCard />
            <MoonPhaseCard />
            <StargazingCard />
            
            {/* Forecast and Planning Row */}
            <ForecastCard />
            <AstrophotographyCard />
            <PhotoAnalysisCard />
          </div>
        </div>
      </div>
    </LocationProvider>
  );
};

export default Index;
