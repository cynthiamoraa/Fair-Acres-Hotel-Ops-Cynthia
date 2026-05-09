# Deploy to Vercel

## Steps to Deploy:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the Backend directory**:
   ```bash
   cd Backend
   vercel --prod
   ```

4. **Follow the prompts**:
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - Project name? (e.g., hms-backend)
   - Directory? ./
   - Override settings? No

## Environment Variables:

Set in Vercel dashboard (Project Settings → Environment Variables):
```
DATABASE_URL=<your-database-connection-string>
NODE_ENV=production
CLIENT_ORIGIN=https://your-frontend.vercel.app
```

## Database Options:

1. **Neon** (Recommended): See `NEON_SETUP.md`
2. **Supabase**: See `SUPABASE_SETUP.md`

## File Storage:

For production, replace local uploads with:
- Vercel Blob Storage
- Cloudinary
- AWS S3

## Complete Guide:

See `../VERCEL_DEPLOY.md` for full deployment instructions.
