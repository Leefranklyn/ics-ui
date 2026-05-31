# Attendance System Redesign - Backend Requirements

## Overview
The attendance system is being redesigned to implement a session-based model. Instead of marking all card taps as attendance, the system now requires a lecturer to explicitly open an attendance session first. Only during an active session will card taps mark attendance records.

## Key Changes

### 1. Attendance Session Management

#### 1.1 Create/Open Attendance Session
- **Endpoint**: `POST /api/admin/attendance/session/start`
- **Authorization**: Staff/Admin role (lecturer)
- **Request Body**:
  ```json
  {
    "room_id": "uuid-string",
    "course_id": "uuid-string",
    "session_name": "Monday Class - Week 5" (optional)
  }
  ```
- **Response**:
  ```json
  {
    "session_id": "uuid-string",
    "room_id": "uuid-string",
    "course_id": "uuid-string",
    "started_at": "2026-05-31T14:00:00Z",
    "status": "active"
  }
  ```
- **Database**: Store in new `attendance_sessions` table with fields: `session_id`, `room_id`, `course_id`, `opened_by`, `started_at`, `ended_at`, `status` (active/closed)

#### 1.2 Close/End Attendance Session
- **Endpoint**: `PUT /api/admin/attendance/session/{session_id}/end`
- **Authorization**: Staff/Admin role
- **Response**:
  ```json
  {
    "session_id": "uuid-string",
    "ended_at": "2026-05-31T15:00:00Z",
    "status": "closed",
    "total_marked": 42
  }
  ```
- **Database**: Update `ended_at` and set `status` to 'closed'

#### 1.3 Get Active Session for Room
- **Endpoint**: `GET /api/admin/attendance/session/active?room_id={room_id}`
- **Authorization**: Staff/Admin role
- **Response**:
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
- **Response if no active session**: `{ "session_id": null, "status": "none" }`

### 2. Card Tap Processing Logic

