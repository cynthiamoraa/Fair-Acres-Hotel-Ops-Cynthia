# Deploy to Render - Manual Setup (WORKS!)

Skip the Blueprint - deploy manually instead.

## Step 1: Deploy Backend

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `fair-acres-backend`
   - **Root Directory:** `Backend`
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Click "Advanced" and add Environment Variables:
   ```
   NODE_ENV=production
   ```

6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. Copy your backend URL (e.g., `https://fair-acres-backend.onrender.com`)

## Step 2: Create Database

1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name:** `fair-acres-db`
   - **Database:** `fair_acres`
   - **User:** `fair_acres_user`
   - **Region:** Same as backend
   - **Plan:** Free

3. Click "Create Database"
4. Wait for provisioning
5. Click on database → "Info" tab
6. Copy **Internal Database URL**

## Step 3: Add Database to Backend

1. Go to Backend service
2. Click "Environment" tab
3. Add new variable:
   ```
   DATABASE_URL=<paste Internal Database URL>
   ```
4. Save (triggers automatic redeploy)

## Step 4: Run Database Schema

1. Go to database in Render
2. Click "Connect" → "PSQL Command"
3. Copy the command and run locally, OR:
4. Use database Shell:
   - Click "Shell" tab in database
   - Copy contents of `Backend/schema.sql`
   - Paste and execute

## Step 5: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name:** `fair-acres-frontend`
   - **Root Directory:** `Frontend`
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://fair-acres-backend.onrender.com
   ```
   (Use your actual backend URL from Step 1)

5. Click "Create Static Site"
6. Wait 2-3 minutes
7. Copy your frontend URL (e.g., `https://fair-acres-frontend.onrender.com`)

## Step 6: Update Backend CORS

1. Go to Backend service
2. Click "Environment" tab
3. Add new variable:
   ```
   CLIENT_ORIGIN=https://fair-acres-frontend.onrender.com
   ```
   (Use your actual frontend URL from Step 5)
4. Save (triggers redeploy)

## Step 7: Test Your App

1. Visit your frontend URL
2. Login as manager (password: `admin1234`)
3. Create rooms, workers, tasks
4. Test all features

## Done! 🎉

Your app is now live:
- **Frontend:** https://fair-acres-frontend.onrender.com
- **Backend:** https://fair-acres-backend.onrender.com
- **Database:** Managed PostgreSQL

## Important Notes

- **Free tier:** Backend spins down after 15 min inactivity
- **First request:** Takes ~30 seconds to wake up
- **Database:** Free for 90 days, then expires
- **Auto-deploy:** Pushes to GitHub trigger redeployment

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify `DATABASE_URL` is set
- Ensure `schema.sql` was executed

### CORS errors
- Verify `CLIENT_ORIGIN` matches frontend URL exactly
- Must include `https://`
- No trailing slash

### Database connection fails
- Use **Internal Database URL** (not External)
- Ensure backend and database are in same region
- Check database is running

### Frontend blank page
- Check build logs for errors
- Verify `VITE_API_URL` is correct
- Check browser console

## Upgrade to Paid

To keep backend always-on and database permanent:
- Backend: Starter plan ($7/month)
- Database: Starter plan ($7/month)
