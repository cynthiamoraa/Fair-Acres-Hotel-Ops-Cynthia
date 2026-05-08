# Complete Vercel Deployment Guide

## 🚀 Quick Deploy (Both Frontend & Backend)

### 1. Deploy Backend First

```bash
cd Backend
vercel
```

- Follow prompts and note your backend URL (e.g., `https://hms-backend-xyz.vercel.app`)

### 2. Deploy Frontend

```bash
cd ../Frontend
vercel
```

- When prompted for environment variables, add:
  - `VITE_API_URL` = `https://your-backend-url.vercel.app` (from step 1)

### 3. Update Backend CORS

After deploying frontend, update your backend's `ALLOWED_ORIGINS` in `server.js`:

```javascript
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://your-frontend.vercel.app",  // Add this
  process.env.CLIENT_ORIGIN,
].filter(Boolean);
```

Then redeploy backend:
```bash
cd Backend
vercel --prod
```

## 📋 Detailed Steps

### Backend Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy Backend**:
   ```bash
   cd Backend
   vercel
   ```

4. **Production Deploy**:
   ```bash
   vercel --prod
   ```

5. **Copy the deployment URL** (you'll need it for frontend)

### Frontend Deployment

1. **Create .env file** (if not exists):
   ```bash
   cd Frontend
   copy .env.example .env
   ```

2. **Update .env** with your backend URL:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```

3. **Deploy Frontend**:
   ```bash
   vercel
   ```

4. **Set Environment Variable in Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Select your frontend project
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend.vercel.app`

5. **Production Deploy**:
   ```bash
   vercel --prod
   ```

## ⚠️ Important Limitations

### Current Setup Issues:

1. **Database (db.json)**: 
   - Resets on every deployment
   - Not persistent across serverless invocations
   - **Solution**: Use a real database (MongoDB, PostgreSQL, Supabase)

2. **File Uploads (uploads/ folder)**:
   - Lost after deployment
   - Serverless functions are stateless
   - **Solution**: Use cloud storage (Vercel Blob, S3, Cloudinary)

### For Production Use:

Replace file-based storage with:

**Database Options:**
- MongoDB Atlas (free tier)
- Supabase (PostgreSQL + Storage)
- PlanetScale (MySQL)
- Vercel Postgres

**File Storage Options:**
- Vercel Blob Storage
- AWS S3
- Cloudinary
- Uploadcare

## 🔧 Environment Variables

### Backend (Vercel Dashboard):
- `CLIENT_ORIGIN` = Your frontend URL

### Frontend (Vercel Dashboard):
- `VITE_API_URL` = Your backend URL

## ✅ Testing

After deployment:

1. **Test Backend**:
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```

2. **Test Frontend**:
   - Open `https://your-frontend.vercel.app`
   - Try logging in
   - Check browser console for errors

## 🔄 Redeployment

To redeploy after changes:

```bash
# Backend
cd Backend
vercel --prod

# Frontend
cd Frontend
vercel --prod
```

## 📝 Notes

- Free tier has limitations (function execution time, bandwidth)
- Consider upgrading for production use
- Monitor usage in Vercel dashboard
- Set up custom domain in Vercel settings (optional)
