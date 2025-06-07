
import React, { useEffect } from 'react';
import LocationSearch from '../components/LocationSearch';
import WeatherCard from '../components/WeatherCard';
import MoonPhaseCard from '../components/MoonPhaseCard';
import ForecastCard from '../components/ForecastCard';
import StargazingCard from '../components/StargazingCard';
import AstrophotographyCard from '../components/AstrophotographyCard';
import PhotoAnalysisCard from '../components/PhotoAnalysisCard';
import { LocationProvider } from '../contexts/LocationContext';
import { visitTracker } from '../utils/visitTracker';

const Index = () => {
  useEffect(() => {
    // Track visit when component mounts
    visitTracker.trackVisit('/');
  }, []);

  return (
    <LocationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
        {/* Enhanced animated stars background */}
        <div className="absolute inset-0 opacity-40">
          <div className="stars stars-1"></div>
          <div className="stars stars-2"></div>
          <div className="stars stars-3"></div>
          <div className="shooting-stars"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Enhanced Header with animations */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              ✨ Celestial Observatory
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
              Your AI-powered companion for discovering perfect dark skies, analyzing celestial conditions, 
              and capturing the cosmos through your lens
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-sm animate-fade-in animation-delay-400">
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

          {/* Location Search with animation */}
          <div className="mb-8 animate-scale-in animation-delay-600">
            <LocationSearch />
          </div>

          {/* Dashboard Layout */}
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Row - 5 Smaller Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="animate-fade-in animation-delay-800">
                <WeatherCard />
              </div>
              <div className="animate-fade-in animation-delay-1000">
                <MoonPhaseCard />
              </div>
              <div className="animate-fade-in animation-delay-1200">
                <StargazingCard />
              </div>
              <div className="animate-fade-in animation-delay-1400">
                <ForecastCard />
              </div>
              <div className="animate-fade-in animation-delay-1600">
                <AstrophotographyCard />
              </div>
            </div>

            {/* Bottom Section - Large AI Photo Analysis Card */}
            <div className="animate-fade-in animation-delay-1800">
              <PhotoAnalysisCard />
            </div>
          </div>

          {/* Enhanced Footer with animation */}
          <div className="text-center mt-12 text-slate-500 text-sm animate-fade-in animation-delay-2000">
            <p className="hover:text-slate-400 transition-colors duration-300">
              Explore the universe • Plan your perfect night under the stars
            </p>
          </div>
        </div>
      </div>
    </LocationProvider>
  );
};

export default Index;
