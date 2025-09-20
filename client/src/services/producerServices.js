import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const producerServices = {
  // Register a new producer
  register: async (producerData) => {
    try {
      const response = await api.post('/producers/register', producerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login producer
  login: async (email, password) => {
    try {
      const response = await api.post('/producers/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Get producer profile
  getProfile: async () => {
    try {
      const response = await api.get('/producers/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update producer profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/producers/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Get all producers (public listing)
  getAllProducers: async (params = {}) => {
    try {
      const response = await api.get('/producers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch producers' };
    }
  },

  // Get producer by ID (public profile)
  getProducerById: async (id) => {
    try {
      const response = await api.get(`/producers/profile/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch producer' };
    }
  },
};

export const categoryServices = {
  // Get all categories
  getAllCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch category' };
    }
  },

  // Get subcategories by parent ID
  getSubcategories: async (parentId) => {
    try {
      const response = await api.get(`/categories/parent/${parentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch subcategories' };
    }
  },
};

// Utility functions
export const utils = {
  // Sanitize phone number to +94 format
  sanitizePhoneNumber: (phone) => {
    if (!phone) return '';
    
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Handle different input formats
    if (digitsOnly.startsWith('94')) {
      // Already has country code
      return `+${digitsOnly}`;
    } else if (digitsOnly.startsWith('0')) {
      // Remove leading 0 and add country code
      return `+94${digitsOnly.substring(1)}`;
    } else if (digitsOnly.length === 9) {
      // Assume it's a local number without leading 0
      return `+94${digitsOnly}`;
    }
    
    // Return as is if format is unclear
    return phone;
  },

  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: [
        ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
        ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
        ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
        ...(!hasNumbers ? ['Password must contain at least one number'] : []),
        ...(!hasSpecialChar ? ['Password must contain at least one special character'] : []),
      ],
    };
  },

  // Format business hours for API
  formatBusinessHours: (businessHours) => {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return daysOfWeek.map(day => ({
      day_of_week: day,
      is_open: businessHours[day]?.isOpen || false,
      open_time: businessHours[day]?.openTime || null,
      close_time: businessHours[day]?.closeTime || null,
    }));
  },

  // Format social media for API
  formatSocialMedia: (socialMedia) => {
    const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'];
    
    return platforms
      .filter(platform => socialMedia[platform] && socialMedia[platform].trim())
      .map(platform => ({
        platform,
        url: socialMedia[platform],
      }));
  },

  // Format languages for API
  formatLanguages: (languages) => {
    return languages
      .filter(lang => lang.language && lang.language.trim())
      .map(lang => ({
        language: lang.language,
        proficiency: lang.proficiency || 'intermediate',
      }));
  },

  // Format certifications for API
  formatCertifications: (certifications) => {
    return certifications.map(cert => {
      if (typeof cert === 'string') {
        return {
          certification_name: cert,
          issuing_body: '',
        };
      }
      return {
        certification_name: cert.name || cert.certification_name,
        issuing_body: cert.issuing_body || '',
      };
    });
  },

  // Format specialties for API
  formatSpecialties: (specialties) => {
    return specialties.map(specialty => {
      if (typeof specialty === 'string') {
        return specialty;
      }
      return specialty.name || specialty;
    });
  },
};

// Image upload service for BunnyCDN
const imageUploadService = {
  // Upload image to BunnyCDN storage zone
  uploadImage: async (file, folder = 'avatars') => {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      
      // BunnyCDN configuration (you'll need to set these values)
      const BUNNY_STORAGE_ZONE = 'helatrade'; // Replace with your storage zone name
      const BUNNY_ACCESS_KEY = '70cf3825-3c31-45ff-9336bb06a8c5-bc95-4844'; // Replace with your access key
      const BUNNY_STORAGE_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${folder}/${uniqueFileName}`;
      const BUNNY_CDN_URL = `https://helatrade.b-cdn.net/${folder}/${uniqueFileName}`; // Replace with your CDN URL
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to BunnyCDN
      console.log('Uploading to BunnyCDN:', {
        url: BUNNY_STORAGE_URL,
        storageZone: BUNNY_STORAGE_ZONE,
        folder: folder,
        filename: uniqueFileName
      });
      
      const response = await fetch(BUNNY_STORAGE_URL, {
        method: 'PUT',
        headers: {
          'AccessKey': BUNNY_ACCESS_KEY,
          'Content-Type': file.type,
        },
        body: file,
      });

      console.log('BunnyCDN Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BunnyCDN Error Response:', errorText);
        throw new Error(`Upload failed (${response.status}): ${response.statusText}. ${errorText || 'Check storage zone setup and access key permissions.'}`);
      }

      return {
        success: true,
        url: BUNNY_CDN_URL,
        filename: uniqueFileName,
        message: 'Image uploaded successfully'
      };

    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Image upload failed'
      };
    }
  },

  // Delete image from BunnyCDN (for cleanup)
  deleteImage: async (filename, folder = 'avatars') => {
    try {
      const BUNNY_STORAGE_ZONE = 'helatrade';
      const BUNNY_ACCESS_KEY = 'your-bunny-access-key';
      const BUNNY_STORAGE_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${folder}/${filename}`;

      const response = await fetch(BUNNY_STORAGE_URL, {
        method: 'DELETE',
        headers: {
          'AccessKey': BUNNY_ACCESS_KEY,
        },
      });

      return {
        success: response.ok,
        message: response.ok ? 'Image deleted successfully' : 'Failed to delete image'
      };

    } catch (error) {
      console.error('Image deletion error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Image deletion failed'
      };
    }
  }
};

export default { producerServices, categoryServices, utils, imageUploadService };
