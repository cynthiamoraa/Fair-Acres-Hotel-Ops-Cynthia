# Room Service Status Management

## Overview
Rooms are automatically managed between "Out of Service" (maintenance) and "Available" status based on issue lifecycle.

## Automatic Room Status Flow

### When Issue is Created
1. Guest submits complaint via QR code
2. System creates issue with ticket number
3. **Room automatically set to "maintenance" status**
4. Task automatically created for the issue

### When Issue is Resolved
Room is automatically released from maintenance in **two ways**:

#### 1. Task Completion (Recommended)
- Worker completes the task with photo proof
- System marks issue as "resolved"
- **Room automatically set to "available" status**
- Works in both JSON and PostgreSQL modes

#### 2. Direct Resolution
- Manager manually resolves issue from dashboard
- **Room automatically set to "available" status**
- Works in both JSON and PostgreSQL modes

## Implementation Details

### Backend Logic (server.js)

**Task Completion Handler** (`POST /api/tasks/:id/complete`):
```javascript
// When task linked to issue is completed
if (task.issue_id) {
  const issue = issues.find((i) => i.id === task.issue_id);
  if (issue && issue.status === "open") {
    // Mark issue as resolved
    await updateIssue(issue.id, { 
      status: "resolved",
      resolved_at: new Date().toISOString()
    });
    
    // Release room from maintenance
    const room = rooms.find((r) => r.code === issue.location);
    if (room && room.status === "maintenance") {
      await updateRoom(room.id, { status: "available" });
    }
  }
}
```

**Direct Resolution Handler** (`PATCH /api/issues/:id/resolve`):
```javascript
// When manager manually resolves issue
await updateIssue(id, { 
  status: "resolved",
  resolved_at: new Date().toISOString()
});

// Release room from maintenance
const room = rooms.find((r) => r.code === issue.location);
if (room && room.status === "maintenance") {
  await updateRoom(room.id, { status: "available" });
}
```

## Status Transitions

```
Issue Created → Room: maintenance
     ↓
Task Assigned → Room: maintenance (no change)
     ↓
Task Completed → Issue: resolved → Room: available ✓
```

OR

```
Issue Created → Room: maintenance
     ↓
Manual Resolve → Issue: resolved → Room: available ✓
```

## Benefits

1. **No Manual Intervention**: Rooms automatically return to service
2. **Prevents Revenue Loss**: Rooms don't stay in maintenance unnecessarily
3. **Accurate Status**: Room status always reflects actual state
4. **Worker Accountability**: Photo proof required before room release
5. **Audit Trail**: Timestamps track when issues resolved

## Edge Cases Handled

- Room only released if currently in "maintenance" status
- Room only released when issue status is "open" → "resolved"
- Case-insensitive room code matching
- Works with both database backends (JSON/PostgreSQL)

## Testing

1. **Create Issue**: Submit complaint for room 101
   - Verify room 101 status = "maintenance"
2. **Complete Task**: Worker completes task with photo
   - Verify issue status = "resolved"
   - Verify room 101 status = "available"
3. **Manual Resolve**: Create issue, then manually resolve
   - Verify room status = "available"

## Notes

- Room status change is immediate upon issue resolution
- No notification sent (can be added if needed)
- Room can be manually set to other statuses if needed
- System prevents duplicate image submissions for task completion
