const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const MAX_IMAGE_SIZE_MB = 150;

// Middleware with increased limits
app.use(cors());
app.use(express.json({ 
  limit: '200mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  limit: '200mb', 
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    apiKeyPresent: !!OPENROUTER_API_KEY,
    maxImageSize: `${MAX_IMAGE_SIZE_MB}MB`
  });
});

// Proxy endpoint for OpenRouter API
app.post('/api/analyze-photo', async (req, res) => {
  try {
    console.log('Received photo analysis request');
    
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      console.error('No image provided in request');
      return res.status(400).json({ error: 'No image provided' });
    }

    // Check image size
    const imageSizeInMB = calculateBase64Size(imageBase64);
    console.log(`Original image size: ${imageSizeInMB.toFixed(2)}MB`);
    
    if (imageSizeInMB === 0) {
      console.error('Invalid image data');
      return res.status(400).json({ 
        error: 'Invalid image data. Please try uploading the image again.',
        size: 0
      });
    }
    
    if (imageSizeInMB > MAX_IMAGE_SIZE_MB) {
      console.error('Image too large:', imageSizeInMB.toFixed(2), 'MB');
      return res.status(413).json({ 
        error: `Image too large (${imageSizeInMB.toFixed(2)}MB). Please upload an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`,
        size: imageSizeInMB.toFixed(2),
        maxSize: MAX_IMAGE_SIZE_MB
      });
    }

    const promptText = `Analyze this astrophotography image and provide concise feedback on composition, technical aspects, and suggestions for improvement. Keep your response under 500 words. Focus on:
1) Star visibility and focus quality
2) Light pollution impact and mitigation
3) Foreground composition and framing
4) Exposure settings and contrast
5) Overall technical quality and artistic merit

Please provide specific, actionable advice for improving future astrophotography shots. Be concise and direct.`;

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
        'HTTP-Referer': 'http://localhost:8080',
        'X-Title': 'Celestial Weather Watcher'
      },
      timeout: 180000
    });

    console.log('Received response from OpenRouter API');
    console.log('Response status:', response.status);
    
    // Transform the response to match our expected format
    const transformedResponse = {
      output: {
        text: response.data.choices?.[0]?.message?.content || ''
      }
    };
    
    console.log('Sending transformed response to client');
    res.json(transformedResponse);
  } catch (error) {
    console.error('Error in photo analysis:');
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
          details: error.response.data
        });
      } else if (error.response.status === 500) {
        res.status(500).json({
          error: 'API inference failed. Please try again with a different image.',
          details: error.response.data
        });
      } else {
        res.status(error.response.status).json({
          error: error.response.data || 'Error from API'
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: 'Request timeout. The image processing took too long. Please try with a smaller image.',
        code: 'TIMEOUT'
      });
    } else {
      console.error('Error setting up request:', error.message);
      res.status(500).json({
        error: 'Failed to analyze photo: ' + error.message
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('API Key present:', !!OPENROUTER_API_KEY);
  console.log(`Maximum image size: ${MAX_IMAGE_SIZE_MB}MB`);
});