# DispaLoadIQ — Production Setup Guide

This guide turns the app into a fully working product with a real database, authentication, and AI.

---

## Step 1 — Create a Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `dispaloadiq`) and a strong database password
3. Select the region closest to your users (US East recommended for trucking)
4. Wait ~2 minutes for the project to spin up

---

## Step 2 — Run the Database Schema (2 min)

1. In your Supabase project → **SQL Editor** → **New Query**
2. Open the file `supabase/migrations/001_initial_schema.sql`
3. Paste the entire contents into the editor
4. Click **Run** (green button)

You should see "Success. No rows returned."

> **What this creates:** 15 tables (users, loads, trips, fleet, claims, invoices, contracts, fuel_logs, maintenance, etc.), Row Level Security policies, triggers, views, and functions.

---

## Step 3 — Enable Realtime (1 min)

In Supabase → **Database** → **Replication** → enable for these tables:
- `loads`
- `notifications`
- `trips`
- `load_bids`

This powers live load board updates — new loads appear instantly without refresh.

---

## Step 4 — Set Up Storage Buckets (2 min)

In Supabase → **Storage** → **New Bucket**, create:

| Bucket name    | Public | Allowed MIME types              |
|---------------|--------|---------------------------------|
| `claim-photos` | No     | `image/*`                       |
| `epod-photos`  | No     | `image/*`                       |
| `documents`    | No     | `application/pdf, image/*`      |
| `avatars`      | Yes    | `image/*`                       |

---

## Step 5 — Configure Environment Variables (2 min)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. In Supabase → **Project Settings** → **API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

3. Your `.env` should look like:
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

> **Note:** The `.env` file is in `.gitignore` — never commit it.

---

## Step 6 — Install & Run (1 min)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo mode (no Supabase needed):** Click any demo account card on the login page. All features work with mock data.

**Real auth mode:** Use the Register tab to create an account, or sign in with a real email/password.

---

## Step 7 — Deploy Claude AI Assistant (optional, 5 min)

The AI Assistant uses Claude via a Supabase Edge Function so your API key is never exposed to the client.

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login and link your project:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_ID
   ```

3. Set the Claude API key as a secret:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy ai-chat
   ```

Get your Claude API key at [console.anthropic.com](https://console.anthropic.com).

---

## Step 8 — Deploy to Production (optional, 10 min)

**Option A: Vercel (recommended)**
```bash
npm install -g vercel
vercel
```
Then add your env vars in Vercel Dashboard → Project → Settings → Environment Variables.

**Option B: Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Architecture Summary

```
Browser (React + Vite)
    ↕ Supabase Client (real-time, RLS-protected)
Supabase
    ├── PostgreSQL  — all data (loads, trips, users, claims...)
    ├── Auth        — JWT sessions, role stored in user_profiles
    ├── Realtime    — load board live updates via WebSocket
    ├── Storage     — POD photos, documents, avatars
    └── Edge Func   — ai-chat (Claude API, keeps key server-side)
```

---

## Demo Accounts

These work without any Supabase setup — perfect for demos:

| Email                | Role               | Description                        |
|---------------------|--------------------|------------------------------------|
| mike@demo.com        | Owner-Operator     | Solo trucker, 1 truck              |
| alex@demo.com        | Dispatcher         | Remote dispatcher, 4 clients       |
| irina@demo.com       | Transport Company  | 5-truck fleet with full ops        |
| sarah@demo.com       | Shipper            | Freight shipper with 3+ routes     |

Password: anything (demo mode skips auth)

---

## FAQ

**Q: Does the app work without Supabase?**
Yes — demo mode uses mock data for all pages. Perfect for demos and development.

**Q: How do I seed test data?**
Log in as `irina@demo.com` (company role) and use the UI to add fleet, trips, loads. Or use the Supabase Table Editor to insert rows directly.

**Q: How do I add a second user (e.g. shipper posting a load)?**
Register a second account with role "Shipper". They can post loads that appear on the Owner-Op load board in real time.

**Q: How do I customize the AI assistant's behavior?**
Edit `supabase/functions/ai-chat/index.ts` → `SYSTEM_PROMPT`. Redeploy with `supabase functions deploy ai-chat`.

**Q: Where are the Stripe keys used?**
Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env` and wire it to the FactoringPage / subscription flow. The secret key (`sk_...`) must only be used in Edge Functions, never in client code.
