
/**
 * Security utilities for input validation and sanitization
 */

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a JPEG, PNG, or WebP image file.'
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size too large. Please upload an image smaller than 10MB.`
    };
  }

  return { isValid: true };
};

export const validateBase64Image = (base64: string): { isValid: boolean; error?: string } => {
  try {
    // Check if it's a valid base64 data URL
    if (!base64.startsWith('data:image/')) {
      return {
        isValid: false,
        error: 'Invalid image format.'
      };
    }

    // Check for valid image types
    const validPrefixes = [
      'data:image/jpeg',
      'data:image/jpg',
      'data:image/png',
      'data:image/webp'
    ];

    if (!validPrefixes.some(prefix => base64.startsWith(prefix))) {
      return {
        isValid: false,
        error: 'Unsupported image format. Please use JPEG, PNG, or WebP.'
      };
    }

    // Estimate file size from base64
    const base64Data = base64.split(',')[1] || base64;
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 10) {
      return {
        isValid: false,
        error: `Image too large (${sizeInMB.toFixed(1)}MB). Please use an image smaller than 10MB.`
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid image data.'
    };
  }
};

export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[<>]/g, '')
    .trim();
};

export const validateLocationName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Location name is required.'
    };
  }

  const sanitized = sanitizeText(name);
  if (sanitized.length < 2) {
    return {
      isValid: false,
      error: 'Location name must be at least 2 characters long.'
    };
  }

  if (sanitized.length > 100) {
    return {
      isValid: false,
      error: 'Location name must be less than 100 characters.'
    };
  }

  return { isValid: true };
};

export const createSecureHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
};

export const handleSecureError = (error: any): string => {
  // Log full error for debugging but return sanitized message to user
  console.error('Application error:', error);
  
  if (error?.response?.data?.error) {
    return sanitizeText(error.response.data.error);
  }
  
  if (error?.message) {
    // Don't expose sensitive error details
    const sensitivePatterns = [
      /api[_\s]?key/i,
      /token/i,
      /password/i,
      /secret/i,
      /auth/i
    ];
    
    const message = error.message;
    if (sensitivePatterns.some(pattern => pattern.test(message))) {
      return 'A system error occurred. Please try again later.';
    }
    
    return sanitizeText(message);
  }
  
  return 'An unexpected error occurred. Please try again later.';
};
