# Debug Vercel 404 Issue

## Check Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check the "Building" tab for errors
4. Look for Frontend build output

## Common Issues

### Issue 1: Frontend not building
**Symptoms:** 404 on all routes, source: "static"

**Check:**
- Does `Frontend/dist/index.html` get created during build?
- Are there any build errors in the logs?

**Fix:**
```bash
# Test locally
cd Frontend
npm install
npm run build
# Check if dist/index.html exists
ls dist/
```

### Issue 2: Wrong distDir path
**Symptoms:** Build succeeds but files not found

**Fix:** The `vercel.json` should have:
```json
{
  "src": "Frontend/package.json",
  "use": "@vercel/static-build",
  "config": {
    "distDir": "dist"  // Relative to Frontend folder
  }
}
```

### Issue 3: Missing vercel-build script
**Check:** `Frontend/package.json` should have:
```json
{
  "scripts": {
    "vercel-build": "vite build"
  }
}
```

## Quick Fix: Deploy Frontend Separately

If monorepo continues to fail:

1. Create new Vercel project
2. Set **Root Directory** to `Frontend`
3. Let Vercel auto-detect Vite
4. Deploy

Then update Backend `CLIENT_ORIGIN` to the new Frontend URL.

## Verify Current Setup

Run these commands locally:

```bash
# From HMS root
cd Frontend
npm install
npm run vercel-build

# Check output
ls -la dist/
# Should see: index.html, assets/, etc.
```

If local build works but Vercel fails, check:
- Node version (Vercel uses Node 18 by default)
- Environment variables
- Build command in Vercel settings
