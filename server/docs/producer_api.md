# Producer API Documentation

## Overview
This document provides comprehensive documentation for all Producer-related API endpoints in the HelaTrade platform. The Producer API enables agricultural producers to manage their profiles, products, content, and connections.

## Base URL
```
https://api.helatrade.com/api
```

## Authentication
All producer endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Responses
All endpoints may return these common error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Authentication & User Management

### POST /auth/producer/register
Register a new producer account.

**Request Body:**
```json
{
  "name": "Highland Tea Estate",
  "email": "john@highlandtea.lk",
  "password": "securePassword123",
  "phone": "+94771234567",
  "location": "Kandy, Sri Lanka",
  "categories": [1, 5],
  "businessType": "Tea Producer",
  "description": "Premium Ceylon tea producer..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@highlandtea.lk",
      "userType": "producer",
      "isVerified": false
    },
    "producer": {
      "id": 1,
      "businessName": "Highland Tea Estate",
      "ownerName": "John Doe",
      "location": "Kandy, Sri Lanka"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/producer/login
Login to producer account.

**Request Body:**
```json
{
  "email": "john@highlandtea.lk",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@highlandtea.lk",
      "userType": "producer"
    },
    "producer": {
      "id": 1,
      "businessName": "Highland Tea Estate",
      "verified": true,
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/producer/verify-phone
Verify producer's phone number.

**Request Body:**
```json
{
  "phone": "+94771234567",
  "verificationCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneVerified": true,
    "message": "Phone number verified successfully"
  }
}
```

---

## Producer Profile Management

### GET /producers/:id
Get producer profile details.

**Parameters:**
- `id` (path) - Producer ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessName": "Highland Tea Estate",
    "ownerName": "John Doe",
    "email": "john@highlandtea.lk",
    "phone": "+94771234567",
    "location": "Kandy, Sri Lanka",
    "description": "Premium Ceylon tea producer...",
    "avatar": "https://storage.helatrade.com/avatars/producer_1.jpg",
    "bannerImage": "https://storage.helatrade.com/banners/producer_1.jpg",
    "verified": true,
    "featured": false,
    "establishedYear": 2003,
    "website": "https://highlandtea.lk",
    "categories": [
      {
        "id": 5,
        "name": "Tea",
        "icon": "🍃"
      }
    ],
    "certifications": [
      {
        "id": 1,
        "name": "Organic Certified",
        "issuingBody": "IFOAM",
        "verified": true
      }
    ],
    "specialties": ["Black Tea", "Green Tea", "White Tea"],
    "languages": [
      {
        "language": "English",
        "proficiency": "advanced"
      }
    ],
    "businessHours": {
      "monday": {"isOpen": true, "openTime": "08:00", "closeTime": "17:00"},
      "tuesday": {"isOpen": true, "openTime": "08:00", "closeTime": "17:00"}
    },
    "socialMedia": {
      "facebook": "https://facebook.com/highlandtea",
      "instagram": "https://instagram.com/highland_tea_estate"
    },
    "stats": {
      "totalViews": 12500,
      "totalLikes": 4200,
      "totalConnections": 850,
      "totalProducts": 15,
      "totalPosts": 87
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:20:00Z"
  }
}
```

### PUT /producers/:id
Update producer profile.

**Parameters:**
- `id` (path) - Producer ID

**Request Body:**
```json
{
  "businessName": "Highland Premium Tea Estate",
  "description": "Updated description...",
  "website": "https://newwebsite.com",
  "categories": [1, 5, 9],
  "certifications": [
    {
      "name": "Fair Trade Certified",
      "issuingBody": "Fair Trade USA",
      "issueDate": "2024-01-01"
    }
  ],
  "businessHours": {
    "monday": {"isOpen": true, "openTime": "07:00", "closeTime": "18:00"}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Producer profile updated successfully"
  }
}
```

### POST /producers/:id/avatar
Upload producer avatar image.

**Parameters:**
- `id` (path) - Producer ID

**Request:** Multipart form data
- `avatar` (file) - Image file (max 5MB, jpg/png)

**Response:**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://storage.helatrade.com/avatars/producer_1_avatar.jpg",
    "message": "Avatar uploaded successfully"
  }
}
```

