import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { storageService } from '@/services/storage';
import { alertService } from '@/services/alertService';
import type { Caregiver, AlertThresholds } from '@/types/eeg';
import {
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  User,
  Star,
  Bell,
  AlertTriangle,
  Heart,
  Brain,
  TestTube,
  Wifi
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    stressLevel: 80,
    anxietyLevel: 70,
    calmLevel: 20,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Caregiver>>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false,
    alertPreferences: {
      critical: true,
      warning: true,
      info: false,
    },
  });

  useEffect(() => {
    loadData();
    // Initialize with default thresholds if none exist
    const currentThresholds = storageService.getAlertThresholds();
    if (!localStorage.getItem('altrea_alert_thresholds')) {
      storageService.saveAlertThresholds(currentThresholds);
    }
  }, []);

  const loadData = () => {
    const loadedCaregivers = storageService.getCaregivers();
    const loadedThresholds = storageService.getAlertThresholds();
    setCaregivers(loadedCaregivers);
    setThresholds(loadedThresholds);
  };

  const handleSaveCaregiver = () => {
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
        storageService.updateCaregiver(editingId, formData);
        toast({
          title: 'Caregiver Updated',
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        storageService.addCaregiver(formData as Omit<Caregiver, 'id'>);
        toast({
          title: 'Caregiver Added',
          description: `${formData.name} has been added successfully.`,
        });
      }
      loadData();
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save caregiver. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCaregiver = (id: string) => {
    const caregiver = caregivers.find(c => c.id === id);
    if (caregiver && window.confirm(`Are you sure you want to remove ${caregiver.name}?`)) {
      storageService.deleteCaregiver(id);
      toast({
        title: 'Caregiver Removed',
        description: `${caregiver.name} has been removed.`,
      });
      loadData();
    }
  };

  const handleEditCaregiver = (caregiver: Caregiver) => {
    setFormData(caregiver);
    setEditingId(caregiver.id);
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isPrimary: false,
      alertPreferences: {
        critical: true,
        warning: true,
        info: false,
      },
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSetPrimary = (id: string) => {
    // Remove primary from all, then set new primary
    const updated = caregivers.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    updated.forEach(c => {
      storageService.updateCaregiver(c.id, { isPrimary: c.isPrimary });
    });
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
      warning: 'This is a test warning alert. Anxiety patterns detected.',
      info: 'This is a test info alert. Monitoring status update.',
    };

    toast({
      title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Alert Sent`,
      description: `Sent to ${recipients.length} caregiver(s): ${recipients.map(r => r.name).join(', ')}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Settings"
        icon={SettingsIcon}
        backTo="/"
        actions={
          <Link href="/configuration">
            <Button variant="outline">
              <Wifi className="w-4 h-4 mr-2" />
              Data Stream Config
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caregivers Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Caregivers & Alert Recipients
            </CardTitle>
            <CardDescription>
              Manage people who will receive alerts when thresholds are exceeded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
              <Card className="bg-secondary/30">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={formData.relationship || ''}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                        placeholder="Family, Doctor, etc."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isPrimary || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                      />
                      <Label>Set as Primary Caregiver</Label>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2 border-t">
                    <Label>Alert Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="critical" className="text-sm font-normal">
                          Critical Alerts
                        </Label>
                        <Switch
                          id="critical"
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
                        <Label htmlFor="warning" className="text-sm font-normal">
                          Warning Alerts
                        </Label>
                        <Switch
                          id="warning"
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
                        <Label htmlFor="info" className="text-sm font-normal">
                          Info Alerts
                        </Label>
                        <Switch
                          id="info"
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
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveCaregiver} className="flex-1">
                      <Save className="w-4 h-4" />
                      {editingId ? 'Update' : 'Add'} Caregiver
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Button */}
            {!isAdding && !editingId && (
              <Button onClick={() => setIsAdding(true)} className="w-full">
                <Plus className="w-4 h-4" />
                Add Caregiver
              </Button>
            )}

            {/* Caregivers List */}
            <div className="space-y-2">
              {caregivers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No caregivers configured</p>
                  <p className="text-sm mt-1">Add caregivers to receive alerts</p>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{caregiver.name}</span>
                          {caregiver.isPrimary && (
                            <Star className="w-4 h-4 text-warning fill-warning" />
                          )}
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
                      <div className="flex gap-2">
                        {!caregiver.isPrimary && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetPrimary(caregiver.id)}
                            title="Set as Primary"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCaregiver(caregiver)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCaregiver(caregiver.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
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

            {/* Anxiety Level Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-warning" />
                  <Label>Anxiety Level Threshold</Label>
                </div>
                <span className="text-lg font-semibold">{thresholds.anxietyLevel}%</span>
              </div>
              <Slider
                value={[thresholds.anxietyLevel]}
                onValueChange={(value) => handleThresholdChange('anxietyLevel', value)}
                min={40}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Warning alerts will be sent when anxiety exceeds this level.
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
      </div>
    </div>
  );
};

export default Settings;
