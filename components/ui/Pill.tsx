import React from 'react';

type PillVariant = 'green' | 'red' | 'amber' | 'blue' | 'gray';

interface PillProps {
  label: string;
  variant: PillVariant;
}

const variantStyles: Record<PillVariant, string> = {
  green: 'badge badge-success',
  red: 'badge badge-error',
  amber: 'badge badge-warning',
  blue: 'badge bg-cyan-950/20 text-cyan-400 border border-cyan-900/50',
  gray: 'badge bg-border-subtle text-text-muted border border-border-default',
};

export default function Pill({ label, variant }: PillProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
