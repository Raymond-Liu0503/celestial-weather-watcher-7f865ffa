
import React, { useState, useCallback } from 'react';
import { Upload, Camera, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateImageFile, validateBase64Image, handleSecureError } from '../utils/security';

const PhotoAnalysisCard = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const resetState = useCallback(() => {
    setError('');
    setAnalysis('');
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    resetState();
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        // Additional validation of base64 data
        const base64Validation = validateBase64Image(base64);
        if (!base64Validation.isValid) {
          setError(base64Validation.error || 'Invalid image data');
          return;
        }
        
        setSelectedImage(base64);
      };
      reader.onerror = () => {
        setError('Failed to read the image file. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process the image. Please try again.');
    }
  }, [resetState]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const analyzePhoto = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis('');

    try {
      // Final validation before sending
      const validation = validateBase64Image(selectedImage);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid image');
        setLoading(false);
        return;
      }

      console.log('Sending image for analysis...');
      
      const response = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          imageBase64: selectedImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.output && result.output.text) {
        setAnalysis(result.output.text);
        console.log('Analysis completed successfully');
      } else {
        throw new Error('Invalid response format from analysis service');
      }
    } catch (err: any) {
      console.error('Photo analysis error:', err);
      const errorMessage = handleSecureError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysis('');
    setError('');
  };

  return (
    <Card className="bg-slate-900/40 backdrop-blur-lg border-slate-700/50 text-white hover:bg-slate-900/60 transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <Camera className="w-6 h-6 text-purple-400" />
          AI Photo Analysis
        </CardTitle>
        <p className="text-slate-400 text-sm">
          Upload your astrophotography for AI-powered feedback and improvement tips
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert className="bg-red-900/20 border-red-700/50 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!selectedImage ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-purple-400 bg-purple-900/20' 
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-300 mb-2">Drop your astrophoto here</p>
            <p className="text-slate-500 text-sm mb-4">
              or click to select (JPEG, PNG, WebP • Max 10MB)
            </p>
            <Button 
              variant="outline" 
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Choose File
            </Button>
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Selected astrophoto" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-slate-900/80 border-slate-600 text-white hover:bg-slate-800/80"
              >
                Remove
              </Button>
            </div>

            <Button 
              onClick={analyzePhoto}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Analyze Photo
                </>
              )}
            </Button>
          </div>
        )}

        {analysis && (
          <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-green-400">Analysis Complete</h4>
            </div>
            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoAnalysisCard;
