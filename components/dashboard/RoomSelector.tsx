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
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
      <label htmlFor="room-select" className="text-sm font-semibold text-text-primary whitespace-nowrap">
        Select Room:
      </label>
      <select
        id="room-select"
        value={selectedRoomId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || rooms.length === 0}
        className="input min-w-[240px] disabled:opacity-50"
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
