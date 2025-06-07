import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';
const MAX_IMAGE_SIZE_MB = 50; // Reduced from 200MB to 50MB for better handling

interface FlorenceResponse {
  content: {
    text: string;
    confidence: number;
  }[];
}

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to calculate base64 size
const calculateBase64Size = (base64String: string): number => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
    // Calculate size in bytes
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    // Convert to MB
    return sizeInBytes / (1024 * 1024);
  } catch (error) {
    console.error('Error calculating base64 size:', error);
    return 0;
  }
};

// Function to compress image with multiple attempts
const compressImage = async (base64String: string, maxSizeMB: number = MAX_IMAGE_SIZE_MB): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64String;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate initial size
      const initialSize = calculateBase64Size(base64String);
      console.log(`Initial image size: ${initialSize.toFixed(2)}MB`);
      
      // If image is already small enough, return as is
      if (initialSize <= maxSizeMB) {
        console.log('Image is already within size limit');
        resolve(base64String);
        return;
      }
      
      // Try different compression levels
      const compressionLevels = [0.8, 0.6, 0.4, 0.2];
      let compressedBase64 = '';
      let compressedSize = initialSize;
      
      for (const quality of compressionLevels) {
        // Calculate scale factor to get under maxSizeMB
        const scaleFactor = Math.sqrt(maxSizeMB / initialSize);
        const newWidth = Math.floor(width * scaleFactor);
        const newHeight = Math.floor(height * scaleFactor);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to JPEG with current quality
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        compressedSize = calculateBase64Size(compressedBase64);
        console.log(`Compression attempt - Quality: ${quality}, Size: ${compressedSize.toFixed(2)}MB`);
        
        if (compressedSize <= maxSizeMB) {
          console.log(`Successfully compressed image to ${compressedSize.toFixed(2)}MB with quality ${quality}`);
          resolve(compressedBase64);
          return;
        }
      }
      
      // If we get here, we couldn't compress enough
      console.error('Failed to compress image below size limit');
      reject(new Error(`Could not compress image below ${maxSizeMB}MB. Current size: ${compressedSize.toFixed(2)}MB`));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

export const analyzeAstroPhoto = async (imageBase64: string): Promise<FlorenceResponse> => {
  console.log('Starting photo analysis...');
  
  try {
    // First check if the backend is healthy
    try {
      const healthCheck = await api.get('/health');
      console.log('Backend health check:', healthCheck.data);
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw new Error('Backend server is not responding. Please try again later.');
    }

    // Check initial image size
    const initialSize = calculateBase64Size(imageBase64);
    console.log(`Initial image size: ${initialSize.toFixed(2)}MB`);
    
    if (initialSize === 0) {
      throw new Error('Invalid image data. Please try uploading the image again.');
    }

    // Compress image if needed
    console.log('Compressing image if needed...');
    let compressedImage: string;
    try {
      compressedImage = await compressImage(imageBase64);
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress image. Please try a smaller image.');
    }
    
    console.log('Sending request to backend...');
    const response = await api.post('/api/analyze-photo', {
      imageBase64: compressedImage
    });

    console.log('Received response from backend:', response.data);
    
    // Transform the response to match our expected format
    return {
      content: [{
        text: response.data.output.text,
        confidence: 0.9 // Default confidence since Florence 2 doesn't provide this
      }]
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      } else if (!error.response) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      } else if (error.response.status === 413) {
        const size = error.response.data?.size || 'unknown';
        throw new Error(`Image too large (${size}MB). Please try a smaller image.`);
      } else if (error.response.status === 400) {
        throw new Error('Invalid image format. Please try again with a different image.');
      } else if (error.response.status === 401) {
        throw new Error('Authentication failed. Please check the server configuration.');
      } else if (error.response.status === 500) {
        const errorMessage = error.response.data?.error || 'Server error';
        throw new Error(`Server error: ${errorMessage}`);
      }
    }
    
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 