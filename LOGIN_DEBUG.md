# Login Issue - Diagnostic Guide

## Issue: Login gets stuck on "Signing in..."

### Quick Checks:

1. **Open Browser Console** (F12 → Console tab)
   - Look for errors (red text)
   - Check for failed network requests

2. **Check Network Tab** (F12 → Network tab)
   - Try logging in again
   - Look for `/api/auth/manager/login` request
   - Check the status code and response

### Common Causes:

#### 1. Missing Environment Variable

**Problem:** `VITE_API_URL` not set in Vercel

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_API_URL` with **empty/blank value** (just the key, no value)
3. Redeploy

#### 2. API Not Responding

**Problem:** Backend serverless function not working

**Check:**
- Visit: `https://your-project.vercel.app/api/health`
- Should return: `{"ok":true}`
- If 404 or error, backend isn't working

**Solution:**
1. Check Vercel Function Logs
2. Verify `DATABASE_URL` is set
3. Check build logs for errors

#### 3. Database Not Connected

**Problem:** Database connection failing

**Check Function Logs:**
1. Go to Vercel Dashboard → Logs
2. Filter by "Functions"
3. Look for database connection errors

**Solution:**
1. Verify `DATABASE_URL` format is correct
2. Ensure database is running
3. Check schema was executed

#### 4. CORS Issues

**Problem:** Cross-origin request blocked

**Check Console:**
- Look for CORS error messages

**Solution:**
- Frontend and backend should be on same domain (Vercel handles this)
- If using custom domain, ensure both use same domain

### Step-by-Step Debug:

#### Step 1: Test API Health
```bash
curl https://your-project.vercel.app/api/health
```

Expected: `{"ok":true}`

If 404: API routing is broken
If 500: Backend error (check logs)

#### Step 2: Test Login Endpoint
```bash
curl -X POST https://your-project.vercel.app/api/auth/manager/login \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -d '{"password":"admin1234"}'
```

Expected: `{"ok":true}`

If error: Check the error message

#### Step 3: Check Environment Variables

In Vercel Dashboard, verify these are set:
- `DATABASE_URL` = your database connection string
- `NODE_ENV` = production
- `VITE_API_URL` = (empty/blank)

#### Step 4: Check Browser Console

1. Open your site
2. Press F12
3. Go to Console tab
4. Try logging in
5. Look for errors

Common errors:
- `Failed to fetch` = API not responding
- `CORS error` = Cross-origin issue
- `404` = API route not found
- `500` = Backend error

#### Step 5: Check Network Requests

1. F12 → Network tab
2. Try logging in
3. Find `/api/auth/manager/login` request
4. Click on it
5. Check:
   - Status code (should be 200)
   - Response (should be `{"ok":true}`)
   - Headers (check if request was sent)

### Solutions by Error:

#### "Failed to fetch"
- API not responding
- Check Vercel Function Logs
- Verify backend deployed correctly

#### "404 Not Found"
- API routing broken
- Check `vercel.json` configuration
- Ensure `api/index.js` exists

#### "500 Internal Server Error"
- Backend error
- Check Function Logs in Vercel
- Usually database connection issue

#### "Incorrect password"
- Database not initialized
- Run `Backend/schema.sql` in your database
- Verify manager record exists

#### Network request never completes
- Timeout issue
- Check Vercel Function Logs
- May need to increase timeout

### Manual Test:

1. **Test locally first:**
```bash
# Terminal 1 - Backend
cd Backend
npm install
npm start

# Terminal 2 - Frontend
cd Frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

2. **If works locally but not on Vercel:**
   - Environment variable issue
   - Check Vercel configuration
   - Review Function Logs

### Vercel-Specific Checks:

1. **Build Logs:**
   - Go to Deployments → Click deployment
   - Check if build succeeded
   - Look for errors

2. **Function Logs:**
   - Go to Logs tab
   - Filter by "Functions"
   - Try logging in
   - Check for errors in real-time

3. **Environment Variables:**
   - Settings → Environment Variables
   - Verify all are set correctly
   - Redeploy after changes

### Still Stuck?

1. Check `VERCEL_TROUBLESHOOTING.md`
2. Review Vercel Function Logs
3. Test API endpoints manually with curl
4. Verify database connection
5. Check browser console for specific errors

### Quick Fix Checklist:

- [ ] `VITE_API_URL` set to empty in Vercel
- [ ] `DATABASE_URL` set correctly
- [ ] `NODE_ENV=production` set
- [ ] Database schema executed
- [ ] `/api/health` returns `{"ok":true}`
- [ ] Browser console shows no errors
- [ ] Network tab shows request completes
- [ ] Redeployed after env var changes
