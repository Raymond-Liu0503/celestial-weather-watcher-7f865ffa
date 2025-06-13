
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
        <div className="absolute inset-0 opacity-30">
          <div className="stars stars-1"></div>
          <div className="stars stars-2"></div>
          <div className="stars stars-3"></div>
          <div className="shooting-stars"></div>
        </div>
        
        <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
          {/* Enhanced Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent leading-tight">
              AstroHub
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-200 mb-6">
              Your AI-powered astrophotography companion for discovering perfect stargazing conditions
            </p>
            <div className="flex items-center justify-center gap-4 text-slate-400 text-sm animate-fade-in animation-delay-400 flex-wrap">
              <div className="flex items-center gap-2">
                <span>Real-time conditions</span>
              </div>
              <span className="hidden sm:block">•</span>
              <div className="flex items-center gap-2">
                <span>AI photo analysis</span>
              </div>
              <span className="hidden sm:block">•</span>
              <div className="flex items-center gap-2">
                <span>Stargazing forecasts</span>
              </div>
            </div>
          </div>

          {/* Location Search */}
          <div className="mb-12 animate-scale-in animation-delay-600">
            <LocationSearch />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Primary Cards */}
            <div className="lg:col-span-8 space-y-6">
              {/* Top Row - Key Weather Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="animate-fade-in animation-delay-800">
                  <WeatherCard />
                </div>
                <div className="animate-fade-in animation-delay-1000">
                  <StargazingCard />
                </div>
              </div>

              {/* Middle Row - Celestial Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="animate-fade-in animation-delay-1200">
                  <MoonPhaseCard />
                </div>
                <div className="animate-fade-in animation-delay-1400">
                  <ForecastCard />
                </div>
              </div>

              {/* Bottom Row - Locations */}
              <div className="animate-fade-in animation-delay-1600">
                <AstrophotographyCard />
              </div>
            </div>

            {/* Right Column - AI Analysis */}
            <div className="lg:col-span-4 animate-fade-in animation-delay-1800">
              <div className="sticky top-6">
                <PhotoAnalysisCard />
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mt-16 text-slate-500 text-sm animate-fade-in animation-delay-2000">
            <div className="border-t border-slate-800 pt-8 mb-4"></div>
            <p className="hover:text-slate-400 transition-colors duration-300">
              Explore the universe • Plan your perfect night under the stars
            </p>
            <p className="text-xs mt-2 text-slate-600">
              Real-time weather data • AI-powered insights • Dark sky locations
            </p>
          </div>
        </div>
      </div>
    </LocationProvider>
  );
};

export default Index;
