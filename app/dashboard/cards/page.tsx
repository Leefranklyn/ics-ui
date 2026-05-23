'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { getAllRooms, getUsers, registerCard, updateCardStatus } from '@/lib/api';
import { Room, User, RegisterCardPayload } from '@/types';
import { useToast } from '@/components/ui/Toast';
import RegisterCardForm from '@/components/cards/RegisterCardForm';
import CardList from '@/components/cards/CardList';

export default function CardsPage() {
  useRequireAuth('admin');
  const { token } = useAuth();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function init() {
      if (!token) return;
      try {
        const [r, u] = await Promise.all([
          getAllRooms(token),
          getUsers(new URLSearchParams({ limit: '1000' }), token) // Fetch all for prototype
        ]);
        setRooms(r);
        setUsers(u.items || []);
      } catch (err: any) {
        showToast(err.message || 'Failed to load data', 'error');
      } finally {
        setLoadingUsers(false);
      }
    }
    init();
  }, [token, showToast]);

  const handleRegister = async (payload: RegisterCardPayload) => {
    if (!token) return;
    setRegistering(true);
    try {
      const res = await registerCard(payload, token);
      showToast(`User registered successfully (ID: ${res.user_id})`, 'success');
      // Refetch
      const u = await getUsers(new URLSearchParams({ limit: '1000' }), token);
      setUsers(u.items || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to register card', 'error');
      throw err; // throw to prevent form reset if it failed
    } finally {
      setRegistering(false);
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    if (!token) return;
    try {
      await updateCardStatus(userId, newStatus, token);
      showToast('Card status updated', 'success');
      setUsers(prev => 
        prev.map(u => u.user_id === userId ? { ...u, card_status: newStatus as 'active' | 'suspended' } : u)
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Card Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RegisterCardForm 
            rooms={rooms} 
            onSubmit={handleRegister} 
            loading={registering} 
          />
        </div>
        <div className="lg:col-span-2">
          <CardList 
            users={users} 
            loading={loadingUsers} 
            onUpdateStatus={handleStatusUpdate} 
          />
        </div>
      </div>
    </div>
  );
}
