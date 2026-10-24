# Complete Supabase, Vercel & Inactivity Prevention Guide

This guide walks you through setting up **Supabase** (Database + Auth), deploying to **Vercel**, configuring the **Supabase MCP Server**, and setting up the automated **Keep-Alive mechanism** so your free-tier Supabase project never gets paused or deleted.

---

## 1. Supabase Project & Database Setup

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose a Name (e.g. `worktrack-attendance`), set a secure Database Password, and select your nearest region.
4. Keep the **Free Tier** selected.

### Step 2: Run Database Schema with Row Level Security (RLS)
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Copy and paste the entire contents of [`supabase_schema.sql`](./supabase_schema.sql).
4. Click **Run**.
5. This creates:
   - `public.attendance_records` table (indexed by `user_id` and `date`)
   - `public.user_settings` table (custom rates, theme, goal per user)
   - Strict **Row Level Security (RLS)** policies ensuring users can only read, write, and delete their own data.
   - Auto-updating `updated_at` triggers.

---

## 2. Authentication Setup (Email/Password & Google)

### Enable Email & Password:
1. In Supabase Dashboard, go to **Authentication → Providers → Email**.
2. Make sure **Enable Email provider** is turned **ON**.
3. *(Optional for testing)*: Under **Email Auth**, you can toggle OFF "Confirm email" if you want users to log in immediately without verifying email.

### Enable Google Login:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create an **OAuth 2.0 Client ID** (Web Application).
3. In Supabase Dashboard, go to **Authentication → Providers → Google**.
4. Copy the **Callback URL** provided by Supabase (looks like `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`).
5. Paste this Callback URL into Google Cloud Console under **Authorized redirect URIs**.
6. Copy the **Client ID** and **Client Secret** from Google Cloud Console into Supabase and click **Save**.

### Configure Redirect URLs in Supabase:
1. In Supabase Dashboard, go to **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL (or `http://localhost:5173` for local dev).
3. Under **Redirect URLs**, add:
   - `http://localhost:5173`
   - `http://localhost:5173/**`
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/**`

---

## 3. How to Prevent Supabase Free Tier from Inactivity Pausing

### Why does Supabase Free Tier pause?
* Supabase free-tier compute instances **automatically pause after 7 days of inactivity** (meaning 7 consecutive days without any REST API requests, Auth events, or database queries).
* Paused projects are not immediately deleted, but they take the database offline. Restoring them requires logging in to the dashboard and waiting 1-3 minutes. If left inactive for several months, paused projects can be scheduled for deletion.

### The Solution: Automated Keep-Alive
We have pre-configured **two redundant, 100% free keep-alive automations** in this repository that ping your database every 3 days so it **never pauses**:

#### Method 1: GitHub Actions Cron (Recommended & 100% Free)
* File: [`.github/workflows/keep-supabase-alive.yml`](./.github/workflows/keep-supabase-alive.yml)
* Runs every 3 days (`cron: '0 4 */3 * *'`) using GitHub's free runners.
* **To activate it**:
  1. Push this repository to GitHub.
  2. On GitHub, go to your repository **Settings → Secrets and variables → Actions**.
  3. Click **New repository secret** and add:
     - `VITE_SUPABASE_URL`: Your Supabase URL (`https://your-ref.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
  4. That's it! GitHub will now ping your Supabase database every 3 days forever.

#### Method 2: Vercel Cron Job
* File: [`vercel.json`](./vercel.json) and [`api/keep-alive.js`](./api/keep-alive.js)
* When deployed to Vercel, Vercel automatically runs the cron job specified in `vercel.json` (`schedule: '0 0 */3 * *'`), which calls `/api/keep-alive`.
* The serverless function queries `attendance_records` once, resetting the 7-day inactivity timer.

#### Method 3 (Optional): Free Uptime Monitor
* You can also set up a free monitor on [Cron-Job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com):
  - URL to ping: `https://<YOUR-PROJECT-REF>.supabase.co/rest/v1/attendance_records?select=id&limit=1`
  - Header: `apikey: <YOUR_SUPABASE_ANON_KEY>`
  - Header: `Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>`
  - Schedule: Every 3 days.

---

## 4. Setting Up the Supabase MCP Server in Antigravity

The user requested: *"also for setting up the supabase use the mcp server"*

In your global MCP config (`C:\Users\USER\.gemini\config\mcp_config.json`), the remote Supabase MCP server requires a **Supabase Personal Access Token** to authenticate.

### How to get your Personal Access Token:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens).
2. Go to **Account → Access Tokens**.
3. Click **Generate new token**, give it a name (e.g. `Antigravity IDE`), and copy the generated token (`sbp_...`).

### How to configure `mcp_config.json`:
Open `C:\Users\USER\.gemini\config\mcp_config.json` and update the `supabase` entry:

```json
{
  "mcpServers": {
    "supabase": {
      "$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate",
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.supabase.com/mcp",
        "--header",
        "Authorization: Bearer sbp_your_personal_access_token_here"
      ]
    }
  }
}
```

Once configured with your token, the MCP server can execute SQL queries, list tables, manage branches, and inspect logs directly through your AI assistant!

---

## 5. Deploying to Vercel

1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of WorkTrack with Supabase"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://ponjvgqnidaoiyovtkyy.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbmp2Z3FuaWRhb2l5b3Z0a3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4Mjc2NjAsImV4cCI6MjEwODQwMzY2MH0.WqN260P5wewht-c4yn-e-Pb6sNXTiHabA9T3JdNkqbk`
5. Click **Deploy**.
6. Once deployed, copy your production Vercel domain (e.g. `https://worktrack-xyz.vercel.app`) and add it to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**.

---

## 6. How the App Works (Per-Account Sync & Offline Fallback)

1. **Signed In**:
   - When a user logs in via Email or Google, attendance records and user wage settings are fetched from Supabase.
   - Any updates (marking Full Day, Half Day, Absent, changing wage rates) are automatically upserted to the user's private rows in Supabase.
2. **Offline / Guest Mode**:
   - If a user is not signed in or offline, the app stores data in `localStorage`.
   - When the user signs in later, they can click **"Upload Local Records to Cloud"** in Settings to instantly sync all their offline shifts to their Supabase account!