### GET /producers/:id/stats
Get producer statistics.

**Parameters:**
- `id` (path) - Producer ID

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalViews": 45230,
      "totalLikes": 3420,
      "totalComments": 890,
      "totalConnections": 142,
      "viewsChange": 12.5,
      "likesChange": 8.3,
      "commentsChange": -2.1,
      "connectionsChange": 15.7
    },
    "products": {
      "totalProducts": 25,
      "inStock": 20,
      "outOfStock": 5,
      "totalInquiries": 156
    },
    "posts": {
      "totalPosts": 87,
      "published": 85,
      "drafts": 2,
      "averageEngagement": 7.8
    }
  }
}
```

---

## Product Management

### GET /producers/:id/products
Get producer's products.

**Parameters:**
- `id` (path) - Producer ID
- `page` (query) - Page number (default: 1)
- `limit` (query) - Items per page (default: 20)
- `category` (query) - Filter by category ID
- `availability` (query) - Filter by availability status
- `search` (query) - Search by name/description
- `sort` (query) - Sort by: newest, oldest, price_asc, price_desc, popular

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Premium Ceylon Tea",
        "description": "High-quality Ceylon tea from the hill country",
        "category": {
          "id": 5,
          "name": "Tea",
          "icon": "🍃"
        },
        "price": 450.00,
        "unit": "per kg",
        "stockQuantity": 500,
        "minOrderQuantity": 10,
        "isOrganic": true,
        "isFeatured": false,
        "availability": "in-stock",
        "images": [
          {
            "id": 1,
            "url": "https://storage.helatrade.com/products/tea_1.jpg",
            "isPrimary": true
          }
        ],
        "tags": ["premium", "ceylon", "export-quality"],
        "analytics": {
          "views": 1200,
          "inquiries": 45,
          "connections": 12
        },
        "rating": 4.8,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 20
    }
  }
}
```

### POST /producers/:id/products
Create new product.

**Parameters:**
- `id` (path) - Producer ID

**Request Body:**
```json
{
  "name": "Premium Ceylon Tea",
  "description": "High-quality Ceylon tea from the hill country",
  "categoryId": 5,
  "price": 450.00,
  "unit": "per kg",
  "stockQuantity": 500,
  "minOrderQuantity": 10,
  "isOrganic": true,
  "isFeatured": false,
  "availability": "in-stock",
  "tags": ["premium", "ceylon", "export-quality"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Premium Ceylon Tea",
    "message": "Product created successfully"
  }
}
```

### PUT /products/:id
Update product.

**Parameters:**
- `id` (path) - Product ID

**Request Body:** (Same as create, all fields optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Product updated successfully"
  }
}
```

### DELETE /products/:id
Delete product.

**Parameters:**
- `id` (path) - Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

### POST /products/:id/images
Upload product images.

**Parameters:**
- `id` (path) - Product ID

**Request:** Multipart form data
- `images` (files) - Image files (max 5 images, 5MB each)

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadedImages": [
      {
        "id": 1,
        "url": "https://storage.helatrade.com/products/product_1_img1.jpg",
        "isPrimary": true
      }
    ],
    "message": "Images uploaded successfully"
  }
}
```

### GET /products/:id/analytics
Get product analytics.

