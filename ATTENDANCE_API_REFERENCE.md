# Frontend Attendance Session API Integration Reference

Quick reference for all attendance session endpoints and their integration with the frontend.

## API Endpoints Summary

### 1. Start Attendance Session

**Endpoint:** `POST /api/admin/attendance/session/start`

**Auth:** Bearer token (staff or admin)

**Request:**
```json
{
  "room_id": "uuid-string",
  "course_id": "uuid-string",
  "session_name": "CS101 - Monday Lecture Week 5"  // optional
}
```

**Response (200):**
```json
{
  "session_id": "uuid-string",
  "room_id": "uuid-string",
  "course_id": "uuid-string",
  "started_at": "2026-05-31T14:00:00Z",
  "status": "active"
}
```

**Error Responses:**
- `400`: Invalid request body
- `401`: Missing/invalid token
- `403`: User not staff/admin or not assigned to room
- `404`: Room or course not found
- `409`: Session already active for this room
- `422`: Invalid UUID format

**Frontend Integration:** `startAttendanceSession(payload, token)`

---

### 2. Get Active Session For Room

**Endpoint:** `GET /api/admin/attendance/session/active?room_id=<room_id>`

**Auth:** Bearer token (staff or admin)

**Response when Active (200):**
```json
{
  "session_id": "uuid-string",
  "room_id": "uuid-string",
  "course_id": "uuid-string",
  "started_at": "2026-05-31T14:00:00Z",
  "status": "active",
  "marked_count": 15
}
```

**Response when None Active (200):**
```json
{
  "session_id": null,
  "status": "none"
}
```

**Error Responses:**
- `401`: Missing/invalid token
- `403`: User not authorized
- `404`: Room not found
- `422`: Invalid UUID

**Frontend Integration:** `getActiveAttendanceSession(roomId, token)`
- Returns `AttendanceSession | null`
- Returns `null` when `session_id` is null

**Polling:** Called every 5 seconds in SessionManager

---

### 3. End Attendance Session

**Endpoint:** `PUT /api/admin/attendance/session/{session_id}/end`

**Auth:** Bearer token (staff or admin)

**Request:** None (no body)

**Response (200):**
```json
{
  "session_id": "uuid-string",
  "ended_at": "2026-05-31T15:00:00Z",
  "status": "closed",
  "total_marked": 42
}
```

**Error Responses:**
- `401`: Missing/invalid token
- `403`: User not authorized
- `404`: Session not found
- `422`: Invalid UUID

**Frontend Integration:** `endAttendanceSession(sessionId, token)`

---

### 4. Get Attendance Report

**Endpoint:** `GET /api/reports/attendance`

**Auth:** Bearer token (any authenticated user)

**Query Parameters:**
| Parameter | Required | Type | Format |
|-----------|----------|------|--------|
| `room_id` | Yes | string | UUID |
| `date_from` | Yes | string | ISO 8601 datetime |
| `date_to` | Yes | string | ISO 8601 datetime |
| `course_id` | No | string | UUID |
| `session_id` | No | string | UUID |
| `student_id` | No | string | UUID |
| `format` | No | string | "json" or "csv" (default: "json") |

**Example Query:**
```
GET /api/reports/attendance?room_id=abc123&date_from=2026-05-31T00:00:00Z&date_to=2026-05-31T23:59:59Z
```

**JSON Response (200):**
```json
[
  {
    "timestamp": "2026-05-31T14:05:00Z",
    "full_name": "John Doe",
    "matric_number": "ST/001/2024",
    "course_code": "CS101",
    "course_name": "Introduction to Computer Science",
    "session_id": "uuid-string",
    "session_name": "CS101 - Monday Lecture Week 5",
    "session_started_at": "2026-05-31T14:00:00Z",
    "event_type": "attendance",
    "marked_at": "2026-05-31T14:05:00Z"
  }
]
```

