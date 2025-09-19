const User = require('./User');
const { query, transaction } = require('../config/database');

class Producer extends User {
  constructor(userData, producerData = {}) {
    super(userData);
    
    // Producer-specific properties
    // Use producer_id field from the SQL query result, not the generic id field
    this.producer_id = producerData.producer_id;
    this.business_name = producerData.business_name;
    this.owner_name = producerData.owner_name;
    this.bio = producerData.bio;
    this.description = producerData.description;
    this.location = producerData.location;
    this.province = producerData.province;
    this.website = producerData.website;
    this.established_year = producerData.established_year;
    this.avatar = producerData.avatar;
    this.banner_image = producerData.banner_image;
    this.verified = producerData.verified;
    this.featured = producerData.featured;
    this.total_views = producerData.total_views;
    this.total_likes = producerData.total_likes;
    this.total_connections = producerData.total_connections;
    this.rating = producerData.rating;
    this.producer_created_at = producerData.created_at;
    this.producer_updated_at = producerData.updated_at;
    
    // Business hours, certifications, and languages will be loaded separately
    this.business_hours = null;
    this.certifications = null;
    this.languages = null;
  }

  // Helper method to get producer ID from user ID
  static async getProducerIdFromUserId(userId) {
    const sql = 'SELECT id FROM producers WHERE user_id = ?';
    const results = await query(sql, [userId]);
    
    if (results.length === 0) {
      throw new Error(`No producer found for user ID ${userId}`);
    }
    
    return results[0].id;
  }

  // Primary method to find producer by user ID (from JWT token)
  static async findByUserId(userId) {
    console.log('Debug - findByUserId - Looking for user ID:', userId);
    
    const sql = `
      SELECT 
        u.*,
        p.id as producer_id,
        p.business_name,
        p.owner_name,
        p.bio,
        p.description,
        p.location,
        p.province,
        p.website,
        p.established_year,
        p.avatar,
        p.banner_image,
        p.verified,
        p.featured,
        p.total_views,
        p.total_likes,
        p.total_connections,
        p.rating,
        p.created_at as producer_created_at,
        p.updated_at as producer_updated_at
      FROM users u
      LEFT JOIN producers p ON u.id = p.user_id
      WHERE u.id = ? AND u.status = 'active' AND u.user_type = 'producer'
    `;

    console.log('Debug - findByUserId - Executing SQL with user_id:', userId);
    const results = await query(sql, [userId]);
    console.log('Debug - findByUserId - SQL results:', results);
    
    if (results.length === 0) {
      console.log('Debug - findByUserId - No results found for user ID:', userId);
      return null;
    }

    const row = results[0];
    console.log('Debug - findByUserId - First row data:', row);
    
    // Check if producer record exists
    if (!row.producer_id) {
      console.log('Debug - findByUserId - No producer record found for user:', userId);
      return null;
    }
    
    console.log('Debug - findByUserId - Found producer with ID:', row.producer_id, 'for user:', userId);
    const producer = new Producer(row, row);

    // Get producer categories, business hours, certifications, and languages
    if (producer.producer_id) {
      producer.categories = await producer.getCategories();
      producer.business_hours = await producer.getBusinessHours();
      producer.certifications = await producer.getCertifications();
      producer.languages = await producer.getLanguages();
    }

    return producer;
  }

  // Create new producer (extends User.create)
  static async create(userData) {
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
      category_ids = [],
      business_hours = [],
      certifications = [],
      languages = []
    } = userData;

    // Validate required producer fields
    if (!business_name || !owner_name) {
      throw new Error('Business name and owner name are required');
    }

