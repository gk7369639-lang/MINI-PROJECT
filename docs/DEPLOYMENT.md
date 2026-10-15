# Production Deployment Guide
## Student Query Resolution Platform (SQRP)

---

## 1. Supabase Database Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Execute the schema migration script:
   - Copy contents of `supabase/migrations/20261015000001_initial_schema.sql` and run it.
4. Execute the initial seed data:
   - Copy contents of `supabase/seed.sql` and run it.
5. In your Supabase Project Settings, retrieve:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

## 2. Vercel Deployment

1. Push this repository to your GitHub account (with user approval).
2. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
3. Import the `MINI PROJECT` repository.
4. In the **Environment Variables** panel, add:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   AI_PROVIDER=gemini
   AI_API_KEY=AIzaSy...
   AI_MODEL_NAME=gemini-1.5-flash
   ```
5. Click **Deploy**. Vercel will execute `npm run build` and launch the optimized production platform.

---

## 3. Local Production Run
```bash
npm run build
npm start
```
The server will bind to `http://localhost:3000`.
