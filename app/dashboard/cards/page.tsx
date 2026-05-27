'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { getUsers, registerCard, updateCardStatus } from '@/lib/api';
import { User, RegisterCardPayload } from '@/types';
import { useToast } from '@/components/ui/Toast';
import RegisterCardForm from '@/components/cards/RegisterCardForm';
import RegistrationModal from '@/components/cards/RegistrationModal';
import CardList from '@/components/cards/CardList';

export default function CardsPage() {
  useRequireAuth('admin');
  const { token } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function init() {
      if (!token) return;
      try {
        const u = await getUsers(new URLSearchParams({ limit: '100', page: '1' }), token);
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
      const u = await getUsers(new URLSearchParams({ limit: '100', page: '1' }), token);
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

  const handleRegistrationSuccess = (uid: string) => {
    showToast(`User registered successfully with card UID: ${uid}`, 'success');
    setShowRegistrationModal(false);
    // Refetch users
    async function refetchUsers() {
      if (!token) return;
      try {
        const u = await getUsers(new URLSearchParams({ limit: '100', page: '1' }), token);
        setUsers(u.items || []);
      } catch (err: any) {
        console.error('Failed to refetch users:', err);
      }
    }
    refetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Card Management</h1>
        <button
          onClick={() => setShowRegistrationModal(true)}
          className="px-4 py-2 rounded text-sm font-medium bg-accent hover:bg-accentDim text-white transition-colors"
        >
          + Tap to Register
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RegisterCardForm 
            rooms={[]}  // Rooms are optional for registration
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

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
        token={token}
      />
    </div>
  );
}