    try {
      // Use transaction to create user, producer profile, categories, and business hours
      const queries = [
        {
          sql: 'INSERT INTO users (email, password_hash, user_type, phone) VALUES (?, ?, ?, ?)',
          params: [email, await User.hashPassword(password), 'producer', phone]
        }
      ];

      const [userResult] = await transaction(queries);
      const userId = userResult.insertId;

      // Create producer profile
      const producerSql = `
        INSERT INTO producers 
        (user_id, business_name, owner_name, bio, description, location, province, website, established_year) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const producerResult = await query(producerSql, [
        userId, 
        business_name, 
        owner_name, 
        bio || null, 
        description || null, 
        location || null, 
        province || null, 
        website || null, 
        established_year || null
      ]);

      const producerId = producerResult.insertId;

      // Add producer categories if provided
      if (category_ids && category_ids.length > 0) {
        const categoryQueries = category_ids.map(categoryId => ({
          sql: 'INSERT INTO producer_categories (producer_id, category_id) VALUES (?, ?)',
          params: [producerId, categoryId]
        }));

        await transaction(categoryQueries);
      }

      // Add business hours if provided
      if (business_hours && business_hours.length > 0) {
        const businessHoursQueries = business_hours.map(hour => ({
          sql: 'INSERT INTO producer_business_hours (producer_id, day_of_week, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)',
          params: [producerId, hour.day_of_week, hour.is_open, hour.open_time || null, hour.close_time || null]
        }));

        await transaction(businessHoursQueries);
      }

      // Add certifications if provided
      if (certifications && certifications.length > 0) {
        const certificationQueries = certifications.map(cert => ({
          sql: 'INSERT INTO producer_certifications (producer_id, certification_name, issuing_body, issue_date, expiry_date, certificate_url) VALUES (?, ?, ?, ?, ?, ?)',
          params: [
            producerId, 
            cert.certification_name, 
            cert.issuing_body || null, 
            cert.issue_date || null, 
            cert.expiry_date || null, 
            cert.certificate_url || null
          ]
        }));

        await transaction(certificationQueries);
      }

      // Add languages if provided
      if (languages && languages.length > 0) {
        const languageQueries = languages.map(lang => ({
          sql: 'INSERT INTO producer_languages (producer_id, language, proficiency) VALUES (?, ?, ?)',
          params: [producerId, lang.language, lang.proficiency]
        }));

        await transaction(languageQueries);
      }

      // Return the complete producer profile
      return await Producer.findById(userId);
    } catch (error) {
      throw new Error(`Failed to create producer: ${error.message}`);
    }
  }

  // Find producer by user ID
  static async findById(userId) {
    const sql = `
      SELECT 
        u.*,
        p.id as producer_id,
        p.business_name,
        p.owner_name,
        p.bio,
        p.description,
        p.location,
        p.province,
        p.website,
        p.established_year,
        p.avatar,
        p.banner_image,
        p.verified,
        p.featured,
        p.total_views,
        p.total_likes,
        p.total_connections,
        p.rating,
        p.created_at as producer_created_at,
        p.updated_at as producer_updated_at
      FROM users u
      LEFT JOIN producers p ON u.id = p.user_id
      WHERE u.id = ? AND u.status = 'active' AND u.user_type = 'producer'
    `;

    const results = await query(sql, [userId]);
    
    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    
    // Check if producer record exists
    if (!row.producer_id) {
      console.log('Debug - No producer record found for user:', userId);
      return null;
    }
    
    console.log('Debug - Found producer with ID:', row.producer_id, 'for user:', userId);
    const producer = new Producer(row, row);

    // Get producer categories, business hours, certifications, and languages
    if (producer.producer_id) {
      producer.categories = await producer.getCategories();
      producer.business_hours = await producer.getBusinessHours();
      producer.certifications = await producer.getCertifications();
      producer.languages = await producer.getLanguages();
    }

    return producer;
  }

  // Find producer by email
  static async findByEmail(email) {
    const sql = `
      SELECT 
        u.*,
        p.id as producer_id,
        p.business_name,
        p.owner_name,
        p.bio,
        p.description,
        p.location,
        p.province,
        p.website,
        p.established_year,
        p.avatar,
        p.banner_image,
        p.verified,
        p.featured,
        p.total_views,
        p.total_likes,
        p.total_connections,
        p.rating,
        p.created_at as producer_created_at,
        p.updated_at as producer_updated_at
      FROM users u
      LEFT JOIN producers p ON u.id = p.user_id
      WHERE u.email = ? AND u.status = 'active' AND u.user_type = 'producer'
    `;

    const results = await query(sql, [email]);
    
    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    const producer = new Producer(row, row);

    // Get producer categories, business hours, certifications, and languages
    if (producer.producer_id) {
      producer.categories = await producer.getCategories();
      producer.business_hours = await producer.getBusinessHours();
      producer.certifications = await producer.getCertifications();
      producer.languages = await producer.getLanguages();
    }

    return producer;
  }

  // Update producer profile
  async updateProfile(updateData) {
    const allowedUserFields = ['email', 'phone'];
    const allowedProducerFields = [
      'business_name', 
      'owner_name', 
      'bio', 
      'description', 
      'location', 
      'province', 
      'website', 
      'established_year',
      'avatar',
      'banner_image'
    ];

    const userUpdates = {};
    const producerUpdates = {};

    // Separate user and producer updates
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedUserFields.includes(key)) {
        userUpdates[key] = value;
      } else if (allowedProducerFields.includes(key)) {
        producerUpdates[key] = value;
      }
    }

    try {
      const queries = [];

      // Update user fields if any
      if (Object.keys(userUpdates).length > 0) {
        const userUpdateFields = Object.keys(userUpdates).map(key => `${key} = ?`);
        const userUpdateValues = Object.values(userUpdates);
        userUpdateValues.push(this.id);

        queries.push({
          sql: `UPDATE users SET ${userUpdateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          params: userUpdateValues
        });
      }

      // Update producer fields if any
      if (Object.keys(producerUpdates).length > 0) {
        const producerUpdateFields = Object.keys(producerUpdates).map(key => `${key} = ?`);
        const producerUpdateValues = Object.values(producerUpdates);
        producerUpdateValues.push(this.id);

        queries.push({
          sql: `UPDATE producers SET ${producerUpdateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
          params: producerUpdateValues
        });
      }

      if (queries.length > 0) {
        await transaction(queries);
      }

      // Refresh producer data
      const updatedProducer = await Producer.findById(this.id);
      Object.assign(this, updatedProducer);
      return this;
    } catch (error) {
      throw new Error(`Failed to update producer profile: ${error.message}`);
    }
  }

  // Get producer categories
  async getCategories() {
    let producerIdToUse = this.producer_id;
    
    // If producer_id is missing, get it from user_id
    if (!producerIdToUse) {
      producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
      this.producer_id = producerIdToUse; // Update the object
    }
    
    const sql = `
      SELECT c.id, c.name, c.slug, c.icon, c.description
      FROM categories c
      JOIN producer_categories pc ON c.id = pc.category_id
      WHERE pc.producer_id = ? AND c.is_active = true
      ORDER BY c.display_order, c.name
    `;

    return await query(sql, [producerIdToUse]);
  }

  // Get producer business hours
  async getBusinessHours() {
    console.log('Debug - getBusinessHours - User ID (this.id):', this.id);
    console.log('Debug - getBusinessHours - Producer ID (this.producer_id):', this.producer_id);
    
    let producerIdToUse = this.producer_id;
    
    // If producer_id is missing, get it from user_id
    if (!producerIdToUse) {
      console.log('Debug - getBusinessHours - Producer ID missing, getting from user ID...');
      producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
      console.log('Debug - getBusinessHours - Found producer ID:', producerIdToUse);
      this.producer_id = producerIdToUse; // Update the object
    }
    
    const sql = `
      SELECT day_of_week, is_open, open_time, close_time
      FROM producer_business_hours
      WHERE producer_id = ?
      ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    `;

    console.log('Debug - getBusinessHours - About to query with producer_id:', producerIdToUse);
    const result = await query(sql, [producerIdToUse]);
    console.log('Debug - getBusinessHours - Query result:', result);
    
    return result;
  }

  // Add business hours for a specific day
  async addBusinessHours(businessHours) {
    let producerIdToUse = this.producer_id;
    
    if (!producerIdToUse) {
      producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
      this.producer_id = producerIdToUse;
    }

    const { day_of_week, is_open, open_time, close_time } = businessHours;
    
    const sql = `
      INSERT INTO producer_business_hours (producer_id, day_of_week, is_open, open_time, close_time)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        is_open = VALUES(is_open),
        open_time = VALUES(open_time),
        close_time = VALUES(close_time),
        updated_at = CURRENT_TIMESTAMP
    `;

    await query(sql, [producerIdToUse, day_of_week, is_open, open_time, close_time]);
  }

  // Update all business hours (replace all)
  async updateBusinessHours(businessHoursArray) {
    try {
      console.log('Debug - updateBusinessHours - User ID (this.id):', this.id);
      console.log('Debug - updateBusinessHours - Producer ID (this.producer_id):', this.producer_id);
      console.log('Debug - updateBusinessHours - Business Hours Array:', businessHoursArray);
      
      let producerIdToUse = this.producer_id;
      
      if (!producerIdToUse) {
        console.log('Debug - updateBusinessHours - Producer ID missing, getting from user ID...');
        producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
        console.log('Debug - updateBusinessHours - Found producer ID:', producerIdToUse);
        this.producer_id = producerIdToUse;
      }

      // Verify the producer exists in the database
      const checkProducer = await query('SELECT id, user_id FROM producers WHERE id = ?', [producerIdToUse]);
      console.log('Debug - updateBusinessHours - Producer exists check:', checkProducer);
      
      if (checkProducer.length === 0) {
        throw new Error(`Producer with ID ${producerIdToUse} does not exist in producers table`);
      }

      console.log('Debug - updateBusinessHours - Confirmed producer relationship: User ID', this.id, '→ Producer ID', producerIdToUse);

      const queries = [];

      // First, remove all existing business hours
      queries.push({
        sql: 'DELETE FROM producer_business_hours WHERE producer_id = ?',
        params: [producerIdToUse]
      });

      // Then add new business hours
      if (businessHoursArray && businessHoursArray.length > 0) {
        const hoursQueries = businessHoursArray.map(hour => ({
          sql: 'INSERT INTO producer_business_hours (producer_id, day_of_week, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)',
          params: [producerIdToUse, hour.day_of_week, hour.is_open, hour.open_time || null, hour.close_time || null]
        }));
        queries.push(...hoursQueries);
        console.log('Debug - updateBusinessHours - Adding', hoursQueries.length, 'business hours entries');
      }

      console.log('Debug - updateBusinessHours - About to execute queries for producer_id:', producerIdToUse);
      await transaction(queries);

      // Refresh business hours
      this.business_hours = await this.getBusinessHours();
      console.log('Debug - updateBusinessHours - Business hours after update:', this.business_hours);
    } catch (error) {
      console.error('Debug - updateBusinessHours - Error:', error);
      throw new Error(`Failed to update producer business hours: ${error.message}`);
    }
  }

  // Add category to producer
  async addCategory(categoryId) {
    const sql = `
      INSERT INTO producer_categories (producer_id, category_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = created_at
    `;

    await query(sql, [this.producer_id, categoryId]);
  }

  // Remove category from producer
  async removeCategory(categoryId) {
    const sql = 'DELETE FROM producer_categories WHERE producer_id = ? AND category_id = ?';
    await query(sql, [this.producer_id, categoryId]);
  }

  // Update producer categories (replace all)
  async updateCategories(categoryIds) {
    try {
      console.log('Debug - User ID (this.id):', this.id);
      console.log('Debug - Producer ID (this.producer_id):', this.producer_id);
      console.log('Debug - Category IDs:', categoryIds);
      
      let producerIdToUse = this.producer_id;
      
      // If producer_id is missing or invalid, get it from user_id
      if (!producerIdToUse) {
        console.log('Debug - Producer ID missing, getting from user ID...');
        producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
        console.log('Debug - Found producer ID:', producerIdToUse);
        this.producer_id = producerIdToUse; // Update the object
      }

      // Verify the producer exists in the database
      const checkProducer = await query('SELECT id, user_id FROM producers WHERE id = ?', [producerIdToUse]);
      console.log('Debug - Producer exists check:', checkProducer);
      
      if (checkProducer.length === 0) {
        throw new Error(`Producer with ID ${producerIdToUse} does not exist in producers table`);
      }

      console.log('Debug - Confirmed producer relationship: User ID', this.id, '→ Producer ID', producerIdToUse);

      // Verify categories exist if we have any
      if (categoryIds && categoryIds.length > 0) {
        const categoryCheckSql = `SELECT id FROM categories WHERE id IN (${categoryIds.map(() => '?').join(',')}) AND is_active = true`;
        const existingCategories = await query(categoryCheckSql, categoryIds);
        console.log('Debug - Existing categories:', existingCategories);
        
        if (existingCategories.length !== categoryIds.length) {
          const existingIds = existingCategories.map(c => c.id);
          const missingIds = categoryIds.filter(id => !existingIds.includes(parseInt(id)));
          throw new Error(`Invalid category IDs: ${missingIds.join(', ')}`);
        }
      }

      const queries = [];

      // First, remove all existing categories
      queries.push({
        sql: 'DELETE FROM producer_categories WHERE producer_id = ?',
        params: [producerIdToUse]
      });

      // Then add new categories
      if (categoryIds && categoryIds.length > 0) {
        const categoryQueries = categoryIds.map(categoryId => ({
          sql: 'INSERT INTO producer_categories (producer_id, category_id) VALUES (?, ?)',
          params: [producerIdToUse, categoryId]
        }));
        queries.push(...categoryQueries);
      }

      console.log('Debug - About to execute queries for producer_id:', producerIdToUse);
      await transaction(queries);

      // Refresh categories
      this.categories = await this.getCategories();
      console.log('Debug - Categories after update:', this.categories);
    } catch (error) {
      console.error('Debug - Error in updateCategories:', error);
      throw new Error(`Failed to update producer categories: ${error.message}`);
    }
  }

  // Get producer certifications
  async getCertifications() {
    console.log('Debug - getCertifications - User ID (this.id):', this.id);
    console.log('Debug - getCertifications - Producer ID (this.producer_id):', this.producer_id);
    
    let producerIdToUse = this.producer_id;
    
    // If producer_id is missing, get it from user_id
    if (!producerIdToUse) {
      console.log('Debug - getCertifications - Producer ID missing, getting from user ID...');
      producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
      console.log('Debug - getCertifications - Found producer ID:', producerIdToUse);
      this.producer_id = producerIdToUse; // Update the object
    }
    
    const sql = `
      SELECT id, certification_name, issuing_body, issue_date, expiry_date, 
             certificate_url, verified, created_at
      FROM producer_certifications
      WHERE producer_id = ?
      ORDER BY issue_date DESC
    `;

    console.log('Debug - getCertifications - About to query with producer_id:', producerIdToUse);
    const result = await query(sql, [producerIdToUse]);
    console.log('Debug - getCertifications - Query result:', result);
    
    return result;
  }

  // Add certification
  async addCertification(certificationData) {
    let producerIdToUse = this.producer_id;
    
    if (!producerIdToUse) {
      producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
      this.producer_id = producerIdToUse;
    }

    const { certification_name, issuing_body, issue_date, expiry_date, certificate_url } = certificationData;
    
    const sql = `
      INSERT INTO producer_certifications 
      (producer_id, certification_name, issuing_body, issue_date, expiry_date, certificate_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      producerIdToUse, 
      certification_name, 
      issuing_body, 
      issue_date, 
      expiry_date, 
      certificate_url
    ]);

    return result.insertId;
  }

  // Update all producer certifications (replace all)
  async updateCertifications(certificationsArray) {
    try {
      console.log('Debug - updateCertifications - User ID (this.id):', this.id);
      console.log('Debug - updateCertifications - Producer ID (this.producer_id):', this.producer_id);
      console.log('Debug - updateCertifications - Certifications Array:', certificationsArray);
      
      let producerIdToUse = this.producer_id;
      
      if (!producerIdToUse) {
        console.log('Debug - updateCertifications - Producer ID missing, getting from user ID...');
        producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
        console.log('Debug - updateCertifications - Found producer ID:', producerIdToUse);
        this.producer_id = producerIdToUse;
      }

      // Verify the producer exists in the database
      const checkProducer = await query('SELECT id, user_id FROM producers WHERE id = ?', [producerIdToUse]);
      console.log('Debug - updateCertifications - Producer exists check:', checkProducer);
      
      if (checkProducer.length === 0) {
        throw new Error(`Producer with ID ${producerIdToUse} does not exist in producers table`);
      }

      console.log('Debug - updateCertifications - Confirmed producer relationship: User ID', this.id, '→ Producer ID', producerIdToUse);

      const queries = [];

      // First, remove all existing certifications
      queries.push({
        sql: 'DELETE FROM producer_certifications WHERE producer_id = ?',
        params: [producerIdToUse]
      });

      // Then add new certifications
      if (certificationsArray && certificationsArray.length > 0) {
        const certQueries = certificationsArray.map(cert => ({
          sql: 'INSERT INTO producer_certifications (producer_id, certification_name, issuing_body, issue_date, expiry_date, certificate_url) VALUES (?, ?, ?, ?, ?, ?)',
          params: [producerIdToUse, cert.certification_name, cert.issuing_body || null, cert.issue_date || null, cert.expiry_date || null, cert.certificate_url || null]
        }));
        queries.push(...certQueries);
        console.log('Debug - updateCertifications - Adding', certQueries.length, 'certification entries');
      }

      console.log('Debug - updateCertifications - About to execute queries for producer_id:', producerIdToUse);
      await transaction(queries);

      // Refresh certifications
      this.certifications = await this.getCertifications();
      console.log('Debug - updateCertifications - Certifications after update:', this.certifications);
    } catch (error) {
      console.error('Debug - updateCertifications - Error:', error);
      throw new Error(`Failed to update producer certifications: ${error.message}`);
    }
  }

  // Get producer languages
  async getLanguages() {
    console.log('Debug - getLanguages - User ID (this.id):', this.id);
    console.log('Debug - getLanguages - Producer ID (this.producer_id):', this.producer_id);

    // Use producer_id if available, otherwise get it from user_id
    let producerIdToUse = this.producer_id;
    if (!producerIdToUse && this.id) {
      console.log('Debug - getLanguages - Producer ID missing, getting from user ID...');
      producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
      console.log('Debug - getLanguages - Found producer ID:', producerIdToUse);
    }

    if (!producerIdToUse) {
      throw new Error('Producer ID not found');
    }

    const sql = `
      SELECT id, language, proficiency, created_at
      FROM producer_languages 
      WHERE producer_id = ? 
      ORDER BY created_at DESC
    `;

    console.log('Debug - getLanguages - About to query with producer_id:', producerIdToUse);
    const result = await query(sql, [producerIdToUse]);
    console.log('Debug - getLanguages - Query result:', result);
    
    return result;
  }

  // Add a single language
  async addLanguage(languageData) {
    const { language, proficiency } = languageData;
    
    // Use producer_id if available, otherwise get it from user_id
    let producerIdToUse = this.producer_id;
    if (!producerIdToUse && this.id) {
      producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
    }

    if (!producerIdToUse) {
      throw new Error('Producer ID not found');
    }

    const sql = `
      INSERT INTO producer_languages (producer_id, language, proficiency) 
      VALUES (?, ?, ?)
    `;

    const result = await query(sql, [producerIdToUse, language, proficiency]);
    return result;
  }

  // Update languages (replace all existing)
  async updateLanguages(languagesArray) {
    try {
      console.log('Debug - updateLanguages - User ID (this.id):', this.id);
      console.log('Debug - updateLanguages - Producer ID (this.producer_id):', this.producer_id);
      console.log('Debug - updateLanguages - Languages Array:', languagesArray);

      // Use producer_id if available, otherwise get it from user_id
      let producerIdToUse = this.producer_id;
      if (!producerIdToUse && this.id) {
        console.log('Debug - updateLanguages - Producer ID missing, getting from user ID...');
        producerIdToUse = await Producer.getProducerIdFromUserId(this.id);
        console.log('Debug - updateLanguages - Found producer ID:', producerIdToUse);
      }

      // Verify producer exists
      const checkProducer = await query('SELECT id, user_id FROM producers WHERE id = ?', [producerIdToUse]);
      console.log('Debug - updateLanguages - Producer exists check:', checkProducer);
      
      if (checkProducer.length === 0) {
        throw new Error(`Producer not found with ID ${producerIdToUse}`);
      }

      console.log('Debug - updateLanguages - Confirmed producer relationship: User ID', this.id, '→ Producer ID', producerIdToUse);

      // Start transaction: delete existing languages
      const queries = [
        {
          sql: 'DELETE FROM producer_languages WHERE producer_id = ?',
          params: [producerIdToUse]
        }
      ];

      // Add new languages if provided
      if (languagesArray && languagesArray.length > 0) {
        const langQueries = languagesArray.map(lang => ({
          sql: 'INSERT INTO producer_languages (producer_id, language, proficiency) VALUES (?, ?, ?)',
          params: [producerIdToUse, lang.language, lang.proficiency]
        }));
        queries.push(...langQueries);
        console.log('Debug - updateLanguages - Adding', langQueries.length, 'language entries');
      }

      console.log('Debug - updateLanguages - About to execute queries for producer_id:', producerIdToUse);
      await transaction(queries);

      // Refresh languages
      this.languages = await this.getLanguages();
      console.log('Debug - updateLanguages - Languages after update:', this.languages);
    } catch (error) {
      console.error('Debug - updateLanguages - Error:', error);
      throw new Error(`Failed to update producer languages: ${error.message}`);
    }
  }

  // Increment view count
  async incrementViews() {
    const sql = 'UPDATE producers SET total_views = total_views + 1 WHERE user_id = ?';
    await query(sql, [this.id]);
    this.total_views = (this.total_views || 0) + 1;
  }

  // Get all producers with filters
  static async getAll(filters = {}) {
    let sql = `
      SELECT 
        u.id, u.email, u.is_verified, u.status, u.created_at,
        p.id as producer_id, p.business_name, p.owner_name, p.bio, 
        p.location, p.province, p.verified, p.featured, p.total_views, 
        p.total_likes, p.total_connections, p.rating, p.avatar
      FROM users u
      JOIN producers p ON u.id = p.user_id
      WHERE u.user_type = 'producer' AND u.status = 'active'
    `;
    
    const params = [];
    const conditions = [];

    // Apply filters
    if (filters.verified !== undefined) {
      conditions.push('p.verified = ?');
      params.push(filters.verified);
    }

    if (filters.featured !== undefined) {
      conditions.push('p.featured = ?');
      params.push(filters.featured);
    }

    if (filters.province) {
      conditions.push('p.province = ?');
      params.push(filters.province);
    }

    if (filters.search) {
      conditions.push('(p.business_name LIKE ? OR p.description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    // Apply ordering
    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection || 'DESC';
    sql += ` ORDER BY ${orderBy} ${orderDirection}`;

    // Apply pagination
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    return await query(sql, params);
  }

  // Producer login (extends User.login)
  static async login(email, password) {
    const producer = await Producer.findByEmail(email);
    
    if (!producer) {
      throw new Error('Invalid email or password');
    }

    if (producer.status !== 'active') {
      throw new Error('Account is not active');
    }

    const isValidPassword = await producer.verifyPassword(password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await producer.updateLastLogin();

    // Generate token
    const token = producer.generateToken();

    return {
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
        categories: producer.categories || [],
        business_hours: producer.business_hours || [],
        certifications: producer.certifications || [],
        languages: producer.languages || []
      },
      token
    };
  }

  // Convert to JSON (exclude password and include producer data)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return {
      ...userWithoutPassword,
      id: this.producer_id, // Use producer_id as the main id
      user_id: this.id, // Keep user_id for reference
      categories: this.categories || [],
      business_hours: this.business_hours || [],
      certifications: this.certifications || [],
      languages: this.languages || []
    };
  }
}

module.exports = Producer;