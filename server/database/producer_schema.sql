# Producer Database Schema Documentation

## Overview
This document provides comprehensive documentation for the database schema supporting the Producer functionality in the HelaTrade platform. The schema is designed to support a complete producer ecosystem including profiles, products, content management, connections, and analytics.

## Database Design Principles
- **Normalized Structure**: Reduces data redundancy and maintains data integrity
- **Scalable Architecture**: Supports horizontal scaling and performance optimization
- **Flexible Relationships**: Many-to-many relationships for categories, tags, and connections
- **Comprehensive Tracking**: Built-in analytics and activity tracking
- **Data Integrity**: Foreign key constraints and proper indexing

---

## Core Tables

### users
Base table for all platform users (producers, stores, admins).

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('producer', 'store', 'admin') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

**Fields:**
- `id`: Primary key, auto-incrementing
- `email`: Unique email address for login
- `password_hash`: Bcrypt hashed password
- `user_type`: Enum for user role (producer, store, admin)
- `is_verified`: Email verification status
- `phone`: Phone number for contact and verification
- `phone_verified`: Phone verification status
- `status`: Account status (active, inactive, suspended)

**Relationships:**
- One-to-one with `producers` table
- One-to-many with `posts`, `post_comments`, `connections`

---

### producers
Core producer profile information.

```sql
CREATE TABLE producers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    bio TEXT,
    description TEXT,
    location VARCHAR(255),
    province VARCHAR(100),
    website VARCHAR(255),
    established_year YEAR,
    avatar VARCHAR(255),
    banner_image VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    total_views INT DEFAULT 0,
    total_likes INT DEFAULT 0,
    total_connections INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_location (location),
    INDEX idx_verified (verified),
    INDEX idx_featured (featured),
    INDEX idx_rating (rating),
    FULLTEXT idx_search (business_name, description)
);
```

**Fields:**
- `business_name`: Official business/farm name
- `owner_name`: Producer's personal name
- `bio`: Short description for quick overview
- `description`: Detailed business description
- `location`: Geographic location (city, region)
- `province`: Sri Lankan province
- `website`: Business website URL
- `established_year`: Year business was established
- `verified`: Platform verification status
- `featured`: Whether producer is featured on platform
- `total_*`: Cached counters for performance
- `rating`: Average rating from connections/reviews

**Business Logic:**
- Avatar and banner images stored as URLs to cloud storage
- Counters updated via triggers or background jobs
- Verification requires manual admin approval
- Featured status affects search ranking

---

## Category and Classification

### categories
Product and content categories.

```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    parent_id INT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parent_id),
    INDEX idx_active (is_active),
    INDEX idx_display_order (display_order)
);
```

**Sample Data:**
```sql
INSERT INTO categories (id, name, slug, icon, description) VALUES
(1, 'Vegetables', 'vegetables', '🥬', 'Fresh vegetables and greens'),
(2, 'Fruits', 'fruits', '🍎', 'Fresh and dried fruits'),
(3, 'Grains & Rice', 'grains-rice', '🌾', 'Rice, wheat, and other grains'),
(4, 'Spices', 'spices', '🌶️', 'Spices and seasonings'),
(5, 'Tea', 'tea', '🍃', 'Ceylon tea and herbal teas'),
(6, 'Coconut Products', 'coconut', '🥥', 'Coconut oil, milk, and products'),
(7, 'Dairy', 'dairy', '🐄', 'Milk, cheese, and dairy products'),
(8, 'Seafood', 'seafood', '🐟', 'Fresh and processed seafood'),
(9, 'Herbs', 'herbs', '🌿', 'Medicinal and culinary herbs'),
(10, 'Flowers', 'flowers', '🌺', 'Cut flowers and plants');
```

### producer_categories
Many-to-many relationship between producers and categories.

```sql
CREATE TABLE producer_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_producer_category (producer_id, category_id),
    INDEX idx_producer_id (producer_id),
    INDEX idx_category_id (category_id)
);
```

