# Deployment Options

## Option 1: Single Vercel Project (Monorepo) - RECOMMENDED

Deploy both Frontend and Backend in one project.

### Configuration

The root `vercel.json` is already configured:
- Builds Frontend as static site
- Builds Backend as serverless functions
- Routes `/api/*` to Backend
- Routes everything else to Frontend

### Vercel Dashboard Settings

**IMPORTANT:** Leave these EMPTY in Dashboard:
- Root Directory: (empty)
- Build Command: (empty)
- Output Directory: (empty)

The `vercel.json` file handles everything.

### Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL` = Your Neon PostgreSQL connection string
- `CLIENT_ORIGIN` = Your Vercel domain (e.g., https://fair-acres-hotel-ops.vercel.app)

### Deploy

1. Commit and push changes
2. Vercel auto-deploys
3. Both Frontend and Backend work on same domain

### How It Works

- `https://your-app.vercel.app/` → Frontend (React app)
- `https://your-app.vercel.app/api/*` → Backend (serverless)
- `https://your-app.vercel.app/uploads/*` → Backend (serverless)

---

## Option 2: Separate Projects (Simpler but 2 deployments)

Deploy Frontend and Backend as separate Vercel projects.

### Frontend Project

1. Create new Vercel project
2. Settings:
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Deploy

### Backend Project

1. Create new Vercel project
2. Settings:
   - **Root Directory:** `Backend`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
3. Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - `CLIENT_ORIGIN` = Frontend Vercel URL
4. Deploy

### Update Frontend API Calls

After Backend deploys, update Frontend to use Backend URL:

Create `Frontend/.env.production`:
```
VITE_API_URL=https://your-backend.vercel.app
```

Update API calls in Frontend code to use `import.meta.env.VITE_API_URL`.

---

## Which Option?

**Use Option 1 (Monorepo)** if:
- You want single domain
- Simpler CORS setup
- Easier to manage

**Use Option 2 (Separate)** if:
- Current monorepo setup keeps failing
- You want independent scaling
- You prefer simpler individual builds

---

## Current Issue: 404 Errors

The 404 happens because Vercel can't find the built files. 

**To fix with Option 1:**
1. Ensure `vercel.json` has the builds array (already done)
2. Don't set Root Directory in Dashboard
3. Redeploy

**To fix with Option 2:**
1. Set Root Directory to `Frontend` in Dashboard
2. Redeploy
3. Deploy Backend separately
