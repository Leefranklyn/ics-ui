import React, { useState, useEffect } from 'react';
import { Room, Course } from '@/types';

interface FilterBarProps {
  rooms: Room[];
  courses: Course[];
  onFilter: (params: URLSearchParams) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
}

export default function FilterBar({ rooms, courses, onFilter, onExportCsv, onExportPdf }: FilterBarProps) {
  const [roomId, setRoomId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  // Default dates
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(lastWeek.toISOString().split('T')[0]);
    
    const savedRoomId = sessionStorage.getItem('selectedRoomId') || '';
    if (savedRoomId) setRoomId(savedRoomId);
  }, []);

  const handleApply = () => {
    if (roomId) sessionStorage.setItem('selectedRoomId', roomId);
    
    const p = new URLSearchParams();
    if (roomId) p.set('room_id', roomId);
    if (courseId) p.set('course_id', courseId);
    if (dateFrom) p.set('date_from', new Date(dateFrom).toISOString());
    // for dateTo include end of day
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      p.set('date_to', d.toISOString());
    }
    if (search) p.set('search', search);

    onFilter(p);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-end">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 w-full">
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Room</label>
          <select 
            value={roomId} 
            onChange={e => setRoomId(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-2 py-1.5 text-sm"
          >
            <option value="">All Rooms</option>
            {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Course</label>
          <select 
            value={courseId} 
            onChange={e => setCourseId(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-2 py-1.5 text-sm"
          >
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_code}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Date From</label>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={e => setDateFrom(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-2 py-1.5 text-sm style-color-scheme-dark"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Date To</label>
          <input 
            type="date" 
            value={dateTo} 
            onChange={e => setDateTo(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-2 py-1.5 text-sm style-color-scheme-dark"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Student / Matric</label>
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-surface2 border border-border rounded px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      
      <div className="flex gap-2 shrink-0">
        <button 
          onClick={handleApply}
          className="px-3 py-1.5 bg-accent hover:bg-accentDim text-white text-sm font-medium rounded transition-colors"
        >
          Apply Filters
        </button>
        <button 
          onClick={onExportCsv}
          className="px-3 py-1.5 bg-surface2 hover:bg-border text-textBase text-sm font-medium rounded transition-colors"
        >
          CSV
        </button>
        <button 
          onClick={onExportPdf}
          className="px-3 py-1.5 bg-surface2 hover:bg-border text-textBase text-sm font-medium rounded transition-colors"
        >
          PDF
        </button>
      </div>
    </div>
  );
}
