# First-Time Setup Guide

## Step 1: Setup Database

### Option A: Neon (Recommended)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up (free tier available)

2. **Create Project**
   - Click "Create Project"
   - Choose a name (e.g., "fair-acres-hms")
   - Select region closest to you

3. **Get Connection String**
   - Copy the connection string (looks like):
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

4. **Run Database Schema**
   - Go to Neon Dashboard → SQL Editor
   - Copy contents of `Backend/schema.sql`
   - Paste and click "Run"
   - ✅ This creates all tables AND the default manager account

### Option B: Supabase

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free tier available)

2. **Create Project**
   - Click "New Project"
   - Choose name and password
   - Select region

3. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your actual password

4. **Run Database Schema**
   - Go to SQL Editor
   - Copy contents of `Backend/schema.sql`
   - Paste and click "Run"
   - ✅ This creates all tables AND the default manager account

## Step 2: Deploy to Vercel

### Using Vercel Dashboard

1. **Go to Vercel**
   - Visit https://vercel.com/dashboard
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your HMS repository
   - Click "Import"

3. **Configure Project**
   - Leave all build settings as default
   - Vercel will auto-detect the configuration

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   DATABASE_URL = <paste your connection string from Step 1>
   NODE_ENV = production
   VITE_API_URL = (leave empty - just add the key with blank value)
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Copy your deployment URL (e.g., `https://fair-acres-hotel-ops.vercel.app`)

## Step 3: First Login

### Manager Dashboard

1. **Visit Your Vercel URL**
   ```
   https://your-project.vercel.app
   ```

2. **Login Credentials**
   ```
   Password: admin1234
   ```

3. **Change Password (Recommended)**
   - After login, go to Settings
   - Click "Change Password"
   - Enter current password: `admin1234`
   - Enter new secure password
   - Save

### Worker App

Workers need to be created first by the manager:

1. **Create Workers**
   - Login as manager
   - Go to Settings → Workers
   - Click "Add Worker"
   - Enter name and 4-digit PIN
   - Save

2. **Worker Login**
   - Visit: `https://your-project.vercel.app/worker`
   - Enter Worker ID (shown in manager dashboard)
   - Enter PIN
   - Login

## Step 4: Initial Setup

### Configure Hotel Settings

1. **Go to Settings**
   - Click Settings in sidebar

2. **Update Hotel Information**
   - Hotel Name: Enter your hotel name
   - Contact Email: Enter support email
   - Save

### Add Rooms

1. **Go to Dashboard**
   - Click "Add Rooms" button

2. **Bulk Add Rooms**
   - Prefix: `room` (or your preference)
   - Floor: `1`
   - From: `101`
   - To: `110`
   - Status: `available`
   - Click "Create Rooms"

3. **Verify**
   - Rooms should appear in dashboard
   - You can add more floors/rooms as needed

### Create Workers

1. **Go to Settings → Workers**
2. **Add Workers**
   - Name: Worker's name
   - PIN: 4-digit PIN (e.g., 1234)
   - Save
3. **Note the Worker ID** - Workers need this to login

## Default Credentials Summary

### Manager Login
- **URL:** `https://your-project.vercel.app`
- **Password:** `admin1234`
- **⚠️ IMPORTANT:** Change this password immediately after first login!

### Worker Login
- **URL:** `https://your-project.vercel.app/worker`
- **Credentials:** Created by manager in Settings
- **Format:** Worker ID + 4-digit PIN

### Guest Features
- **Complaint QR:** Generated in Dashboard → Complaints
- **Review Form:** `https://your-project.vercel.app/guest`

## Troubleshooting First Login

### "Incorrect password" error

**Cause:** Database not initialized or schema not run

**Solution:**
1. Check database connection in Vercel logs
2. Verify `DATABASE_URL` is set correctly
3. Re-run `Backend/schema.sql` in your database
4. The schema includes this line:
   ```sql
   INSERT INTO manager (id, password) VALUES (1, 'admin1234') ON CONFLICT (id) DO NOTHING;
   ```

### "Cannot connect to database" error

**Cause:** Invalid `DATABASE_URL` or database not accessible

**Solution:**
1. Verify connection string format
2. Ensure database is running
3. Check SSL mode is included: `?sslmode=require`
4. Test connection locally first

### Blank page / 404 error

**Cause:** Frontend not built correctly

**Solution:**
1. Check Vercel build logs
2. Verify `VITE_API_URL` is set (empty value)
3. Redeploy from Vercel dashboard

## Security Recommendations

### After First Login:

1. ✅ **Change manager password** immediately
2. ✅ **Use strong passwords** (min 8 characters, mix of letters/numbers)
3. ✅ **Use unique PINs** for each worker (not 1234)
4. ✅ **Keep DATABASE_URL secret** (never commit to Git)
5. ✅ **Enable 2FA** on Vercel account

### Production Checklist:

- [ ] Manager password changed from default
- [ ] Worker PINs are unique and secure
- [ ] Hotel name and contact email configured
- [ ] Rooms added to system
- [ ] Workers created and tested login
- [ ] Guest complaint QR code generated
- [ ] Test all features work correctly

## Need Help?

- **Deployment Issues:** See `VERCEL_TROUBLESHOOTING.md`
- **Database Setup:** See `Backend/NEON_SETUP.md` or `Backend/SUPABASE_SETUP.md`
- **General Guide:** See `VERCEL_DEPLOY.md`

## Quick Reference

| Feature | URL Path | Credentials |
|---------|----------|-------------|
| Manager Dashboard | `/` | Password: `admin1234` |
| Worker App | `/worker` | Worker ID + PIN |
| Guest Complaints | `/guest` | No login required |
| Guest Reviews | `/guest` | No login required |

---

**🎉 You're all set!** Your hotel management system is now live and ready to use.
