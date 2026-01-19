import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types/eeg';
import { AlertTriangle, AlertCircle, Info, Bell, CheckCircle2, History } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-alert/10',
    borderColor: 'border-alert/30',
    iconColor: 'text-alert',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    iconColor: 'text-warning',
  },
  info: {
    icon: Info,
    bgColor: 'bg-calm/10',
    borderColor: 'border-calm/30',
    iconColor: 'text-calm',
  },
};

const formatAlertTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const AlertsPanel = ({ alerts, onAcknowledge }: AlertsPanelProps) => {
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Alerts Sent</h3>
        </div>
        <div className="flex items-center gap-2">
          {unacknowledgedAlerts.length > 0 && (
            <span className="px-3 py-1 text-sm font-medium bg-alert text-alert-foreground rounded-full">
              {unacknowledgedAlerts.length} new
            </span>
          )}
          <Link to="/alerts">
            <Button variant="ghost" size="sm">
              <History className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success opacity-70" />
            <p className="font-medium">All clear</p>
            <p className="text-sm mt-1">No unusual patterns detected</p>
          </div>
        ) : (
          alerts.slice(0, 5).map(alert => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md",
                  config.bgColor,
                  config.borderColor,
                  alert.acknowledged && "opacity-60"
                )}
                onClick={() => !alert.acknowledged && onAcknowledge(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {formatAlertTime(alert.timestamp)}
                    </p>
                    <p className="text-foreground text-sm leading-relaxed">
                      <span className="font-semibold">Alert sent to caregivers:</span>{' '}
                      {alert.message}
                    </p>
                    {!alert.acknowledged && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Tap to acknowledge
                      </p>
                    )}
                    {alert.acknowledged && (
                      <p className="text-xs text-success mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Acknowledged
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {alerts.length > 0 && (
        <Link to="/alerts" className="block mt-4">
          <Button variant="outline" className="w-full">
            <History className="w-4 h-4" />
            View All Alert History
          </Button>
        </Link>
      )}
    </div>
  );
};
