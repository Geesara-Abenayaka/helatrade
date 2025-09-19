const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let sql = 'SELECT id, name, slug, icon, description, parent_id, display_order FROM categories';
    const params = [];
    
    // If active parameter is provided, filter by it; otherwise show only active categories by default
    if (active !== undefined) {
      sql += ' WHERE is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    } else {
      // Default behavior: show only active categories
      sql += ' WHERE is_active = 1';
    }
    
    sql += ' ORDER BY display_order ASC, name ASC';
    
    const categories = await query(sql, params);
    
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
    
    const sql = 'SELECT * FROM categories WHERE id = ? AND is_active = true';
    const categories = await query(sql, [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: { category: categories[0] }
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

module.exports = router;