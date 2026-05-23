import React from 'react';
import { matchStudentEvents } from '@/lib/utils';
import { AccessEvent } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface StudentAttendanceTableProps {
  events: AccessEvent[];
  loading: boolean;
}

export default function StudentAttendanceTable({ events, loading }: StudentAttendanceTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg p-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2 last:mb-0" />)}
      </div>
    );
  }

  const matched = matchStudentEvents(events);

  if (matched.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-surface p-8">
         <EmptyState message="No attendance records found for this period." />
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-lg overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-surface2/50 text-textMuted border-b border-border">
          <tr>
            <th className="px-4 py-3 font-medium">Course Code</th>
            <th className="px-4 py-3 font-medium">Course Name</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Check-in Time</th>
            <th className="px-4 py-3 font-medium">Check-out Time</th>
            <th className="px-4 py-3 font-medium">Duration (mins)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {matched.map((m, i) => (
            <tr key={i} className="hover:bg-surface2/30">
              <td className="px-4 py-3 font-medium text-textBase max-w-[120px] truncate" title={m.courseCode}>{m.courseCode}</td>
              <td className="px-4 py-3 text-textMuted max-w-[200px] truncate" title={m.courseName}>{m.courseName}</td>
              <td className="px-4 py-3 text-textBase">{m.date}</td>
              <td className="px-4 py-3 text-success font-medium">{m.checkIn}</td>
              <td className="px-4 py-3 text-textMuted">{m.checkOut}</td>
              <td className="px-4 py-3 text-textBase">{m.duration > 0 ? m.duration : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
