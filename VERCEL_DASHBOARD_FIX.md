# Fix Vercel 404 - Dashboard Configuration

## Go to Vercel Dashboard

1. Open your project: https://vercel.com/korir-dev/fair-acres-hotel-ops
2. Go to **Settings** → **General**

## Configure Build & Development Settings

Set these values:

**Framework Preset:** Other

**Root Directory:** `Frontend`

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Install Command:** `npm install`

## Environment Variables

Go to **Settings** → **Environment Variables**

Add:
- `DATABASE_URL` = Your Neon connection string
- `NODE_ENV` = `production`

## Redeploy

1. Go to **Deployments**
2. Click the three dots on latest deployment
3. Click **Redeploy**

## This Will Fix

- The 404 errors (Vercel will now find Frontend files)
- The npm workspace warnings (no root install)
- The builds configuration warning (using Dashboard settings instead)

## Backend Deployment

Deploy Backend separately:
1. Create new Vercel project
2. Set **Root Directory:** `Backend`
3. Add env vars: `DATABASE_URL`, `CLIENT_ORIGIN`
4. Deploy

Then update Frontend API calls to point to Backend URL.
