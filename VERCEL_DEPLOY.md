# Deploy to Vercel

## Prerequisites

- GitHub account with your HMS repository
- Vercel account (sign up at https://vercel.com)

## Deployment Method

This project deploys as a **monorepo** from the root directory. Vercel will automatically detect the `vercel.json` configuration.

## Step 1: Setup Database

Choose one option:

### Option A: Neon (Recommended - Free)
1. Go to https://neon.tech
2. Create account and new project
3. Copy connection string
4. See `Backend/NEON_SETUP.md` for schema setup

### Option B: Supabase (Alternative)
1. Go to https://supabase.com
2. Create project
3. Copy connection string
4. See `Backend/SUPABASE_SETUP.md` for setup

## Step 2: Deploy to Vercel

### Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as root)
   - **Build Command:** Leave empty or use: `cd Backend && npm install`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install --prefix Backend && npm install --prefix Frontend`

5. Add Environment Variables:
   ```
   DATABASE_URL=<your-database-connection-string>
   NODE_ENV=production
   VITE_API_URL=
   ```
   Note: Leave `VITE_API_URL` empty (blank value) for same-origin API calls

6. Click "Deploy"
7. Wait for deployment to complete
8. Your app will be live at `https://your-project.vercel.app`

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from root
vercel --prod
```

## Step 3: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Done! 🎉

Your app is now live at a single URL:
- **App:** https://your-project.vercel.app
- **API:** https://your-project.vercel.app/api

## Important Notes

### File Storage
Vercel serverless functions are stateless. For production:
- **Images:** Use Vercel Blob Storage or Cloudinary
- **Database:** Already using PostgreSQL (Neon/Supabase)

### Auto-Deploy
- Pushes to GitHub automatically trigger redeployment
- Configure branch in Vercel project settings

### Custom Domain
1. Go to project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Backend Errors
- Check Vercel logs: Project → Deployments → Click deployment → View Function Logs
- Verify `DATABASE_URL` is set correctly
- Ensure database schema is created

### CORS Errors
- Since frontend and backend are on same domain, CORS should not be an issue
- If issues occur, check backend CORS configuration in `server.js`

### Frontend Blank Page
- Check build logs in Vercel
- Verify `VITE_API_URL=/api` is set
- Check browser console for errors
- Ensure `Frontend/dist` directory is being created

### Database Connection Issues
- Test connection string locally first
- Ensure database allows connections from Vercel IPs
- Check database is active

## Vercel CLI (Alternative Method)

Install Vercel CLI:
```bash
npm install -g vercel
```

Deploy from root:
```bash
vercel --prod
```

The `vercel.json` in the root will handle routing automatically.

## Configuration Files

The project includes:
- **Root `vercel.json`**: Routes `/api/*` to backend, everything else to frontend
- **Backend `vercel.json`**: Configures serverless function
- **Frontend `vercel.json`**: Handles SPA routing

## Upgrade Options

Vercel Free Tier includes:
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions

For more resources, upgrade to Pro ($20/month).
