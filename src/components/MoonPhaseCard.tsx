
import React, { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '../contexts/LocationContext';

interface MoonData {
  phase: string;
  illumination: number;
  age: number;
}

const MoonPhaseCard = () => {
  const { location } = useLocation();
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      fetchMoonData();
    }
  }, [location]);

  const fetchMoonData = async () => {
    setLoading(true);
    
    try {
      // Calculate moon phase based on current date
      const now = new Date();
      const moonPhaseData = calculateMoonPhase(now);
      setMoonData(moonPhaseData);
    } catch (error) {
      console.error('Error calculating moon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMoonPhase = (date: Date): MoonData => {
    // Simplified moon phase calculation
    const lunationLength = 29.530588853; // Average lunar cycle length in days
    const knownNewMoon = new Date('2000-01-06T18:14:00Z'); // Known new moon date
    
    const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const age = daysSinceKnownNewMoon % lunationLength;
    const phasePercent = age / lunationLength;
    
    let phase: string;
    let illumination: number;
    
    if (phasePercent < 0.125) {
      phase = 'New Moon';
      illumination = 0;
    } else if (phasePercent < 0.25) {
      phase = 'Waxing Crescent';
      illumination = phasePercent * 4 * 50;
    } else if (phasePercent < 0.375) {
      phase = 'First Quarter';
      illumination = 50;
    } else if (phasePercent < 0.5) {
      phase = 'Waxing Gibbous';
      illumination = 50 + (phasePercent - 0.25) * 4 * 50;
    } else if (phasePercent < 0.625) {
      phase = 'Full Moon';
      illumination = 100;
    } else if (phasePercent < 0.75) {
      phase = 'Waning Gibbous';
      illumination = 100 - (phasePercent - 0.5) * 4 * 50;
    } else if (phasePercent < 0.875) {
      phase = 'Last Quarter';
      illumination = 50;
    } else {
      phase = 'Waning Crescent';
      illumination = 50 - (phasePercent - 0.75) * 4 * 50;
    }
    
    return {
      phase,
      illumination: Math.round(Math.max(0, Math.min(100, illumination))),
      age: Math.round(age),
    };
  };

  const getMoonIcon = () => {
    if (!moonData) return <Moon className="w-8 h-8" />;
    
    const illumination = moonData.illumination;
    let moonColor = 'text-gray-300';
    
    if (illumination > 80) {
      moonColor = 'text-yellow-200';
    } else if (illumination > 40) {
      moonColor = 'text-gray-200';
    }
    
    return <Moon className={`w-8 h-8 ${moonColor}`} />;
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white card-hover">
        <CardContent className="p-8 text-center">
          <Moon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">Search for a location to view lunar data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300 card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {getMoonIcon()}
          Lunar Phase
        </CardTitle>
        <p className="text-gray-300 text-sm">{location.name}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-white/20 rounded"></div>
              <div className="h-16 bg-white/20 rounded"></div>
            </div>
          </div>
        ) : moonData ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-600 relative overflow-hidden">
                  <div 
                    className="absolute top-0 right-0 h-full bg-gradient-to-l from-yellow-200 to-yellow-100 rounded-full transition-all duration-500"
                    style={{ width: `${moonData.illumination}%` }}
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-yellow-200">{moonData.phase}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">Illumination</h4>
                <span className="text-xl font-semibold">{moonData.illumination}%</span>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                <h4 className="text-sm text-gray-400 mb-1">Age</h4>
                <span className="text-xl font-semibold">{moonData.age} days</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-center py-4">No lunar data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MoonPhaseCard;