**Parameters:**
- `id` (path) - Product ID
- `timeRange` (query) - 7days, 30days, 90days, 1year

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalViews": 1200,
      "totalInquiries": 45,
      "totalConnections": 12,
      "conversionRate": 3.75
    },
    "viewsOverTime": [
      {"date": "2024-01-01", "views": 45},
      {"date": "2024-01-02", "views": 52}
    ],
    "topReferrers": [
      {"source": "search", "views": 450},
      {"source": "direct", "views": 300}
    ]
  }
}
```

---

## Content/Posts Management

### GET /producers/:id/posts
Get producer's posts.

**Parameters:**
- `id` (path) - Producer ID
- `page` (query) - Page number
- `status` (query) - published, draft, archived
- `category` (query) - Filter by category ID
- `sort` (query) - newest, oldest, popular, trending

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "content": "Today we harvested our premium organic vegetables...",
        "category": {
          "id": 1,
          "name": "Vegetables",
          "icon": "🥬"
        },
        "status": "published",
        "isTrending": false,
        "isFeatured": false,
        "images": [
          {
            "id": 1,
            "url": "https://storage.helatrade.com/posts/post_1_img1.jpg"
          }
        ],
        "analytics": {
          "views": 890,
          "likes": 89,
          "comments": 23,
          "shares": 12
        },
        "popularityScore": 85,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 87
    }
  }
}
```

### POST /producers/:id/posts
Create new post.

**Request Body:**
```json
{
  "content": "Today we harvested our premium organic vegetables...",
  "categoryId": 1,
  "status": "published",
  "isFeatured": false,
  "images": [
    "https://storage.helatrade.com/temp/temp_img_1.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Today we harvested our premium organic vegetables...",
    "status": "published",
    "message": "Post created successfully"
  }
}
```

### PUT /posts/:id
Update post.

**Parameters:**
- `id` (path) - Post ID

**Request Body:** (Same as create, all fields optional)

### DELETE /posts/:id
Delete post.

**Parameters:**
- `id` (path) - Post ID

### POST /posts/:id/like
Like or unlike a post.

**Parameters:**
- `id` (path) - Post ID

**Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "totalLikes": 90,
    "message": "Post liked successfully"
  }
}
```

### POST /posts/:id/comment
Comment on a post.

**Parameters:**
- `id` (path) - Post ID

**Request Body:**
```json
{
  "content": "Great quality products! Interested in bulk orders.",
  "parentCommentId": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Great quality products!",
    "user": {
      "id": 2,
      "name": "Store Owner",
      "avatar": "SO"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /posts/:id/comments
Get post comments.

**Parameters:**
- `id` (path) - Post ID
- `page` (query) - Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "Great quality products!",
        "user": {
          "id": 2,
          "name": "Store Owner",
          "userType": "store",
          "avatar": "SO"
        },
        "replies": [
          {
            "id": 2,
            "content": "Thank you! Please contact us for bulk orders.",
            "user": {
              "id": 1,
              "name": "Highland Tea Estate",
              "userType": "producer"
            },
            "createdAt": "2024-01-15T11:00:00Z"
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 23
    }
  }
}
```

---

## Connections Management

### GET /producers/:id/connections
Get producer connections.

**Parameters:**
- `id` (path) - Producer ID
- `status` (query) - accepted, pending, all
- `type` (query) - store, producer, all
- `search` (query) - Search by name

**Response:**
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": 1,
        "connection": {
          "id": 2,
          "name": "Green Valley Supermarket",
          "type": "store",
          "location": "Colombo",
          "avatar": "GV",
          "verified": true
        },
        "status": "accepted",
        "connectedAt": "2024-01-10T10:30:00Z",
        "orderHistory": {
          "totalOrders": 15,
          "totalValue": 450000,
          "lastOrderDate": "2024-01-14T10:30:00Z"
        },
        "mutualConnections": 12
      }
    ],
    "stats": {
      "totalConnections": 142,
      "pendingRequests": 8,
      "activeConnections": 134
    }
  }
}
```

### POST /connections/request
Send connection request.

**Request Body:**
```json
{
  "requestedId": 2,
  "message": "Interested in your premium tea products for our retail chain."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "pending",
    "message": "Connection request sent successfully"
  }
}
```

### PUT /connections/:id/accept
Accept connection request.

**Parameters:**
- `id` (path) - Connection ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "accepted",
    "message": "Connection request accepted"
  }
}
```

### PUT /connections/:id/reject
Reject connection request.

**Parameters:**
- `id` (path) - Connection ID

**Request Body:**
```json
{
  "reason": "Not compatible with our business requirements"
}
```

### DELETE /connections/:id
Remove connection.

**Parameters:**
- `id` (path) - Connection ID

### GET /connections/requests
Get pending connection requests.

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "requester": {
          "id": 3,
          "name": "Export Quality Foods",
          "type": "store",
          "location": "Negombo",
          "avatar": "EQ"
        },
        "message": "Interested in your spice products for export",
        "mutualConnections": 5,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## Analytics & Reporting

### GET /producers/:id/analytics/overview
Get overview analytics.

**Parameters:**
- `id` (path) - Producer ID
- `timeRange` (query) - 7days, 30days, 90days, 1year

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalViews": 45230,
      "totalLikes": 3420,
      "totalComments": 890,
      "totalConnections": 142,
      "viewsChange": 12.5,
      "likesChange": 8.3,
      "commentsChange": -2.1,
      "connectionsChange": 15.7
    },
    "viewsOverTime": [
      {"date": "2024-01-01", "views": 1250},
      {"date": "2024-01-02", "views": 1380}
    ]
  }
}
```

