# Migration: Render → Vercel

## What Changed

### Deployment Platform
- **Before:** Render (separate backend + frontend deployments)
- **After:** Vercel (monorepo deployment from root)

### Key Differences

| Aspect | Render | Vercel |
|--------|--------|--------|
| **Deployment** | 2 separate services | 1 unified deployment |
| **URLs** | 2 different URLs | 1 URL for everything |
| **CORS** | Required configuration | Not needed (same origin) |
| **Database** | Render PostgreSQL | Neon/Supabase |
| **Cost** | Free tier (limited) | Free tier (generous) |

## New Files Created

1. **`vercel.json`** (root) - Routes configuration
2. **`Backend/vercel.json`** - Backend serverless config
3. **`Frontend/vercel.json`** - Frontend SPA routing
4. **`VERCEL_DEPLOY.md`** - Full deployment guide
5. **`VERCEL_QUICKSTART.md`** - Quick reference

## Updated Files

1. **`README.md`** - Changed deployment reference
2. **`Backend/DEPLOY.md`** - Updated for Vercel
3. **`Frontend/.env.example`** - Added monorepo option
4. **`package.json`** - Added `vercel-build` script

## How to Deploy

### Quick Method
```bash
npm install -g vercel
vercel --prod
```

### Dashboard Method
1. Go to https://vercel.com/dashboard
2. Import GitHub repo
3. Add `DATABASE_URL` environment variable
4. Deploy

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "production"

### Not Needed Anymore
- ~~`CLIENT_ORIGIN`~~ - No longer needed (same origin)
- ~~`VITE_API_URL`~~ - Uses `/api` automatically

## URL Structure

### Before (Render)
- Frontend: `https://hms-frontend.onrender.com`
- Backend: `https://hms-backend.onrender.com/api`

### After (Vercel)
- Everything: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api`

## Benefits

✅ **Simpler deployment** - One command instead of two services  
✅ **No CORS issues** - Frontend and backend on same domain  
✅ **Faster** - Vercel's edge network  
✅ **Better free tier** - More generous limits  
✅ **Auto-deploy** - Push to GitHub = automatic deployment  
✅ **Better DX** - Easier to manage and debug  

## Migration Steps

If you have an existing Render deployment:

1. **Setup database** (Neon or Supabase)
2. **Export data** from Render PostgreSQL
3. **Import data** to new database
4. **Deploy to Vercel** using guide
5. **Update DNS** (if using custom domain)
6. **Delete Render services** (optional)

## Documentation

- **Quick Start:** `VERCEL_QUICKSTART.md`
- **Full Guide:** `VERCEL_DEPLOY.md`
- **Database Setup:** `Backend/NEON_SETUP.md` or `Backend/SUPABASE_SETUP.md`

## Support

For issues:
1. Check Vercel Function Logs
2. Review `VERCEL_DEPLOY.md` troubleshooting section
3. Verify environment variables are set
