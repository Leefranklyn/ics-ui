# ICS Frontend - Quick Start Guide

## Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running (local or remote)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update API base URL if needed (edit .env.local)
# NEXT_PUBLIC_API_BASE=http://localhost:8000  # for local backend
# NEXT_PUBLIC_API_BASE=https://api.example.com  # for remote backend
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Login

1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter credentials (requires valid backend database entries)
3. Based on role:
   - **Admin** → Dashboard with full access
   - **Staff** → Dashboard with room management
   - **Student** → Student dashboard with limited features

### Dashboard

**Available for:** Admin, Staff

- View real-time room status (occupancy, temperature, lock state)
- See recent access events
- Monitor active alerts
- Acknowledge alerts

### Attendance Reports

**Available for:** Admin, Staff

- Filter by room and date range
- View detailed attendance records
- Export to CSV

### Analytics

**Available for:** Admin, Staff

- View energy consumption for a room
- Display average temperature and humidity
- Analyze runtime hours and estimated kWh

### Alerts

**Available for:** Admin, Staff

- View all system alerts
- Filter by severity and room
- Acknowledge alerts
- Auto-refresh every 30 seconds

### Card Management

**Available for:** Admin only

#### Direct Registration
1. Fill in user details
2. Enter card UID (from ESP32 reader)
3. Click "Register User"
4. User is created immediately

#### Tap-based Registration
1. Click "+ Tap to Register" button
2. Fill in user details (name, email, role, etc.)
3. Click "Start Registration"
4. ESP32 display enters registration mode
5. User taps card on ESP32 reader
6. Card UID is received and user is created
7. Confirmation message appears

### Room Time Windows

**Available for:** Admin only

*Note: Currently not implemented in UI, but available via API*

## Architecture

### Key Files

```
app/
├── login/page.tsx                    # Login page
├── dashboard/
│   ├── page.tsx                      # Main dashboard
│   ├── attendance/page.tsx           # Attendance reports
│   ├── analytics/page.tsx            # Energy analytics
│   ├── alerts/page.tsx               # Alert management
│   └── cards/page.tsx                # Card user management
│
components/
├── dashboard/                        # Dashboard components
├── attendance/                       # Attendance components
├── analytics/                        # Analytics charts
├── cards/
│   ├── RegisterCardForm.tsx         # Direct card registration
│   ├── RegistrationModal.tsx        # Tap-based registration (NEW)
│   └── CardList.tsx                 # User list
│
context/
├── AuthContext.tsx                  # Authentication state (UPDATED)
│
hooks/
├── useAuth.ts                       # Auth hook (UPDATED)
├── useInterval.ts                   # Polling hook
│
lib/
├── api.ts                           # API client (UPDATED)
├── auth.ts                          # JWT utilities
└── utils.ts                         # Helper functions
│
types/
└── index.ts                         # TypeScript types (UPDATED)
```

### Data Flow

```
User Login
    ↓
API: POST /api/auth/login
    ↓
Receive JWT token
    ↓
Store in localStorage
    ↓
Decode JWT → Extract user info
    ↓
Update AuthContext
    ↓
Route to appropriate page
    ↓
Pages use useAuth() hook
    ↓
Include token in API requests
    ↓
Handle responses/errors
```

## API Integration Points

### Authentication
- **POST** `/api/auth/login` - Login endpoint
- Token stored in `localStorage`
- Validated on app startup

### Dashboard
- **GET** `/api/dashboard/rooms/{room_id}` - Real-time data
- Polls every 10 seconds
- Requires staff/admin role

### Alerts
- **GET** `/api/alerts` - List alerts
- **PUT** `/api/alerts/{alert_id}/acknowledge` - Acknowledge
- Polls every 30 seconds

### Attendance
- **GET** `/api/reports/attendance` - Attendance records
- Supports filters and CSV export

### Analytics
- **GET** `/api/analytics/energy/{room_id}` - Energy data

### Admin - Cards
- **GET** `/api/admin/users` - List all users
- **POST** `/api/admin/cards` - Create user with card UID
- **PUT** `/api/admin/cards/{user_id}/status` - Update status

### Admin - Registration
- **POST** `/api/admin/registration/start` - Start registration
- **GET** `/api/admin/registration/status` - Poll status
- **DELETE** `/api/admin/registration` - Cancel registration

## Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### API Connection Refused
- Verify backend is running
- Check `NEXT_PUBLIC_API_BASE` in `.env.local`
- Try `http://localhost:8000` for local backend

### Login Failed
- Verify user exists in backend database
- Check credentials are correct
- Look for error message in UI

### Hydration Errors
- Clear browser cache
- Delete `.next` folder and rebuild:
  ```bash
  rm -rf .next && npm run dev
  ```

### Token Expired
- Automatically happens after 30 minutes (default)
- Click logout and log back in
- Token is stored in localStorage

## Development Tips

### Enable Debug Logging
Add to `lib/api.ts`:
```typescript
console.log('Request:', path, headers);
console.log('Response:', response);
```

### Test Different Roles
- Edit `.env.local` to test different endpoints
- Use different user accounts with different roles

### Monitor Network Requests
- Open DevTools (F12)
- Go to Network tab
- Watch API calls to backend

### Test Offline Mode
- DevTools → Network → Offline
- Watch for error handling

## Build for Production

```bash
npm run build
npm run start
```

Or deploy to Vercel:
```bash
vercel
```

## Environment Variables

Required for production:
```bash
NEXT_PUBLIC_API_BASE=https://intelligent-classroom-saver-api.onrender.com
```

Optional:
```bash
NODE_ENV=production
```

## Support

For issues or questions:
1. Check INTEGRATION.md for detailed API documentation
2. Review backend API docs: [Backend README](../ics-backend/README.md)
3. Check network requests in DevTools
4. Look for error messages in console and UI

## Next Steps

- [ ] Connect to real backend instance
- [ ] Create test users in backend
- [ ] Setup ESP32 device for testing
- [ ] Test end-to-end registration flow
- [ ] Verify all API endpoints work
- [ ] Test with actual card reader data
