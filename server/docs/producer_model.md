# Producer Model Documentation

## Overview
This document provides comprehensive documentation for the Producer model and its related business logic in the HelaTrade platform. The Producer model represents agricultural producers who create content, manage products, and connect with stores and other producers.

## Table of Contents
1. [Model Structure](#model-structure)
2. [Business Rules](#business-rules)
3. [Relationships](#relationships)
4. [Methods and Behaviors](#methods-and-behaviors)
5. [State Management](#state-management)
6. [Validation Rules](#validation-rules)
7. [Security Considerations](#security-considerations)
8. [Integration Points](#integration-points)

---

## Model Structure

### Core Producer Model
```javascript
// src/models/Producer.js
class Producer {
  constructor(data = {}) {
    this.id = data.id
    this.userId = data.userId
    this.businessName = data.businessName
    this.ownerName = data.ownerName
    this.bio = data.bio
    this.description = data.description
    this.location = data.location
    this.province = data.province
    this.website = data.website
    this.establishedYear = data.establishedYear
    this.avatar = data.avatar
    this.bannerImage = data.bannerImage
    this.verified = data.verified || false
    this.featured = data.featured || false
    this.totalViews = data.totalViews || 0
    this.totalLikes = data.totalLikes || 0
    this.totalConnections = data.totalConnections || 0
    this.rating = data.rating || 0.0
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }
}
```

### Extended Profile Data
```javascript
class ProducerProfile extends Producer {
  constructor(data = {}) {
    super(data)
    this.categories = data.categories || []
    this.certifications = data.certifications || []
    this.specialties = data.specialties || []
    this.languages = data.languages || []
    this.businessHours = data.businessHours || {}
    this.socialMedia = data.socialMedia || {}
    this.user = data.user || null
  }
}
```

---

## Business Rules

### 1. Registration Rules
- **Email Uniqueness**: Each producer must have a unique email address
- **Phone Verification**: Phone number must be verified before account activation
- **Minimum Information**: Business name, owner name, location, and at least one category required
- **Category Limit**: Producers can select up to 5 categories maximum
- **Age Restriction**: Established year cannot be in the future

### 2. Verification Process
```javascript
const verificationCriteria = {
  emailVerified: true,
  phoneVerified: true,
  minimumProfile: {
    businessName: true,
    description: { minLength: 50 },
    location: true,
    categories: { minCount: 1 },
    businessHours: true
  },
  documentSubmission: {
    businessRegistration: 'optional',
    certifications: 'optional',
    photos: { minCount: 2 }
  }
}
```

### 3. Content Publishing Rules
- **Profile Completeness**: 70% profile completion required for content publishing
- **Image Requirements**: At least one profile image required
- **Posting Limits**: 
  - New producers: 5 posts per day
  - Verified producers: 20 posts per day
  - Featured producers: Unlimited

### 4. Product Management Rules
- **Product Limits**:
  - Basic producers: 10 products maximum
  - Verified producers: 100 products maximum
  - Featured producers: Unlimited
- **Image Requirements**: Minimum 1, maximum 5 images per product
- **Pricing Rules**: Price must be greater than 0, valid currency format

---

## Relationships

### 1. User Relationship
```javascript
// One-to-One relationship with User
class Producer {
  static associate(models) {
    Producer.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    })
  }
}
```

### 2. Category Relationships
```javascript
// Many-to-Many relationship with Categories
Producer.belongsToMany(models.Category, {
  through: 'ProducerCategories',
  foreignKey: 'producerId',
  otherKey: 'categoryId',
  as: 'categories'
})
```

### 3. Content Relationships
```javascript
// One-to-Many relationships
Producer.hasMany(models.Product, {
  foreignKey: 'producerId',
  as: 'products',
  onDelete: 'CASCADE'
})

Producer.hasMany(models.Post, {
  foreignKey: 'producerId',
  as: 'posts',
  onDelete: 'CASCADE'
})
```

### 4. Profile Extension Relationships
```javascript
Producer.hasMany(models.ProducerCertification, {
  foreignKey: 'producerId',
  as: 'certifications',
  onDelete: 'CASCADE'
})

Producer.hasMany(models.ProducerSpecialty, {
  foreignKey: 'producerId', 
  as: 'specialties',
  onDelete: 'CASCADE'
})

Producer.hasMany(models.ProducerLanguage, {
  foreignKey: 'producerId',
  as: 'languages', 
  onDelete: 'CASCADE'
})

Producer.hasMany(models.ProducerBusinessHour, {
  foreignKey: 'producerId',
  as: 'businessHours',
  onDelete: 'CASCADE'
})

Producer.hasMany(models.ProducerSocialMedia, {
  foreignKey: 'producerId',
  as: 'socialMedia',
  onDelete: 'CASCADE'
})
```

---

## Methods and Behaviors

### 1. Instance Methods

#### Profile Management
```javascript
class Producer extends Model {
  // Calculate profile completion percentage
  getProfileCompleteness() {
    const fields = {
      businessName: !!this.businessName,
      ownerName: !!this.ownerName,
      description: !!this.description && this.description.length >= 50,
      location: !!this.location,
      avatar: !!this.avatar,
      website: !!this.website,
      categories: this.categories && this.categories.length > 0,
      businessHours: this.businessHours && Object.keys(this.businessHours).length > 0
    }
    
    const completedFields = Object.values(fields).filter(Boolean).length
    return Math.round((completedFields / Object.keys(fields).length) * 100)
  }

  // Check if producer can publish content
  canPublishContent() {
    return this.getProfileCompleteness() >= 70 && !!this.avatar
  }

  // Get verification status
  getVerificationStatus() {
    if (this.verified) return 'verified'
    if (this.getProfileCompleteness() >= 90) return 'pending'
    return 'incomplete'
  }

  // Update counters (called by triggers or jobs)
  async updateCounters() {
    const [products, posts, connections, views] = await Promise.all([
      this.countProducts(),
      this.countPosts({ where: { status: 'published' } }),
      this.countConnections({ where: { status: 'accepted' } }),
      AnalyticsView.count({ 
        where: { 
          viewableType: 'producer', 
          viewableId: this.id 
        } 
      })
    ])

    await this.update({
      totalProducts: products,
      totalPosts: posts,
      totalConnections: connections,
      totalViews: views
    })
  }
}
```

#### Business Logic Methods
```javascript
class Producer extends Model {
  // Calculate rating based on reviews and interactions
  async calculateRating() {
    const reviews = await this.getReviews()
    const interactions = await this.getInteractionScore()
    
    if (reviews.length === 0) return 0
    
    const avgReview = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    const interactionBonus = Math.min(interactions / 1000, 0.5) // Max 0.5 bonus
    
    return Math.min(avgReview + interactionBonus, 5.0)
  }

  // Get producer's trending score
  getTrendingScore() {
    const recentViews = this.getRecentViews(7) // Last 7 days
    const recentLikes = this.getRecentLikes(7)
    const recentComments = this.getRecentComments(7)
    
    return (recentViews * 0.1) + (recentLikes * 2) + (recentComments * 5)
  }

  // Check if producer can connect with another user
  canConnectWith(targetUser) {
    if (targetUser.userType === 'producer' && targetUser.id === this.userId) {
      return { allowed: false, reason: 'Cannot connect with yourself' }
    }
    
    if (this.totalConnections >= this.getConnectionLimit()) {
      return { allowed: false, reason: 'Connection limit reached' }
    }
    
    return { allowed: true }
  }

  // Get connection limit based on verification status
  getConnectionLimit() {
    if (this.featured) return -1 // Unlimited
    if (this.verified) return 1000
    return 100 // Basic producers
  }
}
```

### 2. Static Methods

#### Finder Methods
```javascript
class Producer extends Model {
  // Find producers by category
  static async findByCategory(categoryId, options = {}) {
    return this.findAll({
      include: [{
        model: Category,
        as: 'categories',
        where: { id: categoryId },
        through: { attributes: [] }
      }],
      ...options
    })
  }

  // Search producers
  static async search(query, filters = {}) {
    const whereClause = {
      [Op.and]: [
        filters.location && { location: { [Op.like]: `%${filters.location}%` } },
        filters.verified !== undefined && { verified: filters.verified },
        filters.featured !== undefined && { featured: filters.featured }
      ].filter(Boolean)
    }

    if (query) {
      whereClause[Op.or] = [
        { businessName: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ]
    }

    return this.findAll({
      where: whereClause,
      include: ['categories', 'user'],
      order: [
        ['featured', 'DESC'],
        ['verified', 'DESC'],
        ['rating', 'DESC'],
        ['totalConnections', 'DESC']
      ]
    })
  }

  // Get trending producers
  static async getTrending(limit = 10) {
    const producers = await this.findAll({
      where: { verified: true },
      include: ['categories'],
      limit: limit * 2 // Get more to calculate scores
    })

    // Calculate trending scores and sort
    const withScores = producers.map(producer => ({
      producer,
      score: producer.getTrendingScore()
    }))

    return withScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.producer)
  }

  // Get recommendations for a user
  static async getRecommendations(userId, limit = 10) {
    const user = await User.findByPk(userId, {
      include: ['connections', 'viewHistory']
    })

    // Complex recommendation algorithm
    const recommendations = await this.findAll({
      where: {
        userId: { [Op.ne]: userId },
        verified: true
      },
      include: ['categories'],
      limit: limit * 3
    })

    // Score based on mutual connections, categories, location, etc.
    const scored = recommendations.map(producer => ({
      producer,
      score: this.calculateRecommendationScore(producer, user)
    }))

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.producer)
  }
}
```

### 3. Hook Methods

#### Before/After Hooks
```javascript
class Producer extends Model {
  static init(sequelize, DataTypes) {
    super.init({
      // Field definitions...
    }, {
      sequelize,
      modelName: 'Producer',
      hooks: {
        // Before creating a producer
        beforeCreate: async (producer) => {
          // Validate business name uniqueness
          const existing = await Producer.findOne({
            where: { businessName: producer.businessName }
          })
          if (existing) {
            throw new Error('Business name already exists')
          }
        },

        // After creating a producer
        afterCreate: async (producer) => {
          // Create default business hours
          await producer.createDefaultBusinessHours()
          
          // Send welcome email
          await EmailService.sendProducerWelcome(producer)
          
          // Create activity log
          await Activity.create({
            userId: producer.userId,
            activityType: 'producer_registration',
            targetType: 'producer',
            targetId: producer.id
          })
        },

        // Before updating
        beforeUpdate: async (producer) => {
          // Validate profile changes
          if (producer.changed('verified') && producer.verified) {
            await producer.validateForVerification()
          }
        },

        // After updating
        afterUpdate: async (producer) => {
          // Clear caches
          await CacheService.clearProducerCache(producer.id)
          
          // Update search index
          await SearchService.updateProducerIndex(producer)
        }
      }
    })
  }
}
```

---

## State Management

### 1. Producer States
```javascript
const PRODUCER_STATES = {
  INCOMPLETE: 'incomplete',    // Profile < 70% complete
  PENDING: 'pending',          // Awaiting verification
  VERIFIED: 'verified',        // Verified producer
  FEATURED: 'featured',        // Featured producer
  SUSPENDED: 'suspended'       // Account suspended
}

const stateTransitions = {
  incomplete: ['pending', 'suspended'],
  pending: ['verified', 'incomplete', 'suspended'],
  verified: ['featured', 'suspended'],
  featured: ['verified', 'suspended'],
  suspended: ['incomplete']
}
```

### 2. State Validation
```javascript
class Producer extends Model {
  canTransitionTo(newState) {
    const currentState = this.getState()
    return stateTransitions[currentState]?.includes(newState) || false
  }

  getState() {
    if (this.user.status === 'suspended') return PRODUCER_STATES.SUSPENDED
    if (this.featured) return PRODUCER_STATES.FEATURED
    if (this.verified) return PRODUCER_STATES.VERIFIED
    if (this.getProfileCompleteness() >= 90) return PRODUCER_STATES.PENDING
    return PRODUCER_STATES.INCOMPLETE
  }

  async transitionTo(newState, reason = '') {
    if (!this.canTransitionTo(newState)) {
      throw new Error(`Invalid state transition from ${this.getState()} to ${newState}`)
    }

    const oldState = this.getState()
    
    // Apply state changes
    switch (newState) {
      case PRODUCER_STATES.VERIFIED:
        await this.update({ verified: true })
        break
      case PRODUCER_STATES.FEATURED:
        await this.update({ featured: true, verified: true })
        break
      case PRODUCER_STATES.SUSPENDED:
        await this.user.update({ status: 'suspended' })
        break
    }

    // Log state transition
    await StateTransitionLog.create({
      producerId: this.id,
      fromState: oldState,
      toState: newState,
      reason,
      performedBy: 'system' // or admin user ID
    })

    // Trigger notifications
    await this.notifyStateChange(oldState, newState)
  }
}
```

---

## Validation Rules

### 1. Field Validations
```javascript
class Producer extends Model {
  static getValidationRules() {
    return {
      businessName: {
        required: true,
        minLength: 3,
        maxLength: 255,
        pattern: /^[a-zA-Z0-9\s\-\.&]+$/, // Allow alphanumeric, spaces, hyphens, dots, ampersand
        unique: true
      },
      ownerName: {
        required: true,
        minLength: 2,
        maxLength: 255,
        pattern: /^[a-zA-Z\s\-\.]+$/ // Allow letters, spaces, hyphens, dots
      },
      email: {
        required: true,
        format: 'email',
        unique: true
      },
      phone: {
        required: true,
        pattern: /^\+94[0-9]{9}$/, // Sri Lankan phone format
        unique: true
      },
      website: {
        required: false,
        format: 'url',
        pattern: /^https?:\/\/.+/
      },
      establishedYear: {
        required: false,
        min: 1900,
        max: new Date().getFullYear()
      },
      description: {
        required: true,
        minLength: 50,
        maxLength: 2000
      },
      location: {
        required: true,
        minLength: 3,
        maxLength: 255
      }
    }
  }

  // Custom validation method
  async validate() {
    const errors = []

    // Business name uniqueness
    if (this.changed('businessName')) {
      const existing = await Producer.findOne({
        where: { 
          businessName: this.businessName,
          id: { [Op.ne]: this.id }
        }
      })
      if (existing) {
        errors.push('Business name already exists')
      }
    }

    // Category validation
    if (this.categories && this.categories.length > 5) {
      errors.push('Maximum 5 categories allowed')
    }

    // Profile completeness for verification
    if (this.verified && this.getProfileCompleteness() < 90) {
      errors.push('Profile must be 90% complete for verification')
    }

    if (errors.length > 0) {
      throw new ValidationError(errors)
    }
  }
}
```

### 2. Business Logic Validations
```javascript
class Producer extends Model {
  async validateForVerification() {
    const requirements = {
      profileCompleteness: this.getProfileCompleteness() >= 90,
      emailVerified: this.user.isVerified,
      phoneVerified: this.user.phoneVerified,
      hasAvatar: !!this.avatar,
      hasDescription: this.description && this.description.length >= 50,
      hasCategories: this.categories && this.categories.length > 0,
      hasBusinessHours: this.businessHours && Object.keys(this.businessHours).length >= 5
    }

    const failedRequirements = Object.entries(requirements)
      .filter(([_, passed]) => !passed)
      .map(([requirement]) => requirement)

    if (failedRequirements.length > 0) {
      throw new ValidationError(`Verification requirements not met: ${failedRequirements.join(', ')}`)
    }
  }

  async validateProductLimit() {
    const productCount = await this.countProducts()
    const limit = this.getProductLimit()
    
    if (limit !== -1 && productCount >= limit) {
      throw new ValidationError(`Product limit reached (${limit}). Upgrade your account for more products.`)
    }
  }

  getProductLimit() {
    if (this.featured) return -1 // Unlimited
    if (this.verified) return 100
    return 10 // Basic producers
  }
}
```

---

## Security Considerations

### 1. Data Protection
```javascript
class Producer extends Model {
  // Serialize for public display (hide sensitive data)
  toPublicJSON() {
    const publicData = {
      id: this.id,
      businessName: this.businessName,
      bio: this.bio,
      location: this.location,
      avatar: this.avatar,
      bannerImage: this.bannerImage,
      verified: this.verified,
      featured: this.featured,
      rating: this.rating,
      totalConnections: this.totalConnections,
      categories: this.categories,
      specialties: this.specialties,
      businessHours: this.businessHours,
      socialMedia: this.socialMedia,
      createdAt: this.createdAt
    }

    // Only include sensitive data for owner
    return publicData
  }

  // Serialize for owner view (include sensitive data)
  toOwnerJSON() {
    return {
      ...this.toPublicJSON(),
      ownerName: this.ownerName,
      website: this.website,
      establishedYear: this.establishedYear,
      totalViews: this.totalViews,
      totalLikes: this.totalLikes,
      certifications: this.certifications,
      languages: this.languages
    }
  }
}
```

### 2. Access Control
```javascript
class Producer extends Model {
  // Check if user can edit this producer
  canBeEditedBy(user) {
    return user.id === this.userId || user.userType === 'admin'
  }

  // Check if user can view sensitive data
  canBeViewedBy(user) {
    return user.id === this.userId || 
           user.userType === 'admin' ||
           this.isConnectedWith(user.id)
  }

  // Check if user can connect with this producer
  canReceiveConnectionFrom(user) {
    if (user.userType === 'admin') return false // Admins don't connect
    if (user.id === this.userId) return false // Can't connect with self
    
    return !this.isBlockedBy(user.id) && !this.hasBlocked(user.id)
  }
}
```

### 3. Input Sanitization
```javascript
class Producer extends Model {
  static sanitizeInput(data) {
    const sanitized = {}
    
    // Sanitize text fields
    if (data.businessName) {
      sanitized.businessName = data.businessName.trim().replace(/[<>]/g, '')
    }
    
    if (data.description) {
      sanitized.description = data.description.trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .substring(0, 2000) // Limit length
    }

    // Validate URLs
    if (data.website) {
      try {
        const url = new URL(data.website)
        if (['http:', 'https:'].includes(url.protocol)) {
          sanitized.website = url.toString()
        }
      } catch (e) {
        // Invalid URL, ignore
      }
    }

    return sanitized
  }
}
```

---

## Integration Points

### 1. External Services

#### Email Service Integration
```javascript
class Producer extends Model {
  async sendWelcomeEmail() {
    await EmailService.send({
      to: this.user.email,
      template: 'producer-welcome',
      data: {
        businessName: this.businessName,
        ownerName: this.ownerName,
        profileUrl: `${config.frontendUrl}/producers/${this.id}`
      }
    })
  }

  async sendVerificationApproval() {
    await EmailService.send({
      to: this.user.email,
      template: 'producer-verified',
      data: {
        businessName: this.businessName,
        verificationBadge: this.verified,
        dashboardUrl: `${config.frontendUrl}/producer/dashboard`
      }
    })
  }
}
```

#### Search Service Integration
```javascript
class Producer extends Model {
  // Update search index
  async updateSearchIndex() {
    const searchData = {
      id: this.id,
      businessName: this.businessName,
      description: this.description,
      location: this.location,
      categories: this.categories.map(c => c.name),
      verified: this.verified,
      rating: this.rating,
      boost: this.featured ? 2 : 1
    }

    await SearchService.index('producers', this.id, searchData)
  }

  // Remove from search index
  async removeFromSearchIndex() {
    await SearchService.remove('producers', this.id)
  }
}
```

#### Analytics Integration
```javascript
class Producer extends Model {
  // Track view
  async recordView(viewerId = null, metadata = {}) {
    await AnalyticsView.create({
      viewableType: 'producer',
      viewableId: this.id,
      viewerId,
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
      referrer: metadata.referrer,
      sessionId: metadata.sessionId
    })

    // Update view counter (can be done async)
    await this.increment('totalViews')
  }

  // Get analytics data
  async getAnalytics(timeRange = '30days') {
    const startDate = this.getStartDateForRange(timeRange)
    
    const [views, likes, comments, connections] = await Promise.all([
      AnalyticsView.count({
        where: {
          viewableType: 'producer',
          viewableId: this.id,
          createdAt: { [Op.gte]: startDate }
        }
      }),
      this.getTotalLikes(startDate),
      this.getTotalComments(startDate), 
      this.getTotalConnections(startDate)
    ])

    return {
      views,
      likes,
      comments,
      connections,
      timeRange,
      startDate
    }
  }
}
```

### 2. Cache Integration
```javascript
class Producer extends Model {
  // Cache key helpers
  static getCacheKey(id, suffix = '') {
    return `producer:${id}${suffix ? ':' + suffix : ''}`
  }

  // Get from cache or database
  static async findByIdCached(id) {
    const cacheKey = this.getCacheKey(id)
    let producer = await CacheService.get(cacheKey)
    
    if (!producer) {
      producer = await this.findByPk(id, {
        include: ['categories', 'certifications', 'specialties']
      })
      
      if (producer) {
        await CacheService.set(cacheKey, producer, 3600) // 1 hour
      }
    }
    
    return producer
  }

  // Clear cache
  async clearCache() {
    const keys = [
      Producer.getCacheKey(this.id),
      Producer.getCacheKey(this.id, 'profile'),
      Producer.getCacheKey(this.id, 'analytics'),
      `producer:search:*` // Clear search caches
    ]
    
    await CacheService.deleteMany(keys)
  }
}
```

This comprehensive model documentation provides a complete guide to the Producer model implementation, including business rules, relationships, security considerations, and integration points. It serves as a reference for developers working on the producer functionality and ensures consistent implementation across the platform.