import React from 'react';
import { Alert } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/utils';
import { acknowledgeAlert } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

interface AlertFeedProps {
  alerts: Alert[];
  loading: boolean;
  onAcknowledge: (alertId: string) => void;
}

export default function AlertFeed({ alerts, loading, onAcknowledge }: AlertFeedProps) {
  const { token } = useAuth();
  const { showToast } = useToast();

  const handleAck = async (alertId: string) => {
    if (!token) return;
    try {
      onAcknowledge(alertId);
      await acknowledgeAlert(alertId, token);
      showToast('Alert acknowledged', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to acknowledge alert', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  if (alerts.length === 0) {
    return <EmptyState message="No active alerts" icon="✓" />;
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const isCritical = alert.severity === 'critical';
        return (
          <div 
            key={alert.alert_id} 
            className={`p-4 rounded-lg bg-surface border flex flex-col sm:flex-row items-start justify-between gap-4 border-l-4 ${isCritical ? 'border-l-danger border-border' : 'border-l-warning border-border'}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold uppercase tracking-wider ${isCritical ? 'text-danger' : 'text-warning'} truncate`}>
                  {alert.alert_type.replace('_', ' ')}
                </span>
                <span className="text-xs text-textMuted whitespace-nowrap">&bull; {formatDateTime(alert.triggered_at)}</span>
              </div>
              <p className="text-sm text-textBase break-words">{alert.message}</p>
            </div>
            
            <button 
              onClick={() => handleAck(alert.alert_id)}
              className="px-3 py-1.5 text-xs font-medium bg-surface2 hover:bg-border rounded text-textBase transition-colors shrink-0 self-end sm:self-center"
            >
              Acknowledge
            </button>
          </div>
        );
      })}
    </div>
  );
}
