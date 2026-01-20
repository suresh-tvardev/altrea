import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { storageService } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Configuration = () => {
  const { toast } = useToast();
  const [websocketUrl, setWebsocketUrl] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved WebSocket URL
    const savedUrl = storageService.getWebSocketUrl();
    if (savedUrl) {
      setWebsocketUrl(savedUrl);
    }
  }, []);

  if (!mounted) return null;

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!websocketUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid WebSocket URL (ws:// or wss://)',
        variant: 'destructive',
      });
      return;
    }

    if (!validateUrl(websocketUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'WebSocket URL must start with ws:// or wss://',
        variant: 'destructive',
      });
      return;
    }

    try {
      storageService.saveWebSocketUrl(websocketUrl);
      toast({
        title: 'Configuration Saved',
        description: 'WebSocket URL has been saved. Restart the connection to apply changes.',
      });
      setConnectionStatus('disconnected');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  const handleClear = () => {
    setWebsocketUrl('');
    storageService.saveWebSocketUrl(null);
    setConnectionStatus('disconnected');
    setTestResult('idle');
    setTestMessage('');
    toast({
      title: 'Configuration Cleared',
      description: 'WebSocket URL has been cleared. Mock data will be used.',
    });
  };

  const handleTestConnection = async () => {
    if (!websocketUrl.trim() || !validateUrl(websocketUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid WebSocket URL before testing',
        variant: 'destructive',
      });
      return;
    }

    setTestResult('testing');
    setTestMessage('Connecting to WebSocket server...');

    try {
      const ws = new WebSocket(websocketUrl);

      const timeout = setTimeout(() => {
        ws.close();
        setTestResult('failed');
        setTestMessage('Connection timeout. Server did not respond.');
        toast({
          title: 'Connection Failed',
          description: 'Could not connect to WebSocket server within timeout period.',
          variant: 'destructive',
        });
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        setTestResult('success');
        setTestMessage('Successfully connected to WebSocket server!');
        setConnectionStatus('connected');
        toast({
          title: 'Connection Successful',
          description: 'WebSocket connection established successfully.',
        });
        ws.close();
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        setTestResult('failed');
        setTestMessage('Failed to connect. Check the URL and ensure the server is running.');
        setConnectionStatus('error');
        toast({
          title: 'Connection Error',
          description: 'Could not establish WebSocket connection.',
          variant: 'destructive',
        });
      };

      ws.onclose = () => {
        if (testResult === 'testing') {
          clearTimeout(timeout);
        }
      };
    } catch (error) {
      setTestResult('failed');
      setTestMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      toast({
        title: 'Test Failed',
        description: 'An error occurred while testing the connection.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'connecting':
        return <RefreshCw className="w-5 h-5 text-warning animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-alert" />;
      default:
        return <WifiOff className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-success">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-warning">Connecting</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Data Stream Configuration"
        description="Configure WebSocket URL for real-time EEG data streaming"
        icon={SettingsIcon}
        backTo="/"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WebSocket Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  WebSocket Configuration
                </CardTitle>
                <CardDescription>
                  Configure the WebSocket URL for real-time data streaming
                </CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="websocket-url">WebSocket URL</Label>
              <Input
                id="websocket-url"
                type="text"
                placeholder="ws://localhost:8080/stream or wss://example.com/stream"
                value={websocketUrl}
                onChange={(e) => {
                  setWebsocketUrl(e.target.value);
                  setConnectionStatus('disconnected');
                  setTestResult('idle');
                  setTestMessage('');
                }}
                className="mt-2 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter a WebSocket URL (ws:// or wss://). Leave empty to use mock data.
              </p>
            </div>

            {/* Connection Status */}
            {websocketUrl && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                {getStatusIcon()}
                <div className="flex-1">
                  <p className="text-sm font-medium">Connection Status</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionStatus === 'disconnected' && 'Not connected'}
                    {connectionStatus === 'connecting' && 'Connecting...'}
                    {connectionStatus === 'connected' && 'Connected and ready'}
                    {connectionStatus === 'error' && 'Connection error'}
                  </p>
                </div>
              </div>
            )}

            {/* Test Result */}
            {testResult !== 'idle' && (
              <div className={cn(
                "p-3 rounded-lg border",
                testResult === 'success' && "bg-success/10 border-success/20",
                testResult === 'failed' && "bg-alert/10 border-alert/20",
                testResult === 'testing' && "bg-warning/10 border-warning/20"
              )}>
                <div className="flex items-start gap-2">
                  {testResult === 'success' && <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />}
                  {testResult === 'failed' && <XCircle className="w-4 h-4 text-alert mt-0.5" />}
                  {testResult === 'testing' && <RefreshCw className="w-4 h-4 text-warning mt-0.5 animate-spin" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {testResult === 'success' && 'Connection Test Successful'}
                      {testResult === 'failed' && 'Connection Test Failed'}
                      {testResult === 'testing' && 'Testing Connection...'}
                    </p>
                    {testMessage && (
                      <p className="text-xs text-muted-foreground mt-1">{testMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={!websocketUrl.trim() || testResult === 'testing'}
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
            </div>

            {websocketUrl && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear & Use Mock Data
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Configuration Guide
            </CardTitle>
            <CardDescription>
              How to configure real-time data streaming
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-2">WebSocket URL Format</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use <code className="px-1 py-0.5 bg-secondary rounded">ws://</code> for unencrypted connections</li>
                  <li>Use <code className="px-1 py-0.5 bg-secondary rounded">wss://</code> for encrypted (SSL/TLS) connections</li>
                  <li>Example: <code className="px-1 py-0.5 bg-secondary rounded">ws://localhost:8080/stream</code></li>
                  <li>Example: <code className="px-1 py-0.5 bg-secondary rounded">wss://api.example.com/eeg/stream</code></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Expected Data Format</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  The WebSocket server should send JSON messages with the following structure:
                </p>
                <pre className="text-xs bg-secondary p-3 rounded-lg overflow-x-auto">
                  {`{
  "timestamp": "2024-01-15T10:30:00Z",
  "alpha": 8.5,
  "beta": 15.2,
  "theta": 4.1,
  "delta": 1.2,
  "gamma": 45.8
}`}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Mock Data Mode</h4>
                <p className="text-sm text-muted-foreground">
                  If no WebSocket URL is configured, the application will use simulated/mock data for testing and development purposes.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-warning mb-1">Important</p>
                    <p className="text-xs text-muted-foreground">
                      After saving a new WebSocket URL, you may need to refresh the page or restart the connection for changes to take effect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuration;
