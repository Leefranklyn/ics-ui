# Session-Based Attendance System Implementation

## Overview

The frontend has been updated to support the new session-based attendance model where attendance is only recorded during active attendance sessions started by staff/admin users.

## Key Changes

### API Functions (`lib/api.ts`)

#### 1. **Start Attendance Session**
```typescript
startAttendanceSession(payload, token)
```
- Starts an attendance session for a room and course
- Called by lecturers/staff to begin marking attendance
- Requires staff or admin bearer token
- Returns: `{ session_id, room_id, course_id, started_at, status: "active" }`

#### 2. **Get Active Session For Room**
```typescript
getActiveAttendanceSession(roomId, token)
```
- **UPDATED**: Now properly handles the "no active session" response
- When session is active: Returns session object with all details and `marked_count`
- When no session: Returns `null` (backend sends `{session_id: null, status: "none"}`)
- Polls every 5 seconds in SessionManager to show live updates
- Requires staff or admin bearer token

#### 3. **End Attendance Session**
```typescript
endAttendanceSession(sessionId, token)
```
- Ends an active attendance session
- Returns: `{ session_id, ended_at, status: "closed", total_marked }`
- Shows total number of students marked in success toast
- Requires staff or admin bearer token

#### 4. **Get Attendance Report**
```typescript
getAttendance(params, token)
```
- **UPDATED**: Now returns only attendance records (event_type: "attendance")
- Supports filtering by: room_id, course_id, date_from, date_to, session_id, student_id
- Can export as JSON or CSV format
- Does NOT include entry/exit access logs

### Types (`types/index.ts`)

#### `AttendanceSession`
```typescript
interface AttendanceSession {
  session_id: string | null;        // null when no active session
  room_id?: string;                  // optional
  course_id?: string;                // optional
  started_at?: string;               // ISO datetime
  ended_at?: string | null;          // optional
  status: SessionStatus;             // "active" | "closed" | "none"
  marked_count?: number;             // live count during session
}
```

#### `AttendanceRecord`
Already includes session metadata:
```typescript
interface AttendanceRecord {
  timestamp: string;
  full_name: string | null;
  matric_number: string | null;
  course_code: string | null;
  event_type: "attendance";           // Now only "attendance"
  session_id?: string;                // Which session recorded this
  session_name?: string;              // Session display name
  session_started_at?: string;        // When session started
  marked_at?: string;                 // When attendance was marked
}
```

## Components

### SessionManager (`components/attendance/SessionManager.tsx`)

Displays session state and allows starting/ending sessions.

**Props:**
- `roomId: string | null` - Currently selected room
- `courseId: string | null` - Currently selected course
- `rooms: Room[]` - Available rooms
- `courses: Course[]` - Available courses (currently empty)
- `token: string | null` - Auth token
- `onSessionChange?: (session) => void` - Called when session state changes

**Features:**
- Polls active session status every 5 seconds
- Shows active session with: room, course, start time, student count
- Allows optional session name when starting
- Shows "End Session" button when active
- Disabled until both room and course are selected
- Graceful error handling with user-friendly messages

### AttendanceTable (`components/attendance/AttendanceTable.tsx`)

Displays attendance records in a paginated table.

**Displays:**
- Time Marked
- Student Name
- Matric Number
- Course Code
- Session Name & Start Time
- Status: "MARKED" pill

**Features:**
- Automatically filters to show only "attendance" event_type
- Shows empty state if no attendance records found
- Pagination support
- Truncates long text with title attributes

### FilterBar (`components/attendance/FilterBar.tsx`)

Allows filtering attendance records.

**Filters:**
- Room (required for attendance session to start)
- Course (required for attendance session to start)
- Date From/To (defaults to last 7 days)
- Student/Matric search

**Export Options:**
- CSV export (add `format=csv` query parameter)
- PDF print (uses browser print functionality)

## Usage Flow

### For Lecturers/Staff

1. **Navigate to Attendance Page** (`/dashboard/attendance`)
2. **Select Room** from dropdown
3. **Select Course** from dropdown (must belong to selected room)
4. **Check Active Session** automatically polls and displays status
5. **Start Session**
   - Enter optional session name (e.g., "Monday Lecture Week 5")
   - Click "Start Attendance Session"
   - Green indicator shows session is active
6. **Monitor Attendance**
   - Live student count shown during session
   - Can refresh page - session state is maintained
   - Report table shows real-time attendance
7. **End Session**
   - Click "End Attendance Session"
   - Toast shows total students marked
   - Session closes for the room

### For Administrators

Same flow as lecturers, plus:
- Can view attendance reports after sessions end
- Can filter reports by date, course, session, or student
- Can export reports as CSV or PDF

## Backend Integration Points

### Error Handling

The frontend properly handles backend errors:

| Status | Meaning | Frontend Behavior |
|--------|---------|-------------------|
| 200 | Success | Display session/data |
| 401 | Missing/invalid token | Redirect to login |
| 403 | User not staff/admin or not assigned to room | Show error toast |
| 404 | Room, course, or session not found | Show error toast |
| 409 | Another active session already exists for room | Show error toast |
| 422 | Invalid UUID, datetime, or request body | Show error toast |

### Card Tap Messages

When students tap cards during an active session:

**First tap (new attendance):**
```json
{
  "decision": "granted",
  "message": "Access Granted - Attendance Marked"
}
```

**Subsequent taps (same session, same user):**
```json
{
  "decision": "granted",
  "message": "Access Granted"
}
```

No attendance record is created for repeat taps, only access is granted.

## Known Limitations

### Courses

Currently, courses array is empty because:
1. Backend API documentation doesn't specify a courses endpoint
2. Documentation states "courses must belong to selected room" but no fetch method provided
3. SessionManager/FilterBar show empty course dropdowns

**Future Work:** Once backend provides a courses endpoint (e.g., `GET /api/admin/rooms/{room_id}/courses`), update:
- `lib/api.ts` with `getCoursesByRoom(roomId, token)` function
- `app/dashboard/attendance/page.tsx` to fetch and pass courses to components

### Report Limitations

- Reports return only records from active attendance sessions
- Entry/exit access logs are NOT included
- `door_state` field removed from reports (only relevant for access logs)

## Testing Checklist

- [ ] Start session without room selected - should show error
- [ ] Start session without course selected - should show error
- [ ] Start session successfully - should show success toast and active indicator
- [ ] Check active session on page load - should show session if active
- [ ] Check active session when none exists - should show start session form
- [ ] End session - should show total marked and clear active session
- [ ] Poll for session changes - should update UI every 5 seconds
- [ ] Filter attendance report - should only show "attendance" event_type records
- [ ] Session metadata - session_name and session_started_at should display correctly
- [ ] Export CSV - should include session columns
- [ ] Export PDF - should print attendance table
- [ ] Handle 409 error - show error when session already active for room
- [ ] Handle 403 error - show error when user not authorized

## Migration from Old System

### What Changed

| Aspect | Old System | New System |
|--------|-----------|-----------|
| Attendance Source | Entry/exit access logs | Only active session taps |
| Report Data | All access events | Only "attendance" event type |
| Start Attendance | Automatic at room opening | Manual by staff/admin |
| Report Fields | Includes `door_state` | Includes session metadata |

### Data Continuity

- Old access log data still exists in backend
- New reports endpoint only returns attendance session records
- Use reports filters to distinguish between sessions

## Documentation References

- Backend API: See backend documentation for full endpoint specs
- Components: JSDoc comments in component files
- Types: Full type definitions in `types/index.ts`
- API: Full function documentation in `lib/api.ts`
