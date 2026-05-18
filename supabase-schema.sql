-- ═══════════════════════════════════════════════════════
-- PORSCHE WEBSITE — Supabase Database Schema
-- Run this in your Supabase project → SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── Users table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (char_length(name) <= 60),
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bookings table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model           TEXT NOT NULL CHECK (model IN ('911 Carrera', 'Taycan', '718 Cayman', 'Macan', 'Panamera', 'Cayenne')),
  preferred_date  DATE NOT NULL,
  phone           TEXT NOT NULL,
  message         TEXT DEFAULT '',
  dealer_location TEXT DEFAULT 'Your Nearest Porsche Centre',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Wishlists table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, model)
);

-- ── Orders table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model           TEXT NOT NULL,
  exterior_color  TEXT NOT NULL,
  interior_color  TEXT NOT NULL,
  wheels          TEXT NOT NULL,
  total_price     NUMERIC NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- Row Level Security (RLS) — keep data safe
-- ═══════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;

-- NOTE: Our backend uses the service role key for admin routes
-- and the anon key + JWT for user routes, so we allow all
-- operations from the service role (bypasses RLS by default).
-- The policies below allow the anon key to do nothing by default,
-- which keeps data safe if the anon key is ever exposed.

-- Users: no direct access via anon key (backend handles auth)
CREATE POLICY "No anon access to users" ON users
  FOR ALL USING (false);

-- Bookings: no direct access via anon key
CREATE POLICY "No anon access to bookings" ON bookings
  FOR ALL USING (false);

-- Wishlists: no direct access via anon key
CREATE POLICY "No anon access to wishlists" ON wishlists
  FOR ALL USING (false);

-- Orders: no direct access via anon key
CREATE POLICY "No anon access to orders" ON orders
  FOR ALL USING (false);

-- ═══════════════════════════════════════════════════════
-- Indexes for performance
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_bookings_user_id  ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
