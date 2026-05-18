const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/auth');

// ─── POST /api/orders ── place a car order ───────────
router.post(
  '/',
  protect,
  [
    body('model').notEmpty().withMessage('Model is required'),
    body('exteriorColor').notEmpty().withMessage('Exterior color is required'),
    body('interiorColor').notEmpty().withMessage('Interior color is required'),
    body('wheels').notEmpty().withMessage('Wheels selection is required'),
    body('totalPrice').isNumeric().withMessage('Valid price is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { model, exteriorColor, interiorColor, wheels, totalPrice } = req.body;

    try {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .insert([{
          user_id: req.user.id,
          model,
          exterior_color: exteriorColor,
          interior_color: interiorColor,
          wheels,
          total_price: totalPrice,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to place order' });
      }

      res.status(201).json({ success: true, order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ─── GET /api/orders/mine ── current user's orders ─
router.get('/mine', protect, async (req, res) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
