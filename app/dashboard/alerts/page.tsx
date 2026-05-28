'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInterval } from '@/hooks/useInterval';
import { getAlerts, getRoomDashboard } from '@/lib/api';
import { Alert, Room } from '@/types';
import AlertFeed from '@/components/dashboard/AlertFeed';

export default function AlertsPage() {
  const { token, user } = useAuth();
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState('');
  const [showAck, setShowAck] = useState(false);

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
      }
      setRooms(availableRooms);
    } catch (e) {
      console.error('Failed to initialize rooms:', e);
    }
  }, [token, user]);

  const loadAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const p = new URLSearchParams();
      if (roomId) p.set('room_id', roomId);
      p.set('acknowledged', showAck ? 'true' : 'false');
      
      const data = await getAlerts(p, token);
      setAlerts(data);
      
      // Update room name if we have a room filter
      if (roomId) {
        try {
          const roomData = await getRoomDashboard(roomId, token);
          setRooms(prev => prev.map(r => 
            r.room_id === roomId ? { ...r, room_name: roomData.room_name } : r
          ));
        } catch (err) {
          console.error('Failed to fetch room name:', err);
        }
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [token, roomId, showAck]);

  useEffect(() => {
    setLoading(true);
    loadAlerts();
  }, [loadAlerts]);

  useInterval(() => {
    loadAlerts();
  }, 30000);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Alerts</h1>
      
      <div className="bg-surface border border-border rounded-lg p-4 flex gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-textMuted mb-1">Room</label>
          <select 
            value={roomId} 
            onChange={e => setRoomId(e.target.value)}
            className="w-full bg-surface2 border border-border rounded px-3 py-1.5 text-sm"
          >
            <option value="">All Rooms</option>
            {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_name}</option>)}
          </select>
        </div>
        
        <label className="flex items-center gap-2 text-sm text-textBase cursor-pointer pb-1.5">
          <input 
            type="checkbox" 
            checked={showAck}
            onChange={e => setShowAck(e.target.checked)}
            className="rounded border-border bg-surface text-accent focus:ring-accent accent-accent"
          />
          Show Acknowledged
        </label>
      </div>

      {error ? (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded">
          {error}
        </div>
      ) : (
        <div className="max-w-4xl">
          <AlertFeed alerts={alerts} loading={loading} onAcknowledge={handleAcknowledge} />
        </div>
      )}
    </div>
  );
}
