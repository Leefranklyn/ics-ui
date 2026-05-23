import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'normal' | 'warning' | 'danger';
}

export default function StatCard({ title, value, subtitle, variant = 'normal' }: StatCardProps) {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  
  const iconColor = isDanger 
    ? 'text-danger bg-danger/10' 
    : isWarning 
      ? 'text-warning bg-warning/10' 
      : 'text-accent bg-accent/10';

  return (
    <div className="p-6 rounded-xl bg-surface border border-border flex items-center gap-4 min-w-0">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
        <div className="w-5 h-5 rounded bg-current opacity-80" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-textMuted truncate" title={title}>{title}</p>
        <p className={`text-2xl font-bold mt-1 truncate ${isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-textBase'}`} title={String(value)}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-textMuted mt-1 truncate" title={subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
