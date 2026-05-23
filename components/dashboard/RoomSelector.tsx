import React from 'react';
import { Room } from '@/types';

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onChange: (roomId: string) => void;
  disabled?: boolean;
}

export default function RoomSelector({ rooms, selectedRoomId, onChange, disabled }: RoomSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="room-select" className="text-sm font-medium text-textMuted">
        Room:
      </label>
      <select
        id="room-select"
        value={selectedRoomId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || rooms.length === 0}
        className="bg-surface border border-border text-textBase text-sm rounded focus:outline-none focus:border-accent px-3 py-1.5 min-w-[200px] disabled:opacity-50"
      >
        {rooms.length === 0 && <option value="">No rooms available</option>}
        {rooms.map((room) => (
          <option key={room.room_id} value={room.room_id}>
            {room.room_name} 
          </option>
        ))}
      </select>
    </div>
  );
}
