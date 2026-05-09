# Vercel Deployment - Quick Start

## 1. Setup Database (Choose One)

### Neon (Recommended)
```bash
# 1. Go to https://neon.tech
# 2. Create project
# 3. Copy connection string
# 4. Run schema from Backend/schema.sql
```

### Supabase
```bash
# 1. Go to https://supabase.com
# 2. Create project
# 3. Copy connection string
# 4. Run schema from Backend/schema.sql
```

## 2. Deploy to Vercel

### Option A: Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Set environment variables:
   - `DATABASE_URL` = your database connection string
   - `NODE_ENV` = production
5. Click "Deploy"

### Option B: CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 3. Done!
Your app is live at: `https://your-project.vercel.app`

## Environment Variables

Set in Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host/db
NODE_ENV=production
VITE_API_URL=
```

**Important:** Leave `VITE_API_URL` empty (blank value) so the frontend uses same-origin API calls.

## Project Structure

```
HMS/
├── vercel.json          # Routes /api to backend, rest to frontend
├── Backend/
│   ├── vercel.json      # Backend serverless config
│   └── server.js        # Express API
└── Frontend/
    ├── vercel.json      # Frontend SPA routing
    └── dist/            # Built React app
```

## How It Works

1. Vercel builds Frontend to `Frontend/dist/`
2. Backend runs as serverless function
3. Routes:
   - `/api/*` → Backend API
   - `/uploads/*` → Backend uploads
   - `/*` → Frontend SPA

## Troubleshooting

### Build fails
- Check build logs in Vercel dashboard
- Ensure `DATABASE_URL` is set
- Verify both Backend and Frontend dependencies install

### API not working
- Check Function Logs in Vercel
- Verify database connection
- Ensure schema is created

### Frontend blank
- Check browser console
- Verify build completed successfully
- Check `Frontend/dist/` was created

## Full Documentation

See `VERCEL_DEPLOY.md` for complete guide.