**CSV Response (format=csv):**
```
timestamp,full_name,matric_number,course_code,course_name,session_id,session_name,session_started_at,event_type,marked_at
2026-05-31T14:05:00Z,John Doe,ST/001/2024,CS101,Introduction to Computer Science,uuid-string,CS101 - Monday Lecture Week 5,2026-05-31T14:00:00Z,attendance,2026-05-31T14:05:00Z
```

**Error Responses:**
- `400`: Missing required parameters
- `401`: Missing/invalid token
- `403`: User not authorized for room
- `404`: Room or session not found
- `422`: Invalid UUID or datetime format

**Frontend Integration:** `getAttendance(params, token)` and `downloadAttendanceCsv(params, token)`

---

## Frontend Component Integration

### SessionManager Component

```typescript
// In your attendance page
<SessionManager 
  roomId={selectedRoomId}
  courseId={selectedCourseId}
  rooms={rooms}
  courses={courses}
  token={token}
  onSessionChange={(session) => {
    // Called when session starts, ends, or changes
    // session is null when no active session
  }}
/>
```

**Behavior:**
1. Checks active session on mount and when room changes
2. Polls every 5 seconds for session status
3. Shows active session details and "End" button when active
4. Shows start form when no active session
5. Handles all errors with user-friendly toasts

### FilterBar & AttendanceTable

```typescript
// Fetch attendance records
const params = new URLSearchParams();
params.set('room_id', selectedRoomId);
params.set('date_from', dateFromISO);
params.set('date_to', dateToISO);
params.set('course_id', courseId); // optional

const records = await getAttendance(params, token);

// AttendanceTable auto-filters event_type === "attendance"
// and displays session metadata in the table
```

---

## Type Definitions

### AttendanceSession

```typescript
interface AttendanceSession {
  session_id: string | null;    // null when no active session
  room_id?: string;             // present when session active
  course_id?: string;           // present when session active
  started_at?: string;          // present when session active
  ended_at?: string | null;     // when session ended
  status: "active" | "closed" | "none";
  marked_count?: number;        // live count during session
}
```

### AttendanceRecord

```typescript
interface AttendanceRecord {
  timestamp: string;            // ISO datetime
  full_name: string | null;     // Student name
  matric_number: string | null; // Student ID
  course_code: string | null;   // Course code
  course_name: string | null;   // Course name
  event_type: "attendance";     // Always "attendance" in new reports
  session_id?: string;          // Which session
  session_name?: string;        // Session display name
  session_started_at?: string;  // When session began
  marked_at?: string;           // When attendance marked
}
```

---

## Error Handling Examples

### 409 Conflict - Session Already Active

```typescript
try {
  await startAttendanceSession({ room_id, course_id }, token);
} catch (err) {
  if (err.code === 409) {
    // Show: "An attendance session is already active for this room"
    // User should end it first
  }
}
```

### 403 Forbidden - User Not Authorized

```typescript
try {
  const session = await getActiveAttendanceSession(roomId, token);
} catch (err) {
  if (err.code === 403) {
    // Show: "You don't have permission to manage attendance for this room"
    // User needs to be assigned to the room
  }
}
```

### Handle "No Active Session" Response

```typescript
const session = await getActiveAttendanceSession(roomId, token);

if (session === null) {
  // No active session - show start form
} else {
  // Session is active - show session details and end button
}
```

---

## Testing Scenarios

### Happy Path
1. ✓ Select room and course
2. ✓ Start session → success toast, active indicator
3. ✓ Poll for session → shows marked_count updating
4. ✓ End session → shows total_marked, clears indicator
5. ✓ Query attendance report → shows marked records

### Error Cases
1. ✓ Try to start session without room → validation error
2. ✓ Try to start when already active → 409 error
3. ✓ Unauthorized user → 403 error
4. ✓ Invalid UUID format → 422 error
5. ✓ Network failure → handled by error handler

### Edge Cases
1. ✓ Page refresh while session active → polling restores state
2. ✓ Multiple users starting session for same room → 409 after first
3. ✓ Session ends from other user → polling detects and updates UI
4. ✓ Export CSV with session metadata → includes all columns
5. ✓ Filter report by specific session → returns only that session's records
