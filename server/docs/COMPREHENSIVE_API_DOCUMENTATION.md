# HelaTrade API Documentation

## Overview
This document provides comprehensive documentation for the HelaTrade Producer and Categories APIs, including all endpoints, request/response structures, authentication requirements, and examples.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)",
  "errors": ["Validation error 1", "Validation error 2"] // For validation errors
}
```

---

# Categories API

## Endpoints Overview
- `GET /categories` - Get all categories with optional filtering
- `GET /categories/:id` - Get category by ID
- `GET /categories/parent/:parentId` - Get subcategories by parent ID
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Soft delete category
- `GET /categories/:id/relationships` - Get category with full relationships
- `PATCH /categories/:id/restore` - Restore soft-deleted category

## Category Data Structure

### Category Object
```json
{
  "id": 1,
  "name": "Agriculture",
  "slug": "agriculture",
  "icon": "agriculture-icon",
  "description": "Agricultural products and services",
  "parent_id": null,
  "display_order": 0,
  "is_active": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### Category with Relationships
```json
{
  "id": 1,
  "name": "Agriculture",
  "slug": "agriculture",
  "icon": "agriculture-icon",
  "description": "Agricultural products and services",
  "parent_id": null,
  "display_order": 0,
  "is_active": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "subcategories": [
    {
      "id": 2,
      "name": "Fruits",
      "slug": "fruits",
      "parent_id": 1,
      // ... other fields
    }
  ],
  "parent": null
}
```

## Category Endpoints

### GET /categories
Retrieve all categories with optional filtering.

**Authentication:** None required

**Query Parameters:**
- `active` (boolean, optional): Filter by active status ("true" or "false")
- `parent_id` (integer/string, optional): Filter by parent ID (use "null" or empty string for root categories)

**Request Example:**
```http
GET /api/categories?active=true&parent_id=null
```

**Response Example:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Agriculture",
        "slug": "agriculture",
        "icon": "agriculture-icon",
        "description": "Agricultural products and services",
        "parent_id": null,
        "display_order": 0,
        "is_active": true,
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /categories/:id
Get a specific category by ID.

**Authentication:** None required

**Path Parameters:**
- `id` (integer, required): Category ID

**Request Example:**
```http
GET /api/categories/1
```

**Response Example:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Agriculture",
      "slug": "agriculture",
      "icon": "agriculture-icon",
      "description": "Agricultural products and services",
      "parent_id": null,
      "display_order": 0,
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Category not found

### GET /categories/parent/:parentId
Get all subcategories for a specific parent category.

**Authentication:** None required

**Path Parameters:**
- `parentId` (integer, required): Parent category ID

**Request Example:**
```http
GET /api/categories/parent/1
```

**Response Example:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": 2,
        "name": "Fruits",
        "slug": "fruits",
        "parent_id": 1,
        "is_active": true,
        // ... other fields
      }
    ]
  }
}
```

### POST /categories
Create a new category.

**Authentication:** Required (Admin privileges recommended)

**Request Body:**
```json
{
  "name": "New Category",
  "slug": "new-category", // Optional, auto-generated if not provided
  "icon": "category-icon", // Optional
  "description": "Category description", // Optional
  "parent_id": 1, // Optional, null for root category
  "display_order": 0, // Optional, defaults to 0
  "is_active": true // Optional, defaults to true
}
```

**Validation Rules:**
- `name`: Required, string, max 255 characters
- `slug`: Optional, string, max 255 characters, lowercase letters/numbers/hyphens only
- `icon`: Optional, string, max 50 characters
- `description`: Optional, string
- `parent_id`: Optional, positive integer or null
- `display_order`: Optional, non-negative integer
- `is_active`: Optional, boolean

**Request Example:**
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Organic Vegetables",
  "description": "Fresh organic vegetables",
  "parent_id": 1,
  "display_order": 1
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": 3,
      "name": "Organic Vegetables",
      "slug": "organic-vegetables",
      "description": "Fresh organic vegetables",
      "parent_id": 1,
      "display_order": 1,
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or parent category not found
- `409 Conflict`: Category with this name/slug already exists

### PUT /categories/:id
Update an existing category.

**Authentication:** Required (Admin privileges recommended)

**Path Parameters:**
- `id` (integer, required): Category ID

**Request Body:** Same as POST, but all fields are optional

**Request Example:**
```http
PUT /api/categories/3
Content-Type: application/json

