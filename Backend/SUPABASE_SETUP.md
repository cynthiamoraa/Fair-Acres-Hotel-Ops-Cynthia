# Supabase PostgreSQL Setup

## 1. Create Supabase Project
- Go to https://supabase.com
- Create a new project
- Wait for database provisioning

## 2. Run Database Schema
- Open SQL Editor in Supabase dashboard
- Copy and paste contents of `schema.sql`
- Execute the SQL

## 3. Get Credentials
- Go to Project Settings > API
- Copy `Project URL` (SUPABASE_URL)
- Copy `anon public` key (SUPABASE_KEY)

## 4. Configure Environment
Create `.env` file in Backend folder:
```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
CLIENT_ORIGIN=https://your-frontend-domain.com
```

## 5. Install Dependencies
```bash
cd Backend
npm install
```

## 6. Deploy
The app automatically detects PostgreSQL when SUPABASE_URL and SUPABASE_KEY are set.
- Development: Uses JSON file (db.json)
- Production: Uses PostgreSQL when env vars are present

## Notes
- JSON database is used locally for development
- PostgreSQL is used in production when Supabase credentials are configured
- No code changes needed - automatic detection
