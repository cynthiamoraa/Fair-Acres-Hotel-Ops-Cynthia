# Vercel Deployment - Issues Fixed

## Summary

Successfully migrated Fair Acres HMS from Render to Vercel with full functionality.

## Issues Encountered & Fixed

### 1. ❌ 404 Error on Root Path
**Problem:** Frontend wasn't being served  
**Cause:** Incorrect `vercel.json` configuration  
**Fix:** Updated `vercel.json` with proper builds and routes for monorepo structure

### 2. ❌ Login Stuck on "Signing in..."
**Problem:** Login button stuck, no error message  
**Cause:** Missing error handling in login components  
**Fix:** Added try-catch blocks to handle network errors gracefully

### 3. ❌ "Cannot connect to server"
**Problem:** API calls failing to reach backend  
**Cause:** Frontend using `localhost:8000` in production  
**Fix:** Auto-detect production mode and use relative `/api` path

### 4. ❌ ENOENT: mkdir '/var/task/Backend/uploads'
**Problem:** Cannot create uploads directory  
**Cause:** Vercel filesystem is read-only except `/tmp`  
**Fix:** Use `/tmp/uploads` in production, `Backend/uploads` in development

### 5. ❌ PathError: Missing parameter name at index 1: *
**Problem:** Express wildcard route causing crash  
**Cause:** `app.get("*")` incompatible with Express 5 + Vercel  
**Fix:** Removed catch-all route (handled by `vercel.json` instead)

### 6. ❌ Server listening in serverless environment
**Problem:** `app.listen()` called in Vercel serverless  
**Cause:** Server code designed for traditional hosting  
**Fix:** Conditionally start server only when not in Vercel

## Final Working Configuration

### File Structure
```
HMS/
├── api/
│   ├── index.js           # Serverless function wrapper
│   └── package.json       # API dependencies
├── Backend/
│   ├── server.js          # Express app (no listen in Vercel)
│   ├── db.js
│   └── schema.sql
├── Frontend/
│   ├── src/
│   └── dist/              # Built by Vercel
├── vercel.json            # Routing configuration
└── package.json
```

### Key Files

#### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "Frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/uploads/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*\\.(js|css|json|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp))", "dest": "/Frontend/$1" },
    { "src": "/(.*)", "dest": "/Frontend/index.html" }
  ]
}
```

#### `api/index.js`
```javascript
const app = require('../Backend/server');
module.exports = app;
```

#### `Backend/server.js` (Key Changes)
```javascript
// Use /tmp for uploads in production
const uploadsDir = IS_PRODUCTION ? "/tmp/uploads" : path.join(__dirname, "uploads");

// Only listen when not in serverless
if (process.env.VERCEL !== '1' && !module.parent) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel
module.exports = app;
```

#### `Frontend/src/services/api.js`
```javascript
// Auto-detect production and use correct API URL
const IS_PRODUCTION = import.meta.env.PROD;
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (IS_PRODUCTION ? "" : "http://localhost:8000");
export const API_URL = `${API_BASE_URL}/api`;
```

## Environment Variables (Vercel)

Required in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = <your-neon-or-supabase-connection-string>
NODE_ENV = production
```

Optional (auto-detected):
```
VITE_API_URL = (not needed - auto-detected)
```

## Deployment Process

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Vercel Auto-Deploys:**
   - Detects changes
   - Builds frontend
   - Deploys serverless functions
   - Updates routes

3. **Access App:**
   - Frontend: `https://your-project.vercel.app`
   - API: `https://your-project.vercel.app/api`

## Default Login

**Manager:**
- Password: `admin1234`
- ⚠️ Change immediately after first login

**Workers:**
- Created by manager in Settings
- Login with Worker ID + PIN

## Known Limitations

### Temporary File Storage
- Uploads stored in `/tmp` are temporary
- Lost when serverless function restarts
- **Solution:** Implement cloud storage (Vercel Blob, Cloudinary, S3)

### Cold Starts
- First request after inactivity takes ~1-2 seconds
- Subsequent requests are fast
- **Solution:** Upgrade to Vercel Pro for faster cold starts

## Testing Checklist

- [x] Frontend loads correctly
- [x] Manager login works
- [x] Worker login works
- [x] API endpoints respond
- [x] Database connection works
- [x] CORS not an issue (same origin)
- [x] Error handling works
- [x] Console logs show correct API URL

## Performance

- **Frontend:** Served from Vercel Edge Network (fast globally)
- **API:** Serverless functions (scales automatically)
- **Database:** PostgreSQL (Neon/Supabase)

## Monitoring

**Check Logs:**
1. Go to Vercel Dashboard
2. Select project
3. Click "Logs" tab
4. Filter by "Functions" for API logs

**Common Log Messages:**
- ✓ PostgreSQL driver loaded
- ✓ Using PostgreSQL database
- ✓ Serving frontend from /var/task/Frontend/dist

## Next Steps

### Recommended Improvements

1. **Cloud Storage for Uploads**
   - Implement Vercel Blob Storage
   - Or use Cloudinary for images
   - Update `saveBufferToUploads()` function

2. **Environment-Specific Configs**
   - Add staging environment
   - Separate dev/prod databases

3. **Monitoring & Analytics**
   - Add error tracking (Sentry)
   - Add analytics (Vercel Analytics)

4. **Performance Optimization**
   - Enable Vercel Edge Functions
   - Add caching headers
   - Optimize images

## Documentation

- `FIRST_TIME_SETUP.md` - Complete setup guide
- `VERCEL_QUICKSTART.md` - Quick reference
- `VERCEL_DEPLOY.md` - Detailed deployment
- `VERCEL_TROUBLESHOOTING.md` - Common issues
- `LOGIN_DEBUG.md` - Login troubleshooting

## Success! 🎉

The application is now fully deployed on Vercel with:
- ✅ Working manager login
- ✅ Working worker login
- ✅ Database connectivity
- ✅ API functionality
- ✅ File uploads (temporary)
- ✅ Auto-deployment from GitHub
- ✅ Production-ready configuration

**Live URL:** https://fair-acres-hotel-ops.vercel.app
