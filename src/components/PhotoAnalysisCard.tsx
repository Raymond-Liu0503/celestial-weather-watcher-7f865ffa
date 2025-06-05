
import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from '../contexts/LocationContext';

interface CompositionSuggestion {
  type: string;
  description: string;
  tip: string;
}

const PhotoAnalysisCard = () => {
  const { location, stargazingConditions } = useLocation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CompositionSuggestion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        analyzePhoto(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async (imageUrl: string) => {
    setAnalyzing(true);
    
    // Simulate photo analysis with composition suggestions
    setTimeout(() => {
      const baseSuggestions: CompositionSuggestion[] = [
        {
          type: "Rule of Thirds",
          description: "Place key celestial objects along the grid lines or at intersection points",
          tip: "Position the horizon on the lower third line for better sky composition"
        },
        {
          type: "Foreground Interest",
          description: "Include trees, mountains, or structures to add depth and context",
          tip: "Silhouettes against the night sky create dramatic contrast"
        },
        {
          type: "Leading Lines",
          description: "Use natural or man-made lines to guide the eye toward your subject",
          tip: "Rivers, paths, or rock formations can lead to the Milky Way"
        }
      ];

      // Add location-specific suggestions based on stargazing conditions
      if (stargazingConditions) {
        if (stargazingConditions.rating >= 8) {
          baseSuggestions.push({
            type: "Milky Way Core",
            description: "Excellent conditions for capturing the galactic center",
            tip: "Face south and look for the bright core rising after midnight"
          });
        }
        
        if (stargazingConditions.factors.moonPhase < 30) {
          baseSuggestions.push({
            type: "Deep Sky Objects",
            description: "Dark skies perfect for capturing nebulae and star clusters",
            tip: "Use longer exposures (15-30s) to reveal fainter celestial objects"
          });
        } else {
          baseSuggestions.push({
            type: "Moonlit Landscapes",
            description: "Use moonlight to illuminate foreground elements naturally",
            tip: "Balance moon exposure with star trails for dramatic effect"
          });
        }
      }

      setSuggestions(baseSuggestions);
      setAnalyzing(false);
    }, 2000);
  };

  const getLocationSpecificTips = () => {
    if (!location || !stargazingConditions) return [];
    
    const tips = [];
    
    if (stargazingConditions.factors.cloudCover < 20) {
      tips.push("Clear skies detected - perfect for long exposure astrophotography");
    }
    
    if (stargazingConditions.factors.humidity < 60) {
      tips.push("Low humidity means less atmospheric distortion for sharper stars");
    }
    
    if (stargazingConditions.rating >= 7) {
      tips.push("Excellent conditions for capturing the Milky Way tonight");
    }
    
    return tips;
  };

  if (!location) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardContent className="p-8 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300">Search for a location to get photo composition suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Camera className="w-8 h-8 text-purple-400" />
          Photo Analysis & Composition
        </CardTitle>
        <p className="text-gray-300 text-sm">{location.name}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo for Analysis
            </Button>
          </div>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded for analysis"
                className="w-full h-32 object-cover rounded-lg"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Analyzing composition...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location-Specific Tips */}
          {getLocationSpecificTips().length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Tonight's Photography Tips
              </h4>
              <ul className="space-y-1">
                {getLocationSpecificTips().map((tip, index) => (
                  <li key={index} className="text-sm text-gray-300">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Composition Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-purple-400">Composition Suggestions</h4>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-2">{suggestion.type}</h5>
                  <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                  <p className="text-purple-300 text-xs italic">💡 {suggestion.tip}</p>
                </div>
              ))}
            </div>
          )}

          {/* General Astrophotography Tips */}
          {!uploadedImage && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm text-gray-400 mb-2">General Astrophotography Tips</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Use manual focus set to infinity</li>
                <li>• Start with 15-25 second exposures</li>
                <li>• Use the 500 rule: 500 ÷ focal length = max exposure time</li>
                <li>• Shoot in RAW format for better post-processing</li>
                <li>• Use a tripod and remote shutter release</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoAnalysisCard;
