const express = require('express');
const Producer = require('../models/Producer');
const { 
  validateProducerRegistration, 
  validateProfileUpdate,
  validateBusinessHoursUpdate,
  validateCertificationsUpdate,
  validateLanguagesUpdate,
  validateSocialMediaUpdate,
  validateSpecialtiesUpdate
} = require('../middleware/validation');
const { 
  authenticateToken, 
  requireProducer, 
  requireOwnership,
  optionalAuth 
} = require('../middleware/auth');

const router = express.Router();

// Register new producer
router.post('/register', validateProducerRegistration, async (req, res) => {
  try {
    const {
      email,
      password,
      phone,
      business_name,
      owner_name,
      bio,
      description,
      location,
      province,
      website,
      established_year,
      avatar,
      banner_image,
      category_ids,
      business_hours,
      certifications,
      languages,
      social_media,
      specialties
    } = req.body;

    // Create new producer
    const producer = await Producer.create({
      email,
      password,
      phone,
      business_name,
      owner_name,
      bio,
      description,
      location,
      province,
      website,
      established_year,
      avatar,
      banner_image,
      category_ids,
      business_hours,
      certifications,
      languages,
      social_media,
      specialties
    });

    // Generate JWT token
    const token = producer.generateToken();

    res.status(201).json({
      success: true,
      message: 'Producer registered successfully',
      data: {
        user: {
          id: producer.producer_id, // Use producer_id as the main id
          user_id: producer.id, // Keep user_id for reference
          email: producer.email,
          user_type: producer.user_type,
          is_verified: producer.is_verified,
          phone_verified: producer.phone_verified,
          status: producer.status,
          producer_id: producer.producer_id, // Keep for backward compatibility
          business_name: producer.business_name,
          owner_name: producer.owner_name,
          bio: producer.bio,
          location: producer.location,
          province: producer.province,
          verified: producer.verified,
          avatar: producer.avatar,
          banner_image: producer.banner_image,
          categories: producer.categories || [],
          business_hours: producer.business_hours || [],
          certifications: producer.certifications || [],
          languages: producer.languages || [],
          social_media: producer.social_media || [],
          specialties: producer.specialties || []
        },
        token
      }
    });
  } catch (error) {
    console.error('Producer registration error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Producer registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Producer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Attempt login
    const result = await Producer.login(email, password);

    res.json({
      success: true,
      message: 'Producer login successful',
      data: result
    });
  } catch (error) {
    console.error('Producer login error:', error);
    
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (error.message.includes('not active')) {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Producer login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get current producer profile
router.get('/profile', authenticateToken, requireProducer, async (req, res) => {
  try {
    const producer = await Producer.findById(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Producer profile retrieved successfully',
      data: { producer: producer.toJSON() }
    });
  } catch (error) {
    console.error('Get producer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve producer profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get producer profile by ID (public)
router.get('/profile/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const producer = await Producer.findById(id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer not found'
      });
    }

    // Increment view count if not the owner viewing
    if (!req.user || req.user.id !== producer.id) {
      await producer.incrementViews();
    }

    // Return public profile data
    const publicProfile = {
      id: producer.producer_id, // Use producer_id as the main id
      user_id: producer.id, // Keep user_id for reference
      producer_id: producer.producer_id, // Keep for backward compatibility
      business_name: producer.business_name,
      owner_name: producer.owner_name,
      bio: producer.bio,
      description: producer.description,
      location: producer.location,
      province: producer.province,
      website: producer.website,
      established_year: producer.established_year,
      avatar: producer.avatar,
      banner_image: producer.banner_image,
      verified: producer.verified,
      featured: producer.featured,
      total_views: producer.total_views,
      total_likes: producer.total_likes,
      total_connections: producer.total_connections,
      rating: producer.rating,
      created_at: producer.producer_created_at,
      categories: producer.categories || [],
      business_hours: producer.business_hours || [],
      certifications: producer.certifications || [],
      languages: producer.languages || [],
      social_media: producer.social_media || [],
      specialties: producer.specialties || []
    };

    res.json({
      success: true,
      message: 'Producer profile retrieved successfully',
      data: { producer: publicProfile }
    });
  } catch (error) {
    console.error('Get producer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve producer profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update producer profile
router.put('/profile', authenticateToken, requireProducer, validateProfileUpdate, async (req, res) => {
  try {
    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    // Update producer profile
    await producer.updateProfile(req.body);

    res.json({
      success: true,
      message: 'Producer profile updated successfully',
      data: { producer: producer.toJSON() }
    });
  } catch (error) {
    console.error('Update producer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update producer profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all producers (public with filtering)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      verified,
      featured,
      province,
      search,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      orderBy,
      orderDirection
    };

    // Apply filters
    if (verified !== undefined) filters.verified = verified === 'true';
    if (featured !== undefined) filters.featured = featured === 'true';
    if (province) filters.province = province;
    if (search) filters.search = search;

    const producers = await Producer.getAll(filters);

    res.json({
      success: true,
      message: 'Producers retrieved successfully',
      data: {
        producers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: producers.length
        }
      }
    });
  } catch (error) {
    console.error('Get all producers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve producers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get producer categories
router.get('/profile/categories', authenticateToken, requireProducer, async (req, res) => {
  try {
    const producer = await Producer.findById(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const categories = await producer.getCategories();

    res.json({
      success: true,
      message: 'Producer categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Get producer categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve producer categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add category to producer
router.post('/profile/categories/:categoryId', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const producer = await Producer.findById(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    await producer.addCategory(categoryId);

    res.json({
      success: true,
      message: 'Category added successfully'
    });
  } catch (error) {
    console.error('Add producer category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Debug endpoint to check producer data
router.get('/debug/producer-data', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    // Check user data
    const userData = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    // Check producer data - this should be where user_id = req.user.id
    const producerData = await query('SELECT * FROM producers WHERE user_id = ?', [req.user.id]);
    
    // Check existing categories for this producer if any
    const existingCategories = await query(`
      SELECT pc.*, c.name as category_name 
      FROM producer_categories pc 
      JOIN categories c ON pc.category_id = c.id 
      WHERE pc.producer_id = ?
    `, [producerData.length > 0 ? producerData[0].id : null]);

    res.json({
      success: true,
      debug_data: {
        jwt_user_id: req.user.id, // This is the users.id from JWT
        user: userData[0] || null,
        producer: producerData[0] || null, // This shows producers.id and producers.user_id
        existing_categories: existingCategories,
        explanation: {
          jwt_contains: "users.id (from users table)",
          producer_categories_needs: "producers.id (from producers table)",
          relationship: "users.id -> producers.user_id -> producers.id"
        }
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

// Debug endpoint to check database state
router.get('/debug/user-check', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    console.log('Debug - User check - JWT User ID:', req.user.id);
    
    // Check user in users table
    const userCheck = await query('SELECT id, email, user_type, status FROM users WHERE id = ?', [req.user.id]);
    console.log('Debug - User check - User data:', userCheck);
    
    // Check producer in producers table
    const producerCheck = await query('SELECT id, user_id, business_name FROM producers WHERE user_id = ?', [req.user.id]);
    console.log('Debug - User check - Producer data:', producerCheck);
    
    // Check business hours if producer exists
    let businessHoursCheck = [];
    if (producerCheck.length > 0) {
      businessHoursCheck = await query('SELECT * FROM producer_business_hours WHERE producer_id = ?', [producerCheck[0].id]);
      console.log('Debug - User check - Business hours data:', businessHoursCheck);
    }
    
    res.json({
      success: true,
      debug_data: {
        jwt_user_id: req.user.id,
        user_record: userCheck[0] || null,
        producer_record: producerCheck[0] || null,
        business_hours_records: businessHoursCheck,
        counts: {
          users: userCheck.length,
          producers: producerCheck.length,
          business_hours: businessHoursCheck.length
        }
      }
    });
  } catch (error) {
    console.error('Debug user check error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

// Get producer business hours
router.get('/profile/business-hours', authenticateToken, async (req, res) => {
  try {
    console.log('Debug - GET business-hours - User ID from token:', req.user.id);
    console.log('Debug - GET business-hours - User type from token:', req.user.user_type);
    console.log('Debug - GET business-hours - User object:', req.user);
    
    // Check if user is producer type
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Producer access required'
      });
    }
    
    const producer = await Producer.findByUserId(req.user.id);
    
    console.log('Debug - GET business-hours - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - GET business-hours - Producer ID in object:', producer.producer_id);
      console.log('Debug - GET business-hours - Producer object keys:', Object.keys(producer));
    }
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const businessHours = await producer.getBusinessHours();
    console.log('Debug - GET business-hours - Final business hours result:', businessHours);

    res.json({
      success: true,
      message: 'Producer business hours retrieved successfully',
      data: { business_hours: businessHours }
    });
  } catch (error) {
    console.error('Get producer business hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve producer business hours',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update producer business hours
router.put('/profile/business-hours', authenticateToken, validateBusinessHoursUpdate, async (req, res) => {
  try {
    const { business_hours } = req.body;
    console.log('Debug - PUT business-hours - User ID from token:', req.user.id);
    console.log('Debug - PUT business-hours - User type from token:', req.user.user_type);
    console.log('Debug - PUT business-hours - Business hours in request:', business_hours);
    
    // Check if user is producer type
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Producer access required'
      });
    }
    
    const producer = await Producer.findByUserId(req.user.id);
    
    console.log('Debug - PUT business-hours - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - PUT business-hours - Producer ID in object:', producer.producer_id);
    }
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    // Validate business_hours is an array
    if (business_hours && !Array.isArray(business_hours)) {
      return res.status(400).json({
        success: false,
        message: 'Business hours must be an array'
      });
    }

    await producer.updateBusinessHours(business_hours || []);

    res.json({
      success: true,
      message: 'Producer business hours updated successfully',
      data: { business_hours: producer.business_hours }
    });
  } catch (error) {
    console.error('Update producer business hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business hours',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update all producer categories
router.put('/profile/categories', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { category_ids } = req.body;
    const producer = await Producer.findByUserId(req.user.id);
    
    console.log('Debug - User ID:', req.user.id);
    console.log('Debug - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - Producer ID in object:', producer.producer_id);
      console.log('Debug - Producer complete object keys:', Object.keys(producer));
      console.log('Debug - Producer full object:', JSON.stringify(producer, null, 2));
    }
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    // Validate category_ids is an array
    if (category_ids && !Array.isArray(category_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Category IDs must be an array'
      });
    }

    await producer.updateCategories(category_ids || []);

    res.json({
      success: true,
      message: 'Producer categories updated successfully',
      data: { categories: producer.categories }
    });
  } catch (error) {
    console.error('Update producer categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update producer categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Remove category from producer
router.delete('/profile/categories/:categoryId', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const producer = await Producer.findById(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    await producer.removeCategory(categoryId);

    res.json({
      success: true,
      message: 'Category removed successfully'
    });
  } catch (error) {
    console.error('Remove producer category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get producer certifications
router.get('/profile/certifications', authenticateToken, async (req, res) => {
  try {
    console.log('Debug - GET certifications - User ID from token:', req.user.id);
    console.log('Debug - GET certifications - User type from token:', req.user.user_type);
    
    // Check if user is producer type
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Producer access required'
      });
    }
    
    const producer = await Producer.findByUserId(req.user.id);
    
    console.log('Debug - GET certifications - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - GET certifications - Producer ID in object:', producer.producer_id);
    }
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const certifications = await producer.getCertifications();
    console.log('Debug - GET certifications - Final certifications result:', certifications);

    res.json({
      success: true,
      message: 'Producer certifications retrieved successfully',
      data: { certifications }
    });
  } catch (error) {
    console.error('Get producer certifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve producer certifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update producer certifications
router.put('/profile/certifications', authenticateToken, validateCertificationsUpdate, async (req, res) => {
  try {
    const { certifications } = req.body;
    console.log('Debug - PUT certifications - User ID from token:', req.user.id);
    console.log('Debug - PUT certifications - User type from token:', req.user.user_type);
    console.log('Debug - PUT certifications - Certifications in request:', certifications);
    
    // Check if user is producer type
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Producer access required'
      });
    }
    
    const producer = await Producer.findByUserId(req.user.id);
    
    console.log('Debug - PUT certifications - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - PUT certifications - Producer ID in object:', producer.producer_id);
    }
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    // Validate certifications is an array
    if (certifications && !Array.isArray(certifications)) {
      return res.status(400).json({
        success: false,
        message: 'Certifications must be an array'
      });
    }

    await producer.updateCertifications(certifications || []);

    res.json({
      success: true,
      message: 'Producer certifications updated successfully',
      data: { certifications: producer.certifications }
    });
  } catch (error) {
    console.error('Update producer certifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update certifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add certification to producer
router.post('/profile/certifications', authenticateToken, async (req, res) => {
  try {
    console.log('Debug - POST certifications - User ID from token:', req.user.id);
    console.log('Debug - POST certifications - User type from token:', req.user.user_type);
    console.log('Debug - POST certifications - Certification data:', req.body);
    
    // Check if user is producer type
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Producer access required'
      });
    }
    
    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const certificationId = await producer.addCertification(req.body);

    res.status(201).json({
      success: true,
      message: 'Certification added successfully',
      data: { certificationId }
    });
  } catch (error) {
    console.error('Add producer certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add certification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get producer languages
router.get('/profile/languages', authenticateToken, async (req, res) => {
  try {
    console.log('Debug - GET languages - User ID from token:', req.user.id);
    console.log('Debug - GET languages - User type from token:', req.user.user_type);

    // Check if user is a producer
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only producers can access this endpoint.'
      });
    }

    // Find producer using user ID from JWT token
    const producer = await Producer.findByUserId(req.user.id);
    console.log('Debug - GET languages - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - GET languages - Producer ID in object:', producer.producer_id);
    }

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const languages = await producer.getLanguages();
    console.log('Debug - GET languages - Final languages result:', languages);

    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Get producer languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve languages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update producer languages (replace all)
router.put('/profile/languages', authenticateToken, validateLanguagesUpdate, async (req, res) => {
  try {
    const languages = req.body.languages;
    console.log('Debug - PUT languages - User ID from token:', req.user.id);
    console.log('Debug - PUT languages - User type from token:', req.user.user_type);
    console.log('Debug - PUT languages - Languages in request:', languages);

    // Check if user is a producer
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only producers can access this endpoint.'
      });
    }

    // Find producer using user ID from JWT token
    const producer = await Producer.findByUserId(req.user.id);
    console.log('Debug - PUT languages - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - PUT languages - Producer ID in object:', producer.producer_id);
    }

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    await producer.updateLanguages(languages);

    res.json({
      success: true,
      message: 'Languages updated successfully',
      data: producer.languages
    });
  } catch (error) {
    console.error('Update producer languages error:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Producer not found') ? error.message : 'Failed to update languages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add single language
router.post('/profile/languages', authenticateToken, async (req, res) => {
  try {
    const { language, proficiency } = req.body;

    // Basic validation
    if (!language || !proficiency) {
      return res.status(400).json({
        success: false,
        message: 'Language and proficiency are required'
      });
    }

    const validProficiencies = ['basic', 'intermediate', 'advanced', 'native'];
    if (!validProficiencies.includes(proficiency)) {
      return res.status(400).json({
        success: false,
        message: `Proficiency must be one of: ${validProficiencies.join(', ')}`
      });
    }

    // Check if user is a producer
    if (req.user.user_type !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only producers can access this endpoint.'
      });
    }

    // Find producer using user ID from JWT token
    const producer = await Producer.findByUserId(req.user.id);

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const result = await producer.addLanguage({ language, proficiency });
    const languageId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Language added successfully',
      data: { languageId }
    });
  } catch (error) {
    console.error('Add producer language error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add language',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get producer social media
router.get('/profile/social-media', authenticateToken, async (req, res) => {
  try {
    console.log('Debug - GET social media - User ID from token:', req.user.id);
    console.log('Debug - GET social media - User type from token:', req.user.user_type);

    // Find producer by user ID (from JWT token)
    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      console.log('Debug - GET social media - Producer not found for user ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    console.log('Debug - GET social media - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - GET social media - Producer ID in object:', producer.producer_id);
    }

    // Ensure we have the producer_id for the query
    if (!producer.producer_id) {
      console.log('Debug - GET social media - No producer_id found');
      return res.status(404).json({
        success: false,
        message: 'Producer profile incomplete'
      });
    }

    const socialMedia = await producer.getSocialMedia();
    console.log('Debug - GET social media - Final social media result:', socialMedia);

    res.json({
      success: true,
      message: 'Social media retrieved successfully',
      data: socialMedia
    });
  } catch (error) {
    console.error('Get producer social media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve social media',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update producer social media (replace all)
router.put('/profile/social-media', authenticateToken, validateSocialMediaUpdate, async (req, res) => {
  try {
    console.log('Debug - PUT social media - User ID from token:', req.user.id);
    console.log('Debug - PUT social media - Request body:', req.body);

    // Find producer by user ID (from JWT token)
    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      console.log('Debug - PUT social media - Producer not found for user ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    console.log('Debug - PUT social media - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - PUT social media - Producer ID in object:', producer.producer_id);
    }

    // Update social media
    await producer.updateSocialMedia(req.body.social_media);

    // Get updated social media
    const updatedSocialMedia = await producer.getSocialMedia();

    res.json({
      success: true,
      message: 'Social media updated successfully',
      data: updatedSocialMedia
    });
  } catch (error) {
    console.error('Update producer social media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social media',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add single social media profile
router.post('/profile/social-media', authenticateToken, async (req, res) => {
  try {
    const { platform, url } = req.body;

    // Validate required fields
    if (!platform || !url) {
      return res.status(400).json({
        success: false,
        message: 'Platform and URL are required'
      });
    }

    // Validate platform
    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Platform must be one of: ${validPlatforms.join(', ')}`
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const result = await producer.addSocialMedia({ platform, url });

    res.status(201).json({
      success: true,
      message: 'Social media profile added successfully',
      data: { 
        id: result.insertId,
        platform,
        url
      }
    });
  } catch (error) {
    console.error('Add producer social media error:', error);
    
    // Handle duplicate key constraint
    if (error.message && error.message.includes('Duplicate entry')) {
      return res.status(409).json({
        success: false,
        message: 'Social media profile for this platform already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add social media profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get producer specialties
router.get('/profile/specialties', authenticateToken, async (req, res) => {
  try {
    console.log('Debug - GET specialties - User ID from token:', req.user.id);
    console.log('Debug - GET specialties - User type from token:', req.user.user_type);

    // Find producer by user ID (from JWT token)
    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      console.log('Debug - GET specialties - Producer not found for user ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    console.log('Debug - GET specialties - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - GET specialties - Producer ID in object:', producer.producer_id);
    }

    // Ensure we have the producer_id for the query
    if (!producer.producer_id) {
      console.log('Debug - GET specialties - No producer_id found');
      return res.status(404).json({
        success: false,
        message: 'Producer profile incomplete'
      });
    }

    const specialties = await producer.getSpecialties();
    console.log('Debug - GET specialties - Final specialties result:', specialties);

    res.json({
      success: true,
      message: 'Specialties retrieved successfully',
      data: specialties
    });
  } catch (error) {
    console.error('Get producer specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve specialties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update producer specialties (replace all)
router.put('/profile/specialties', authenticateToken, validateSpecialtiesUpdate, async (req, res) => {
  try {
    console.log('Debug - PUT specialties - User ID from token:', req.user.id);
    console.log('Debug - PUT specialties - Request body:', req.body);

    // Find producer by user ID (from JWT token)
    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      console.log('Debug - PUT specialties - Producer not found for user ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    console.log('Debug - PUT specialties - Producer found:', !!producer);
    if (producer) {
      console.log('Debug - PUT specialties - Producer ID in object:', producer.producer_id);
    }

    // Update specialties
    await producer.updateSpecialties(req.body.specialties);

    // Get updated specialties
    const updatedSpecialties = await producer.getSpecialties();

    res.json({
      success: true,
      message: 'Specialties updated successfully',
      data: updatedSpecialties
    });
  } catch (error) {
    console.error('Update producer specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update specialties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add single specialty
router.post('/profile/specialties', authenticateToken, async (req, res) => {
  try {
    const { specialty } = req.body;

    // Validate required field
    if (!specialty) {
      return res.status(400).json({
        success: false,
        message: 'Specialty is required'
      });
    }

    // Validate specialty text
    const specialtyText = typeof specialty === 'string' ? specialty.trim() : specialty.specialty?.trim();
    if (!specialtyText || specialtyText.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Specialty cannot be empty'
      });
    }

    if (specialtyText.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Specialty must not exceed 255 characters'
      });
    }

    const producer = await Producer.findByUserId(req.user.id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }

    const result = await producer.addSpecialty(specialty);

    res.status(201).json({
      success: true,
      message: 'Specialty added successfully',
      data: { 
        id: result.insertId,
        specialty: specialtyText
      }
    });
  } catch (error) {
    console.error('Add producer specialty error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to add specialty',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;