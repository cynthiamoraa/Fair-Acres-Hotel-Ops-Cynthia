# Deploy to Render - Step by Step

## Option 1: Blueprint (Automatic - RECOMMENDED)

This deploys everything automatically using `render.yaml`.

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Render configuration"
   git push
   ```

2. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Sign up/Login with GitHub

3. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository
   - Click "Apply"

4. **Render will automatically create:**
   - PostgreSQL database
   - Backend web service
   - Frontend static site
   - All environment variables

5. **Run Database Schema**
   - Go to your database in Render dashboard
   - Click "Connect" → Copy the External Connection String
   - Use a PostgreSQL client (like pgAdmin or DBeaver) to connect
   - Run the SQL from `Backend/schema.sql`
   
   OR use Render Shell:
   - Click on database → "Shell" tab
   - Paste contents of `Backend/schema.sql`
   - Execute

6. **Wait for Deployment** (3-5 minutes)
   - Backend: `https://fair-acres-backend.onrender.com`
   - Frontend: `https://fair-acres-frontend.onrender.com`

7. **Done!** Visit your frontend URL

---

## Option 2: Manual Setup

If Blueprint doesn't work, deploy manually:

### Step 1: Create Database

1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name:** `fair-acres-db`
   - **Database:** `fair_acres`
   - **User:** `fair_acres_user`
   - **Region:** Choose closest to you
   - **Plan:** Free
3. Click "Create Database"
4. Copy the **Internal Database URL**

### Step 2: Run Schema

1. In database dashboard, click "Connect"
2. Use Shell or external client
3. Run `Backend/schema.sql`

### Step 3: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name:** `fair-acres-backend`
   - **Root Directory:** `Backend`
   - **Environment:** `Node`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables:**
   ```
   DATABASE_URL=<paste Internal Database URL>
   NODE_ENV=production
   PORT=8000
   CLIENT_ORIGIN=https://fair-acres-frontend.onrender.com
   ```

5. Click "Create Web Service"
6. Wait for deployment
7. Copy your backend URL

### Step 4: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name:** `fair-acres-frontend`
   - **Root Directory:** `Frontend`
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Environment Variables:**
   ```
   VITE_API_URL=https://fair-acres-backend.onrender.com
   ```

5. Click "Create Static Site"
6. Wait for deployment

### Step 5: Update Backend CORS

1. Go to Backend service
2. Environment tab
3. Update `CLIENT_ORIGIN` with actual frontend URL
4. Save (triggers redeploy)

---

## Verify Deployment

1. Visit frontend URL
2. Try logging in:
   - Manager: password `admin1234`
   - Worker: Create one first as manager
3. Test creating rooms, tasks, etc.

---

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify `DATABASE_URL` is correct
- Ensure schema.sql was executed

### Frontend shows blank page
- Check build logs for errors
- Verify `VITE_API_URL` is set correctly
- Check browser console for errors

### CORS errors
- Verify `CLIENT_ORIGIN` matches frontend URL exactly
- Must include `https://`
- No trailing slash

### Database connection fails
- Use **Internal Database URL** for backend
- Verify database is in same region
- Check database is running

### First request is slow
- Free tier spins down after 15 min inactivity
- First request takes ~30 seconds to wake up
- Subsequent requests are fast

---

## Free Tier Limits

- **Backend:** Spins down after 15 min inactivity
- **Frontend:** Always on, unlimited bandwidth
- **Database:** 90 days free, then expires (upgrade to keep data)
- **Build minutes:** 500 minutes/month

---

## Upgrade Options

If you need always-on backend:
- Upgrade to Starter plan ($7/month)
- Backend stays awake 24/7
- Database persists forever

---

## Custom Domain

1. Go to Frontend service → Settings
2. Click "Add Custom Domain"
3. Enter your domain
4. Update DNS records as shown
5. Update `CLIENT_ORIGIN` in Backend to match

---

## Auto-Deploy

Render auto-deploys when you push to GitHub:
- Push to `main` branch
- Render detects changes
- Rebuilds and redeploys automatically

---

## Local Development

```bash
# Backend (port 8000)
cd Backend
npm install
npm start

# Frontend (port 5173)
cd Frontend
npm install
npm run dev
```

Frontend uses `http://localhost:8000` in development.
