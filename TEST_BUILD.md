# Test Build Locally

Run this to verify the build works:

```bash
cd Frontend
npm install
npm run build
```

Check the output:
```bash
ls Frontend/dist/
```

You should see:
- index.html
- assets/ (folder with JS and CSS files)

If you see these files, the build is working. The issue is with Vercel routing.

# Current Setup

The new configuration:
- `api/index.js` - Wraps Backend as serverless function
- Routes `/api/*` and `/uploads/*` to backend
- Routes everything else to Frontend static files

# Deploy

1. Commit and push all changes
2. Vercel will auto-deploy
3. Check if root path now works

If still 404, go to Vercel Dashboard → Settings → General and verify:
- Framework Preset: Other
- Root Directory: (leave empty)
- Build Command: (auto-detected)
- Output Directory: Frontend/dist
