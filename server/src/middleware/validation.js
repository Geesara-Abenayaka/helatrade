const { body, validationResult } = require('express-validator');

// Validation middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('user_type')
    .isIn(['producer', 'store'])
    .withMessage('User type must be either producer or store'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Producer registration validation
const validateProducerRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('business_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Business name must be between 2 and 255 characters'),
  
  body('owner_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Owner name must be between 2 and 255 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Location must not exceed 255 characters'),
  
  body('province')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Province must not exceed 100 characters'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('established_year')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Please provide a valid establishment year'),

  body('avatar')
    .optional()
    .isURL()
    .isLength({ max: 255 })
    .withMessage('Avatar must be a valid URL and not exceed 255 characters'),

  body('banner_image')
    .optional()
    .isURL()
    .isLength({ max: 255 })
    .withMessage('Banner image must be a valid URL and not exceed 255 characters'),

  body('category_ids')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array'),

  body('category_ids.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each category ID must be a positive integer'),

  body('business_hours')
    .optional()
    .isArray()
    .withMessage('Business hours must be an array'),

  body('business_hours.*.day_of_week')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Day of week must be a valid day name'),

  body('business_hours.*.is_open')
    .optional()
    .isBoolean()
    .withMessage('is_open must be a boolean'),

  body('business_hours.*.open_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Open time must be in HH:mm format'),

  body('business_hours.*.close_time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Close time must be in HH:mm format'),

  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),

  body('certifications.*.certification_name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Certification name is required and must not exceed 255 characters'),

  body('certifications.*.issuing_body')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Issuing body must not exceed 255 characters'),

  body('certifications.*.issue_date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Issue date must be in YYYY-MM-DD format'),

  body('certifications.*.expiry_date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Expiry date must be in YYYY-MM-DD format'),

  body('certifications.*.certificate_url')
    .optional()
    .isURL()
    .isLength({ max: 255 })
    .withMessage('Certificate URL must be a valid URL and not exceed 255 characters'),

  // Languages validation
  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),

  body('languages.*.language')
    .if(body('languages').exists())
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Language name is required and must not exceed 100 characters'),

  body('languages.*.proficiency')
    .if(body('languages').exists())
    .isIn(['basic', 'intermediate', 'advanced', 'native'])
    .withMessage('Proficiency must be one of: basic, intermediate, advanced, native'),

  // Social media validation
  body('social_media')
    .optional()
    .isArray()
    .withMessage('Social media must be an array'),

  body('social_media.*.platform')
    .if(body('social_media').exists())
    .isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'])
    .withMessage('Platform must be one of: facebook, instagram, twitter, linkedin, youtube, tiktok'),

  body('social_media.*.url')
    .if(body('social_media').exists())
    .isURL()
    .isLength({ max: 255 })
    .withMessage('URL must be a valid URL and not exceed 255 characters'),

  // Specialties validation
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array'),

  body('specialties.*')
    .if(body('specialties').exists())
    .custom((value) => {
      // Allow either string or object with specialty property
      if (typeof value === 'string') {
        return value.trim().length > 0 && value.length <= 255;
      }
      if (typeof value === 'object' && value.specialty) {
        return typeof value.specialty === 'string' && 
               value.specialty.trim().length > 0 && 
               value.specialty.length <= 255;
      }
      return false;
    })
    .withMessage('Each specialty must be a non-empty string not exceeding 255 characters'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('business_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Business name must be between 2 and 255 characters'),
  
  body('owner_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Owner name must be between 2 and 255 characters'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Location must not exceed 255 characters'),
  
  body('province')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Province must not exceed 100 characters'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('established_year')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Please provide a valid establishment year'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validate producer business hours update
const validateBusinessHoursUpdate = (req, res, next) => {
  const { business_hours } = req.body;
  
  if (business_hours !== undefined) {
    if (!Array.isArray(business_hours)) {
      return res.status(400).json({
        success: false,
        message: 'Business hours must be an array'
      });
    }

    for (let i = 0; i < business_hours.length; i++) {
      const hours = business_hours[i];
      
      if (!hours.day_of_week || typeof hours.day_of_week !== 'string') {
        return res.status(400).json({
          success: false,
          message: `Business hours entry ${i + 1}: day_of_week is required and must be a string`
        });
      }

      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(hours.day_of_week)) {
        return res.status(400).json({
          success: false,
          message: `Business hours entry ${i + 1}: day_of_week must be one of: ${validDays.join(', ')}`
        });
      }

      if (typeof hours.is_open !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: `Business hours entry ${i + 1}: is_open is required and must be a boolean`
        });
      }

      if (hours.is_open) {
        const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (!hours.open_time || !timeFormat.test(hours.open_time)) {
          return res.status(400).json({
            success: false,
            message: `Business hours entry ${i + 1}: open_time is required and must be in HH:MM format when is_open is true`
          });
        }

        if (!hours.close_time || !timeFormat.test(hours.close_time)) {
          return res.status(400).json({
            success: false,
            message: `Business hours entry ${i + 1}: close_time is required and must be in HH:MM format when is_open is true`
          });
        }
      }
    }
  }

  next();
};

