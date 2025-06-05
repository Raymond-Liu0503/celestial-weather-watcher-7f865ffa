
import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from '../contexts/LocationContext';
import { toast } from '@/hooks/use-toast';

interface CompositionSuggestion {
  type: string;
  description: string;
  tip: string;
  confidence?: number;
}

interface AIAnalysisResult {
  overallQuality: number;
  suggestions: CompositionSuggestion[];
  detectedElements: string[];
  improvementAreas: string[];
}

const PhotoAnalysisCard = () => {
  const { location, stargazingConditions } = useLocation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [apiCallsUsed, setApiCallsUsed] = useState(() => {
    return parseInt(localStorage.getItem('photoAnalysisApiCalls') || '0');
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_API_CALLS = 5; // Limit to 5 analyses per session

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (apiCallsUsed >= MAX_API_CALLS) {
        toast({
          title: "API Limit Reached",
          description: `You've used all ${MAX_API_CALLS} photo analyses for this session. Refresh the page to reset.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        analyzePhotoWithAI(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhotoWithAI = async (imageUrl: string) => {
    setAnalyzing(true);
    
    try {
      // Simulate AI analysis with more detailed feedback
      const analysisResult = await performAIAnalysis(imageUrl);
      setAiAnalysis(analysisResult);
      
      // Update API call count
      const newCount = apiCallsUsed + 1;
      setApiCallsUsed(newCount);
      localStorage.setItem('photoAnalysisApiCalls', newCount.toString());
      
      toast({
        title: "Analysis Complete",
        description: `Photo analyzed successfully! ${MAX_API_CALLS - newCount} analyses remaining.`,
      });
      
    } catch (error) {
      console.error('Error analyzing photo:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const performAIAnalysis = async (imageUrl: string): Promise<AIAnalysisResult> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate AI analysis results based on image characteristics
    const mockAnalysis: AIAnalysisResult = {
      overallQuality: Math.floor(Math.random() * 3) + 7, // 7-9 rating
      detectedElements: [
        'Night sky',
        'Stars visible',
        'Foreground silhouette',
        'Horizon line',
        'Possible light pollution'
      ],
      improvementAreas: [
        'Reduce light pollution impact',
        'Enhance star visibility',
        'Improve foreground composition',
        'Adjust exposure balance'
      ],
      suggestions: [
        {
          type: "Star Trail Optimization",
          description: "Your star trails could be enhanced with longer exposure times",
          tip: "Try 4-6 minute exposures for more pronounced trails",
          confidence: 85
        },
        {
          type: "Foreground Balance",
          description: "The foreground silhouette creates good contrast but could be repositioned",
          tip: "Position the horizon on the lower third line for better composition",
          confidence: 92
        },
        {
          type: "Focus Stacking",
          description: "Consider focus stacking for sharper stars and foreground",
          tip: "Take multiple shots with different focus points and blend in post",
          confidence: 78
        },
        {
          type: "Light Pollution Mitigation",
          description: "Some light pollution detected in the lower portion",
          tip: "Use a light pollution filter or adjust white balance in post-processing",
          confidence: 88
        }
      ]
    };

    // Add location-specific suggestions if available
    if (stargazingConditions) {
      if (stargazingConditions.rating >= 8) {
        mockAnalysis.suggestions.push({
          type: "Milky Way Capture",
          description: "Excellent conditions detected for Milky Way photography",
          tip: "Face south after 10 PM for the galactic core",
          confidence: 95
        });
      }
    }

    return mockAnalysis;
  };

  const getQualityColor = (rating: number) => {
    if (rating >= 8) return 'text-emerald-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getLocationSpecificTips = () => {
    if (!location || !stargazingConditions) return [];
    
    const tips = [];
    
    if (stargazingConditions.factors.cloudCover < 20) {
      tips.push("Crystal clear skies - perfect for deep sky photography");
    }
    
    if (stargazingConditions.factors.humidity < 60) {
      tips.push("Low humidity detected - minimal atmospheric distortion expected");
    }
    
    if (stargazingConditions.rating >= 7) {
      tips.push("Exceptional dark sky conditions for tonight's shoot");
    }
    
    return tips;
  };

  if (!location) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-md border-slate-700/50 text-white">
        <CardContent className="p-8 text-center">
          <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-300">Search for a location to unlock photo analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-md border-slate-700/50 text-white hover:bg-slate-800/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Camera className="w-8 h-8 text-indigo-400" />
          AI Photo Analysis
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-slate-300 text-sm">{location.name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4" />
            {apiCallsUsed}/{MAX_API_CALLS} analyses used
          </div>
        </div>
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
              disabled={apiCallsUsed >= MAX_API_CALLS}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              {apiCallsUsed >= MAX_API_CALLS ? 'Limit Reached' : 'Upload for AI Analysis'}
            </Button>
          </div>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded for analysis"
                className="w-full h-40 object-cover rounded-lg border border-slate-600"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>AI analyzing composition...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-indigo-400 mb-2">AI Analysis Results</h4>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`text-2xl font-bold ${getQualityColor(aiAnalysis.overallQuality)}`}>
                    {aiAnalysis.overallQuality}/10
                  </div>
                  <span className="text-slate-300">Overall Quality Score</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm text-slate-400 mb-2">Detected Elements</h5>
                    <ul className="space-y-1">
                      {aiAnalysis.detectedElements.map((element, index) => (
                        <li key={index} className="text-xs text-slate-300">• {element}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm text-slate-400 mb-2">Improvement Areas</h5>
                    <ul className="space-y-1">
                      {aiAnalysis.improvementAreas.map((area, index) => (
                        <li key={index} className="text-xs text-slate-300">• {area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-indigo-400">AI Composition Suggestions</h4>
                {aiAnalysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-white">{suggestion.type}</h5>
                      {suggestion.confidence && (
                        <span className="text-xs text-emerald-400">{suggestion.confidence}% confidence</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{suggestion.description}</p>
                    <p className="text-indigo-300 text-xs italic">💡 {suggestion.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location-Specific Tips */}
          {getLocationSpecificTips().length > 0 && (
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
              <h4 className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Tonight's Astrophotography Conditions
              </h4>
              <ul className="space-y-1">
                {getLocationSpecificTips().map((tip, index) => (
                  <li key={index} className="text-sm text-slate-300">
                    ⭐ {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* General Tips */}
          {!uploadedImage && (
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
              <h4 className="text-sm text-slate-400 mb-2">Astrophotography Essentials</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>🔧 Use manual focus set to infinity</li>
                <li>⏱️ Follow the 500 rule: 500 ÷ focal length = max exposure</li>
                <li>📸 Shoot in RAW format for maximum flexibility</li>
                <li>🎯 Use a sturdy tripod and intervalometer</li>
                <li>🌟 Check star charts for optimal framing</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoAnalysisCard;
