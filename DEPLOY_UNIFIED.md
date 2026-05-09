# Single Service Deployment (Backend serves Frontend)

Deploy both Frontend and Backend as **one service** on Render.

## How It Works

- Backend serves API at `/api/*`
- Backend serves Frontend static files at `/*`
- Single URL for everything
- No CORS issues
- Simpler deployment

## Deploy to Render

### 1. Push to GitHub
```bash
git add .
git commit -m "Add unified deployment"
git push
```

### 2. Create Render Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `fair-acres-hms`
   - **Root Directory:** `Backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 3. Add Environment Variables

Click "Advanced" and add:
```
NODE_ENV=production
DATABASE_URL=your_neon_postgresql_url
```

### 4. Deploy

Click "Create Web Service"

Wait 3-5 minutes for:
1. Backend dependencies install
2. Frontend build
3. Server start

### 5. Access Your App

Your app will be live at:
```
https://fair-acres-hms.onrender.com
```

Everything works from one URL:
- Manager Dashboard: `/`
- Worker App: `/worker`
- Guest App: `/guest`
- API: `/api/*`

## Database Setup

### Option 1: Render PostgreSQL (Recommended)

1. In Render, click "New +" → "PostgreSQL"
2. Name: `fair-acres-db`
3. Plan: Free
4. Create
5. Copy **Internal Database URL**
6. Add to your service as `DATABASE_URL`
7. Connect to database and run `Backend/schema.sql`

### Option 2: Neon PostgreSQL

1. Go to https://neon.tech
2. Create project
3. Copy connection string
4. Add as `DATABASE_URL` in Render
5. Run `Backend/schema.sql` in Neon SQL Editor

## Local Development

Still use separate servers locally:
```bash
npm start
```

This runs Frontend on 5173 and Backend on 8000.

## Production vs Development

**Development (Local):**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Separate processes

**Production (Render):**
- Everything: `https://your-app.onrender.com`
- Single process
- Backend serves Frontend

## Benefits

✅ Single deployment
✅ One URL to manage
✅ No CORS configuration needed
✅ Simpler than separate services
✅ Lower cost (one service instead of two)

## Troubleshooting

### Build fails
- Check Frontend dependencies are installed
- Verify `Frontend/dist` is created
- Check build logs in Render

### 404 on routes
- Ensure `NODE_ENV=production` is set
- Verify Frontend built successfully
- Check `Frontend/dist/index.html` exists

### API not working
- Check `DATABASE_URL` is set
- Verify database schema is loaded
- Check API logs in Render

### Database connection fails
- Use **Internal Database URL** if using Render PostgreSQL
- Ensure database is in same region
- Verify connection string format

## Free Tier Limits

- **Service:** Spins down after 15 min inactivity
- **Database:** 90 days free (Render) or permanent (Neon free tier)
- **First request:** ~30 seconds to wake up
- **Subsequent requests:** Fast

## Upgrade

To keep service always-on:
- Upgrade to Starter plan ($7/month)
- No spin-down
- Faster performance
