export type Role = 'student' | 'staff' | 'admin';

export type CardStatus = 'active' | 'suspended';

export type EventType = 'entry' | 'exit' | 'denied' | 'attendance';

export type DoorState = 'entry' | 'exit';

export type LockState = 'locked' | 'unlocked';

export type AlertType =
  | 'temperature_high'
  | 'temperature_low'
  | 'humidity_high'
  | 'humidity_low'
  | 'occupancy_critical'
  | 'network_outage'
  | 'hw_fault'
  | 'unauth_attempt';

export type Severity = 'warning' | 'critical';

export type SessionStatus = 'active' | 'closed';

export interface AttendanceSession {
  session_id: string;
  room_id: string;
  course_id: string;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
  marked_count?: number;
}

export interface TokenPayload {
  sub: string; // User UUID
  role: Role;
  email?: string;
  name?: string;
  rooms?: string[]; // Optional: accessible room IDs
  exp?: number; // Expiration timestamp
  [key: string]: any; // Allow other fields from backend
}

export interface AuthState {
  token: string | null;
  user: TokenPayload | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export interface Room {
  room_id: string;
  room_name: string;
  capacity: number;
  lock_state: LockState;
  current_occupancy: number;
  ac_setpoint: number;
  time_windows: Record<string, { open: string; close: string }>;
  assigned_staff: string[];
}

export interface RoomDashboardData {
  room_id: string;
  room_name: string;
  current_occupancy: number;
  capacity: number;
  lock_state: LockState;
  ac_setpoint: number;
  temperature: number | null;
  humidity: number | null;
  recent_events: Array<{
    full_name: string | null;
    matric_number: string | null;
    event_type: EventType;
    timestamp: string;
    door_state: DoorState;
  }>;
}

export interface AccessEvent {
  log_id: string;
  user_id: string | null;
  room_id: string;
  course_id: string | null;
  event_type: EventType;
  card_uid: string;
  door_state: DoorState;
  timestamp: string;
  synced_at: string;
  full_name?: string;
  matric_number?: string;
  course_code?: string;
  course_name?: string;
}

export interface Alert {
  alert_id: string;
  room_id: string;
  alert_type: AlertType;
  severity: Severity;
  message: string;
  acknowledged: boolean;
  triggered_at: string;
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  matric_number: string | null;
  role: Role;
  card_status: CardStatus;
  department: string | null;
  level: number | null;
  assigned_rooms: string[];
  created_at: string;
}

export interface Course {
  course_id: string;
  course_code: string;
  course_name: string;
  room_id: string;
  lecturer_id: string;
  schedule: {
    day: string;
    start_time: string;
    duration_mins: number;
  };
  semester: string;
  academic_year: string;
}

export interface AttendanceRecord {
  timestamp: string;
  full_name: string | null;
  matric_number: string | null;
  course_code: string | null;
  event_type: EventType;
  session_id?: string;
  session_name?: string;
  session_started_at?: string;
  marked_at?: string;
}

export interface AnalyticsData {
  room_id: string;
  date_from: string;
  date_to: string;
  runtime_hours: number;
  estimated_kwh: number;
  avg_temperature: number;
  avg_humidity: number;
}

export interface RegisterCardPayload {
  full_name: string;
  email: string;
  matric_number?: string;
  role: Role;
  raw_card_uid: string;
  department?: string;
  level?: number;
  assigned_rooms?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  status: 'error';
  code: number;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
