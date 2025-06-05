
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 opacity-30">
          <div className="stars stars-1"></div>
          <div className="stars stars-2"></div>
          <div className="stars stars-3"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              ✨ Celestial Observatory
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Your AI-powered companion for discovering perfect dark skies, analyzing celestial conditions, 
              and capturing the cosmos through your lens
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-sm">
              <span>🌌</span>
              <span>Real-time conditions</span>
              <span>•</span>
              <span>🔭</span>
              <span>AI photo analysis</span>
              <span>•</span>
              <span>⭐</span>
              <span>Stargazing forecasts</span>
            </div>
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

          {/* Footer */}
          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>Explore the universe • Plan your perfect night under the stars</p>
          </div>
        </div>
      </div>
    </LocationProvider>
  );
};

export default Index;
