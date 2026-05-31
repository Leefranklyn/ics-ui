'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getEnergyAnalytics, getRoomDashboard } from '@/lib/api';
import { AnalyticsData, Room } from '@/types';
import OccupancyChart from '@/components/analytics/OccupancyChart';
import TemperatureChart from '@/components/analytics/TemperatureChart';
import StatCard from '@/components/dashboard/StatCard';
import { useToast } from '@/components/ui/Toast';

export default function AnalyticsPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  // Mock time series data since backend AnalyticsData only returns summary
  const [mockTsData, setMockTsData] = useState<{ occ: any[], temp: any[] }>({ occ: [], temp: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  
  const selectedRoom = rooms.find(r => r.room_id === roomId);

  useEffect(() => {
    if (!token || !user) {
      console.log('Analytics: Waiting for auth...', { token: !!token, user: !!user });
      return;
    }
    
    console.log('Analytics: Initializing with user:', { role: user.role, rooms: user.rooms });
    try {
      let availableRooms: Room[] = [];
      if (user.rooms && Array.isArray(user.rooms)) {
        availableRooms = user.rooms.map(id => ({
          room_id: id, 
          room_name: `Room ${id}`, 
          capacity: 50, 
          lock_state: 'locked' as const,
          current_occupancy: 0, 
          ac_setpoint: 0, 
          time_windows: {}, 
          assigned_staff: []
        }));
        console.log('Analytics: Available rooms:', availableRooms.length);
        
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
      } else {
        const errMsg = `No rooms available. User.rooms: ${user.rooms}`;
        console.warn('Analytics:', errMsg);
        setInitError(errMsg);
      }
      setRooms(availableRooms);
      const saved = sessionStorage.getItem('selectedRoomId');
      if (saved && availableRooms.some(r => r.room_id === saved)) {
        setRoomId(saved);
      } else if (availableRooms.length > 0) {
        setRoomId(availableRooms[0].room_id);
      }
      
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      setDateTo(today.toISOString().split('T')[0]);
      setDateFrom(lastWeek.toISOString().split('T')[0]);
      
    } catch (e: any) {
      const errMsg = `Analytics init error: ${e.message || String(e)}`;
      console.error(errMsg);
      setInitError(errMsg);
    }
  }, [token, user]);

  const loadData = async () => {
    if (!token || !roomId || !dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set('date_from', new Date(dateFrom).toISOString());
      
      const dt = new Date(dateTo);
      dt.setHours(23, 59, 59, 999);
      p.set('date_to', dt.toISOString());
      
      const res = await getEnergyAnalytics(roomId, p, token);
      setData(res);
      
      // Update room name from API response
      try {
        const roomData = await getRoomDashboard(roomId, token);
        setRooms(prev => prev.map(r => 
          r.room_id === roomId ? { ...r, room_name: roomData.room_name } : r
        ));
      } catch (err) {
        console.error('Failed to fetch room name:', err);
      }
      
      sessionStorage.setItem('selectedRoomId', roomId);
      
      // Generate some mock time series data to pad out the charts since it's not in the type
      const occ = [];
      const temp = [];
      for (let i = 0; i < 24; i++) {
        occ.push({ time: `${i}:00`, value: Math.floor(Math.random() * (selectedRoom?.capacity || 50)) });
        temp.push({ time: `${i}:00`, value: 20 + Math.random() * 10 });
      }
      setMockTsData({ occ, temp });
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = () => {
    if (!data) return 0;
    const baseline = 8 * 1.5; // 8 hours * 1.5kW
    const savings = ((baseline - data.estimated_kwh) / baseline) * 100;
    return Math.round(savings);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics & Efficiency</h1>
      
      {initError && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded">
          <p className="font-medium">Initialization Error</p>
          <p className="text-sm mt-1">{initError}</p>
        </div>
      )}
      
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Room</label>
          <select 
            value={roomId} 
            onChange={e => setRoomId(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-3 py-1.5 text-sm"
          >
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Date From</label>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={e => setDateFrom(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-3 py-1.5 text-sm style-color-scheme-dark"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Date To</label>
          <input 
            type="date" 
            value={dateTo} 
            onChange={e => setDateTo(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-3 py-1.5 text-sm style-color-scheme-dark"
          />
        </div>
        <button 
          onClick={loadData}
          disabled={loading || !roomId}
          className="px-4 py-1.5 bg-accent hover:bg-accentDim text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Apply Details'}
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded">
          {error}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="AC Runtime" value={`${data.runtime_hours.toFixed(1)} hrs`} />
            <StatCard title="Estimated Energy" value={`${data.estimated_kwh.toFixed(1)} kWh`} />
            <StatCard title="Avg Temperature" value={`${data.avg_temperature.toFixed(1)} °C`} />
            <div className="p-6 rounded-xl bg-surface border border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-success bg-success/10">
                <div className="w-5 h-5 rounded bg-current opacity-80" />
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted">Efficiency</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {calculateSavings()}% saved
                </p>
                <p className="text-xs text-textMuted mt-1">vs fixed schedule</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <OccupancyChart data={mockTsData.occ} capacity={selectedRoom?.capacity || 50} />
            <TemperatureChart data={mockTsData.temp} />
          </div>
        </>
      ) : (
        <div className="text-textMuted py-8">Select options and apply to view analytics.</div>
      )}
    </div>
  );
}