**Business Logic:**
- Producers can belong to multiple categories
- Categories help with search and filtering
- Used for recommendations and discovery

---

## Producer Profile Extensions

### producer_certifications
Producer certifications and accreditations.

```sql
CREATE TABLE producer_certifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    certification_name VARCHAR(255) NOT NULL,
    issuing_body VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_url VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    INDEX idx_producer_id (producer_id),
    INDEX idx_verified (verified),
    INDEX idx_expiry_date (expiry_date)
);
```

**Common Certifications:**
- Organic Certification
- Fair Trade
- Rainforest Alliance
- ISO Standards
- HACCP
- GlobalGAP

### producer_specialties
Producer specialties and expertise areas.

```sql
CREATE TABLE producer_specialties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    INDEX idx_producer_id (producer_id),
    FULLTEXT idx_specialty (specialty)
);
```

### producer_languages
Languages spoken by producer.

```sql
CREATE TABLE producer_languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    language VARCHAR(100) NOT NULL,
    proficiency ENUM('basic', 'intermediate', 'advanced', 'native') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    INDEX idx_producer_id (producer_id),
    INDEX idx_language (language)
);
```

### producer_business_hours
Producer business hours by day of week.

```sql
CREATE TABLE producer_business_hours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    open_time TIME,
    close_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_producer_day (producer_id, day_of_week),
    INDEX idx_producer_id (producer_id)
);
```

### producer_social_media
Producer social media profiles.

```sql
CREATE TABLE producer_social_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    platform ENUM('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok') NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_producer_platform (producer_id, platform),
    INDEX idx_producer_id (producer_id)
);
```

---

## Product Management

### products
Producer products catalog.

```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    price DECIMAL(10,2),
    unit VARCHAR(50),
    stock_quantity INT DEFAULT 0,
    min_order_quantity INT DEFAULT 1,
    is_organic BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    availability ENUM('in-stock', 'out-of-stock', 'limited', 'seasonal') DEFAULT 'in-stock',
    tags JSON,
    total_views INT DEFAULT 0,
    total_inquiries INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_producer_id (producer_id),
    INDEX idx_category_id (category_id),
    INDEX idx_availability (availability),
    INDEX idx_is_organic (is_organic),
    INDEX idx_is_featured (is_featured),
    INDEX idx_price (price),
    FULLTEXT idx_search (name, description)
);
```

**Fields:**
- `tags`: JSON array of product tags for filtering
- `unit`: Pricing unit (per kg, per box, per piece, etc.)
- `availability`: Stock status with seasonal considerations
- `min_order_quantity`: Minimum order requirement

### product_images
Product image gallery.

```sql
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary),
    INDEX idx_display_order (display_order)
);
```

**Business Logic:**
- One primary image per product for listings
- Multiple images for product gallery
- Images stored in cloud storage (S3, CloudFront)
- Alt text for accessibility

---

## Content Management

### posts
Producer content posts.

```sql
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producer_id INT NOT NULL,
    content TEXT NOT NULL,
    category_id INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    is_trending BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    total_views INT DEFAULT 0,
    total_likes INT DEFAULT 0,
    total_comments INT DEFAULT 0,
    total_shares INT DEFAULT 0,
    popularity_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_producer_id (producer_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_is_trending (is_trending),
    INDEX idx_is_featured (is_featured),
    INDEX idx_popularity_score (popularity_score),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_content (content)
);
```

**Popularity Algorithm:**
```sql
-- Popularity score calculation
UPDATE posts SET popularity_score = (
    (total_likes * 3) + 
    (total_comments * 5) + 
    (total_shares * 10) + 
    (total_views * 0.1)
) WHERE id = ?;
```

### post_images
Images attached to posts.

```sql
CREATE TABLE post_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_display_order (display_order)
);
```

### post_likes
Post like tracking.

```sql
CREATE TABLE post_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_like (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
);
```