{
  "name": "Premium Organic Vegetables",
  "description": "Premium quality organic vegetables"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": 3,
      "name": "Premium Organic Vegetables",
      "slug": "premium-organic-vegetables",
      "description": "Premium quality organic vegetables",
      "parent_id": 1,
      "display_order": 1,
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:05:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors, parent category not found, or circular reference
- `404 Not Found`: Category not found
- `409 Conflict`: Category with this name/slug already exists

### DELETE /categories/:id
Soft delete a category (sets is_active to false).

**Authentication:** Required (Admin privileges recommended)

**Path Parameters:**
- `id` (integer, required): Category ID

**Request Example:**
```http
DELETE /api/categories/3
```

**Response Example:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Category has active subcategories
- `404 Not Found`: Category not found

### GET /categories/:id/relationships
Get a category with all its relationships (subcategories and parent).

**Authentication:** None required

**Path Parameters:**
- `id` (integer, required): Category ID

**Request Example:**
```http
GET /api/categories/1/relationships
```

**Response Example:**
```json
{
  "success": true,
  "message": "Category with relationships retrieved successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Agriculture",
      "slug": "agriculture",
      "parent_id": null,
      "subcategories": [
        {
          "id": 2,
          "name": "Fruits",
          "parent_id": 1
          // ... other fields
        }
      ],
      "parent": null
    }
  }
}
```

### PATCH /categories/:id/restore
Restore a soft-deleted category.

**Authentication:** Required (Admin privileges recommended)

**Path Parameters:**
- `id` (integer, required): Category ID

**Request Example:**
```http
PATCH /api/categories/3/restore
```

**Response Example:**
```json
{
  "success": true,
  "message": "Category restored successfully",
  "data": {
    "category": {
      "id": 3,
      "name": "Organic Vegetables",
      "is_active": true
      // ... other fields
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Category is already active
- `404 Not Found`: Category not found

---

# Producers API

## Endpoints Overview

### Authentication & Registration
- `POST /producers/register` - Register new producer
- `POST /producers/login` - Producer login

### Profile Management
- `GET /producers/profile` - Get authenticated producer's profile
- `GET /producers/profile/:id` - Get producer profile by ID
- `PUT /producers/profile` - Update producer profile
- `GET /producers/` - Get all producers (public listing)

### Categories Management
- `GET /producers/profile/categories` - Get producer's categories
- `POST /producers/profile/categories/:categoryId` - Add category to producer
- `PUT /producers/profile/categories` - Update producer categories
- `DELETE /producers/profile/categories/:categoryId` - Remove category from producer

### Business Hours Management
- `GET /producers/profile/business-hours` - Get producer's business hours
- `PUT /producers/profile/business-hours` - Update business hours

### Certifications Management
- `GET /producers/profile/certifications` - Get producer's certifications
- `PUT /producers/profile/certifications` - Update certifications
- `POST /producers/profile/certifications` - Add new certification

### Languages Management
- `GET /producers/profile/languages` - Get producer's languages
- `PUT /producers/profile/languages` - Update languages
- `POST /producers/profile/languages` - Add new language

### Social Media Management
- `GET /producers/profile/social-media` - Get producer's social media
- `PUT /producers/profile/social-media` - Update social media
- `POST /producers/profile/social-media` - Add new social media

### Specialties Management
- `GET /producers/profile/specialties` - Get producer's specialties
- `PUT /producers/profile/specialties` - Update specialties
- `POST /producers/profile/specialties` - Add new specialty

### Debug Endpoints
- `GET /producers/debug/producer-data` - Debug producer data
- `GET /producers/debug/user-check` - Debug user authentication

## Producer Data Structures

### Producer Profile Object
```json
{
  "id": 1,
  "user_id": 5,
  "email": "producer@example.com",
  "user_type": "producer",
  "is_verified": false,
  "phone_verified": false,
  "status": "active",
  "producer_id": 1,
  "business_name": "Green Farm Solutions",
  "owner_name": "John Doe",
  "bio": "Organic farming specialist",
  "description": "We specialize in organic vegetables and fruits",
  "location": "Colombo, Sri Lanka",
  "province": "Western",
  "website": "https://greenfarm.lk",
  "established_year": 2020,
  "avatar": "avatar_url.jpg",
  "banner_image": "banner_url.jpg",
  "verified": false,
  "featured": false,
  "total_views": 0,
  "total_likes": 0,
  "total_connections": 0,
  "rating": 0,
  "categories": [],
  "business_hours": [],
  "certifications": [],
  "languages": [],
  "social_media": [],
  "specialties": []
}
```

### Business Hours Object
```json
{
  "id": 1,
  "producer_id": 1,
  "day_of_week": 1,
  "is_open": true,
  "open_time": "08:00:00",
  "close_time": "17:00:00"
}
```

### Certification Object
```json
{
  "id": 1,
  "producer_id": 1,
  "certification_name": "Organic Certification",
  "issuing_body": "Sri Lanka Standards Institute",
  "issue_date": "2023-01-01",
  "expiry_date": "2024-01-01",
  "certificate_url": "https://example.com/cert.pdf"
}
```

### Language Object
```json
{
  "id": 1,
  "producer_id": 1,
  "language": "English",
  "proficiency_level": "fluent"
}
```

### Social Media Object
```json
{
  "id": 1,
  "producer_id": 1,
  "platform": "facebook",
  "profile_url": "https://facebook.com/greenfarm",
  "username": "greenfarm"
}
```

### Specialty Object
```json
{
  "id": 1,
  "producer_id": 1,
  "specialty_name": "Organic Farming",
  "description": "Specializes in chemical-free organic farming methods",
  "years_of_experience": 5
}
```

## Producer Authentication & Registration

### POST /producers/register
Register a new producer account.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "producer@example.com",
  "password": "securePassword123",
  "phone": "+94771234567",
  "business_name": "Green Farm Solutions",
  "owner_name": "John Doe",
  "bio": "Organic farming specialist",
  "description": "We specialize in organic vegetables and fruits",
  "location": "Colombo, Sri Lanka",
  "province": "Western",
  "website": "https://greenfarm.lk",
  "established_year": 2020,
  "avatar": "avatar_url.jpg",
  "banner_image": "banner_url.jpg",
  "category_ids": [1, 2],
  "business_hours": [
    {
      "day_of_week": 1,
      "is_open": true,
      "open_time": "08:00",
      "close_time": "17:00"
    }
  ],
  "certifications": [
    {
      "certification_name": "Organic Certification",
      "issuing_body": "Sri Lanka Standards Institute",
      "issue_date": "2023-01-01",
      "expiry_date": "2024-01-01"
    }
  ],
  "languages": [
    {
      "language": "English",
      "proficiency": "advanced"
    },
    {
      "language": "Sinhala",
      "proficiency": "native"
    }
  ],
  "social_media": [
    {
      "platform": "facebook",
      "profile_url": "https://facebook.com/greenfarm"
    }
  ],
  "specialties": [
    {
      "specialty_name": "Organic Farming",
      "years_of_experience": 5
    }
  ]
}
```

**Required Fields:**
- `email`: Valid email address
- `password`: Strong password
- `business_name`: Business name
- `owner_name`: Owner's name

**Response Example:**
```json
{
  "success": true,
  "message": "Producer registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "producer@example.com",
      "user_type": "producer",
      "business_name": "Green Farm Solutions",
      "owner_name": "John Doe",
      // ... other fields
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /producers/login
Login for existing producers.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "producer@example.com",
  "password": "securePassword123"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "producer@example.com",
      "user_type": "producer",
      // ... producer details
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Producer Profile Management

### GET /producers/profile
Get the authenticated producer's profile.

**Authentication:** Required (Producer)

**Request Example:**
```http
GET /api/producers/profile
Authorization: Bearer <token>
```

**Response Example:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "producer": {
      "id": 1,
      "business_name": "Green Farm Solutions",
      "owner_name": "John Doe",
      "bio": "Organic farming specialist",
      "categories": [
        {
          "id": 1,
          "name": "Agriculture"
        }
      ],
      "business_hours": [
        {
          "day_of_week": 1,
          "is_open": true,
          "open_time": "08:00:00",
          "close_time": "17:00:00"
        }
      ]
      // ... other fields
    }
  }
}
```

### GET /producers/profile/:id
Get a producer's public profile by ID.

**Authentication:** Optional

**Path Parameters:**
- `id` (integer, required): Producer ID

**Request Example:**
```http
GET /api/producers/profile/1
```

**Response Example:**
```json
{
  "success": true,
  "message": "Producer profile retrieved successfully",
  "data": {
    "producer": {
      "id": 1,
      "business_name": "Green Farm Solutions",
      "owner_name": "John Doe",
      "bio": "Organic farming specialist",
      "location": "Colombo, Sri Lanka",
      "verified": false,
      "rating": 4.5,
      "total_views": 150,
      "categories": []
      // ... public fields only
    }
  }
}
```

### PUT /producers/profile
Update the authenticated producer's profile.

**Authentication:** Required (Producer)

**Request Body:** (All fields optional)
```json
{
  "business_name": "Updated Business Name",
  "owner_name": "Updated Owner Name",
  "bio": "Updated bio",
  "description": "Updated description",
  "location": "Updated location",
  "province": "Updated province",
  "website": "https://updated-website.com",
  "established_year": 2021,
  "avatar": "new_avatar_url.jpg",
  "banner_image": "new_banner_url.jpg"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "producer": {
      "id": 1,
      "business_name": "Updated Business Name",
      // ... updated fields
    }
  }
}
```

### GET /producers/
Get all producers (public listing with pagination and filtering).

**Authentication:** None required

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10, max: 50)
- `category` (integer, optional): Filter by category ID
- `province` (string, optional): Filter by province
- `verified` (boolean, optional): Filter by verification status

