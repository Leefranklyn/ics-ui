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
  
  const borderColor = isDanger 
    ? 'border-l-status-error' 
    : isWarning 
      ? 'border-l-status-warning' 
      : 'border-l-accent-indigo';
      
  const valueColor = isDanger 
    ? 'text-status-error' 
    : isWarning 
      ? 'text-status-warning' 
      : 'text-accent-cyan-bright';

  return (
    <div className={`card p-6 space-y-2 border-l-4 ${borderColor} group hover:border-border-focus overflow-hidden`}>
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider truncate">{title}</p>
      <p className={`text-2xl md:text-3xl font-bold font-mono ${valueColor} tracking-tight truncate`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-text-muted pt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