### post_comments
Post comments and replies.

```sql
CREATE TABLE post_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_comment_id (parent_comment_id),
    INDEX idx_created_at (created_at)
);
```

**Business Logic:**
- Threaded comments with parent-child relationships
- Comments can be nested (replies to replies)
- Soft delete option for content moderation

---

## Connections and Networking

### connections
Producer-Store connections and relationships.

```sql
CREATE TABLE connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_id INT NOT NULL,
    requested_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
    message TEXT,
    connected_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_connection (requester_id, requested_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_requested_id (requested_id),
    INDEX idx_status (status),
    INDEX idx_connected_at (connected_at)
);
```

**Connection States:**
- `pending`: Initial request state
- `accepted`: Active connection
- `rejected`: Request was declined
- `blocked`: User blocked connection

**Business Logic:**
- Bidirectional relationships (A connects to B = B connects to A)
- Message included with connection request
- Connected_at timestamp for accepted connections

---

## Analytics and Tracking

### analytics_views
Comprehensive view tracking system.

```sql
CREATE TABLE analytics_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    viewable_type ENUM('producer', 'product', 'post') NOT NULL,
    viewable_id INT NOT NULL,
    viewer_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_viewable (viewable_type, viewable_id),
    INDEX idx_viewer_id (viewer_id),
    INDEX idx_created_at (created_at),
    INDEX idx_session_id (session_id)
);
```

**Analytics Capabilities:**
- Track views for producers, products, and posts
- Anonymous and authenticated views
- Session tracking for unique visitors
- Referrer tracking for traffic sources
- IP and user agent for analytics

### activities
Activity feed and notifications.

```sql
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    actor_id INT,
    activity_type ENUM('like', 'comment', 'connection_request', 'connection_accepted', 'product_inquiry', 'post_mention', 'post_share') NOT NULL,
    target_type ENUM('post', 'product', 'producer', 'comment') NOT NULL,
    target_id INT NOT NULL,
    message TEXT,
    metadata JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_actor_id (actor_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_target (target_type, target_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);
```

**Activity Types:**
- `like`: User liked producer's content
- `comment`: User commented on content
- `connection_request`: New connection request
- `connection_accepted`: Connection request accepted
- `product_inquiry`: Inquiry about product
- `post_mention`: Producer mentioned in post
- `post_share`: Content was shared

---

## Database Triggers and Procedures

### Update Counters Trigger
Automatically update counter fields when related data changes.

```sql
-- Update post likes count
DELIMITER $$
CREATE TRIGGER update_post_likes_count
AFTER INSERT ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET total_likes = (
        SELECT COUNT(*) FROM post_likes WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
END$$

CREATE TRIGGER update_post_likes_count_delete
AFTER DELETE ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET total_likes = (
        SELECT COUNT(*) FROM post_likes WHERE post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
END$$
DELIMITER ;
```

### Producer Statistics View
Materialized view for producer analytics.

```sql
CREATE VIEW producer_analytics AS
SELECT 
    p.id,
    p.business_name,
    p.total_views,
    p.total_likes,
    p.total_connections,
    COUNT(DISTINCT pr.id) as total_products,
    COUNT(DISTINCT po.id) as total_posts,
    AVG(pr.rating) as avg_product_rating,
    SUM(pr.total_views) as total_product_views,
    SUM(po.total_views) as total_post_views
FROM producers p
LEFT JOIN products pr ON p.id = pr.producer_id
LEFT JOIN posts po ON p.id = po.producer_id
GROUP BY p.id;
```

---

## Indexing Strategy

### Primary Indexes
All tables have primary key indexes on `id` field.

### Foreign Key Indexes
All foreign key columns have indexes for join performance.

