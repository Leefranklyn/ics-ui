import React from 'react';

type PillVariant = 'green' | 'red' | 'amber' | 'blue' | 'gray';

interface PillProps {
  label: string;
  variant: PillVariant;
}

const variantStyles: Record<PillVariant, string> = {
  green: 'bg-success/20 text-success border border-success/30',
  red: 'bg-danger/20 text-danger border border-danger/30',
  amber: 'bg-warning/20 text-warning border border-warning/30',
  blue: 'bg-accent/20 text-accent border border-accent/30',
  gray: 'bg-surface2 text-textMuted border border-border',
};

export default function Pill({ label, variant }: PillProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}
