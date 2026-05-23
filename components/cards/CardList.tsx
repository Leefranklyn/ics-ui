import React, { useState } from 'react';
import { User } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Pill from '@/components/ui/Pill';
import Modal from '@/components/ui/Modal';

interface CardListProps {
  users: User[];
  loading: boolean;
  onUpdateStatus: (userId: string, newStatus: string) => Promise<void>;
}

export default function CardList({ users, loading, onUpdateStatus }: CardListProps) {
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, user: User | null }>({ isOpen: false, user: null });
  const [updatingParams, setUpdatingParams] = useState<string | null>(null);

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    (u.matric_number && u.matric_number.toLowerCase().includes(search.toLowerCase()))
  );

  const handleConfirm = async () => {
    if (!confirmModal.user) return;
    const u = confirmModal.user;
    const newStatus = u.card_status === 'active' ? 'suspended' : 'active';
    
    setUpdatingParams(u.user_id);
    setConfirmModal({ isOpen: false, user: null });
    
    try {
      await onUpdateStatus(u.user_id, newStatus);
    } finally {
      setUpdatingParams(null);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface2/30">
        <h2 className="font-semibold text-textBase">User Cards Management</h2>
        <input 
          type="text" 
          placeholder="Search name or matric..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-1.5 text-sm focus:border-accent focus:outline-none w-full sm:w-64 text-textBase"
        />
      </div>

      <div className="overflow-x-auto w-full">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8">
            <EmptyState message="No users found" />
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surface2/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Matric No.</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(u => {
                const isActive = u.card_status === 'active';
                const isWorking = updatingParams === u.user_id;
                
                return (
                  <tr key={u.user_id} className="hover:bg-surface2/30">
                    <td className="px-4 py-3 font-medium text-textBase max-w-[150px] truncate" title={u.full_name}>{u.full_name}</td>
                    <td className="px-4 py-3 text-textMuted max-w-[150px] truncate" title={u.matric_number || ''}>{u.matric_number || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-textMuted">{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Pill label={u.card_status.toUpperCase()} variant={isActive ? 'green' : 'red'} />
                    </td>
                    <td className="px-4 py-3 text-textMuted">{u.department || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, user: u })}
                        disabled={isWorking}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          isActive 
                            ? 'text-danger hover:bg-danger/10 border border-transparent hover:border-danger/30' 
                            : 'text-success hover:bg-success/10 border border-transparent hover:border-success/30'
                        } disabled:opacity-50`}
                      >
                        {isWorking ? 'Updating...' : (isActive ? 'Suspend' : 'Reactivate')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, user: null })}
        title="Confirm Status Change"
        confirmLabel="Yes, Continue"
        onConfirm={handleConfirm}
      >
        <p>
          Are you sure you want to {confirmModal.user?.card_status === 'active' ? 'suspend' : 'reactivate'}{' '}
          the card for <strong>{confirmModal.user?.full_name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