// Validate producer certifications update
const validateCertificationsUpdate = (req, res, next) => {
  const { certifications } = req.body;
  
  if (certifications !== undefined) {
    if (!Array.isArray(certifications)) {
      return res.status(400).json({
        success: false,
        message: 'Certifications must be an array'
      });
    }

    for (let i = 0; i < certifications.length; i++) {
      const cert = certifications[i];
      
      if (!cert.certification_name || typeof cert.certification_name !== 'string') {
        return res.status(400).json({
          success: false,
          message: `Certification entry ${i + 1}: certification_name is required and must be a string`
        });
      }

      if (cert.certification_name.length > 255) {
        return res.status(400).json({
          success: false,
          message: `Certification entry ${i + 1}: certification_name must not exceed 255 characters`
        });
      }

      if (cert.issuing_body && typeof cert.issuing_body !== 'string') {
        return res.status(400).json({
          success: false,
          message: `Certification entry ${i + 1}: issuing_body must be a string`
        });
      }

      if (cert.issuing_body && cert.issuing_body.length > 255) {
        return res.status(400).json({
          success: false,
          message: `Certification entry ${i + 1}: issuing_body must not exceed 255 characters`
        });
      }

      // Validate date formats if provided
      const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
      
      if (cert.issue_date && !dateFormat.test(cert.issue_date)) {
        return res.status(400).json({
          success: false,
          message: `Certification entry ${i + 1}: issue_date must be in YYYY-MM-DD format`
        });
      }

      if (cert.expiry_date && !dateFormat.test(cert.expiry_date)) {
        return res.status(400).json({
          success: false,
          message: `Certification entry ${i + 1}: expiry_date must be in YYYY-MM-DD format`
        });
      }

      // Validate URL format if provided
      if (cert.certificate_url && cert.certificate_url.length > 0) {
        try {
          new URL(cert.certificate_url);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: `Certification entry ${i + 1}: certificate_url must be a valid URL`
          });
        }
      }

      if (cert.certificate_url && cert.certificate_url.length > 255) {
        return res.status(400).json({
          success: false,
          message: `Certification entry ${i + 1}: certificate_url must not exceed 255 characters`
        });
      }
    }
  }

  next();
};

