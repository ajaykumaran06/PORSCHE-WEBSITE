const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');

// Helper: sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Helper: send token response
const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ─── POST /api/auth/register ───────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, adminCode } = req.body;

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const role = adminCode && adminCode === process.env.ADMIN_SECRET_CODE ? 'admin' : 'user';

      // Insert new user
      const { data: user, error } = await supabase
        .from('users')
        .insert([{ name: name.trim(), email: email.toLowerCase(), password: hashedPassword, role }])
        .select('id, name, email, role')
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to create user' });
      }

      sendToken(user, 201, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ─── POST /api/auth/login ──────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Fetch user including hashed password
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, password')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      sendToken(user, 200, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ─── GET /api/auth/me ──────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── POST /api/auth/wishlist ───────────────────────────
router.post('/wishlist', protect, async (req, res) => {
  const { model } = req.body;
  if (!model) return res.status(400).json({ success: false, message: 'Model name required' });

  try {
    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('model', model)
      .single();

    if (existing) {
      return res.status(409).json({ success: false, message: 'Already in wishlist' });
    }

    // Insert wishlist item
    const { error } = await supabase
      .from('wishlists')
      .insert([{ user_id: req.user.id, model }]);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
    }

    // Return updated wishlist
    const { data: wishlist } = await supabase
      .from('wishlists')
      .select('id, model, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
