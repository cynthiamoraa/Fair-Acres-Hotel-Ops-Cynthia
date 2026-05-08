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
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - Project name? (e.g., hms-backend)
   - Directory? ./
   - Override settings? No

5. **For production deployment**:
   ```bash
   vercel --prod
   ```

## Important Notes:

⚠️ **File Storage Limitation**: Vercel serverless functions are stateless. Your current implementation uses:
- Local file system for `db.json` (will reset on each deployment)
- Local `uploads/` folder for images (will be lost)

### Recommended Changes for Production:

1. **Database**: Replace `db.json` with a real database:
   - MongoDB Atlas (free tier available)
   - PostgreSQL on Vercel
   - Supabase
   - PlanetScale

2. **File Storage**: Replace local uploads with cloud storage:
   - Vercel Blob Storage
   - AWS S3
   - Cloudinary
   - Uploadcare

3. **Environment Variables**: Set in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `CLIENT_ORIGIN` with your frontend URL

## Current Setup (Development Only):

The current setup will work on Vercel but:
- Data will reset on each deployment
- Uploaded images will be lost
- Not suitable for production use

## Test Your Deployment:

After deployment, test the API:
```bash
curl https://your-app.vercel.app/api/health
```

Update your frontend's API URL to point to the Vercel deployment.