### GET /producers/:id/analytics/posts
Get post analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "topPosts": [
      {
        "id": 1,
        "title": "Ceylon Cinnamon Processing Methods",
        "views": 8500,
        "likes": 450,
        "comments": 120,
        "shares": 89,
        "engagement": 7.8,
        "category": "Spices"
      }
    ],
    "categoryPerformance": [
      {
        "category": "Tea",
        "posts": 25,
        "totalViews": 15000,
        "averageEngagement": 8.2
      }
    ]
  }
}
```

### GET /producers/:id/activities
Get recent activities and notifications.

**Parameters:**
- `id` (path) - Producer ID
- `type` (query) - all, likes, comments, connections
- `limit` (query) - Number of activities (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1,
        "type": "comment",
        "actor": {
          "id": 2,
          "name": "Green Valley Store",
          "avatar": "GV"
        },
        "action": "commented on your post",
        "target": {
          "type": "post",
          "id": 1,
          "title": "Premium organic vegetables harvest"
        },
        "message": "High quality organic vegetables!",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

## Categories & Search

### GET /categories
Get all categories.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Vegetables",
        "slug": "vegetables",
        "icon": "🥬",
        "description": "Fresh vegetables and greens",
        "producerCount": 245,
        "productCount": 1520
      }
    ]
  }
}
```

### GET /producers/search
Search producers.

**Parameters:**
- `q` (query) - Search query
- `category` (query) - Filter by category ID
- `location` (query) - Filter by location
- `verified` (query) - Filter verified producers
- `sort` (query) - relevance, rating, newest

**Response:**
```json
{
  "success": true,
  "data": {
    "producers": [
      {
        "id": 1,
        "businessName": "Highland Tea Estate",
        "location": "Kandy, Sri Lanka",
        "categories": ["Tea"],
        "rating": 4.8,
        "verified": true,
        "totalConnections": 850,
        "avatar": "https://storage.helatrade.com/avatars/producer_1.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 87
    }
  }
}
```

### GET /producers/recommendations
Get recommended producers.

**Parameters:**
- `limit` (query) - Number of recommendations (default: 10)
- `category` (query) - Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": 1,
        "businessName": "Lanka Spice Producer",
        "category": "Spices",
        "connections": 2100,
        "mutualConnections": 15,
        "rating": 4.9,
        "reason": "Popular in your category"
      }
    ]
  }
}
```

---

## Rate Limits
- Authentication endpoints: 5 requests per minute
- Profile updates: 10 requests per minute
- Content creation: 20 requests per minute
- General API: 100 requests per minute

## Webhooks
The API supports webhooks for real-time notifications:

- `connection.request` - New connection request
- `post.like` - Post liked
- `post.comment` - New comment on post
- `product.inquiry` - Product inquiry received

## SDK Support
Official SDKs available for:
- JavaScript/Node.js
- Python
- PHP
- React/React Native

## Support
For API support, contact: api-support@helatrade.com