# 🏎️ Porsche Website — Supabase Backend Setup

## What changed
MongoDB + Mongoose has been completely removed and replaced with **Supabase (PostgreSQL)**. No more connection errors.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Give it a name (e.g. `porsche-website`) and set a database password
4. Wait ~2 minutes for it to provision

---

## Step 2 — Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase-schema.sql` from this project
3. Paste the entire contents and click **Run**

This creates 3 tables: `users`, `bookings`, `wishlists`

---

## Step 3 — Get your API keys

In Supabase dashboard → **Settings → API**:

| Key | Where to find it |
|---|---|
| `SUPABASE_URL` | "Project URL" |
| `SUPABASE_ANON_KEY` | "Project API keys → anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | "Project API keys → service_role secret" |

⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` secret — never expose it in frontend code.

---

## Step 4 — Set up your .env

Copy `.env.example` to `.env` and fill in:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=any-long-random-string
JWT_EXPIRE=7d
ADMIN_SECRET_CODE=your-admin-code
PORT=5000
NODE_ENV=development
```

Generate a JWT secret quickly:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 5 — Install dependencies & run

```bash
# Remove old node_modules (mongoose is gone)
rm -rf node_modules package-lock.json

# Install clean dependencies
npm install

# Start in dev mode
npm run dev

# Or production
npm start
```

---

## File structure (backend only)

```
backend/
├── server.js              ✅ Updated — no MongoDB
├── config/
│   └── supabase.js        ✅ Supabase client config
├── middleware/
│   └── auth.js            ✅ Updated — queries Supabase users table
└── routes/
    ├── auth.js            ✅ Updated — register/login/wishlist via Supabase
    ├── bookings.js        ✅ Updated — bookings via Supabase
    └── admin.js           ✅ Updated — admin stats/CRUD via Supabase
auth-api.js                ✅ Updated — handles snake_case field names
package.json               ✅ mongoose removed
supabase-schema.sql        🆕 Run this in Supabase SQL Editor
.env.example               🆕 Template for your .env
```

---

## API endpoints (unchanged)

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | User |
| POST | `/api/auth/wishlist` | User |
| POST | `/api/bookings` | User |
| GET | `/api/bookings/mine` | User |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/bookings` | Admin |
| PUT | `/api/admin/bookings/:id` | Admin |
| DELETE | `/api/admin/bookings/:id` | Admin |
| GET | `/api/admin/users` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |

---

## Troubleshooting

**"relation users does not exist"** → You haven't run `supabase-schema.sql` yet. Do Step 2.

**"Invalid API key"** → Check your `.env` — make sure there are no extra spaces around the keys.

**Admin routes returning 403** → Register with the `ADMIN_SECRET_CODE` to get admin role.

**Bookings not showing dates correctly** → Supabase returns `preferred_date` (snake_case). The `auth-api.js` handles both formats automatically.
