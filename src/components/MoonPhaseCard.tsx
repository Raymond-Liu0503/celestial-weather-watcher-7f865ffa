
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
    if (!moonData) return <Moon className="w-6 h-6" />;
    
    const illumination = moonData.illumination;
    let moonColor = 'text-slate-400';
    
    if (illumination > 80) {
      moonColor = 'text-yellow-200';
    } else if (illumination > 40) {
      moonColor = 'text-slate-200';
    }
    
    return <Moon className={`w-6 h-6 ${moonColor}`} />;
  };

  if (!location) {
    return (
      <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white h-full">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
          <Moon className="w-12 h-12 mb-4 text-slate-500" />
          <p className="text-slate-400 text-sm">Search for a location to view lunar data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white hover:bg-slate-900/60 transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          {getMoonIcon()}
          <div>
            <div>Moon Phase</div>
            <p className="text-slate-400 text-sm font-normal truncate">{location.name}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-slate-800/50 rounded mx-auto w-16"></div>
            <div className="h-4 bg-slate-800/50 rounded w-2/3 mx-auto"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-slate-800/50 rounded"></div>
              <div className="h-12 bg-slate-800/50 rounded"></div>
            </div>
          </div>
        ) : moonData ? (
          <>
            {/* Moon Visual */}
            <div className="text-center mb-4">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="w-16 h-16 rounded-full bg-slate-700 relative overflow-hidden border-2 border-slate-600">
                  <div 
                    className="absolute top-0 right-0 h-full bg-gradient-to-l from-yellow-200 to-yellow-100 rounded-full transition-all duration-500"
                    style={{ width: `${moonData.illumination}%` }}
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-yellow-200">{moonData.phase}</h3>
            </div>
            
            {/* Moon Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-sm font-medium text-white">{moonData.illumination}%</div>
                <div className="text-xs text-slate-500">Illuminated</div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-sm font-medium text-white">{moonData.age} days</div>
                <div className="text-xs text-slate-500">Moon Age</div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-center py-8 text-sm">No lunar data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MoonPhaseCard;
