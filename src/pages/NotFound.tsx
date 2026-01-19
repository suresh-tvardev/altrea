import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Calendar,
  AlertTriangle, 
  AlertCircle, 
  Info,
  CheckCircle2,
  FileText,
  X
} from 'lucide-react';
import type { Alert } from '@/types/eeg';

// Generate mock historical alerts
const generateMockAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  const messages = {
    critical: [
      'Stress levels are unusually high. Immediate attention recommended.',
      'Critical anxiety spike detected. Emergency protocols initiated.',
      'Sustained high stress for over 30 minutes. Caregiver notified.',
    ],
    warning: [
      'Anxiety patterns are elevated beyond normal range.',
      'Prolonged anxious state detected. Monitoring closely.',
      'Moderate stress increase observed during afternoon.',
      'Sleep pattern irregularity affecting emotional baseline.',
    ],
    info: [
      'Calm period extended. Positive trend noted.',
      'Relaxation session completed successfully.',
      'Weekly emotional stability improved by 12%.',
    ],
  };

  for (let i = 0; i < 25; i++) {
    const types: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const type = types[Math.floor(Math.random() * (i < 5 ? 2 : 3))];
    const typeMessages = messages[type];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    alerts.push({
      id: `alert-${i}`,
      type,
      message: typeMessages[Math.floor(Math.random() * typeMessages.length)],
      timestamp: date,
      acknowledged: Math.random() > 0.3,
    });
  }

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    label: 'Critical',
    bgColor: 'bg-alert/10',
    borderColor: 'border-alert/30',
    iconColor: 'text-alert',
    badgeColor: 'bg-alert text-alert-foreground',
  },
  warning: {
    icon: AlertCircle,
    label: 'Warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    iconColor: 'text-warning',
    badgeColor: 'bg-warning text-warning-foreground',
  },
  info: {
    icon: Info,
    label: 'Info',
    bgColor: 'bg-calm/10',
    borderColor: 'border-calm/30',
    iconColor: 'text-calm',
    badgeColor: 'bg-calm text-calm-foreground',
  },
};

type DateFilter = 'all' | 'today' | 'week' | 'month';
type SeverityFilter = 'all' | 'critical' | 'warning' | 'info';
type StatusFilter = 'all' | 'acknowledged' | 'pending';

const AlertHistory = () => {
  const [alerts] = useState<Alert[]>(generateMockAlerts);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Date filter
      const now = new Date();
      const alertDate = new Date(alert.timestamp);
      
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (alertDate < today) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (alertDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (alertDate < monthAgo) return false;
      }

      // Severity filter
      if (severityFilter !== 'all' && alert.type !== severityFilter) return false;

      // Status filter
      if (statusFilter === 'acknowledged' && !alert.acknowledged) return false;
      if (statusFilter === 'pending' && alert.acknowledged) return false;

      return true;
    });
  }, [alerts, dateFilter, severityFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: filteredAlerts.length,
    critical: filteredAlerts.filter(a => a.type === 'critical').length,
    warning: filteredAlerts.filter(a => a.type === 'warning').length,
    info: filteredAlerts.filter(a => a.type === 'info').length,
    pending: filteredAlerts.filter(a => !a.acknowledged).length,
  }), [filteredAlerts]);

  const exportReport = () => {
    const reportData = filteredAlerts.map(alert => ({
      Date: alert.timestamp.toLocaleString(),
      Severity: alertConfig[alert.type].label,
      Status: alert.acknowledged ? 'Acknowledged' : 'Pending',
      Message: alert.message,
    }));

    const csvContent = [
      'MindCare Alert History Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Total Alerts: ${stats.total}`,
      `Critical: ${stats.critical} | Warning: ${stats.warning} | Info: ${stats.info}`,
      '',
      'Date,Severity,Status,Message',
      ...reportData.map(row => 
        `"${row.Date}","${row.Severity}","${row.Status}","${row.Message}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mindcare-alert-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setDateFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = dateFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Alert History</h1>
                <p className="text-xs text-muted-foreground">View and export past alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(hasActiveFilters && "border-primary")}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
              <Button onClick={exportReport} size="sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Filter Alerts</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'today', 'week', 'month'] as DateFilter[]).map(filter => (
                    <Button
                      key={filter}
                      variant={dateFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateFilter(filter)}
                    >
                      {filter === 'all' ? 'All Time' : filter === 'today' ? 'Today' : filter === 'week' ? '7 Days' : '30 Days'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Severity
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'critical', 'warning', 'info'] as SeverityFilter[]).map(filter => (
                    <Button
                      key={filter}
                      variant={severityFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSeverityFilter(filter)}
                    >
                      {filter === 'all' ? 'All' : alertConfig[filter].label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'pending', 'acknowledged'] as StatusFilter[]).map(filter => (
                    <Button
                      key={filter}
                      variant={statusFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(filter)}
                    >
                      {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Critical" value={stats.critical} color="text-alert" />
          <StatCard label="Warning" value={stats.warning} color="text-warning" />
          <StatCard label="Info" value={stats.info} color="text-calm" />
          <StatCard label="Pending" value={stats.pending} color="text-muted-foreground" />
        </div>

        {/* Alerts List */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Alert Records</h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredAlerts.length} alerts
            </span>
          </div>

          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No alerts match your filters</p>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const config = alertConfig[alert.type];
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 transition-colors hover:bg-muted/30",
                      !alert.acknowledged && "bg-muted/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        config.bgColor
                      )}>
                        <Icon className={cn("w-5 h-5", config.iconColor)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            config.badgeColor
                          )}>
                            {config.label}
                          </span>
                          {alert.acknowledged ? (
                            <span className="text-xs text-success flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Acknowledged
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                        <p className="text-foreground">{alert.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, color = 'text-foreground' }: { label: string; value: number; color?: string }) => (
  <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
    <p className={cn("text-2xl font-bold", color)}>{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default AlertHistory;
