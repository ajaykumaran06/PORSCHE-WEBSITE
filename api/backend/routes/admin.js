const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { protect, requireAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// ─── GET /api/admin/stats ──────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalBookings },
      { count: totalOrders },
      { count: pendingBookings },
      { count: confirmedBookings },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalBookings, totalOrders, pendingBookings, confirmedBookings },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/admin/bookings ───────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        users ( name, email )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /api/admin/bookings/:id ──────────────────────
router.put('/bookings/:id', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', req.params.id)
      .select(`*, users ( name, email )`)
      .single();

    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/admin/bookings/:id ───────────────────
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/admin/orders ────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users ( name, email )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /api/admin/orders/:id ───────────────────────
router.put('/orders/:id', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select(`*, users ( name, email )`)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/admin/orders/:id ────────────────────
router.delete('/orders/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/admin/users ─────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DELETE /api/admin/users/:id ──────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Delete their bookings first (foreign key safety)
    await supabaseAdmin.from('bookings').delete().eq('user_id', req.params.id);

    // Delete their orders
    await supabaseAdmin.from('orders').delete().eq('user_id', req.params.id);

    // Delete wishlists too
    await supabaseAdmin.from('wishlists').delete().eq('user_id', req.params.id);

    // Delete user
    const { error } = await supabaseAdmin.from('users').delete().eq('id', req.params.id);

    if (error) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User and their bookings deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
