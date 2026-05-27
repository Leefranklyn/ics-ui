# Frontend Integration with Real Backend API

This document outlines the integration changes made to connect the ICS Frontend with the real backend API.

## Overview

The frontend has been updated to replace all dummy data with real API calls to the Intelligent Classroom Saver backend API.

## Key Changes

### 1. API Configuration

**File: `.env.local`**
- Set `NEXT_PUBLIC_API_BASE` to the backend URL
- Default: `http://localhost:8000` for local development
- Production: `https://intelligent-classroom-saver-api.onrender.com`

### 2. Authentication

**Files Modified:**
- `context/AuthContext.tsx` - Now persists JWT tokens to localStorage
- `hooks/useAuth.ts` - Added hydration check for SSR compatibility
- `app/login/page.tsx` - Enhanced error handling

**Features:**
- Tokens are stored in localStorage and restored on page refresh
- Automatic token expiration detection
- Proper role-based routing (students → `/student`, others → `/dashboard`)

### 3. API Endpoints

**File: `lib/api.ts`**

All endpoints have been updated to call the real backend:

#### Authentication
- `POST /api/auth/login` - User login with email/password

#### Dashboard
- `GET /api/dashboard/rooms/{room_id}` - Real-time room status

#### Reports
- `GET /api/reports/attendance` - Attendance records for a room/date range
- `GET /api/reports/attendance?format=csv` - CSV export

#### Analytics
- `GET /api/analytics/energy/{room_id}` - Energy consumption data

#### Alerts
- `GET /api/alerts` - List of alerts (with optional filters)
- `PUT /api/alerts/{alert_id}/acknowledge` - Mark alert as acknowledged

#### Admin - Cards
- `POST /api/admin/cards` - Create new card user
- `PUT /api/admin/cards/{user_id}/status` - Update card status
- `GET /api/admin/users` - List users (paginated)

#### Admin - Rooms
- `PUT /api/admin/rooms/{room_id}/windows` - Update room access time windows

#### Admin - Registration (Tap-based)
- `POST /api/admin/registration/start` - Initiate card registration session
- `GET /api/admin/registration/status` - Poll for registration progress
- `DELETE /api/admin/registration` - Cancel registration session

### 4. Type Updates

**File: `types/index.ts`**

Updated types to match backend API responses:
- `EventType`: Changed from `'entry' | 'exit' | 'denied'` to match backend enum
- `DoorState`: Changed from `'opened' | 'closed'` to `'entry' | 'exit'`
- `AlertType`: Updated to match backend alert types
- `RoomDashboardData`: Adjusted to match backend response format
- `AttendanceRecord`: Simplified to match backend response structure
- `TokenPayload`: Made more flexible to accommodate various JWT fields

### 5. Page Updates

#### Dashboard (`app/dashboard/page.tsx`)
- Uses `user.rooms` from JWT for room selection
- Removed `getAllRooms()` call (not available in backend)
- Polls dashboard data every 10 seconds
- Real-time occupancy, temperature, and alert display

#### Attendance (`app/dashboard/attendance/page.tsx`)
- Uses real attendance data from backend
- Supports date range filtering
- CSV export functionality
- Query parameters: `room_id`, `date_from`, `date_to`, `format`, `student_id`, `course_id`

#### Analytics (`app/dashboard/analytics/page.tsx`)
- Fetches energy analytics from backend
- Displays runtime hours and estimated kWh
- Shows average temperature and humidity

#### Alerts (`app/dashboard/alerts/page.tsx`)
- Polls alerts every 30 seconds
- Supports room filtering and acknowledgment toggle
- Real-time severity-based styling

#### Cards (`app/dashboard/cards/page.tsx`)
- Lists all users with card status
- Two registration methods:
  1. **Direct Registration**: Admin enters card UID upfront
  2. **Tap-based Registration**: Admin starts session, waits for card tap (new feature)
- Update card status (active/suspended)

### 6. New Components

#### `RegistrationModal.tsx`
New modal component for tap-based card registration:
- Admin enters user details (name, email, role, etc.)
- Frontend initiates registration session via backend
- Polls `GET /api/admin/registration/status` every 2 seconds
- Displays confirmation when ESP32 taps card
- Automatically closes on success

**Usage:**
```tsx
<RegistrationModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={(uid) => console.log('Registered:', uid)}
  token={token}
/>
```

## Error Handling

The API layer now properly handles:
- 401 Unauthorized - Invalid/missing JWT token
- 403 Forbidden - User lacks required role
- 404 Not Found - Resource doesn't exist
- 422 Unprocessable Entity - Invalid request format
- 500 Internal Server Error - Server errors

Errors are caught and displayed as toasts in the UI.

## Token Management

### Storage
- Tokens stored in `localStorage` under key `ics_auth_token`
- Automatically restored on page reload
- Expires based on `exp` claim in JWT

### Headers
- All authenticated requests include: `Authorization: Bearer <token>`
- Content-Type: `application/json`

## Room Assignment

The system expects rooms to be provided in the JWT token's `rooms` claim. Currently:
- Each user has a list of accessible rooms
- Frontend uses `user.rooms` to populate room selectors
- If no rooms are available, user sees an error message

To set room assignments, use the backend `/api/admin/cards` endpoint with `assigned_rooms` parameter.

## Environment Variables

### Development
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### Production
```bash
NEXT_PUBLIC_API_BASE=https://intelligent-classroom-saver-api.onrender.com
```

## Testing

### Test Credentials
Contact your administrator for test user credentials with different roles:
- **Admin**: Full access to all features
- **Staff**: Dashboard, analytics, alerts, attendance reports
- **Student**: Limited dashboard access

### Mock Data Removed
All mock/dummy data has been removed. The following assumptions apply:
- Backend API is running and accessible at configured URL
- Database contains valid test data
- ESP32 devices can reach the same backend for integration testing

## Deployment Checklist

- [ ] Update `NEXT_PUBLIC_API_BASE` to production backend URL
- [ ] Verify JWT token format matches expected payload
- [ ] Test all authentication flows
- [ ] Verify API endpoints are accessible from frontend
- [ ] Test CORS configuration if needed
- [ ] Verify localStorage is working in production
- [ ] Test token expiration and refresh handling
- [ ] Verify error messages are user-friendly

## Troubleshooting

### "No rooms available" error
- Check that user JWT includes `rooms` claim
- Verify backend is returning room assignments for the user

### API 401 errors
- Token may have expired - log out and log back in
- Check token is being stored in localStorage
- Verify `Authorization` header is being sent

### API 403 errors
- User may lack required role
- Check user's role in backend database
- Verify role is correctly decoded from JWT

### API 422 errors
- Invalid request format
- Check request parameters match API documentation
- Verify date formats are ISO 8601

## API Documentation

Full API documentation is available in the backend repository:
- Base URL: https://intelligent-classroom-saver-api.onrender.com
- Endpoints: See backend README.md for comprehensive endpoint documentation
- Auth: Bearer token (JWT) in Authorization header

## Future Enhancements

Potential improvements:
- [ ] Implement token refresh endpoint
- [ ] Add request retry logic with exponential backoff
- [ ] Implement request caching
- [ ] Add real-time WebSocket support for live updates
- [ ] Implement optimistic UI updates
- [ ] Add offline mode with sync
