import React from 'react';
import { AttendanceRecord } from '@/types';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pill from '@/components/ui/Pill';
import { formatDateTime } from '@/lib/utils';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export default function AttendanceTable({ records, loading, total, page, limit, onPageChange }: AttendanceTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-2 last:mb-0" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return <EmptyState message="No attendance records found for the selected filters." />;
  }

  return (
    <div className="w-full bg-surface border border-border rounded-lg p-4 overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="text-textMuted border-b border-border">
          <tr>
            <th className="font-medium pb-3 pr-4">Timestamp</th>
            <th className="font-medium pb-3 pr-4">Name</th>
            <th className="font-medium pb-3 pr-4">Matric No.</th>
            <th className="font-medium pb-3 pr-4">Course</th>
            <th className="font-medium pb-3 pr-4">Event Type</th>
            <th className="font-medium pb-3">Door State</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map(rec => (
            <tr key={rec.log_id} className="hover:bg-surface2/20">
              <td className="py-3 pr-4 whitespace-nowrap">{formatDateTime(rec.timestamp)}</td>
              <td className="py-3 pr-4 max-w-[150px] truncate" title={rec.full_name}>{rec.full_name}</td>
              <td className="py-3 pr-4 text-textMuted max-w-[120px] truncate" title={rec.matric_number}>{rec.matric_number}</td>
              <td className="py-3 pr-4 max-w-[120px] truncate" title={rec.course_code}>{rec.course_code}</td>
              <td className="py-3 pr-4">
                <Pill 
                  label={rec.event_type.toUpperCase()} 
                  variant={rec.event_type === 'entry' ? 'green' : rec.event_type === 'exit' ? 'blue' : 'red'} 
                />
              </td>
              <td className="py-3 capitalize text-textMuted">{rec.door_state}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
    </div>
  );
}
