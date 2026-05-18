const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  SUPABASE_URL and SUPABASE_ANON_KEY are required in .env');
}

// Anon client — used for auth and user-scoped queries
const supabase = createClient(supabaseUrl, supabaseKey);

// Service role client — bypasses RLS, used for admin routes only
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

// Helper to create a client scoped to a specific user's JWT
const getSupabaseClient = (token) =>
  createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

module.exports = { supabase, supabaseAdmin, getSupabaseClient };