**Request Example:**
```http
GET /api/producers?page=1&limit=10&category=1&verified=true
```

**Response Example:**
```json
{
  "success": true,
  "message": "Producers retrieved successfully",
  "data": {
    "producers": [
      {
        "id": 1,
        "business_name": "Green Farm Solutions",
        "location": "Colombo, Sri Lanka",
        "verified": true,
        "rating": 4.5
        // ... public fields
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 10
    }
  }
}
```

## Categories Management

### GET /producers/profile/categories
Get the authenticated producer's categories.

**Authentication:** Required (Producer)

**Response Example:**
```json
{
  "success": true,
  "message": "Producer categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Agriculture",
        "slug": "agriculture"
      }
    ]
  }
}
```

### PUT /producers/profile/categories
Update producer's categories (replace all existing categories).

**Authentication:** Required (Producer)

**Request Body:**
```json
{
  "category_ids": [1, 2, 3]
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Categories updated successfully",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Agriculture"
      },
      {
        "id": 2,
        "name": "Organic Products"
      }
    ]
  }
}
```

### POST /producers/profile/categories/:categoryId
Add a single category to producer.

**Authentication:** Required (Producer)

**Path Parameters:**
- `categoryId` (integer, required): Category ID

**Response Example:**
```json
{
  "success": true,
  "message": "Category added successfully"
}
```

