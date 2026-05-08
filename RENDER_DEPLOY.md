# Deploy to Render (Recommended)

Render hosts both Frontend and Backend in one place, simpler than Vercel.

## Why Render?

✅ Deploy both Frontend + Backend in one project
✅ Free tier includes PostgreSQL database
✅ Always-on server (not serverless)
✅ Simple configuration
✅ Better for file uploads
✅ Easy environment variables
✅ Auto-deploy from GitHub

## Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub

## Step 2: Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `fair-acres-db`
3. Select Free tier
4. Click "Create Database"
5. Copy the **Internal Database URL** (starts with `postgresql://`)

## Step 3: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `fair-acres-backend`
   - **Root Directory:** `Backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. Add Environment Variables:
   ```
   DATABASE_URL=<paste your Internal Database URL>
   NODE_ENV=production
   PORT=8000
   ```

5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Copy your backend URL: `https://fair-acres-backend.onrender.com`

## Step 4: Run Database Schema

1. Go to your PostgreSQL database in Render
2. Click "Connect" → "External Connection"
3. Use the connection details with a PostgreSQL client, or:
4. Use Render Shell:
   - Click on database → "Shell" tab
   - Paste contents of `Backend/schema.sql`
   - Execute

## Step 5: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name:** `fair-acres-frontend`
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://fair-acres-backend.onrender.com
   ```

5. Click "Create Static Site"
6. Wait for deployment
7. Your app is live at: `https://fair-acres-frontend.onrender.com`

## Step 6: Update Backend CORS

1. Go to Backend service
2. Environment → Add variable:
   ```
   CLIENT_ORIGIN=https://fair-acres-frontend.onrender.com
   ```
3. Save (auto-redeploys)

## Done! 🎉

Your app is now live:
- Frontend: `https://fair-acres-frontend.onrender.com`
- Backend: `https://fair-acres-backend.onrender.com`
- Database: Managed PostgreSQL on Render

## Free Tier Limits

- Backend: Spins down after 15 min of inactivity (first request takes ~30s)
- Database: 90 days, then expires (upgrade to keep)
- Static Site: Always on, unlimited bandwidth

## Custom Domain (Optional)

1. Go to Frontend service → Settings
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CLIENT_ORIGIN` in Backend

## Troubleshooting

### Backend takes long to respond
- Free tier spins down after inactivity
- First request wakes it up (~30 seconds)
- Upgrade to paid tier for always-on

### CORS errors
- Verify `CLIENT_ORIGIN` matches Frontend URL exactly
- Include `https://` protocol

### Database connection fails
- Use **Internal Database URL** (not External)
- Verify schema.sql was executed
- Check database logs

## Local Development

```bash
# Backend
cd Backend
npm install
npm start

# Frontend
cd Frontend
npm install
npm run dev
```

## Alternative: Single Service (Advanced)

You can also deploy as a single service that serves both:
1. Backend serves API at `/api/*`
2. Backend serves Frontend static files at `/*`
3. Requires modifying server.js to serve static files

This is more complex but uses only one service.