### Search Indexes
```sql
-- Full-text search indexes
ALTER TABLE producers ADD FULLTEXT(business_name, description);
ALTER TABLE products ADD FULLTEXT(name, description);
ALTER TABLE posts ADD FULLTEXT(content);

-- Composite indexes for common queries
CREATE INDEX idx_producer_category_active ON producer_categories(producer_id, category_id);
CREATE INDEX idx_posts_producer_status ON posts(producer_id, status, created_at);
CREATE INDEX idx_products_producer_available ON products(producer_id, availability, is_featured);
```

### Performance Optimization
```sql
-- Analytics optimization
CREATE INDEX idx_analytics_views_daily ON analytics_views(viewable_type, viewable_id, DATE(created_at));

-- Activity feed optimization  
CREATE INDEX idx_activities_user_unread ON activities(user_id, is_read, created_at);

-- Connection lookup optimization
CREATE INDEX idx_connections_user_status ON connections(requester_id, requested_id, status);
```

---

## Data Migration Scripts

### Initial Category Setup
```sql
INSERT INTO categories (name, slug, icon, description) VALUES
('Vegetables', 'vegetables', '🥬', 'Fresh vegetables and leafy greens'),
('Fruits', 'fruits', '🍎', 'Fresh and dried fruits'),
('Grains & Rice', 'grains-rice', '🌾', 'Rice, wheat, and other grains'),
('Spices', 'spices', '🌶️', 'Spices and seasonings'),
('Tea', 'tea', '🍃', 'Ceylon tea and herbal teas'),
('Coconut Products', 'coconut', '🥥', 'Coconut oil, milk, and products'),
('Dairy', 'dairy', '🐄', 'Milk, cheese, and dairy products'),
('Seafood', 'seafood', '🐟', 'Fresh and processed seafood'),
('Herbs', 'herbs', '🌿', 'Medicinal and culinary herbs'),
('Flowers', 'flowers', '🌺', 'Cut flowers and ornamental plants');
```

### Sample Producer Data
```sql
-- Sample producer for testing
INSERT INTO users (email, password_hash, user_type, is_verified, phone, phone_verified) 
VALUES ('demo@highlandtea.lk', '$2b$10$hashedpassword', 'producer', true, '+94771234567', true);

INSERT INTO producers (user_id, business_name, owner_name, description, location, province, verified, established_year)
VALUES (1, 'Highland Tea Estate', 'John Doe', 'Premium Ceylon tea producer with over 20 years of experience', 'Kandy', 'Central', true, 2003);

INSERT INTO producer_categories (producer_id, category_id) VALUES (1, 5);
```

---

## Backup and Maintenance

### Daily Backup Strategy
```sql
-- Full database backup
mysqldump --single-transaction --routines --triggers helatrade > backup_$(date +%Y%m%d).sql

-- Table-specific backups for large tables
mysqldump --single-transaction --where="created_at >= CURDATE() - INTERVAL 30 DAY" helatrade analytics_views > analytics_backup_$(date +%Y%m%d).sql
```

### Maintenance Queries
```sql
-- Clean old analytics data (older than 1 year)
DELETE FROM analytics_views WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Update popularity scores
UPDATE posts SET popularity_score = (
    (total_likes * 3) + 
    (total_comments * 5) + 
    (total_shares * 10) + 
    (total_views * 0.1)
);

-- Clean expired certifications
UPDATE producer_certifications 
SET verified = FALSE 
WHERE expiry_date < CURDATE() AND verified = TRUE;
```

---

## Performance Monitoring

### Key Metrics to Monitor
- Query execution time for search operations
- Index usage statistics
- Table growth rates (especially analytics_views)
- Connection pool utilization
- Slow query log analysis

### Optimization Recommendations
1. **Partitioning**: Consider partitioning `analytics_views` by date
2. **Archiving**: Move old data to archive tables
3. **Caching**: Implement Redis for frequently accessed data
4. **Read Replicas**: Use read replicas for analytics queries
5. **Connection Pooling**: Optimize database connection management

This schema provides a robust foundation for the producer functionality while maintaining flexibility for future enhancements and scalability requirements.