#### 2.1 When User Taps Card
**Current behavior (from access log endpoint)**:
1. Check if there's an active attendance session for the room
2. **If session is active**:
   - Check if this user has already been marked for THIS session (query `attendance_records` where `session_id = active_session_id` and `user_id = tapped_user_id`)
   - If NOT yet marked: Create attendance record + grant access
   - If already marked: Just grant access (don't mark again)
   - Event type should be stored as `"attendance"` (new value, not `entry`/`exit`)
3. **If NO session is active**:
   - Grant normal entry/exit access (existing behavior)
   - Event type is `"entry"` or `"exit"` based on door state
   - Do NOT create attendance record

#### 2.2 Database Changes
- Add to `access_logs` or create new `attendance_records` table:
  - `attendance_record_id`: UUID (primary key)
  - `session_id`: UUID (foreign key to attendance_sessions)
  - `user_id`: UUID (student/staff who tapped card)
  - `room_id`: UUID
  - `course_id`: UUID
  - `marked_at`: Timestamp
  - `marked_by_card_uid`: String (card UID that triggered the mark)
  - Unique constraint: `(session_id, user_id)` - ensures one mark per user per session

### 3. Attendance Report Changes

#### 3.1 Update Attendance Endpoint
- **Endpoint**: `GET /api/reports/attendance` (UPDATED logic)
- **Query Parameters**:
  - `room_id`: UUID (required)
  - `date_from`: ISO 8601 (required)
  - `date_to`: ISO 8601 (required)
  - `course_id`: UUID (optional)
  - `session_id`: UUID (optional - filter by specific session)
  - `format`: 'json' or 'csv' (default: 'json')
  - `student_id`: UUID (optional)
- **Response** (should now return ONLY attendance records from sessions, not entry/exit logs):
  ```json
  [
    {
      "timestamp": "2026-05-31T14:05:00Z",
      "full_name": "John Doe",
      "matric_number": "ST/001/2024",
      "course_code": "CS101",
      "session_id": "uuid-string",
      "session_name": "Monday Class - Week 5",
      "session_started_at": "2026-05-31T14:00:00Z",
      "event_type": "attendance",
      "marked_at": "2026-05-31T14:05:00Z"
    }
  ]
  ```
  
#### 3.2 Key Differences from Previous Attendance Records
- **No more entry/exit records**: The attendance report should ONLY include records marked during active sessions
- **New field `session_id`**: Links back to the attendance session
- **New field `session_name`**: Display friendly name
- **New field `session_started_at`**: Shows when the session opened
- **Event type will always be `"attendance"`**: Not entry/exit anymore
- **Remove `door_state` field**: Not relevant for attendance records

### 4. Data Migration

If migrating from old system:
- Old entry/exit logs remain in `access_logs` table (unmodified)
- New attendance records go to separate `attendance_records` table
- Attendance endpoint will query `attendance_records` instead of filtering `access_logs`

### 5. Edge Cases

1. **Session active but user card not recognized**: Allow access but don't mark attendance (normal access denial logic)
2. **User taps multiple times during session**: Only mark once (enforce unique constraint)
3. **Session ends**: No more attendance marks can be created for that session
4. **Concurrent sessions in different rooms**: Each room can have its own independent session
5. **Room with multiple courses**: Each course gets its own session (separate session IDs)

### 6. Example User Flow

**Scenario**: Lecturer opening attendance for Monday's 2 PM class in Room 101

1. **2:00 PM**: Lecturer calls `POST /api/admin/attendance/session/start` with:
   - room_id: "room-101"
   - course_id: "cs101-mon-2pm"
   - session_name: "CS101 - Monday Lecture Week 5"
   - Response: `{ session_id: "sess-abc123", status: "active" }`

2. **2:01 PM**: First student taps card:
   - System checks: Is there active session for room-101? YES → `sess-abc123`
   - Has this user been marked before? NO
   - Action: Create attendance record + grant entry
   - Response to ESP32: "Access Granted - Attendance Marked"

3. **2:05 PM**: Same student taps card again (on exit):
   - System checks: Is there active session for room-101? YES → `sess-abc123`
   - Has this user been marked before? YES
   - Action: Only grant exit, don't mark attendance again
   - Response to ESP32: "Access Granted"

4. **2:50 PM**: Lecturer ends session:
   - Calls `PUT /api/admin/attendance/session/sess-abc123/end`
   - Response shows: 45 students marked for attendance

5. **Later**: Admin pulls attendance report:
   - Calls `GET /api/reports/attendance?room_id=room-101&date_from=2026-05-31&date_to=2026-05-31`
   - Gets only the 45 attendance records from the session
   - No entry/exit logs included

## API Summary

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| POST | `/api/admin/attendance/session/start` | Open attendance session | Staff/Admin |
| PUT | `/api/admin/attendance/session/{id}/end` | Close attendance session | Staff/Admin |
| GET | `/api/admin/attendance/session/active?room_id={id}` | Check active session | Staff/Admin |
| GET | `/api/reports/attendance` | Get attendance records (UPDATED) | Staff/Admin |

## Testing Checklist

- [ ] Can lecturer open attendance session
- [ ] Can lecturer close attendance session
- [ ] User taps card during active session → marked once
- [ ] User taps card multiple times → only marked once
- [ ] User taps card when NO session active → normal entry/exit behavior
- [ ] Attendance report shows only session attendance (not entry/exit)
- [ ] Attendance report includes session_id and session metadata
- [ ] Concurrent sessions in different rooms work independently
- [ ] Attendance records have unique constraint on (session_id, user_id)
- [ ] CSV export includes all new fields

## Frontend Expected Behavior

- Lecturer will see session status in dashboard/attendance pages
- Button to open/close attendance session
- Attendance table will only display attendance records (event_type: "attendance")
- Session name and timing visible in records
- Card tap responses will be: "Access Granted - Attendance Marked" or just "Access Granted"
