import { 
  TokenResponse, RoomDashboardData, AttendanceRecord,
  AnalyticsData, Alert, User, Room, Course,
  RegisterCardPayload, LoginPayload, PaginatedResponse, ApiError
} from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_BASE;
const USE_DUMMY_DATA = true; // Toggle this to false when the backend is ready

// --- Dummy Data Helpers ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkBpY3MuY29tIiwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluIFVzZXIifQ.DUMMY_SIGNATURE';
// (Decoded payload: { sub: "1234567890", email: "admin@ics.com", role: "admin", name: "Admin User" })

const dummyUserToken = (role: string) => `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({sub: "123", email: `${role}@ics.com`, role: role, name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`}))}.DUMMY_SIGNATURE`;

// --- End Dummy Data Helpers ---

async function request<T>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: 'error',
      code: res.status,
      message: res.statusText,
    }));
    throw err;
  }
  return res.json() as Promise<T>;
}

// Auth
export const loginUser = async (payload: LoginPayload): Promise<TokenResponse> => {
  if (USE_DUMMY_DATA) {
    await delay(500);
    // Allow 'admin', 'staff', 'student' as password to test different roles
    const role = (payload.password || 'admin').toLowerCase();
    const validRoles = ['admin', 'staff', 'student'];
    const assignedRole = validRoles.includes(role) ? role : 'admin';
    return { access_token: dummyUserToken(assignedRole), token_type: 'Bearer' };
  }
  return request<TokenResponse>('/api/auth/login', null, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Dashboard
export const getRoomDashboard = async (roomId: string, token: string): Promise<RoomDashboardData> => {
  if (USE_DUMMY_DATA) {
    await delay(300);
    return {
      room_id: roomId,
      room_name: `Room ${roomId}`,
      current_occupancy: Math.floor(Math.random() * 50),
      capacity: 100,
      lock_state: Math.random() > 0.5 ? 'locked' : 'unlocked',
      ac_setpoint: 22,
      temperature: 22 + Math.random() * 4,
      humidity: 45 + Math.random() * 10,
      recent_events: []
    };
  }
  return request<RoomDashboardData>(`/api/dashboard/rooms/${roomId}`, token);
};

// Attendance
export const getAttendance = async (params: URLSearchParams, token: string): Promise<AttendanceRecord[]> => {
  if (USE_DUMMY_DATA) {
    await delay(400);
    return [
      {
        log_id: 'log1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        full_name: 'John Doe',
        matric_number: '123456',
        course_code: 'CS101',
        course_name: 'Introduction to CS',
        event_type: 'entry',
        door_state: 'opened'
      },
      {
        log_id: 'log2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        full_name: 'Jane Smith',
        matric_number: '654321',
        course_code: 'CS102',
        course_name: 'Data Structures',
        event_type: 'entry',
        door_state: 'opened'
      }
    ];
  }
  return request<AttendanceRecord[]>(`/api/reports/attendance?${params}`, token);
};

// Analytics
export const getEnergyAnalytics = async (roomId: string, params: URLSearchParams, token: string): Promise<AnalyticsData> => {
  if (USE_DUMMY_DATA) {
    await delay(400);
    return {
      room_id: roomId,
      date_from: params.get('date_from') || new Date().toISOString(),
      date_to: params.get('date_to') || new Date().toISOString(),
      runtime_hours: 12.5,
      estimated_kwh: 11.9,
      avg_temperature: 24.3,
      avg_humidity: 45.2
    } as AnalyticsData;
  }
  return request<AnalyticsData>(`/api/analytics/energy/${roomId}?${params}`, token);
};

// Alerts
export const getAlerts = async (params: URLSearchParams, token: string): Promise<Alert[]> => {
  if (USE_DUMMY_DATA) {
    await delay(300);
    return [
      {
        alert_id: 'a1',
        room_id: 'Room A',
        alert_type: 'unauth_attempt',
        severity: 'critical',
        message: 'Unknown RFID tag scanned.',
        triggered_at: new Date().toISOString(),
        acknowledged: false
      },
      {
        alert_id: 'a2',
        room_id: 'Room B',
        alert_type: 'hw_fault',
        severity: 'warning',
        message: 'AC unit not responding.',
        triggered_at: new Date(Date.now() - 86400000).toISOString(),
        acknowledged: true
      }
    ];
  }
  return request<Alert[]>(`/api/alerts?${params}`, token);
};

export const acknowledgeAlert = async (alertId: string, token: string): Promise<void> => {
  if (USE_DUMMY_DATA) {
    await delay(200);
    return;
  }
  return request<void>(`/api/alerts/${alertId}/acknowledge`, token, { method: 'PUT' });
};

// Admin — Cards
export const registerCard = async (payload: RegisterCardPayload, token: string): Promise<{ user_id: string }> => {
  if (USE_DUMMY_DATA) {
    await delay(400);
    return { user_id: 'new-user-123' };
  }
  return request<{ user_id: string }>('/api/admin/cards', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateCardStatus = async (userId: string, status: string, token: string): Promise<void> => {
  if (USE_DUMMY_DATA) {
    await delay(300);
    return;
  }
  return request<void>(`/api/admin/cards/${userId}/status`, token, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const getUsers = async (params: URLSearchParams, token: string): Promise<PaginatedResponse<User>> => {
  if (USE_DUMMY_DATA) {
    await delay(300);
    return {
      items: [
        { user_id: '123', full_name: 'John Doe', email: 'john@ics.com', role: 'student', card_status: 'active', department: 'CS', level: 100, assigned_rooms: [], created_at: new Date().toISOString(), matric_number: '12345' },
        { user_id: '456', full_name: 'Jane Smith', email: 'jane@ics.com', role: 'staff', card_status: 'suspended', department: 'EE', level: null, assigned_rooms: ['Room A'], created_at: new Date().toISOString(), matric_number: null }
      ],
      total: 2,
      page: 1,
      limit: 10,
    };
  }
  return request<PaginatedResponse<User>>(`/api/admin/users?${params}`, token);
};

// Admin — Rooms
export const updateTimeWindows = async (roomId: string, windows: object, token: string): Promise<void> => {
  if (USE_DUMMY_DATA) {
    await delay(300);
    return;
  }
  return request<void>(`/api/admin/rooms/${roomId}/windows`, token, {
    method: 'PUT',
    body: JSON.stringify({ time_windows: windows }),
  });
};

// Rooms and Courses (for dropdowns)
export const getAllRooms = async (token: string): Promise<Room[]> => {
  if (USE_DUMMY_DATA) {
    await delay(200);
    return [
      { room_id: 'Room A', room_name: 'Room A', capacity: 30, lock_state: 'locked', current_occupancy: 0, ac_setpoint: 22, time_windows: {}, assigned_staff: [] },
      { room_id: 'Room B', room_name: 'Room B', capacity: 40, lock_state: 'unlocked', current_occupancy: 5, ac_setpoint: 24, time_windows: {}, assigned_staff: [] }
    ];
  }
  return request<Room[]>('/api/admin/users', token); // as per prompt instructions!
};

export const getCoursesByRoom = async (roomId: string, token: string): Promise<Course[]> => {
  if (USE_DUMMY_DATA) {
    await delay(200);
    return [
      { id: 'CS101', name: 'Intro to Computer Science' },
      { id: 'EE200', name: 'Circuits 101' }
    ] as any;
  }
  return request<Course[]>(`/api/courses?room_id=${roomId}`, token);
};

// CSV export — returns raw Response, not JSON
export async function downloadAttendanceCsv(params: URLSearchParams, token: string) {
  if (USE_DUMMY_DATA) {
    await delay(500);
    const csvContent = "id,user_id,course_id,room_id,check_in_time,check_out_time,status\n1,123,CS101,Room A,2023-10-01T08:00:00Z,2023-10-01T09:00:00Z,PRESENT";
    return new Blob([csvContent], { type: 'text/csv' });
  }
  params.set('format', 'csv');
  const res = await fetch(`${BASE}/api/reports/attendance?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.blob();
}
