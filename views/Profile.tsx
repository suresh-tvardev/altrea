import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Cpu,
  HardDrive,
  Activity,
  Edit,
  Save,
  LogOut
} from 'lucide-react';
import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/actions/auth';
import { getFullProfile } from '@/app/actions/profile';

const Profile = () => {
  const { isConnected, setIsConnected } = useEEGSimulation();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    email: string;
    name: string;
    role: string;
    created_at: string;
  } | null>(null);

  const [deviceInfo, setDeviceInfo] = useState({
    deviceName: 'Altrea EEG Monitor',
    deviceId: 'ALT-2024-001',
    firmwareVersion: 'v2.1.3',
    batteryLevel: 85,
    storageUsed: 45,
    storageTotal: 128,
    lastSync: new Date(2024, 0, 1),
    signalStrength: 95,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(deviceInfo.deviceName);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchProfile = async () => {
      try {
        const profileData = await getFullProfile();

        if (profileData) {
          setUserProfile({
            email: profileData.email || '',
            name: profileData.name || 'User',
            role: profileData.role || 'User',
            created_at: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    setDeviceInfo(prev => ({
      ...prev,
      lastSync: new Date(),
      signalStrength: isConnected ? 85 + Math.random() * 15 : 0,
    }));

    // Simulate device info updates
    const interval = setInterval(() => {
      setDeviceInfo(prev => ({
        ...prev,
        batteryLevel: Math.max(10, prev.batteryLevel - 0.1),
        signalStrength: isConnected ? 85 + Math.random() * 15 : 0,
        lastSync: new Date(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.push("/auth/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!mounted) return null;

  const handleSave = () => {
    setDeviceInfo(prev => ({ ...prev, deviceName: editedName }));
    setIsEditing(false);
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength > 70) return 'text-success';
    if (strength > 40) return 'text-warning';
    return 'text-alert';
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-success';
    if (level > 20) return 'text-warning';
    return 'text-alert';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Profile & Device"
        description="Manage your profile and monitor device information"
        icon={User}
        backTo="/"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{userProfile?.name || 'Loading...'}</h3>
                <p className="text-sm text-muted-foreground capitalize">{userProfile?.role || 'Loading...'}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-foreground mt-1">{userProfile?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground mt-1">{userProfile?.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="text-foreground mt-1">{userProfile?.created_at || '-'}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Information
                </CardTitle>
                <CardDescription>
                  Connected wearable device details
                </CardDescription>
              </div>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Device Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-foreground">{deviceInfo.deviceName}</p>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Device ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Device ID
              </label>
              <p className="text-foreground font-mono text-sm">{deviceInfo.deviceId}</p>
            </div>

            {/* Firmware Version */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Firmware Version
              </label>
              <p className="text-foreground">{deviceInfo.firmwareVersion}</p>
            </div>

            {/* Connection Status */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-success" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Connection Status</span>
                </div>
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Signal Strength */}
              {isConnected && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Signal Strength</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          getSignalStrengthColor(deviceInfo.signalStrength)
                        )}
                        style={{ width: `${deviceInfo.signalStrength}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-semibold w-12 text-right",
                      getSignalStrengthColor(deviceInfo.signalStrength)
                    )}>
                      {Math.round(deviceInfo.signalStrength)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Battery Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Battery Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        getBatteryColor(deviceInfo.batteryLevel)
                      )}
                      style={{ width: `${deviceInfo.batteryLevel}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold w-12 text-right",
                    getBatteryColor(deviceInfo.batteryLevel)
                  )}>
                    {Math.round(deviceInfo.batteryLevel)}%
                  </span>
                </div>
              </div>

              {/* Storage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(deviceInfo.storageUsed / deviceInfo.storageTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-20 text-right text-muted-foreground">
                    {deviceInfo.storageUsed}GB / {deviceInfo.storageTotal}GB
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm text-foreground">
                  {deviceInfo.lastSync.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Connection Toggle */}
            <div className="pt-4 border-t">
              <Button
                variant={isConnected ? "outline" : "default"}
                className="w-full"
                onClick={() => setIsConnected(!isConnected)}
              >
                {isConnected ? (
                  <>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Disconnect Device
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 mr-2" />
                    Connect Device
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
