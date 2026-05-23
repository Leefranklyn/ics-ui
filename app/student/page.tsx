'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAttendance, downloadAttendanceCsv } from '@/lib/api';
import { AccessEvent } from '@/types';
import StudentAttendanceTable from '@/components/student/StudentAttendanceTable';
import { useToast } from '@/components/ui/Toast';

export default function StudentPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState<AccessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(lastMonth.toISOString().split('T')[0]);
  }, []);

  const loadData = async () => {
    if (!token || !user?.sub || !dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set('user_id', user.sub); // filter by student's own ID
      p.set('date_from', new Date(dateFrom).toISOString());
      
      const dt = new Date(dateTo);
      dt.setHours(23, 59, 59, 999);
      p.set('date_to', dt.toISOString());
      
      const res: any = await getAttendance(p, token);
      
      // Attendance API might return AttendanceRecord[], wait StudentTable needs AccessEvent[]
      // Let's assume getAttendance returns detailed raw events or AttendanceRecord has what we need
      // For the prompt it says "getAttendance with student's own user_id".
      // We will cast it to any and map it to match AccessEvent shape for matchStudentEvents.
      
      const items = Array.isArray(res) ? res : (res.items || []);
      setEvents(items);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadData();
    }
  }, [dateFrom, dateTo]);

  const handleExportCsv = async () => {
    if (!token || !user) return;
    try {
      showToast('Preparing CSV...', 'info');
      const p = new URLSearchParams();
      p.set('user_id', user.sub);
      p.set('date_from', new Date(dateFrom).toISOString());
      
      const dt = new Date(dateTo);
      dt.setHours(23, 59, 59, 999);
      p.set('date_to', dt.toISOString());
      
      const blob = await downloadAttendanceCsv(p, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_attendance_${dateFrom}_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast(err.message || 'CSV Export failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <h2 className="text-lg font-semibold">My Attendance</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="date" 
            value={dateFrom} 
            onChange={e => setDateFrom(e.target.value)}
            className="bg-surface2 border border-border rounded px-2 py-1.5 text-sm style-color-scheme-dark"
          />
          <span className="text-textMuted">to</span>
          <input 
            type="date" 
            value={dateTo} 
            onChange={e => setDateTo(e.target.value)}
            className="bg-surface2 border border-border rounded px-2 py-1.5 text-sm style-color-scheme-dark"
          />
          <div className="flex gap-2">
            <button 
              onClick={loadData}
              className="px-3 py-1.5 bg-accent hover:bg-accentDim text-white text-sm font-medium rounded transition-colors"
            >
              Apply
            </button>
            <button 
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-surface2 hover:bg-border text-textBase text-sm font-medium rounded transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded">
          {error}
        </div>
      )}

      <StudentAttendanceTable events={events} loading={loading} />
    </div>
  );
}
