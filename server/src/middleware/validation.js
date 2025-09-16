const { body, param, query, validationResult } = require('express-validator');
const validator = require('validator');

// Custom validation functions
const isValidPhoneNumber = (value) => {
  // Sri Lankan phone number pattern
  const phoneRegex = /^(\+94|0)?[1-9]\d{8}$/;
  return phoneRegex.test(value.replace(/\s/g, ''));
};

const isValidSriLankanLocation = (value) => {
  // Common Sri Lankan locations validation
  const locationRegex = /^[a-zA-Z\s,.-]+$/;
  return locationRegex.test(value);
};

const isValidYear = (value) => {
  const year = parseInt(value);
  const currentYear = new Date().getFullYear();
  return year >= 1800 && year <= currentYear;
};

// =============================================================================
// CATEGORY VALIDATIONS
// =============================================================================

// Validation rules for creating a category
const validateCreateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s&\-,.()]+$/)
    .withMessage('Category name contains invalid characters'),
  
  body('icon')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Icon must be maximum 10 characters'),
    
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Validation rules for updating a category
const validateUpdateCategory = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s&\-,.()]+$/)
    .withMessage('Category name contains invalid characters'),
  
  body('icon')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Icon must be maximum 10 characters'),
    
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// =============================================================================
// PARAMETER VALIDATIONS
// =============================================================================

// Validation for ID parameters
const validateUUIDParam = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID')
];

// =============================================================================
// QUERY PARAMETER VALIDATIONS
// =============================================================================

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// =============================================================================
// VALIDATION RESULT HANDLER
// =============================================================================

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data provided',
      details: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = {
  // Category validations
  validateCreateCategory,
  validateUpdateCategory,
  
  // Parameter validations
  validateUUIDParam,
  
  // Query validations
  validatePagination,
  
  // Validation handler
  handleValidationErrors,
  
  // Custom validators (for reuse)
  customValidators: {
    isValidPhoneNumber,
    isValidSriLankanLocation,
    isValidYear
  }
};