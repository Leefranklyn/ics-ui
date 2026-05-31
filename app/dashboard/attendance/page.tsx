'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FilterBar from '@/components/attendance/FilterBar';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import SessionManager from '@/components/attendance/SessionManager';
import { getAttendance, downloadAttendanceCsv, getRoomDashboard } from '@/lib/api';
import { AttendanceRecord, Room, ApiError, AttendanceSession } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import Pill from '@/components/ui/Pill';

export default function AttendancePage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  
  const lastParams = useRef<URLSearchParams>(new URLSearchParams());
  
  // Data for PDF
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !user) return;
    try {
      let availableRooms: Room[] = [];
      if (user.rooms && Array.isArray(user.rooms)) {
        availableRooms = user.rooms.map(id => ({
          room_id: id, 
          room_name: `Room ${id}`, 
          capacity: 0, 
          lock_state: 'locked' as const,
          current_occupancy: 0, 
          ac_setpoint: 0, 
          time_windows: {}, 
          assigned_staff: []
        }));
        
        // Fetch actual room names in parallel
        (async () => {
          try {
            const roomDataPromises = availableRooms.map(room =>
              getRoomDashboard(room.room_id, token).catch(() => null)
            );
            const roomDataResults = await Promise.all(roomDataPromises);
            
            const updatedRooms = availableRooms.map((room, idx) => ({
              ...room,
              room_name: roomDataResults[idx]?.room_name || room.room_name
            }));
            setRooms(updatedRooms);
          } catch (err) {
            console.error('Failed to fetch room names:', err);
          }
        })();
      }
      
      if (availableRooms.length === 0) {
        setError('No rooms available. Please contact your administrator.');
      }
      
      setRooms(availableRooms);
    } catch (e) {
      console.error('Failed to initialize rooms:', e);
    }
  }, [token, user]);

  const loadData = async (params: URLSearchParams) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res: any = await getAttendance(params, token);
      // Backend returns array directly
      if (Array.isArray(res)) {
        setRecords(res);
        setTotal(res.length);
      } else {
        setRecords(res.items || []);
        setTotal(res.total || 0);
      }
      
      // Update room name if we have a room filter
      const roomId = params.get('room_id');
      if (roomId && token) {
        try {
          const roomData = await getRoomDashboard(roomId, token);
          setRooms(prev => prev.map(r => 
            r.room_id === roomId ? { ...r, room_name: roomData.room_name } : r
          ));
        } catch (err) {
          console.error('Failed to fetch room name:', err);
        }
      }
      
      lastParams.current = params;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (p: URLSearchParams) => {
    const roomId = p.get('room_id');
    if (roomId !== selectedRoomId) {
      setSelectedRoomId(roomId);
    }
    p.set('page', '1');
    p.set('limit', limit.toString());
    loadData(p);
  };

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(lastParams.current.toString());
    params.set('page', p.toString());
    loadData(params);
  };

  const handleExportCsv = async () => {
    if (!token) return;
    try {
      showToast('Preparing CSV...', 'info');
      const blob = await downloadAttendanceCsv(lastParams.current, token);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const roomName = rooms.find(r => r.room_id === lastParams.current.get('room_id'))?.room_name || 'AllRooms';
      const df = lastParams.current.get('date_from') ? new Date(lastParams.current.get('date_from')!).toISOString().split('T')[0] : 'Any';
      const dt = lastParams.current.get('date_to') ? new Date(lastParams.current.get('date_to')!).toISOString().split('T')[0] : 'Any';
      
      a.download = `attendance_${roomName.replace(/\s+/g,'_')}_${df}_${dt}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast(err.message || 'CSV Export failed', 'error');
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleSessionRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleSessionCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Reports</h1>

      <SessionManager 
        roomId={selectedRoomId}
        courseId={selectedCourseId}
        rooms={rooms}
        courses={[]}
        token={token}
        userRole={user?.role}
        onRoomChange={handleSessionRoomChange}
        onCourseChange={handleSessionCourseChange}
        onSessionChange={setActiveSession}
      />

      <FilterBar 
        rooms={rooms} 
        courses={[]}
        onFilter={handleFilter}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded text-danger">
          {error}
        </div>
      )}

      {/* Screen View */}
      <div className="print:hidden">
        <AttendanceTable 
          records={records} 
          loading={loading}
          total={total}
          page={parseInt(lastParams.current.get('page') || '1', 10)}
          limit={limit}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Hidden Print View */}
      <div className="hidden print:block bg-white text-black p-8 fixed inset-0 z-50 overflow-visible" ref={printRef}>
        <h1 className="text-2xl font-bold mb-4">Attendance Report</h1>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="pb-2">Time</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Matric No.</th>
              <th className="pb-2">Course</th>
              <th className="pb-2">Event Type</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={`${rec.timestamp}-${idx}`} className="border-b border-gray-300">
                <td className="py-2 pr-2">{formatDateTime(rec.timestamp)}</td>
                <td className="py-2 pr-2">{rec.full_name}</td>
                <td className="py-2 pr-2">{rec.matric_number}</td>
                <td className="py-2 pr-2">{rec.course_code}</td>
                <td className="py-2 capitalize">{rec.event_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
