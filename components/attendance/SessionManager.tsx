'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceSession, Room, Course } from '@/types';
import { startAttendanceSession, endAttendanceSession, getActiveAttendanceSession } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';

interface SessionManagerProps {
  roomId: string | null;
  courseId: string | null;
  rooms: Room[];
  courses: Course[];
  token: string | null;
  onSessionChange?: (session: AttendanceSession | null) => void;
}

export default function SessionManager({
  roomId,
  courseId,
  rooms,
  courses,
  token,
  onSessionChange
}: SessionManagerProps) {
  const { showToast } = useToast();
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionName, setSessionName] = useState('');

  // Check for active session when room changes
  useEffect(() => {
    if (!roomId || !token) {
      setActiveSession(null);
      return;
    }

    const checkActiveSession = async () => {
      try {
        const session = await getActiveAttendanceSession(roomId, token);
        setActiveSession(session);
        onSessionChange?.(session);
      } catch (err: any) {
        console.error('Failed to check active session:', err);
      }
    };

    checkActiveSession();

    // Poll every 5 seconds to check for session changes
    const interval = setInterval(checkActiveSession, 5000);
    return () => clearInterval(interval);
  }, [roomId, token, onSessionChange]);

  const handleStartSession = async () => {
    if (!roomId || !courseId || !token) {
      showToast('Please select both room and course', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        room_id: roomId,
        course_id: courseId,
        session_name: sessionName || undefined,
      };

      const session = await startAttendanceSession(payload, token);
      setActiveSession(session);
      setSessionName('');
      showToast(`Attendance session started`, 'success');
      onSessionChange?.(session);
    } catch (err: any) {
      showToast(err.message || 'Failed to start session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession || !activeSession.session_id || !token) return;

    setLoading(true);
    try {
      const result = await endAttendanceSession(activeSession.session_id, token);
      setActiveSession(null);
      showToast(`Attendance session ended. ${result.total_marked} students marked.`, 'success');
      onSessionChange?.(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to end session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const room = rooms.find(r => r.room_id === roomId);
  const course = courses.find(c => c.course_id === courseId);

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Attendance Session</h3>

      {activeSession ? (
        // Session Active
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-300">Session Active</span>
            </div>
            <div className="text-sm space-y-1">
              {activeSession.room_id && (
                <p className="text-textMuted">
                  <span className="font-medium">Room:</span> {room?.room_name || activeSession.room_id}
                </p>
              )}
              {activeSession.course_id && (
                <p className="text-textMuted">
                  <span className="font-medium">Course:</span> {course?.course_code || activeSession.course_id}
                </p>
              )}
              {activeSession.started_at && (
                <p className="text-textMuted">
                  <span className="font-medium">Started:</span> {formatDateTime(activeSession.started_at)}
                </p>
              )}
              <p className="text-textMuted">
                <span className="font-medium">Students Marked:</span> {activeSession.marked_count || 0}
              </p>
            </div>
          </div>

          <button
            onClick={handleEndSession}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-medium py-2 px-4 rounded transition"
          >
            {loading ? 'Ending Session...' : 'End Attendance Session'}
          </button>
        </div>
      ) : (
        // No Session Active
        <div className="space-y-4">
          <p className="text-sm text-textMuted">
            No active attendance session. Start a new session to begin marking attendance.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-textMuted mb-1">
                Session Name (Optional)
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                placeholder="e.g., Monday Lecture - Week 5"
                className="w-full bg-surface2 border border-border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading || !roomId || !courseId}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-surface2 disabled:text-textMuted text-white font-medium py-2 px-4 rounded transition"
            >
              {loading ? 'Starting Session...' : 'Start Attendance Session'}
            </button>

            {(!roomId || !courseId) && (
              <p className="text-xs text-red-400">
                Please select both room and course to start a session.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
