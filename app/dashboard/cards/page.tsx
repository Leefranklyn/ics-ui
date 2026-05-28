'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { getUsers, updateCardStatus } from '@/lib/api';
import { User } from '@/types';
import { useToast } from '@/components/ui/Toast';
import RegistrationModal from '@/components/cards/RegistrationModal';
import CardList from '@/components/cards/CardList';

export default function CardsPage() {
  useRequireAuth('admin');
  const { token } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

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
        <h1 className="text-3xl font-bold text-text-primary">User Card Management</h1>
        <button
          onClick={() => setShowRegistrationModal(true)}
          className="btn-primary"
        >
          + Register User
        </button>
      </div>
      
      <CardList 
        users={users} 
        loading={loadingUsers} 
        onUpdateStatus={handleStatusUpdate} 
      />

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
        token={token}
      />
    </div>
  );
}
