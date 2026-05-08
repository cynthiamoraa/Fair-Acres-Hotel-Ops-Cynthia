# Monorepo Vercel Deployment (Single Project)

## Setup

This configuration deploys both Frontend and Backend in a single Vercel project.

### 1. Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:

**Production:**
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `CLIENT_ORIGIN`: Will be auto-set to your Vercel domain
- `NODE_ENV`: `production`

### 2. Deploy

1. Push to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Vercel will auto-detect the configuration
4. Deploy

### 3. How It Works

**Root `vercel.json` handles:**
- Frontend: Builds from `Frontend/` folder → serves static files
- Backend: Deploys `Backend/server.js` as serverless function
- Routes:
  - `/api/*` → Backend serverless function
  - `/uploads/*` → Backend serverless function  
  - `/*` → Frontend static files (SPA)

**Build Process:**
1. Vercel builds Frontend using `@vercel/static-build`
2. Vercel builds Backend using `@vercel/node`
3. Routes requests based on path

### 4. Local Development

```bash
# Frontend (port 5173)
cd Frontend
npm install
npm run dev

# Backend (port 8000)
cd Backend
npm install
npm start
```

### 5. Troubleshooting

**404 on root:**
- Check build logs for Frontend build errors
- Verify `Frontend/dist/index.html` exists after build

**API errors:**
- Check Backend function logs in Vercel dashboard
- Verify `DATABASE_URL` is set correctly
- Check CORS `CLIENT_ORIGIN` matches your domain

**Database connection:**
- Ensure Neon database is accessible
- Run `schema.sql` in Neon SQL Editor first
- Verify connection string format

---

# Alternative: Separate Projects

If you prefer separate deployments:

## Frontend Project
1. Create new Vercel project
2. Set **Root Directory**: `Frontend`
3. Framework: Vite (auto-detected)
4. Deploy

## Backend Project  
1. Create new Vercel project
2. Set **Root Directory**: `Backend`
3. Add environment variables:
   - `DATABASE_URL`
   - `CLIENT_ORIGIN` (Frontend URL)
4. Deploy

## Update Frontend API URL
In Frontend code, update API calls to point to Backend Vercel URL.
