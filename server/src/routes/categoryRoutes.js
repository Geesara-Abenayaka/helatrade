const express = require('express');
const { query } = require('../config/database');
const Category = require('../models/Category');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { active, parent_id } = req.query;
    
    const filters = {};
    
    // Parse active filter
    if (active !== undefined) {
      filters.is_active = active === 'true';
    }
    
    // Parse parent_id filter
    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === '') {
        filters.parent_id = null;
      } else {
        filters.parent_id = parseInt(parent_id);
      }
    }
    
    const categories = await Category.getAll(filters);
    
    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.getById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get categories by parent ID
router.get('/parent/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const sql = 'SELECT * FROM categories WHERE parent_id = ? AND is_active = true ORDER BY display_order ASC, name ASC';
    const categories = await query(sql, [parentId]);
    
    res.json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subcategories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const categoryData = req.body;

    // Validate input data
    const validation = Category.validateData(categoryData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if slug already exists
    if (categoryData.slug) {
      const existingCategory = await Category.getBySlug(categoryData.slug);
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
    }

    // Check if parent category exists
    if (categoryData.parent_id) {
      const parentCategory = await Category.getById(categoryData.parent_id);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const newCategory = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category: newCategory }
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate input data
    const validation = Category.validateData(updateData, true);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if category exists
    const existingCategory = await Category.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if slug already exists (excluding current category)
    if (updateData.slug) {
      const categoryWithSlug = await Category.getBySlug(updateData.slug);
      if (categoryWithSlug && categoryWithSlug.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
    }

    // Check if parent category exists and prevent circular reference
    if (updateData.parent_id) {
      if (updateData.parent_id === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parentCategory = await Category.getById(updateData.parent_id);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const updatedCategory = await Category.update(id, updateData);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updatedCategory }
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Soft delete category (deactivate)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await Category.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has active subcategories
    const subcategories = await Category.getAll({ parent_id: id, is_active: true });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with active subcategories',
        data: { subcategoriesCount: subcategories.length }
      });
    }

    await Category.softDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get category with full relationships (subcategories and parent)
router.get('/:id/relationships', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoryWithRelations = await Category.getWithRelations(id);
    
    if (!categoryWithRelations) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category with relationships retrieved successfully',
      data: { category: categoryWithRelations }
    });
  } catch (error) {
    console.error('Get category relationships error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category relationships',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Restore soft-deleted category
router.patch('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await Category.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (existingCategory.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Category is already active'
      });
    }

    const restoredCategory = await Category.update(id, { is_active: true });

    res.json({
      success: true,
      message: 'Category restored successfully',
      data: { category: restoredCategory }
    });
  } catch (error) {
    console.error('Restore category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;