'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInterval } from '@/hooks/useInterval';
import { getRoomDashboard, getAlerts } from '@/lib/api';
import { Room, RoomDashboardData, Alert } from '@/types';
import RoomSelector from '@/components/dashboard/RoomSelector';
import StatCard from '@/components/dashboard/StatCard';
import AccessLogTable from '@/components/dashboard/AccessLogTable';
import AlertFeed from '@/components/dashboard/AlertFeed';

export default function DashboardPage() {
  const { token, user } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  
  const [data, setData] = useState<RoomDashboardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rooms and default selection
  useEffect(() => {
    async function loadRooms() {
      if (!token || !user) return;
      try {
        let availableRooms: Room[] = [];
        
        // Try to get rooms from JWT token
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
        
        // If no rooms available, provide a placeholder
        if (availableRooms.length === 0) {
          setError('No rooms available. Please contact your administrator.');
        }
        
        setRooms(availableRooms);
        
        const savedRoomId = sessionStorage.getItem('selectedRoomId');
        if (savedRoomId && availableRooms.some(r => r.room_id === savedRoomId)) {
          setSelectedRoomId(savedRoomId);
        } else if (availableRooms.length > 0) {
          setSelectedRoomId(availableRooms[0].room_id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load rooms');
      }
    }
    loadRooms();
  }, [token, user]);

  const loadDashboard = useCallback(async () => {
    if (!token || !selectedRoomId) return;
    try {
      const dbData = await getRoomDashboard(selectedRoomId, token);
      setData(dbData);
      
      const q = new URLSearchParams({ room_id: selectedRoomId, acknowledged: 'false' });
      const activeAlerts = await getAlerts(q, token);
      setAlerts(activeAlerts);
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedRoomId, token]);

  // Initial load when room changes
  useEffect(() => {
    if (selectedRoomId) {
      setLoading(true);
      loadDashboard();
      sessionStorage.setItem('selectedRoomId', selectedRoomId);
    }
  }, [selectedRoomId, loadDashboard]);

  // Poll
  useInterval(() => {
    loadDashboard();
  }, selectedRoomId ? 10000 : null);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
  };

  const getOccupancyVariant = () => {
    if (!data) return 'normal';
    const percent = data.capacity > 0 ? (data.current_occupancy / data.capacity) * 100 : 0;
    if (percent > 100) return 'danger';
    if (percent >= 80) return 'warning';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <RoomSelector 
          rooms={rooms} 
          selectedRoomId={selectedRoomId} 
          onChange={setSelectedRoomId}
          disabled={loading && !data}
        />
      </div>

      {error ? (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded text-danger">
          Error: {error}
        </div>
      ) : null}

      {!selectedRoomId ? (
        <div className="text-textMuted py-8">Select a room to view dashboard.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Occupancy" 
              value={data ? `${data.current_occupancy} / ${data.capacity}` : '-'}
              subtitle="Current / Max"
              variant={getOccupancyVariant()}
            />
            <StatCard 
              title="Temperature" 
              value={data && data.temperature !== null ? `${data.temperature.toFixed(1)}°C` : '-'}
              subtitle={`Setpoint: ${data?.ac_setpoint || '-'}°C`}
              variant={data && data.temperature !== null && data.temperature > 35 ? 'danger' : 'normal'}
            />
            <StatCard 
              title="Door State" 
              value={data ? (data.lock_state === 'locked' ? 'Locked' : 'Unlocked') : '-'}
              subtitle={data?.lock_state === 'unlocked' ? 'Warning: Door Unlocked' : 'Secure'}
              variant={data?.lock_state === 'unlocked' ? 'warning' : 'normal'}
            />
            <StatCard 
              title="Active Alerts" 
              value={alerts.length}
              variant={alerts.length > 0 ? 'warning' : 'normal'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Recent Access</h2>
              <AccessLogTable 
                events={(data?.recent_events as any) || []} 
                loading={loading && !data} 
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Alert Feed</h2>
              <AlertFeed 
                alerts={alerts} 
                loading={loading && !data} 
                onAcknowledge={handleAcknowledge}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
