import React from 'react';
import { AccessEvent } from '@/types';
import Pill from '@/components/ui/Pill';
import Skeleton from '@/components/ui/Skeleton';
import { formatTime } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

interface AccessLogTableProps {
  events: AccessEvent[];
  loading: boolean;
}

export default function AccessLogTable({ events, loading }: AccessLogTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 p-4 border-b border-border bg-surface2/50 text-sm font-medium text-textMuted">
          <span>Time</span>
          <span className="col-span-2">Name</span>
          <span>Matric No.</span>
          <span>Event</span>
          <span>Door</span>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-0">
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6 border border-border rounded-lg bg-surface">
        <EmptyState message="No recent access events" />
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-lg overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-surface2/50 text-textMuted border-b border-border">
          <tr>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Matric No.</th>
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Door</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((ev, i) => (
            <tr key={ev.log_id || i} className="hover:bg-surface2/30 transition-colors">
              <td className="px-4 py-3 text-textBase">{formatTime(ev.timestamp)}</td>
              <td className="px-4 py-3 text-textBase">{ev.full_name || 'Unknown'}</td>
              <td className="px-4 py-3 text-textMuted">{ev.matric_number || '-'}</td>
              <td className="px-4 py-3">
                <span className="capitalize text-textMuted">{ev.event_type}</span>
              </td>
              <td className="px-4 py-3">
                <span className="capitalize text-textBase">{ev.door_state}</span>
              </td>
              <td className="px-4 py-3">
                {ev.event_type === 'entry' && <Pill label="GRANTED" variant="green" />}
                {ev.event_type === 'exit' && <Pill label="EXIT" variant="blue" />}
                {ev.event_type === 'denied' && <Pill label="DENIED" variant="red" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