### DELETE /producers/profile/categories/:categoryId
Remove a category from producer.

**Authentication:** Required (Producer)

**Path Parameters:**
- `categoryId` (integer, required): Category ID

**Response Example:**
```json
{
  "success": true,
  "message": "Category removed successfully"
}
```

## Business Hours Management

### GET /producers/profile/business-hours
Get producer's business hours.

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Business hours retrieved successfully",
  "data": {
    "business_hours": [
      {
        "id": 1,
        "day_of_week": 1,
        "is_open": true,
        "open_time": "08:00:00",
        "close_time": "17:00:00"
      }
    ]
  }
}
```

### PUT /producers/profile/business-hours
Update producer's business hours.

**Authentication:** Required

**Request Body:**
```json
{
  "business_hours": [
    {
      "day_of_week": 1,
      "is_open": true,
      "open_time": "08:00",
      "close_time": "17:00"
    },
    {
      "day_of_week": 2,
      "is_open": false
    }
  ]
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Business hours updated successfully",
  "data": {
    "business_hours": [
      {
        "id": 1,
        "day_of_week": 1,
        "is_open": true,
        "open_time": "08:00:00",
        "close_time": "17:00:00"
      }
    ]
  }
}
```

## Certifications Management

### GET /producers/profile/certifications
Get producer's certifications.

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Certifications retrieved successfully",
  "data": {
    "certifications": [
      {
        "id": 1,
        "certification_name": "Organic Certification",
        "issuing_body": "Sri Lanka Standards Institute",
        "issue_date": "2023-01-01T00:00:00.000Z",
        "expiry_date": "2024-01-01T00:00:00.000Z",
        "certificate_url": "https://example.com/cert.pdf"
      }
    ]
  }
}
```

### PUT /producers/profile/certifications
Update all certifications (replace existing).

**Authentication:** Required

**Request Body:**
```json
{
  "certifications": [
    {
      "certification_name": "Organic Certification",
      "issuing_body": "Sri Lanka Standards Institute",
      "issue_date": "2023-01-01",
      "expiry_date": "2024-01-01",
      "certificate_url": "https://example.com/cert.pdf"
    }
  ]
}
```

### POST /producers/profile/certifications
Add a new certification.

**Authentication:** Required

**Request Body:**
```json
{
  "certification_name": "Fair Trade Certification",
  "issuing_body": "Fair Trade International",
  "issue_date": "2023-06-01",
  "expiry_date": "2024-06-01"
}
```

## Error Codes

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Access denied (insufficient permissions)
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (duplicate)
- `500 Internal Server Error`: Server error

### Common Error Messages
- "Authentication required": No token provided
- "Invalid token": Token is malformed or expired
- "Access denied": User doesn't have required permissions
- "Validation failed": Request data doesn't meet validation requirements
- "Resource not found": Requested resource doesn't exist
- "Resource already exists": Attempting to create duplicate resource

## Rate Limiting
API endpoints may be rate-limited to prevent abuse. Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## API Versioning
The current API version is v1. Future versions will be accessible via URL versioning:
- Current: `/api/...`
- Future: `/api/v2/...`

---

*This documentation is current as of the latest API version. For the most up-to-date information, please refer to the API source code or contact the development team.*
