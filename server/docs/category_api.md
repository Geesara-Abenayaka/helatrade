# Category API Documentation

This document describes the category management APIs available in the HelaTrade platform.

## Base URL
```
/api/categories
```

## Endpoints

### 1. Get All Categories
- **Method**: `GET`
- **URL**: `/api/categories`
- **Query Parameters**:
  - `active` (optional): Filter by active status (`true` or `false`)
  - `parent_id` (optional): Filter by parent category ID (use `null` for top-level categories)

**Example Requests:**
```bash
# Get all active categories
GET /api/categories?active=true

# Get all top-level categories
GET /api/categories?parent_id=null

# Get all categories (active and inactive)
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Vegetables",
        "slug": "vegetables",
        "icon": "🥬",
        "description": "Fresh vegetables and greens",
        "parent_id": null,
        "display_order": 0,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. Get Category by ID
- **Method**: `GET`
- **URL**: `/api/categories/:id`

**Example Request:**
```bash
GET /api/categories/1
```

**Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Vegetables",
      "slug": "vegetables",
      "icon": "🥬",
      "description": "Fresh vegetables and greens",
      "parent_id": null,
      "display_order": 0,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Get Categories by Parent ID
- **Method**: `GET`
- **URL**: `/api/categories/parent/:parentId`

**Example Request:**
```bash
GET /api/categories/parent/1
```

### 4. Create New Category
- **Method**: `POST`
- **URL**: `/api/categories`
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "name": "Organic Vegetables",
  "slug": "organic-vegetables", // Optional - auto-generated from name if not provided
  "icon": "🥒", // Optional
  "description": "Organically grown vegetables", // Optional
  "parent_id": 1, // Optional - null for top-level category
  "display_order": 10, // Optional - defaults to 0
  "is_active": true // Optional - defaults to true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": 11,
      "name": "Organic Vegetables",
      "slug": "organic-vegetables",
      "icon": "🥒",
      "description": "Organically grown vegetables",
      "parent_id": 1,
      "display_order": 10,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Update Category
- **Method**: `PUT`
- **URL**: `/api/categories/:id`
- **Content-Type**: `application/json`

**Request Body:** (Include only fields you want to update)
```json
{
  "name": "Fresh Organic Vegetables",
  "description": "Freshly picked organic vegetables",
  "display_order": 5,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": 11,
      "name": "Fresh Organic Vegetables",
      "slug": "organic-vegetables",
      "icon": "🥒",
      "description": "Freshly picked organic vegetables",
      "parent_id": 1,
      "display_order": 5,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### 6. Delete Category (Soft Delete)
- **Method**: `DELETE`
- **URL**: `/api/categories/:id`

**Example Request:**
```bash
DELETE /api/categories/11
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### 7. Get Category with Relationships
- **Method**: `GET`
- **URL**: `/api/categories/:id/relationships`

**Example Request:**
```bash
GET /api/categories/1/relationships
```

**Response:**
```json
{
  "success": true,
  "message": "Category with relationships retrieved successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Vegetables",
      "slug": "vegetables",
      "icon": "🥬",
      "description": "Fresh vegetables and greens",
      "parent_id": null,
      "display_order": 0,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "subcategories": [
        {
          "id": 11,
          "name": "Organic Vegetables",
          "slug": "organic-vegetables",
          // ... other category fields
        }
      ],
      "parent": null
    }
  }
}
```

### 8. Restore Deleted Category
- **Method**: `PATCH`
- **URL**: `/api/categories/:id/restore`

**Example Request:**
```bash
PATCH /api/categories/11/restore
```

**Response:**
```json
{
  "success": true,
  "message": "Category restored successfully",
  "data": {
    "category": {
      "id": 11,
      "name": "Organic Vegetables",
      "slug": "organic-vegetables",
      "icon": "🥒",
      "description": "Organically grown vegetables",
      "parent_id": 1,
      "display_order": 10,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

## Validation Rules

### Required Fields
- `name`: Required for creation, must be a non-empty string (max 255 characters)

### Optional Fields
- `slug`: Auto-generated from name if not provided, must be unique, lowercase letters/numbers/hyphens only
- `icon`: String with maximum 50 characters
- `description`: Text description
- `parent_id`: Must be a valid category ID or null
- `display_order`: Non-negative integer (default: 0)
- `is_active`: Boolean (default: true)

### Business Rules
- Category cannot be its own parent
- Cannot delete category with active subcategories
- Slug must be unique across all categories
- Parent category must exist if specified

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Slug must contain only lowercase letters, numbers, and hyphens"
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Category not found"
}
```

### 409 Conflict - Duplicate
```json
{
  "success": false,
  "message": "Category with this slug already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create category",
  "error": "Database connection error" // Only in development mode
}
```

## Example Usage with cURL

### Create a new category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Fruits",
    "description": "Organically grown fruits",
    "parent_id": 2,
    "icon": "🍊"
  }'
```

### Update a category
```bash
curl -X PUT http://localhost:3000/api/categories/11 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Organic Fruits",
    "display_order": 1
  }'
```

### Get all active categories
```bash
curl http://localhost:3000/api/categories?active=true
```

### Delete a category
```bash
curl -X DELETE http://localhost:3000/api/categories/11
```