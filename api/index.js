require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { supabase } = require('./config/supabase');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Supabase readiness check for API routes ─────────────
app.use('/api', async (req, res, next) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(503).json({
      success: false,
      message: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env',
    });
  }
  next();
});

// ── Serve static frontend files ─────────────────────────
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// ── API Routes ──────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// ── Route: serve login.html ─────────────────────────────
app.get('/login', (req, res) => {
  res.sendFile(path.join(rootDir, 'login.html'));
});

// ── Route: serve admin.html ─────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'admin.html'));
});

// ── Route: serve main index.html (catch-all) ────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// ── Global error handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
});

// ── Start server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏎️  PORSCHE — Driven by Dreams`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Using Supabase — no MongoDB required`);
});

module.exports = app;
