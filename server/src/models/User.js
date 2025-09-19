const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password_hash = userData.password_hash;
    this.user_type = userData.user_type;
    this.is_verified = userData.is_verified;
    this.phone = userData.phone;
    this.phone_verified = userData.phone_verified;
    this.status = userData.status;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
    this.last_login = userData.last_login;
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Generate JWT token
  generateToken() {
    const payload = {
      id: this.id,
      email: this.email,
      user_type: this.user_type,
      is_verified: this.is_verified
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Create new user
  static async create(userData) {
    const { email, password, user_type, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await User.hashPassword(password);

    // Insert user into database
    const sql = `
      INSERT INTO users (email, password_hash, user_type, phone)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query(sql, [email, password_hash, user_type, phone]);
    
    // Return user without password
    return await User.findById(result.insertId);
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ? AND status = "active"';
    const users = await query(sql, [id]);
    
    if (users.length === 0) {
      return null;
    }

    return new User(users[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND status = "active"';
    const users = await query(sql, [email]);
    
    if (users.length === 0) {
      return null;
    }

    return new User(users[0]);
  }

  // Update user
  async update(updateData) {
    const allowedFields = ['email', 'phone', 'is_verified', 'phone_verified', 'status'];
    const updateFields = [];
    const updateValues = [];

    // Only update allowed fields
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateValues.push(this.id);

    const sql = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await query(sql, updateValues);

    // Refresh user data
    const updatedUser = await User.findById(this.id);
    Object.assign(this, updatedUser);
    return this;
  }

  // Update password
  async updatePassword(newPassword) {
    const password_hash = await User.hashPassword(newPassword);
    const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [password_hash, this.id]);
    this.password_hash = password_hash;
  }

  // Update last login
  async updateLastLogin() {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.last_login = new Date();
  }

  // Verify email
  async verifyEmail() {
    await this.update({ is_verified: true });
  }

  // Verify phone
  async verifyPhone() {
    await this.update({ phone_verified: true });
  }

  // Deactivate user
  async deactivate() {
    await this.update({ status: 'inactive' });
  }

  // Suspend user
  async suspend() {
    await this.update({ status: 'suspended' });
  }

  // Activate user
  async activate() {
    await this.update({ status: 'active' });
  }

  // Get all users (admin only)
  static async getAll(filters = {}) {
    let sql = 'SELECT id, email, user_type, is_verified, phone_verified, status, created_at, last_login FROM users';
    const params = [];
    const conditions = [];

    // Apply filters
    if (filters.user_type) {
      conditions.push('user_type = ?');
      params.push(filters.user_type);
    }

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.is_verified !== undefined) {
      conditions.push('is_verified = ?');
      params.push(filters.is_verified);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    // Add pagination if specified
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    const users = await query(sql, params);
    return users;
  }

  // Login user
  static async login(email, password) {
    const user = await User.findByEmail(email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const isValidPassword = await user.verifyPassword(password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = user.generateToken();

    return {
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        is_verified: user.is_verified,
        phone_verified: user.phone_verified,
        status: user.status
      },
      token
    };
  }

  // Delete user (soft delete by setting status to inactive)
  async delete() {
    await this.update({ status: 'inactive' });
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;