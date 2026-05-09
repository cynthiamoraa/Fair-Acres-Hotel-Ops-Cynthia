# Vercel Deployment - Troubleshooting

## Issue: 404 Error on Root Path

**Symptoms:** Visiting your Vercel URL shows 404 error

**Solution:**

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check if build succeeded
   - Verify `Frontend/dist` folder was created

2. **Verify Environment Variables**
   - Go to Project Settings → Environment Variables
   - Ensure these are set:
     ```
     DATABASE_URL=<your-database-url>
     NODE_ENV=production
     VITE_API_URL=
     ```
   - **Important:** `VITE_API_URL` should be empty (blank value)

3. **Redeploy**
   - After adding environment variables
   - Go to Deployments → Click "..." → Redeploy

## Issue: API Calls Failing

**Symptoms:** Frontend loads but API calls return errors

**Causes & Solutions:**

### 1. Missing VITE_API_URL
- Set `VITE_API_URL=` (empty/blank) in Vercel environment variables
- Redeploy

### 2. Database Not Connected
- Verify `DATABASE_URL` is set correctly
- Check Function Logs for database errors
- Ensure database schema is created

### 3. CORS Errors (shouldn't happen with monorepo)
- Verify frontend and backend are on same domain
- Check browser console for specific error

## Issue: Build Fails

**Symptoms:** Deployment fails during build

**Solutions:**

### 1. Check Build Command
Verify in `vercel.json`:
```json
{
  "buildCommand": "cd Frontend && npm run build"
}
```

### 2. Check Install Command
Verify in `vercel.json`:
```json
{
  "installCommand": "npm install --prefix Backend && npm install --prefix Frontend"
}
```

### 3. Check Dependencies
- Ensure `Frontend/package.json` has all dependencies
- Ensure `Backend/package.json` has all dependencies

## Issue: Images/Uploads Not Working

**Symptoms:** Image uploads fail or don't display

**Cause:** Vercel serverless functions are stateless

**Solutions:**

### Option 1: Vercel Blob Storage (Recommended)
```bash
npm install @vercel/blob
```

### Option 2: Cloudinary
```bash
npm install cloudinary
```

### Option 3: AWS S3
```bash
npm install @aws-sdk/client-s3
```

## Issue: Database Connection Fails

**Symptoms:** API returns 500 errors, logs show database errors

**Solutions:**

1. **Verify Connection String**
   - Check `DATABASE_URL` format
   - Neon: `postgresql://user:pass@host/db?sslmode=require`
   - Supabase: `postgresql://postgres:pass@host:5432/postgres`

2. **Check Database Status**
   - Ensure database is running
   - Verify schema is created
   - Test connection locally first

3. **Check SSL Mode**
   - Most cloud databases require SSL
   - Add `?sslmode=require` to connection string

## Checking Logs

### Function Logs (Backend)
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Logs" tab
4. Filter by "Functions"
5. Look for errors

### Build Logs
1. Go to Deployments
2. Click on deployment
3. View build output
4. Check for errors

## Common Environment Variable Issues

### Wrong Format
❌ `VITE_API_URL=http://localhost:8000`  
✅ `VITE_API_URL=` (empty)

### Missing Variables
Required:
- `DATABASE_URL`
- `NODE_ENV=production`
- `VITE_API_URL=` (empty)

### Not Redeploying After Changes
- Environment variable changes require redeploy
- Go to Deployments → Redeploy

## Testing Locally Before Deploy

```bash
# Test backend
cd Backend
npm install
npm start

# Test frontend (in new terminal)
cd Frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## Vercel CLI Debugging

```bash
# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Inspect deployment
vercel inspect <deployment-url>
```

## Still Having Issues?

1. Check Vercel Status: https://www.vercel-status.com
2. Review Vercel Docs: https://vercel.com/docs
3. Check project logs in Vercel Dashboard
4. Verify all files committed to Git
5. Try deploying from CLI: `vercel --prod`

## Quick Fix Checklist

- [ ] `DATABASE_URL` environment variable set
- [ ] `NODE_ENV=production` set
- [ ] `VITE_API_URL=` set (empty value)
- [ ] Database schema created
- [ ] Build succeeds in Vercel Dashboard
- [ ] `Frontend/dist` folder created during build
- [ ] Redeployed after environment variable changes
- [ ] No errors in Function Logs
- [ ] No errors in Build Logs
