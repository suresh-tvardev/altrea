"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EmotionalStateIndicator } from '@/components/dashboard/EmotionalStateIndicator';
import { EEGWaveform } from '@/components/dashboard/EEGWaveform';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { CaregiversPanel } from '@/components/dashboard/CaregiversPanel';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { InterventionDialog } from '@/components/dashboard/InterventionDialog';
import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { useRole } from '@/contexts/RoleContext';
import { isAuthenticatedButMissingProfile } from '@/app/actions/user';
import { login } from '@/app/actions/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, AlertCircle, Info, Zap, Eye, ExternalLink, Loader2 } from 'lucide-react';
import type { Alert } from '@/types/eeg';

// Demo account credentials for caregiver
const DEMO_CAREGIVER = {
    email: 'john.smith@altrea.com',
    password: 'Demo123!',
};

export default function CaregiverDashboard() {
    const router = useRouter();
    const { isElder, loading: roleLoading } = useRole();
    const [checkingProfile, setCheckingProfile] = useState(true);
    const {
        readings,
        analysis,
        alerts,
        historicalData,
        insights,
        isConnected,
        setIsConnected,
        acknowledgeAlert,
        shouldShowIntervention,
        setShouldShowIntervention,
        isUsingWebSocket,
    } = useEEGSimulation();

    
    // Alert popup state (for localStorage-based alerts)
    const [alertPopup, setAlertPopup] = useState<Alert | null>(null);
    const processedAlertIds = useRef<Set<string>>(new Set());
    const [isLoggingIn, setIsLoggingIn] = useState<'simulator' | 'comparison' | null>(null);

    // Check if user is authenticated but missing profile
    useEffect(() => {
        const checkProfile = async () => {
            const needsSetup = await isAuthenticatedButMissingProfile();
            if (needsSetup) {
                router.replace('/setup');
                return;
            }
            setCheckingProfile(false);
        };

        checkProfile();
    }, [router]);

    // Redirect to elder page if user is in elder role (from context)
    useEffect(() => {
        if (!checkingProfile && !roleLoading && isElder) {
            router.replace('/elder');
        }
    }, [isElder, roleLoading, checkingProfile, router]);

    // Show alert popup for new alerts when using localStorage (not WebSocket)
    // Only show alerts that were triggered after initial load (from localStorage/simulator)
    useEffect(() => {
        if (isUsingWebSocket) return; // Only show popups when using localStorage
        
        // Find the most recent unacknowledged alert that hasn't been shown yet
        // Only show alerts that are recent (within last 5 minutes) to avoid showing old alerts on load
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const newAlert = alerts
            .filter(a => 
                !a.acknowledged && 
                !processedAlertIds.current.has(a.id) &&
                a.timestamp > fiveMinutesAgo // Only show recent alerts
            )
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        
        if (newAlert) {
            // If there's already a popup open for a different alert, allow the new one to replace it
            if (alertPopup && alertPopup.id !== newAlert.id) {
                // Remove the old alert from processed set so it can be shown again if needed
                processedAlertIds.current.delete(alertPopup.id);
            }
            processedAlertIds.current.add(newAlert.id);
            setAlertPopup(newAlert);
        }
    }, [alerts, isUsingWebSocket]);

    const handleAlertPopupClose = () => {
        if (alertPopup) {
            acknowledgeAlert(alertPopup.id);
            // Remove from processed set so new alerts can show
            processedAlertIds.current.delete(alertPopup.id);
            setAlertPopup(null);
        }
    };

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="w-6 h-6 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-6 h-6 text-orange-500" />;
            case 'info':
                return <Info className="w-6 h-6 text-blue-500" />;
            default:
                return <AlertCircle className="w-6 h-6" />;
        }
    };

    const handleLoginAndOpen = async (page: 'simulator' | 'comparison') => {
        setIsLoggingIn(page);
        try {
            const formData = new FormData();
            formData.append('email', DEMO_CAREGIVER.email);
            formData.append('password', DEMO_CAREGIVER.password);
            
            const result = await login(formData);
            if (result.error) {
                toast.error(result.error);
                setIsLoggingIn(null);
                return;
            }

            toast.success('Logged in as Caregiver');
            
            // Open the appropriate page in a new tab
            const url = page === 'simulator' ? '/simulator' : '/comparison';
            window.open(url, '_blank');
            
            setIsLoggingIn(null);
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            setIsLoggingIn(null);
        }
    };

    // Show loading until profile check and role are ready (prevents flash of wrong content / missing topbar icons)
    if (checkingProfile || roleLoading || isElder) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* CTA Buttons for Simulator and Comparison */}
            <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Quick Access Tools</h3>
                            <p className="text-sm text-muted-foreground">
                                Test stress scenarios or compare views side-by-side
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleLoginAndOpen('simulator')}
                                disabled={isLoggingIn !== null}
                                size="lg"
                                className="gap-2"
                            >
                                {isLoggingIn === 'simulator' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Opening...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Simulator
                                        <ExternalLink className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => handleLoginAndOpen('comparison')}
                                disabled={isLoggingIn !== null}
                                size="lg"
                                variant="outline"
                                className="gap-2"
                            >
                                {isLoggingIn === 'comparison' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Opening...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        Comparison
                                        <ExternalLink className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <section className="mb-6">
                <QuickStats data={historicalData} />
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Real-time Monitoring */}
                <div className="lg:col-span-2 space-y-6">
                    <EmotionalStateIndicator analysis={analysis} />
                    <EEGWaveform readings={readings} isConnected={isConnected} />
                    <HistoricalChart data={historicalData} />
                </div>

                {/* Right Column - Alerts, Caregivers, Insights */}
                <div className="space-y-6">
                    <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
                    <CaregiversPanel />
                    <InsightsPanel insights={insights} />
                </div>
            </div>

            {/* Intervention Dialog */}
            <InterventionDialog
                analysis={analysis}
                open={shouldShowIntervention}
                onOpenChange={setShouldShowIntervention}
            />

            {/* Alert Popup Dialog (for localStorage-based alerts) */}
            <AlertDialog open={!!alertPopup} onOpenChange={(open) => !open && handleAlertPopupClose()}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            {alertPopup && getAlertIcon(alertPopup.type)}
                            <AlertDialogTitle className="text-xl">
                                {alertPopup?.type === 'critical' && 'Critical Alert'}
                                {alertPopup?.type === 'warning' && 'Warning Alert'}
                                {alertPopup?.type === 'info' && 'Information Alert'}
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-base pt-2">
                            {alertPopup?.message}
                        </AlertDialogDescription>
                        {alertPopup?.recipients && alertPopup.recipients.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">Sent to:</span>{' '}
                                    {alertPopup.recipients.join(', ')}
                                </p>
                            </div>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleAlertPopupClose}>
                            Acknowledge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
