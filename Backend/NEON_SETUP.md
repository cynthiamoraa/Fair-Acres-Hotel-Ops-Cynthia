# Neon PostgreSQL Setup

## 1. Create Neon Project
- Go to https://neon.tech
- Create a new project
- Copy the connection string

## 2. Run Database Schema
- Use Neon SQL Editor or connect via psql
- Copy and paste contents of `schema.sql`
- Execute the SQL

## 3. Configure Environment
Create `.env` file in Backend folder:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
CLIENT_ORIGIN=https://your-frontend-domain.com
```

## 4. Install Dependencies
```bash
cd Backend
npm install
```

## 5. Deploy
The app automatically detects PostgreSQL when DATABASE_URL is set.
- Development: Uses JSON file (db.json)
- Production: Uses Neon PostgreSQL when DATABASE_URL is present

## Notes
- Neon provides serverless PostgreSQL with auto-scaling
- Free tier includes 0.5 GB storage and 191 hours compute
- Connection pooling is built-in
- No code changes needed - automatic detection
