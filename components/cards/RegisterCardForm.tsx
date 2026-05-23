import React, { useState } from 'react';
import { Role, RegisterCardPayload, Room } from '@/types';

interface RegisterCardFormProps {
  rooms: Room[];
  onSubmit: (payload: RegisterCardPayload) => Promise<void>;
  loading: boolean;
}

export default function RegisterCardForm({ rooms, onSubmit, loading }: RegisterCardFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [cardUid, setCardUid] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [assignedRooms, setAssignedRooms] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      full_name: fullName,
      email,
      matric_number: role === 'student' ? matricNumber : undefined,
      role,
      raw_card_uid: cardUid,
      department: department || undefined,
      level: role === 'student' && level ? parseInt(level, 10) : undefined,
      assigned_rooms: ['staff', 'admin'].includes(role) ? assignedRooms : undefined
    });

    // Reset on success handled by parent if needed, but we can do it here if it doesn't throw
    setFullName('');
    setEmail('');
    setMatricNumber('');
    setCardUid('');
    setDepartment('');
    setLevel('');
    setAssignedRooms([]);
  };

  const toggleRoom = (id: string) => {
    setAssignedRooms(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border p-6 rounded-lg space-y-4">
      <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4">Register New Card</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-textMuted mb-1">Full Name *</label>
          <input required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-textMuted mb-1">Email *</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-textMuted mb-1">Role *</label>
          <select required value={role} onChange={e => setRole(e.target.value as Role)} className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase">
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-textMuted mb-1">Card UID (Hex) *</label>
          <input required value={cardUid} onChange={e => setCardUid(e.target.value)} placeholder="e.g. 1A 2B 3C 4D" className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase uppercase" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {role === 'student' && (
          <>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Matric Number *</label>
              <input required={role==='student'} value={matricNumber} onChange={e => setMatricNumber(e.target.value)} className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Level (e.g. 100) *</label>
              <input type="number" required={role==='student'} value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase" />
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-textMuted mb-1">Department</label>
          <input value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-surface2 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent text-textBase" />
        </div>
      </div>

      {['staff', 'admin'].includes(role) && (
        <div className="pt-2">
          <label className="block text-sm font-medium text-textMuted mb-2">Assigned Rooms</label>
          <div className="bg-surface2 border border-border rounded p-3 h-32 overflow-y-auto grid grid-cols-1 gap-2">
            {rooms.length === 0 && <span className="text-textMuted text-sm">No rooms available</span>}
            {rooms.map(room => (
              <label key={room.room_id} className="flex items-center gap-2 text-sm text-textBase cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={assignedRooms.includes(room.room_id)}
                  onChange={() => toggleRoom(room.room_id)}
                  className="rounded border-border bg-surface text-accent focus:ring-accent accent-accent"
                />
                {room.room_name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-accent hover:bg-accentDim text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register User'}
        </button>
      </div>
    </form>
  );
}
