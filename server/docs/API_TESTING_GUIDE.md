# HelaTrade API Testing Guide

## Overview
This document provides simple examples for testing the HelaTrade authentication and producer APIs using tools like Postman, cURL, or any HTTP client.

## Base URL
```
http://localhost:3000/api
```

## Testing Workflow
1. Register a new producer
2. Login to get JWT token
3. Use token to access protected endpoints
4. Test profile management and producer endpoints

---

## 1. Authentication Endpoints

### 1.1 Producer Registration
**POST** `/auth/producer/register`

```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "businessName": "Green Valley Farm",
  "ownerName": "John Doe",
  "phone": "+94771234567",
  "location": "Kandy, Sri Lanka",
  "province": "Central",
  "website": "https://greenvalley.lk",
  "establishedYear": 2010,
  "bio": "Organic vegetable producer",
  "description": "We specialize in organic vegetables and sustainable farming practices.",
  "categories": [1, 2]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "user_type": "producer",
      "is_verified": false,
      "phone": "+94771234567",
      "phone_verified": false,
      "status": "active"
    },
    "producer": {
      "id": 1,
      "user_id": 1,
      "business_name": "Green Valley Farm",
      "owner_name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Producer registration successful"
}
```

### 1.2 Login
**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "user_type": "producer"
    },
    "producer": {
      "id": 1,
      "business_name": "Green Valley Farm",
      "verified": false,
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 1.3 Get Current User Profile
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "user_type": "producer",
      "is_verified": false,
      "phone": "+94771234567",
      "phone_verified": false,
      "status": "active"
    },
    "producer": {
      "id": 1,
      "business_name": "Green Valley Farm",
      "owner_name": "John Doe",
      "location": "Kandy, Sri Lanka",
      "categories": [],
      "certifications": [],
      "specialties": []
    }
  }
}
```

### 1.4 Update Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "business_name": "Green Valley Organic Farm",
  "description": "Updated description with more details about our organic farming practices.",
  "website": "https://greenvalleyorganic.lk"
}
```

### 1.5 Change Password
**POST** `/auth/change-password`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

---

## 2. Producer Endpoints

### 2.1 Get All Producers
**GET** `/producers`

**Query Parameters (optional):**
- `page=1`
- `limit=10`
- `search=organic`
- `location=Kandy`
- `province=Central`
- `verified=true`
- `featured=true`
- `category=vegetables`

**Example:**
```
GET /producers?page=1&limit=5&search=organic&verified=true
```

### 2.2 Get Producer by ID
**GET** `/producers/1`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "business_name": "Green Valley Farm",
    "owner_name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "location": "Kandy, Sri Lanka",
    "description": "We specialize in organic vegetables...",
    "verified": false,
    "featured": false,
    "total_views": 1,
    "total_likes": 0,
    "total_connections": 0,
    "categories": [],
    "certifications": [],
    "specialties": []
  }
}
```

### 2.3 Update Producer Profile
**PUT** `/producers/1`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "business_name": "Green Valley Premium Farm",
  "bio": "Premium organic produce supplier",
  "description": "We are a leading supplier of premium organic vegetables and fruits in Sri Lanka.",
  "location": "Kandy, Central Province"
}
```

### 2.4 Update Producer Categories
**PUT** `/producers/1/categories`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "categories": [1, 2, 9]
}
```

### 2.5 Get Producer Statistics
**GET** `/producers/1/stats`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Category Endpoints

### 3.1 Get All Categories
**GET** `/categories`

**Expected Response:**
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
        "description": "Fresh vegetables and greens"
      },
      {
        "id": 2,
        "name": "Fruits",
        "slug": "fruits",
        "icon": "🍎",
        "description": "Fresh and dried fruits"
      }
    ]
  }
}
```

### 3.2 Get Category by ID
**GET** `/categories/1`

### 3.3 Get Producers in Category
**GET** `/categories/1/producers?page=1&limit=10`

---

## 4. cURL Examples

### Register Producer
```bash
curl -X POST http://localhost:3000/api/auth/producer/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "businessName": "Test Farm",
    "ownerName": "Test User",
    "phone": "+94771234567",
    "location": "Colombo",
    "categories": [1]
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Get Profile (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Get All Producers
```bash
curl -X GET "http://localhost:3000/api/producers?page=1&limit=5"
```

### Get Categories
```bash
curl -X GET http://localhost:3000/api/categories
```

---

## 5. Testing Checklist

### Authentication Flow
- [ ] Register new producer with valid data
- [ ] Try registration with invalid email (should fail)
- [ ] Try registration with weak password (should fail)
- [ ] Try registration with existing email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected route without token (should fail)
- [ ] Access protected route with valid token (should work)

### Producer Management
- [ ] Get all producers (public access)
- [ ] Get specific producer by ID
- [ ] Update own producer profile (authenticated)
- [ ] Try to update another producer's profile (should fail)
- [ ] Update producer categories
- [ ] Get producer statistics

### Data Validation
- [ ] Try registration with missing required fields
- [ ] Try registration with invalid email format
- [ ] Try registration with password too short
- [ ] Try profile update with invalid website URL
- [ ] Try category update with invalid category IDs

### Error Handling
- [ ] Access non-existent producer (404 error)
- [ ] Send malformed JSON (400 error)
- [ ] Use expired/invalid token (401 error)

---

## 6. Common HTTP Status Codes

- **200** - Success
- **201** - Created (registration successful)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **422** - Validation Error
- **500** - Internal Server Error

---

## 7. Environment Setup

Make sure you have:
1. MySQL database running with the helatrade schema
2. `.env` file configured with database credentials
3. Server running on `http://localhost:3000`

**Sample `.env`:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=helatrade
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

---

## 8. Postman Collection

You can import these examples into Postman by creating a new collection and adding requests with the above endpoints and data. Remember to:

1. Set up environment variables for `baseUrl` and `token`
2. Use the token from login response in subsequent requests
3. Set up tests to automatically extract tokens from responses

**Postman Environment Variables:**
- `baseUrl`: `http://localhost:3000/api`
- `token`: (set this from login response)

**Authorization Header:**
```
Bearer {{token}}
```