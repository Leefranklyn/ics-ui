import React from 'react';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-surface2 animate-pulse rounded ${className}`} />
  );
}
