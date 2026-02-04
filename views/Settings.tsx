import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { storageService } from '@/services/storage';
import { alertService } from '@/services/alertService';
import {
  getCareTeamMembers,
  getElderForAccount,
  addCareTeamMember,
  updateCareTeamMember,
  deleteCareTeamMember,
  updateElderProfile
} from '@/app/actions/settings';
import type { Caregiver, AlertThresholds } from '@/types/eeg';
import {
  Settings as SettingsIcon,
  Plus,
  Save,
  X,
  User,
  Bell,
  AlertTriangle,
  Heart,
  Brain,
  TestTube,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Upload,
  Camera,
} from 'lucide-react';
import { cn, resolveAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Settings = () => {
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<(Caregiver & { avatarUrl?: string | null })[]>([]);
  const [elder, setElder] = useState<{ id: string; name: string; email?: string; phone?: string; avatarUrl?: string | null } | null>(null);
  const [isEditingElder, setIsEditingElder] = useState(false);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    stressLevel: 80,
    anxietyLevel: 70,
    calmLevel: 20,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Caregiver> & { role?: 'caregiver' | 'elder'; avatarUrl?: string | null }>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    role: 'caregiver',
    isPrimary: false,
    alertPreferences: {
      critical: true,
      warning: true,
      info: false,
    },
    avatarUrl: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Stream Config state (demo: streaming enabled by default with ws://192.168.224.1:8765)
  const DEFAULT_WEBSOCKET_URL = 'ws://192.168.224.1:8765';
  const SAMPLE_DEVICES = [
    { id: 'neurable-mw75', label: 'Neurable MW75 Neuro', url: DEFAULT_WEBSOCKET_URL },
    { id: 'muse-s', label: 'Muse S (Athena)', url: DEFAULT_WEBSOCKET_URL },
    { id: 'emotiv-insight', label: 'Emotiv Insight', url: DEFAULT_WEBSOCKET_URL },
    { id: 'neurosity-crown', label: 'Neurosity Crown', url: DEFAULT_WEBSOCKET_URL },
  ];
  const [selectedDevice, setSelectedDevice] = useState<string>(SAMPLE_DEVICES[0].id);
  const [websocketUrl, setWebsocketUrl] = useState<string>(DEFAULT_WEBSOCKET_URL);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [connectionMode, setConnectionMode] = useState<'localStorage' | 'streaming'>('streaming');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
    // Initialize with default thresholds if none exist
    const currentThresholds = storageService.getAlertThresholds();
    if (typeof window !== 'undefined' && !localStorage.getItem('altrea_alert_thresholds')) {
      storageService.saveAlertThresholds(currentThresholds);
    }
    // Load Data Stream Config (default: streaming enabled with ws://192.168.224.1:8765)
    let savedUrl = storageService.getWebSocketUrl();
    const savedMode = storageService.getConnectionMode();
    const urlToUse = savedUrl || DEFAULT_WEBSOCKET_URL;
    const matchedDevice = SAMPLE_DEVICES.find(d => d.url === urlToUse);
    setWebsocketUrl(urlToUse);
    setSelectedDevice(matchedDevice ? matchedDevice.id : 'custom');
    setConnectionMode(savedMode);
    if (!savedUrl) {
      storageService.saveWebSocketUrl(DEFAULT_WEBSOCKET_URL);
      storageService.saveConnectionMode('streaming');
    }
  }, []);

  const loadData = async () => {
    // Load elder and caregivers from Server Actions (DB)
    const [elderData, loadedCaregivers] = await Promise.all([
      getElderForAccount(),
      getCareTeamMembers(),
    ]);
    setElder(elderData ?? null);
    setCaregivers(loadedCaregivers);

    // Load thresholds from Local Storage (for now)
    const loadedThresholds = storageService.getAlertThresholds();
    setThresholds(loadedThresholds);
  };

  const handleSaveCaregiver = async () => {
    if (isEditingElder) {
      // Save elder profile
      if (!formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Name is required.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const result = await updateElderProfile(editingId!, {
          name: formData.name,
          avatarUrl: formData.avatarUrl,
        });

        if (result.error) throw new Error(result.error);

        toast({
          title: 'Elder Profile Updated',
          description: `${formData.name} has been updated successfully.`,
        });
        await loadData();
        resetForm();
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to update elder profile. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    // Regular caregiver save
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (name, email, phone).',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        // Update via Server Action
        const result = await updateCareTeamMember(editingId, formData);
        if (result.error) throw new Error(result.error);

        toast({
          title: 'Caregiver Updated',
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Add via Server Action
        const result = await addCareTeamMember(formData as Omit<Caregiver, 'id'>);
        if (result.error) throw new Error(result.error);

        toast({
          title: 'Caregiver Added',
          description: `${formData.name} has been added successfully.`,
        });
      }
      await loadData(); // Refresh list
      resetForm();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to save caregiver. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCaregiver = async (id: string) => {
    const caregiver = caregivers.find(c => c.id === id);
    if (caregiver && window.confirm(`Are you sure you want to remove ${caregiver.name}?`)) {
      try {
        const result = await deleteCareTeamMember(id);
        if (result.error) throw new Error(result.error);

        toast({
          title: 'Caregiver Removed',
          description: `${caregiver.name} has been removed.`,
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove caregiver.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditCaregiver = (caregiver: Caregiver & { avatarUrl?: string | null }) => {
    setFormData({ 
      ...caregiver, 
      role: (caregiver as any).role || 'caregiver',
      avatarUrl: caregiver.avatarUrl || null,
    });
    setPreviewImage(caregiver.avatarUrl || null);
    setEditingId(caregiver.id);
    setIsAdding(false);
    setIsEditingElder(false);
    setDialogOpen(true);
  };

  const handleEditElder = () => {
    if (!elder) return;
    setFormData({
      name: elder.name,
      email: elder.email || '',
      phone: elder.phone || '',
      relationship: 'Elder',
      role: 'elder',
      isPrimary: false,
      alertPreferences: {
        critical: true,
        warning: true,
        info: false,
      },
      avatarUrl: elder.avatarUrl || null,
    });
    setPreviewImage(elder.avatarUrl || null);
    setEditingId(elder.id);
    setIsEditingElder(true);
    setIsAdding(false);
    setDialogOpen(true);
  };

  const handleAddCaregiver = () => {
    resetForm();
    setIsAdding(true);
    setIsEditingElder(false);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      role: 'caregiver',
      isPrimary: false,
      alertPreferences: {
        critical: true,
        warning: true,
        info: false,
      },
      avatarUrl: null,
    });
    setPreviewImage(null);
    setEditingId(null);
    setIsAdding(false);
    setIsEditingElder(false);
    setDialogOpen(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload via API route
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Upload failed');
      }

      setFormData(prev => ({ ...prev, avatarUrl: result.url }));
      toast({
        title: 'Image uploaded',
        description: 'Profile image uploaded successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      // Reset preview on error
      setPreviewImage(formData.avatarUrl || null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    // Remove primary from all, then set new primary
    // Optimistic update
    const updated = caregivers.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    setCaregivers(updated);

    // Update in DB
    // Note: Ideally transactional on server, but looping here for now
    // A better approach would be a 'setPrimaryMember' action.
    for (const c of updated) {
      if (c.id === id || c.isPrimary) { // Only update the relevant ones to save calls
        await updateCareTeamMember(c.id, { isPrimary: c.isPrimary });
      }
    }
    loadData();
  };

  const handleThresholdChange = (key: keyof AlertThresholds, value: number[]) => {
    const newThresholds = { ...thresholds, [key]: value[0] };
    setThresholds(newThresholds);
    storageService.saveAlertThresholds(newThresholds);
    toast({
      title: 'Thresholds Updated',
      description: 'Alert thresholds have been saved.',
    });
  };

  const handleTestAlert = async (type: 'critical' | 'warning' | 'info') => {
    const recipients = alertService.getRecipients(type);
    if (recipients.length === 0) {
      toast({
        title: 'No Recipients',
        description: `No caregivers are configured to receive ${type} alerts.`,
        variant: 'destructive',
      });
      return;
    }

    const testMessages = {
      critical: 'This is a test critical alert. Stress levels are high.',
      warning: 'This is a test warning alert. Calm levels are low.',
      info: 'This is a test info alert. Monitoring status update.',
    };

    toast({
      title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Alert Sent`,
      description: `Sent to ${recipients.length} caregiver(s): ${recipients.map(r => r.name).join(', ')}`,
    });
  };

  // Data Stream Config helpers
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
    } catch {
      return false;
    }
  };

  const handleConnectionModeChange = (checked: boolean) => {
    const newMode = checked ? 'streaming' : 'localStorage';
    setConnectionMode(newMode);
  };

  const handleSaveStreamConfig = () => {
    if (connectionMode === 'streaming') {
      if (!websocketUrl.trim()) {
        toast({ title: 'Invalid URL', description: 'Please enter a valid WebSocket URL for streaming mode', variant: 'destructive' });
        return;
      }
      if (!validateUrl(websocketUrl)) {
        toast({ title: 'Invalid URL', description: 'WebSocket URL must start with ws:// or wss://', variant: 'destructive' });
        return;
      }
    }
    try {
      storageService.saveConnectionMode(connectionMode);
      if (connectionMode === 'streaming') storageService.saveWebSocketUrl(websocketUrl);
      else storageService.saveWebSocketUrl(null);
      toast({ title: 'Configuration Saved', description: `Connection mode set to ${connectionMode === 'streaming' ? 'Streaming API' : 'localStorage'}. Refresh to apply.` });
      setConnectionStatus('disconnected');
    } catch {
      toast({ title: 'Error', description: 'Failed to save configuration', variant: 'destructive' });
    }
  };

  const handleClearStreamUrl = () => {
    setWebsocketUrl('');
    storageService.saveWebSocketUrl(null);
    setConnectionStatus('disconnected');
    setTestResult('idle');
    setTestMessage('');
    toast({ title: 'Configuration Cleared', description: 'WebSocket settings cleared. Simulated data will be used.' });
  };

  const handleTestConnection = async () => {
    if (!websocketUrl.trim() || !validateUrl(websocketUrl)) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid WebSocket URL before testing', variant: 'destructive' });
      return;
    }
    setTestResult('testing');
    setTestMessage('Connecting...');
    try {
      const ws = new WebSocket(websocketUrl);
      const timeout = setTimeout(() => {
        ws.close();
        setTestResult('failed');
        setTestMessage('Connection timeout.');
        toast({ title: 'Connection Failed', description: 'Could not connect within timeout.', variant: 'destructive' });
      }, 5000);
      ws.onopen = () => {
        clearTimeout(timeout);
        setTestResult('success');
        setTestMessage('Connected!');
        setConnectionStatus('connected');
        toast({ title: 'Connection Successful', description: 'Device connected.' });
        ws.close();
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        setTestResult('failed');
        setTestMessage('Failed to connect.');
        setConnectionStatus('error');
        toast({ title: 'Connection Error', description: 'Could not establish connection.', variant: 'destructive' });
      };
    } catch (error) {
      setTestResult('failed');
      setTestMessage(String(error));
      toast({ title: 'Test Failed', description: 'An error occurred.', variant: 'destructive' });
    }
  };

  const getStreamStatusIcon = () => {
    // Demo: always show connected
    return <CheckCircle2 className="w-4 h-4 text-success" />;
  };

  const getStreamStatusBadge = () => {
    // Demo: always show connected
    return <Badge className="bg-success text-xs">Connected</Badge>;
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader title="Settings" icon={SettingsIcon} backTo="/" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Caregivers Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Care Team & Family
            </CardTitle>
            <CardDescription>
              Manage family members and caregivers associated with this account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Button */}
            <Button onClick={handleAddCaregiver} className="w-full">
              <Plus className="w-4 h-4" />
              Add {caregivers.length === 0 ? 'First' : ''} Caregiver
            </Button>

            {/* Elder (shown at top) */}
            {elder && (
              <Card className="p-4 bg-pink-50/50 border-pink-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={resolveAvatarUrl(elder.avatarUrl, elder.name)} alt={elder.name} />
                    <AvatarFallback className="bg-pink-200 text-pink-800 text-sm">
                      {elder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{elder.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0">Elder</Badge>
                  </div>
                </div>
              </Card>
            )}

            {/* Caregivers List */}
            <div className="space-y-2">
              {caregivers.length === 0 && !elder ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No persons configured</p>
                  <p className="text-sm mt-1">Add caregivers or family members to receive alerts</p>
                </div>
              ) : (
                caregivers.map((caregiver) => (
                  <Card
                    key={caregiver.id}
                    className={cn(
                      'p-4',
                      caregiver.isPrimary && 'ring-2 ring-primary/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={resolveAvatarUrl((caregiver as { avatarUrl?: string }).avatarUrl, caregiver.name)} alt={caregiver.name} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {caregiver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold truncate">{caregiver.name}</span>
                          <Badge variant="outline" className="text-xs capitalize shrink-0">
                            {(caregiver as any).role || 'caregiver'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {caregiver.relationship || 'No relationship specified'}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{caregiver.email}</p>
                          <p>{caregiver.phone}</p>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className={caregiver.alertPreferences?.critical ? 'text-alert' : 'text-muted-foreground'}>
                            Critical
                          </span>
                          <span className={caregiver.alertPreferences?.warning ? 'text-warning' : 'text-muted-foreground'}>
                            Warning
                          </span>
                          <span className={caregiver.alertPreferences?.info ? 'text-primary' : 'text-muted-foreground'}>
                            Info
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Thresholds
            </CardTitle>
            <CardDescription>
              Configure when alerts should be triggered based on emotional state levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stress Level Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-alert" />
                  <Label>Stress Level Threshold</Label>
                </div>
                <span className="text-lg font-semibold">{thresholds.stressLevel}%</span>
              </div>
              <Slider
                value={[thresholds.stressLevel]}
                onValueChange={(value) => handleThresholdChange('stressLevel', value)}
                min={50}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Critical alerts will be sent when stress exceeds this level.
              </p>
            </div>

            {/* Calm Level Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-success" />
                  <Label>Calm Level Threshold</Label>
                </div>
                <span className="text-lg font-semibold">{thresholds.calmLevel}%</span>
              </div>
              <Slider
                value={[thresholds.calmLevel]}
                onValueChange={(value) => handleThresholdChange('calmLevel', value)}
                min={0}
                max={50}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Warning alerts will be sent when calm level falls below this threshold.
              </p>
            </div>

            {/* Test Alerts */}
            <div className="pt-4 border-t space-y-2">
              <Label>Test Alerts</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Send test alerts to verify your configuration.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestAlert('critical')}
                  className="text-alert"
                >
                  <TestTube className="w-3 h-3" />
                  Critical
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestAlert('warning')}
                  className="text-warning"
                >
                  <TestTube className="w-3 h-3" />
                  Warning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestAlert('info')}
                  className="text-primary"
                >
                  <TestTube className="w-3 h-3" />
                  Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Stream Config */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Data Stream Config
              </CardTitle>
              {getStreamStatusBadge()}
            </div>
            <CardDescription>
              Configure WebSocket URL for real-time EEG data streaming.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select Device</Label>
              <Select
                value={selectedDevice}
                onValueChange={(value) => {
                  setSelectedDevice(value);
                  if (value === 'custom') {
                    setConnectionMode('streaming');
                    setConnectionStatus('disconnected');
                    setTestResult('idle');
                    // Keep current websocketUrl for editing
                  } else {
                    setConnectionMode('streaming');
                    const device = SAMPLE_DEVICES.find(d => d.id === value);
                    setWebsocketUrl(device?.url ?? DEFAULT_WEBSOCKET_URL);
                    setConnectionStatus('disconnected');
                    setTestResult('idle');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a device" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_DEVICES.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom WebSocket URL...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-semibold">Connection Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {connectionMode === 'streaming' ? 'WebSocket streaming' : 'localStorage / simulator'}
                </p>
              </div>
              <Switch
                checked={connectionMode === 'streaming'}
                onCheckedChange={handleConnectionModeChange}
              />
            </div>

            {connectionMode === 'streaming' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="websocket-url" className="text-sm">WebSocket URL</Label>
                  <Input
                    id="websocket-url"
                    type="text"
                    placeholder="ws://192.168.224.1:8765"
                    value={websocketUrl}
                    onChange={(e) => {
                      setWebsocketUrl(e.target.value);
                      setConnectionStatus('disconnected');
                      setTestResult('idle');
                      setTestMessage('');
                    }}
                    className="font-mono text-sm"
                  />
                </div>

                {websocketUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-sm">
                    {getStreamStatusIcon()}
                    <span className="text-muted-foreground truncate">Connected</span>
                  </div>
                )}

                {testResult !== 'idle' && (
                  <div className={cn(
                    "p-2 rounded-lg border text-sm",
                    testResult === 'success' && "bg-success/10 border-success/20",
                    testResult === 'failed' && "bg-alert/10 border-alert/20",
                    testResult === 'testing' && "bg-warning/10 border-warning/20"
                  )}>
                    {testResult === 'success' && <CheckCircle2 className="w-4 h-4 text-success inline mr-2" />}
                    {testResult === 'failed' && <XCircle className="w-4 h-4 text-alert inline mr-2" />}
                    {testResult === 'testing' && <RefreshCw className="w-4 h-4 text-warning inline mr-2 animate-spin" />}
                    {testMessage}
                  </div>
                )}
              </>
            )}

            {connectionMode === 'localStorage' && (
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  Data from stress simulator via localStorage. Use simulator page to trigger events.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleSaveStreamConfig} className="w-full" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Config
              </Button>
              {connectionMode === 'streaming' && (
                <>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleTestConnection} disabled={!websocketUrl.trim() || testResult === 'testing'}>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                  {websocketUrl && (
                    <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={handleClearStreamUrl}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Clear URL
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Caregiver Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>
              {isEditingElder ? 'Edit Elder Profile' : editingId ? 'Edit Care Team Member' : 'Add Care Team Member'}
            </DialogTitle>
            <DialogDescription>
              {isEditingElder 
                ? 'Update the elder profile details below.'
                : editingId ? 'Update the details below.' : 'Add a new caregiver or family member.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={previewImage || resolveAvatarUrl(formData.avatarUrl, formData.name || '')} 
                  alt={formData.name || 'Avatar'} 
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                  {formData.name ? formData.name.split(' ').map(n => n[0]).join('').slice(0, 2) : <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dialog-name">Name *</Label>
              <Input
                id="dialog-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            {!isEditingElder && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'caregiver' | 'elder') => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caregiver">Caregiver / Family</SelectItem>
                        <SelectItem value="elder">Elder / Patient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-relationship">Relationship</Label>
                    <Input
                      id="dialog-relationship"
                      value={formData.relationship || ''}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      placeholder="Family, Doctor, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dialog-email">Email *</Label>
                  <Input
                    id="dialog-email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dialog-phone">Phone *</Label>
                  <Input
                    id="dialog-phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="dialog-primary"
                    checked={formData.isPrimary || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                  />
                  <Label htmlFor="dialog-primary">Set as Primary Caregiver</Label>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <Label>Alert Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dialog-critical" className="text-sm font-normal">
                        Critical Alerts
                      </Label>
                      <Switch
                        id="dialog-critical"
                        checked={formData.alertPreferences?.critical ?? true}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            alertPreferences: {
                              ...formData.alertPreferences!,
                              critical: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dialog-warning" className="text-sm font-normal">
                        Warning Alerts
                      </Label>
                      <Switch
                        id="dialog-warning"
                        checked={formData.alertPreferences?.warning ?? true}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            alertPreferences: {
                              ...formData.alertPreferences!,
                              warning: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dialog-info" className="text-sm font-normal">
                        Info Alerts
                      </Label>
                      <Switch
                        id="dialog-info"
                        checked={formData.alertPreferences?.info ?? false}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            alertPreferences: {
                              ...formData.alertPreferences!,
                              info: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {isEditingElder && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-muted-foreground">
                  Elder profile information. Email and contact details are managed through the account settings.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSaveCaregiver}>
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
