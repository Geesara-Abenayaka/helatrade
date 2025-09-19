const { query } = require('../config/database');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.icon = data.icon;
    this.description = data.description;
    this.parent_id = data.parent_id;
    this.display_order = data.display_order || 0;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all categories
  static async getAll(filters = {}) {
    try {
      let sql = 'SELECT * FROM categories';
      const params = [];
      const conditions = [];

      // Apply filters
      if (filters.is_active !== undefined) {
        conditions.push('is_active = ?');
        params.push(filters.is_active);
      }

      if (filters.parent_id !== undefined) {
        if (filters.parent_id === null) {
          conditions.push('parent_id IS NULL');
        } else {
          conditions.push('parent_id = ?');
          params.push(filters.parent_id);
        }
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY display_order ASC, name ASC';

      const result = await query(sql, params);
      return result.map(row => new Category(row));
    } catch (error) {
      console.error('Category.getAll error:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getById(id) {
    try {
      const sql = 'SELECT * FROM categories WHERE id = ?';
      const result = await query(sql, [id]);
      
      if (result.length === 0) {
        return null;
      }

      return new Category(result[0]);
    } catch (error) {
      console.error('Category.getById error:', error);
      throw error;
    }
  }

  // Get category by slug
  static async getBySlug(slug) {
    try {
      const sql = 'SELECT * FROM categories WHERE slug = ?';
      const result = await query(sql, [slug]);
      
      if (result.length === 0) {
        return null;
      }

      return new Category(result[0]);
    } catch (error) {
      console.error('Category.getBySlug error:', error);
      throw error;
    }
  }

  // Create new category
  static async create(categoryData) {
    try {
      // Generate slug if not provided
      if (!categoryData.slug) {
        categoryData.slug = this.generateSlug(categoryData.name);
      }

      const sql = `
        INSERT INTO categories (name, slug, icon, description, parent_id, display_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        categoryData.name,
        categoryData.slug,
        categoryData.icon || null,
        categoryData.description || null,
        categoryData.parent_id || null,
        categoryData.display_order || 0,
        categoryData.is_active !== undefined ? categoryData.is_active : true
      ];

      const result = await query(sql, params);
      
      // Return the created category
      return await this.getById(result.insertId);
    } catch (error) {
      console.error('Category.create error:', error);
      throw error;
    }
  }

  // Update category
  static async update(id, updateData) {
    try {
      const existingCategory = await this.getById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Generate slug if name is being updated and slug is not provided
      if (updateData.name && !updateData.slug) {
        updateData.slug = this.generateSlug(updateData.name);
      }

      const fields = [];
      const params = [];

      // Build dynamic update query
      const allowedFields = ['name', 'slug', 'icon', 'description', 'parent_id', 'display_order', 'is_active'];
      
      allowedFields.forEach(field => {
        if (updateData.hasOwnProperty(field)) {
          fields.push(`${field} = ?`);
          params.push(updateData[field]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at timestamp
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
      
      await query(sql, params);
      
      // Return the updated category
      return await this.getById(id);
    } catch (error) {
      console.error('Category.update error:', error);
      throw error;
    }
  }

  // Soft delete category (set is_active to false)
  static async softDelete(id) {
    try {
      const existingCategory = await this.getById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const sql = 'UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await query(sql, [id]);
      
      return true;
    } catch (error) {
      console.error('Category.softDelete error:', error);
      throw error;
    }
  }

  // Hard delete category (permanent deletion)
  static async delete(id) {
    try {
      const existingCategory = await this.getById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Check if category has subcategories
      const subcategories = await this.getAll({ parent_id: id });
      if (subcategories.length > 0) {
        throw new Error('Cannot delete category with subcategories');
      }

      const sql = 'DELETE FROM categories WHERE id = ?';
      await query(sql, [id]);
      
      return true;
    } catch (error) {
      console.error('Category.delete error:', error);
      throw error;
    }
  }

  // Get subcategories
  async getSubcategories() {
    try {
      return await Category.getAll({ parent_id: this.id, is_active: true });
    } catch (error) {
      console.error('Category.getSubcategories error:', error);
      throw error;
    }
  }

  // Get parent category
  async getParent() {
    try {
      if (!this.parent_id) {
        return null;
      }
      return await Category.getById(this.parent_id);
    } catch (error) {
      console.error('Category.getParent error:', error);
      throw error;
    }
  }

  // Get category with relationships
  static async getWithRelations(id) {
    try {
      const category = await this.getById(id);
      if (!category) {
        return null;
      }

      const subcategories = await category.getSubcategories();
      const parent = await category.getParent();

      return {
        ...category,
        subcategories,
        parent
      };
    } catch (error) {
      console.error('Category.getWithRelations error:', error);
      throw error;
    }
  }

  // Utility method to generate slug from name
  static generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  }

  // Validate category data
  static validateData(data, isUpdate = false) {
    const errors = [];

    // Name validation
    if (!isUpdate && !data.name) {
      errors.push('Name is required');
    } else if (data.name && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      errors.push('Name must be a non-empty string');
    } else if (data.name && data.name.length > 255) {
      errors.push('Name must be less than 255 characters');
    }

    // Slug validation
    if (data.slug) {
      if (typeof data.slug !== 'string' || data.slug.trim().length === 0) {
        errors.push('Slug must be a non-empty string');
      } else if (data.slug.length > 255) {
        errors.push('Slug must be less than 255 characters');
      } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
        errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
      }
    }

    // Icon validation
    if (data.icon && (typeof data.icon !== 'string' || data.icon.length > 50)) {
      errors.push('Icon must be a string with maximum 50 characters');
    }

    // Description validation
    if (data.description && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    }

    // Display order validation
    if (data.display_order !== undefined && (!Number.isInteger(data.display_order) || data.display_order < 0)) {
      errors.push('Display order must be a non-negative integer');
    }

    // Parent ID validation
    if (data.parent_id !== undefined && data.parent_id !== null && (!Number.isInteger(data.parent_id) || data.parent_id <= 0)) {
      errors.push('Parent ID must be a positive integer or null');
    }

    // Active status validation
    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
      errors.push('is_active must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Category;