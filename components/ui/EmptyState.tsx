import React, { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-textMuted border border-dashed border-border rounded-lg bg-surface/50 px-4 text-center">
      {icon && <div className="mb-3 text-3xl opacity-50">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
}
