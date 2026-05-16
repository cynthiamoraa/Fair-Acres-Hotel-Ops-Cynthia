# Team/Department Feature

## Overview

Workers can now be organized into different teams/departments for better management and organization.

## Available Teams

- **Housekeeping** - Room cleaning and maintenance
- **Kitchen** - Food preparation and service
- **Security** - Property security and safety
- **Maintenance** - Building and equipment maintenance
- **Front Desk** - Guest services and reception
- **Other** - Any other department

## Features

### 1. Add Workers with Team Assignment
When adding a new worker in Settings:
- Enter worker name
- Select team from dropdown
- Set PIN (minimum 4 digits)

### 2. Filter Workers by Team
- Dropdown filter in Settings page
- View all teams or filter by specific team
- Shows team name under each worker

### 3. Team Display
- Each worker shows their team assignment
- Team badge displayed under worker name
- Easy identification of worker roles

## Database Changes

### PostgreSQL Migration

Run this SQL to add team support to existing database:

```sql
-- Add team column
ALTER TABLE workers ADD COLUMN IF NOT EXISTS team TEXT DEFAULT 'Housekeeping';

-- Add check constraint
ALTER TABLE workers DROP CONSTRAINT IF EXISTS workers_team_check;
ALTER TABLE workers ADD CONSTRAINT workers_team_check 
  CHECK (team IN ('Housekeeping', 'Kitchen', 'Security', 'Maintenance', 'Front Desk', 'Other'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_workers_team ON workers(team);

-- Update existing workers
UPDATE workers SET team = 'Housekeeping' WHERE team IS NULL;
```

Or use the migration file:
```bash
# Run in your database SQL editor
cat Backend/migration_add_teams.sql
```

### JSON Database

Automatically adds default team ('Housekeeping') to existing workers on server startup.

## API Changes

### GET /api/workers
**Query Parameters:**
- `team` (optional) - Filter by team name

**Response:**
```json
[
  {
    "id": "w1234567890",
    "name": "John Doe",
    "team": "Housekeeping"
  }
]
```

### POST /api/workers
**Request Body:**
```json
{
  "name": "Jane Smith",
  "pin": "1234",
  "team": "Kitchen"
}
```

**Response:**
```json
{
  "id": "w1234567891",
  "name": "Jane Smith",
  "team": "Kitchen"
}
```

## Usage Examples

### Filter Workers by Team
```javascript
// Get all housekeeping workers
const response = await fetch('/api/workers?team=Housekeeping');
const housekeepingWorkers = await response.json();

// Get all workers
const response = await fetch('/api/workers');
const allWorkers = await response.json();
```

### Create Worker with Team
```javascript
const response = await fetch('/api/workers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  body: JSON.stringify({
    name: 'Security Guard',
    pin: '5678',
    team: 'Security'
  })
});
```

## UI Updates

### Settings Page
- **Team dropdown** when adding new worker
- **Filter dropdown** to view workers by team
- **Team badge** displayed under worker name
- **"Team Members"** section title (replaces "Housekeeping Team")

### Worker Display
```
┌─────────────────────────────────┐
│ [J] John Doe                    │
│     Housekeeping                │
└─────────────────────────────────┘
```

## Future Enhancements

Potential additions:
1. **Team-specific tasks** - Assign tasks to teams
2. **Team leaders** - Designate supervisors
3. **Team performance** - Analytics by team
4. **Team schedules** - Different shifts per team
5. **Team notifications** - Broadcast to entire team
6. **Custom teams** - Allow managers to create custom teams

## Benefits

✅ **Better Organization** - Workers grouped by function  
✅ **Easier Management** - Filter and view by department  
✅ **Clear Roles** - Instantly see worker responsibilities  
✅ **Scalability** - Supports hotels with multiple departments  
✅ **Flexibility** - Easy to add new teams as needed  

## Migration Guide

### For Existing Deployments

1. **Backup Database**
   ```bash
   # Export your current database
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Run Migration**
   ```bash
   # In your database SQL editor (Neon/Supabase)
   # Copy and run: Backend/migration_add_teams.sql
   ```

3. **Deploy Updated Code**
   ```bash
   git pull
   git push origin main  # Triggers Vercel deployment
   ```

4. **Verify**
   - Check Settings page
   - Add a new worker with team
   - Filter workers by team

### For New Deployments

The team field is included in the main `schema.sql`, so no migration needed!

## Troubleshooting

### Workers showing no team
- Run the migration SQL
- Or restart the server (JSON mode auto-adds default team)

### Can't filter by team
- Clear browser cache
- Refresh the page
- Check API response includes `team` field

### Invalid team error
- Ensure team is one of the valid options
- Check spelling matches exactly

## Files Changed

- `Backend/schema.sql` - Added team column
- `Backend/migration_add_teams.sql` - Migration script
- `Backend/server.js` - Team support in API
- `Backend/db.js` - Team in PostgreSQL operations
- `Frontend/src/pages/SettingsPage.jsx` - UI for teams

## Testing

1. Add worker with different teams
2. Filter by each team
3. Verify team displays correctly
4. Check API returns team field
5. Test with existing workers (should show default team)
