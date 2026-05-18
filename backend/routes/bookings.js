const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/auth');

const VALID_MODELS = ['911 Carrera', 'Taycan', '718 Cayman', 'Macan', 'Panamera', 'Cayenne'];

// ─── POST /api/bookings ── book a test drive ───────────
router.post(
  '/',
  protect,
  [
    body('model').notEmpty().withMessage('Please select a car model'),
    body('preferredDate').isISO8601().withMessage('Valid date required'),
    body('phone').notEmpty().withMessage('Phone number required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { model, preferredDate, phone, message, dealerLocation } = req.body;

    if (!VALID_MODELS.includes(model)) {
      return res.status(400).json({ success: false, message: 'Invalid car model selected' });
    }

    try {
      const { data: booking, error } = await supabaseAdmin
        .from('bookings')
        .insert([{
          user_id: req.user.id,
          model,
          preferred_date: preferredDate,
          phone,
          message: message || '',
          dealer_location: dealerLocation || 'Your Nearest Porsche Centre',
          status: 'pending',
        }])
        .select()
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to create booking' });
      }

      res.status(201).json({ success: true, booking });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ─── GET /api/bookings/mine ── current user's bookings ─
router.get('/mine', protect, async (req, res) => {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
