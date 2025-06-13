
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const MAX_IMAGE_SIZE_MB = 10; // Reduced from 150MB for security
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.open-meteo.com", "https://openrouter.ai"]
    }
  }
}));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

const photoAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 photo analyses per hour
  message: {
    error: 'Too many photo analysis requests. Please try again in an hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

// Enhanced middleware with security limits
app.use(express.json({ 
  limit: '50mb', // Reduced from 200mb
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('OpenRouter API key not found in environment variables');
  console.error('Please create a .env file in the backend directory with OPENROUTER_API_KEY=your_api_key');
  process.exit(1);
}

// Enhanced file type validation
const validateImageType = (base64String) => {
  try {
    const header = base64String.substring(0, 50);
    const validTypes = [
      'data:image/jpeg',
      'data:image/jpg', 
      'data:image/png',
      'data:image/webp'
    ];
    return validTypes.some(type => header.startsWith(type));
  } catch (error) {
    return false;
  }
};

// Helper function to calculate base64 size
const calculateBase64Size = (base64String) => {
  try {
    const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    return sizeInBytes / (1024 * 1024);
  } catch (error) {
    console.error('Error calculating base64 size:', error);
    return 0;
  }
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+=/gi, '');
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    apiKeyPresent: !!OPENROUTER_API_KEY,
    maxImageSize: `${MAX_IMAGE_SIZE_MB}MB`,
    timestamp: new Date().toISOString()
  });
});

// Enhanced photo analysis endpoint with comprehensive security
app.post('/api/analyze-photo', photoAnalysisLimiter, async (req, res) => {
  try {
    console.log('Received photo analysis request from IP:', req.ip);
    
    const { imageBase64 } = req.body;
    
    // Enhanced input validation
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      console.error('Invalid or missing image data');
      return res.status(400).json({ 
        error: 'Invalid image data provided',
        code: 'INVALID_INPUT'
      });
    }

    // Validate image type
    if (!validateImageType(imageBase64)) {
      console.error('Invalid image type detected');
      return res.status(400).json({ 
        error: 'Invalid image format. Please upload a JPEG, PNG, or WebP image.',
        code: 'INVALID_FORMAT'
      });
    }

    // Check image size
    const imageSizeInMB = calculateBase64Size(imageBase64);
    console.log(`Image size: ${imageSizeInMB.toFixed(2)}MB from IP: ${req.ip}`);
    
    if (imageSizeInMB === 0) {
      console.error('Invalid image data - size calculation failed');
      return res.status(400).json({ 
        error: 'Invalid image data. Please try uploading the image again.',
        code: 'INVALID_DATA',
        size: 0
      });
    }
    
    if (imageSizeInMB > MAX_IMAGE_SIZE_MB) {
      console.error('Image too large:', imageSizeInMB.toFixed(2), 'MB from IP:', req.ip);
      return res.status(413).json({ 
        error: `Image too large (${imageSizeInMB.toFixed(2)}MB). Please upload an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`,
        code: 'FILE_TOO_LARGE',
        size: imageSizeInMB.toFixed(2),
        maxSize: MAX_IMAGE_SIZE_MB
      });
    }

    const promptText = sanitizeInput(`Analyze this astrophotography image and provide concise feedback on composition, technical aspects, and suggestions for improvement. Keep your response under 500 words. Focus on:
1) Star visibility and focus quality
2) Light pollution impact and mitigation
3) Foreground composition and framing
4) Exposure settings and contrast
5) Overall technical quality and artistic merit

Please provide specific, actionable advice for improving future astrophotography shots. Be concise and direct.`);

    const payload = {
      model: "qwen/qwen2.5-vl-72b-instruct:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            },
            {
              type: "text",
              text: promptText
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
    };

    console.log('Sending request to OpenRouter API...');
    console.log('API URL:', OPENROUTER_API_URL);
    console.log('API Key present:', !!OPENROUTER_API_KEY);
    console.log('Image size:', imageSizeInMB.toFixed(2), 'MB');
    
    const response = await axios.post(OPENROUTER_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:8080',
        'X-Title': 'Celestial Weather Watcher'
      },
      timeout: 120000 // Reduced timeout to 2 minutes
    });

    console.log('Received response from OpenRouter API for IP:', req.ip);
    console.log('Response status:', response.status);
    
    // Sanitize response content
    const responseContent = sanitizeInput(response.data.choices?.[0]?.message?.content || '');
    
    // Transform the response to match our expected format
    const transformedResponse = {
      output: {
        text: responseContent
      }
    };
    
    console.log('Sending transformed response to client');
    res.json(transformedResponse);
  } catch (error) {
    console.error('Error in photo analysis from IP:', req.ip);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      if (error.response.status === 422) {
        res.status(422).json({
          error: 'Invalid request format. Please try again.',
          code: 'INVALID_REQUEST'
        });
      } else if (error.response.status === 500) {
        res.status(500).json({
          error: 'API service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE'
        });
      } else if (error.response.status === 429) {
        res.status(429).json({
          error: 'API rate limit exceeded. Please try again later.',
          code: 'RATE_LIMITED'
        });
      } else {
        res.status(error.response.status).json({
          error: 'External service error. Please try again later.',
          code: 'EXTERNAL_ERROR'
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: 'Request timeout. Please try with a smaller image.',
        code: 'TIMEOUT'
      });
    } else {
      console.error('Unexpected error:', error.message);
      res.status(500).json({
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request payload too large',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('API Key present:', !!OPENROUTER_API_KEY);
  console.log(`Maximum image size: ${MAX_IMAGE_SIZE_MB}MB`);
  console.log('Allowed origins:', ALLOWED_ORIGINS);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
