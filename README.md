# Fair Acres Hotel Management System

A complete hotel operations management system for managing rooms, workers, tasks, guest complaints, and reviews.

## Quick Start

### Option 1: One Command (Recommended)
```bash
npm start
```

### Option 2: Windows
Double-click `start.bat`

### Option 3: Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

### Option 4: Manual
```bash
# Terminal 1 - Backend
cd Backend
npm install
npm start

# Terminal 2 - Frontend
cd Frontend
npm install
npm run dev
```

## First Time Setup

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Start the App**
   ```bash
   npm start
   ```

3. **Access the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Default Login

**Manager Dashboard:**
- URL: `http://localhost:5173` (local) or your Vercel URL
- Password: `admin1234`
- ⚠️ **IMPORTANT:** Change password after first login!

**Worker App:**
- URL: `http://localhost:5173/worker` (local) or your Vercel URL + `/worker`
- Create workers in Manager Dashboard → Settings
- Login with Worker ID and PIN

**First-Time Production Setup:** See `FIRST_TIME_SETUP.md`

## Features

- **Dashboard** - Overview of rooms, tasks, and issues
- **Tasks Management** - Assign and track housekeeping tasks
- **Complaints** - Handle guest complaints with ticket system
- **Reviews** - View guest feedback
- **Workers** - Manage housekeeping staff
- **Calendar** - View scheduled tasks
- **Settings** - Configure hotel details and workers

## Guest Features

- QR code for submitting complaints
- Review submission after checkout
- Ticket tracking system

## Worker Features

- Mobile-friendly task list
- Photo proof of completed work
- Real-time task updates

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** JSON (dev) / PostgreSQL (production)

## Deployment

**First-Time Setup:** See `FIRST_TIME_SETUP.md` 👈 **START HERE**  
**Quick Start:** See `VERCEL_QUICKSTART.md`  
**Full Guide:** See `VERCEL_DEPLOY.md`  
**Migration from Render:** See `RENDER_TO_VERCEL.md`

## Project Structure

```
HMS/
├── Backend/          # Express API server
├── Frontend/         # React application
├── start.bat         # Windows startup script
├── start.sh          # Unix/Linux/Mac startup script
├── start.js          # Cross-platform Node.js starter
└── package.json      # Root package with scripts
```

## Scripts

- `npm start` - Start both frontend and backend
- `npm run start:backend` - Start backend only
- `npm run start:frontend` - Start frontend only
- `npm run install:all` - Install all dependencies
- `npm run build:frontend` - Build frontend for production

## Support

For issues or questions, check the documentation in the project folders.
