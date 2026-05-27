'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Role } from '@/types';
import Modal from '@/components/ui/Modal';
import { startRegistration, getRegistrationStatus, cancelRegistration } from '@/lib/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uid: string) => void;
  token: string | null;
}

export default function RegistrationModal({ isOpen, onClose, onSuccess, token }: RegistrationModalProps) {
  const [step, setStep] = useState<'form' | 'waiting'>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [matricNumber, setMatricNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [receivedUid, setReceivedUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Poll for registration status
  useEffect(() => {
    if (step === 'waiting' && token) {
      const poll = async () => {
        try {
          const status = await getRegistrationStatus(token);
          if (status.completed && status.received_uid) {
            setReceivedUid(status.received_uid);
            if (pollInterval.current) clearInterval(pollInterval.current);
            // Auto-close after 2 seconds
            setTimeout(() => {
              onSuccess(status.received_uid!);
              handleClose();
            }, 2000);
          }
        } catch (err: any) {
          console.error('Failed to poll registration status:', err);
        }
      };

      poll(); // Initial poll
      pollInterval.current = setInterval(poll, 2000);
      return () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
      };
    }
  }, [step, token, onSuccess]);

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      await startRegistration({
        full_name: fullName,
        email,
        role,
        matric_number: role === 'student' ? matricNumber : null,
        department: department || null,
        level: role === 'student' && level ? parseInt(level, 10) : null,
        assigned_rooms: []
      }, token);

      setStep('waiting');
    } catch (err: any) {
      setError(err.message || 'Failed to start registration');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (token) {
      try {
        await cancelRegistration(token);
      } catch (err) {
        console.error('Failed to cancel registration:', err);
      }
    }
    handleClose();
  };

  const handleClose = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    setStep('form');
    setFullName('');
    setEmail('');
    setRole('student');
    setMatricNumber('');
    setDepartment('');
    setLevel('');
    setReceivedUid(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'form' ? 'Register New User' : 'Waiting for Card Tap'}>
      {step === 'form' ? (
        <form onSubmit={handleStartRegistration} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Full Name *</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Role *</label>
              <select
                required
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase"
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Matric Number *</label>
                <input
                  required={role === 'student'}
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase"
                />
              </div>
            )}
            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Level (e.g. 100) *</label>
                <input
                  type="number"
                  required={role === 'student'}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded text-sm font-medium border border-border hover:bg-surface2 text-textBase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded text-sm font-medium bg-accent hover:bg-accentDim text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Registration'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>

          <h3 className="text-lg font-semibold text-textBase">
            {receivedUid ? '✓ Card Registered!' : 'Waiting for Card Tap...'}
          </h3>

          {receivedUid ? (
            <p className="text-sm text-textMuted">
              Card UID: <span className="font-mono text-accent">{receivedUid}</span>
            </p>
          ) : (
            <p className="text-sm text-textMuted">
              Please tap the card on the ESP32 reader to register the user.
            </p>
          )}

          {error && (
            <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {!receivedUid && (
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded text-sm font-medium border border-border hover:bg-surface2 text-textBase transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
