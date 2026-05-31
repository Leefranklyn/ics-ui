import { 
  TokenResponse, RoomDashboardData, AttendanceRecord,
  AnalyticsData, Alert, User, Room, Course,
  RegisterCardPayload, LoginPayload, PaginatedResponse, ApiError, AttendanceSession
} from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://intelligent-classroom-saver-api.onrender.com';

/**
 * Generic request helper for API calls
 * Handles authentication headers, error responses, and JSON parsing
 */
async function request<T>(
  path: string, 
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, { ...options, headers });

  // Handle error responses
  if (!res.ok) {
    let err: ApiError;
    try {
      err = await res.json();
    } catch {
      err = {
        status: 'error',
        code: res.status,
        message: res.statusText || 'An error occurred',
      };
    }
    throw err;
  }
  
  return res.json() as Promise<T>;
}


/**
 * ========== AUTHENTICATION ==========
 */

/**
 * Login with email and password
 * Returns JWT access token for subsequent requests
 */
export const loginUser = async (payload: LoginPayload): Promise<TokenResponse> => {
  return request<TokenResponse>('/api/auth/login', null, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


/**
 * ========== DASHBOARD ==========
 */

/**
 * Get real-time room status including occupancy, environment, and recent events
 * Requires staff or admin role
 */
export const getRoomDashboard = async (roomId: string, token: string): Promise<RoomDashboardData> => {
  return request<RoomDashboardData>(`/api/dashboard/rooms/${roomId}`, token);
};


/**
 * ========== REPORTING ==========
 */

/**
 * Get attendance records for a room and date range
 * Returns array of access events with user and course information
 * Query params: room_id, date_from, date_to, format (json/csv), student_id, course_id
 */
export const getAttendance = async (params: URLSearchParams, token: string): Promise<AttendanceRecord[]> => {
  return request<AttendanceRecord[]>(`/api/reports/attendance?${params}`, token);
};


/**
 * ========== ANALYTICS ==========
 */

/**
 * Get energy consumption analytics for a room
 * Query params: date_from, date_to (ISO 8601 format)
 * Requires staff or admin role
 */
export const getEnergyAnalytics = async (roomId: string, params: URLSearchParams, token: string): Promise<AnalyticsData> => {
  return request<AnalyticsData>(`/api/analytics/energy/${roomId}?${params}`, token);
};


/**
 * ========== ALERTS ==========
 */

/**
 * Get list of alerts for accessible rooms
 * Query params: acknowledged (boolean), room_id (UUID)
 */
export const getAlerts = async (params: URLSearchParams, token: string): Promise<Alert[]> => {
  return request<Alert[]>(`/api/alerts?${params}`, token);
};

/**
 * Mark an alert as acknowledged
 */
export const acknowledgeAlert = async (alertId: string, token: string): Promise<{ alert_id: string; acknowledged: boolean }> => {
  return request<{ alert_id: string; acknowledged: boolean }>(`/api/alerts/${alertId}/acknowledge`, token, { method: 'PUT' });
};


/**
 * ========== ADMIN - CARDS ==========
 */

/**
 * Create a new card user
 * Requires admin role
 */
export const registerCard = async (payload: RegisterCardPayload, token: string): Promise<{ user_id: string }> => {
  return request<{ user_id: string }>('/api/admin/cards', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Update card status (active/suspended)
 * Requires admin role
 */
export const updateCardStatus = async (userId: string, status: string, token: string): Promise<{ status: string }> => {
  return request<{ status: string }>(`/api/admin/cards/${userId}/status`, token, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

/**
 * Get paginated list of all users
 * Requires admin role
 * Query params: page (default 1), limit (default 20, max 100)
 */
export const getUsers = async (params: URLSearchParams, token: string): Promise<PaginatedResponse<User>> => {
  return request<PaginatedResponse<User>>(`/api/admin/users?${params}`, token);
};


/**
 * ========== ADMIN - ROOMS ==========
 */

/**
 * Update room access time windows
 * Requires admin role
 */
export const updateTimeWindows = async (
  roomId: string,
  windows: Record<string, { start: string; end: string } | null>,
  token: string
): Promise<{ status: string }> => {
  return request<{ status: string }>(`/api/admin/rooms/${roomId}/windows`, token, {
    method: 'PUT',
    body: JSON.stringify({ time_windows: windows }),
  });
};

/**
 * ========== ADMIN - REGISTRATION ==========
 */

/**
 * Start a card registration session
 * ESP32 devices will detect this and display registration UI
 * Requires admin role
 */
export const startRegistration = async (
  payload: {
    full_name: string;
    email: string;
    role: 'student' | 'staff' | 'admin';
    matric_number?: string | null;
    department?: string | null;
    level?: number | null;
    assigned_rooms?: string[];
  },
  token: string
): Promise<{ session_id: string; status: string }> => {
  return request<{ session_id: string; status: string }>('/api/admin/registration/start', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Get current registration session status (for admin polling)
 * Frontend polls this to display live status updates as user taps card
 * Requires admin role
 */
export const getRegistrationStatus = async (token: string): Promise<{
  active: boolean;
  completed?: boolean;
  session_id?: string | null;
  full_name?: string | null;
  received_uid?: string | null;
}> => {
  return request<{
    active: boolean;
    completed?: boolean;
    session_id?: string | null;
    full_name?: string | null;
    received_uid?: string | null;
  }>('/api/admin/registration/status', token);
};

/**
 * Cancel the active registration session
 * Requires admin role
 */
export const cancelRegistration = async (token: string): Promise<{ status: string }> => {
  return request<{ status: string }>('/api/admin/registration', token, {
    method: 'DELETE',
  });
};


/**
 * ========== ADMIN - ATTENDANCE SESSIONS ==========
 */

/**
 * Start an attendance session for a room and course
 * Lecturers call this to begin marking attendance
 * Requires staff or admin role
 */
export const startAttendanceSession = async (
  payload: {
    room_id: string;
    course_id: string;
    session_name?: string;
  },
  token: string
): Promise<AttendanceSession> => {
  return request<AttendanceSession>('/api/admin/attendance/session/start', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * End/close an active attendance session
 * Lecturers call this when they're done taking attendance
 * Requires staff or admin role
 */
export const endAttendanceSession = async (
  sessionId: string,
  token: string
): Promise<{ session_id: string; ended_at: string; status: string; total_marked: number }> => {
  return request<{ session_id: string; ended_at: string; status: string; total_marked: number }>(
    `/api/admin/attendance/session/${sessionId}/end`,
    token,
    { method: 'PUT' }
  );
};

/**
 * Get active attendance session for a room
 * Returns the current active session if one exists, or null state if none
 * Response when active: { session_id, room_id, course_id, started_at, status: "active", marked_count }
 * Response when none: { session_id: null, status: "none" }
 * Requires staff or admin role
 */
export const getActiveAttendanceSession = async (
  roomId: string,
  token: string
): Promise<AttendanceSession | null> => {
  const response = await request<AttendanceSession>(
    `/api/admin/attendance/session/active?room_id=${roomId}`,
    token
  );
  
  // If session_id is null, no active session exists - return null
  if (response.session_id === null) {
    return null;
  }
  
  return response;
};


/**
 * Get courses for a specific room
 * Returns list of courses taught in that room
 * Requires staff or admin role
 */
export const getCoursesByRoom = async (roomId: string, token: string): Promise<Course[]> => {
  return request<Course[]>(`/api/admin/rooms/${roomId}/courses`, token);
};

/**
 * ========== UTILITIES ==========
 */

/**
 * Download attendance report as CSV
 * This performs a raw blob download instead of JSON parsing
 */
export async function downloadAttendanceCsv(params: URLSearchParams, token: string): Promise<Blob> {
  params.set('format', 'csv');
  const url = `${BASE}/api/reports/attendance?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      status: 'error',
      code: res.status,
      message: res.statusText || 'Failed to download CSV',
    }));
    throw error;
  }

  return res.blob();
}