// Validate specialties update
const validateSpecialtiesUpdate = (req, res, next) => {
  const specialties = req.body.specialties;

  // If specialties is provided, it must be an array
  if (!Array.isArray(specialties)) {
    return res.status(400).json({
      success: false,
      message: 'Specialties must be an array'
    });
  }

  // Validate each specialty entry
  for (let i = 0; i < specialties.length; i++) {
    const specialty = specialties[i];
    let specialtyText;
    
    // Handle both string and object formats
    if (typeof specialty === 'string') {
      specialtyText = specialty.trim();
    } else if (typeof specialty === 'object' && specialty.specialty) {
      specialtyText = specialty.specialty.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: `Specialty entry ${i + 1}: must be a string or object with specialty property`
      });
    }

    // Validate specialty text
    if (!specialtyText || specialtyText.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Specialty entry ${i + 1}: cannot be empty`
      });
    }

    if (specialtyText.length > 255) {
      return res.status(400).json({
        success: false,
        message: `Specialty entry ${i + 1}: must not exceed 255 characters`
      });
    }
  }

  // Check for duplicates
  const specialtyTexts = specialties.map(s => 
    typeof s === 'string' ? s.trim().toLowerCase() : s.specialty.trim().toLowerCase()
  );
  const uniqueSpecialties = [...new Set(specialtyTexts)];
  if (specialtyTexts.length !== uniqueSpecialties.length) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate specialties are not allowed'
    });
  }

  next();
};

// Validate social media update
const validateSocialMediaUpdate = (req, res, next) => {
  const socialMedia = req.body.social_media;

  // If social_media is provided, it must be an array
  if (!Array.isArray(socialMedia)) {
    return res.status(400).json({
      success: false,
      message: 'Social media must be an array'
    });
  }

  // Validate each social media entry
  for (let i = 0; i < socialMedia.length; i++) {
    const social = socialMedia[i];
    
    if (!social.platform || !social.url) {
      return res.status(400).json({
        success: false,
        message: `Social media entry ${i + 1}: platform and url are required`
      });
    }

    // Validate platform
    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];
    if (!validPlatforms.includes(social.platform)) {
      return res.status(400).json({
        success: false,
        message: `Social media entry ${i + 1}: platform must be one of ${validPlatforms.join(', ')}`
      });
    }

    // Validate URL format
    try {
      new URL(social.url);
    } catch {
      return res.status(400).json({
        success: false,
        message: `Social media entry ${i + 1}: invalid URL format`
      });
    }

    // Check URL length
    if (social.url.length > 255) {
      return res.status(400).json({
        success: false,
        message: `Social media entry ${i + 1}: URL must not exceed 255 characters`
      });
    }
  }

  // Check for duplicate platforms
  const platforms = socialMedia.map(s => s.platform);
  const uniquePlatforms = [...new Set(platforms)];
  if (platforms.length !== uniquePlatforms.length) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate platforms are not allowed'
    });
  }

  next();
};

// Validate languages update
const validateLanguagesUpdate = (req, res, next) => {
  const languages = req.body.languages;

  // Check if y
  if (!Array.isArray(languages)) {
    return res.status(400).json({
      success: false,
      message: 'Languages must be an array'
    });
  }

  // Validate each language entry
  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];

    // Check if lang is an object
    if (typeof lang !== 'object' || lang === null) {
      return res.status(400).json({
        success: false,
        message: `Language entry ${i + 1} must be an object`
      });
    }

    // Required field: language
    if (!lang.language || typeof lang.language !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Language entry ${i + 1}: language is required and must be a string`
      });
    }

    if (lang.language.length > 100) {
      return res.status(400).json({
        success: false,
        message: `Language entry ${i + 1}: language must not exceed 100 characters`
      });
    }

    // Required field: proficiency (must be one of the enum values)
    if (!lang.proficiency || typeof lang.proficiency !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Language entry ${i + 1}: proficiency is required and must be a string`
      });
    }

    const validProficiencies = ['basic', 'intermediate', 'advanced', 'native'];
    if (!validProficiencies.includes(lang.proficiency)) {
      return res.status(400).json({
        success: false,
        message: `Language entry ${i + 1}: proficiency must be one of: ${validProficiencies.join(', ')}`
      });
    }
  }

  next();
};

module.exports = {
  validateUserRegistration,
  validateProducerRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateBusinessHoursUpdate,
  validateCertificationsUpdate,
  validateLanguagesUpdate,
  validateSocialMediaUpdate,
  validateSpecialtiesUpdate,
  handleValidationErrors
};