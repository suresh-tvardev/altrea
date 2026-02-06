"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EmotionalStateIndicator } from '@/components/dashboard/EmotionalStateIndicator';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { CaregiversPanel } from '@/components/dashboard/CaregiversPanel';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
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
import { AlertTriangle, AlertCircle, Info, Zap, Eye, ExternalLink, Loader2, User } from 'lucide-react';
import { getCaregiverWelcomeInfo, getElderForAccount } from '@/app/actions/settings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveAvatarUrl } from '@/lib/utils';
import type { Alert, Insight } from '@/types/eeg';

/** Default avatar for the welcome banner when none is set (Sara Zhou / caregiver). */
const WELCOME_BANNER_AVATAR =
    'https://ogrefwgsopzhxgfvomro.supabase.co/storage/v1/object/public/altrea/avatars/1770215957098-21ffqi.jpeg';

// Demo account credentials for caregiver (Garcia Care Team)
const DEMO_CAREGIVER = {
    email: 'saraz@mit.edu',
    password: 'Demo123!',
};

export default function CaregiverDashboard() {
    const router = useRouter();
    const { isElder, loading: roleLoading } = useRole();
    const [checkingProfile, setCheckingProfile] = useState(true);
    const {
        analysis,
        alerts,
        historicalData,
        setIsConnected,
        acknowledgeAlert,
        shouldShowIntervention,
        setShouldShowIntervention,
        isUsingWebSocket,
    } = useEEGSimulation();

    
    // Alert popup state (for localStorage-based alerts)
    const [alertPopup, setAlertPopup] = useState<Alert | null>(null);
    const [caregiver, setCaregiver] = useState<{ name: string; avatarUrl?: string | null } | null>(null);
    const [elderName, setElderName] = useState<string | null>(null);
    const processedAlertIds = useRef<Set<string>>(new Set());
    /** Keep first resolved banner avatar URL so we never flip back to initials after the image has loaded. */
    const bannerAvatarUrlRef = useRef<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState<'simulator' | 'comparison' | null>(null);

    // Demo mode: skip profile check
    useEffect(() => {
        setCheckingProfile(false);
    }, [router]);

    // Demo mode: use default names
    useEffect(() => {
        if (!checkingProfile && !roleLoading && !isElder) {
            setCaregiver({ name: 'Sara Zhou', avatarUrl: null });
            setElderName('Maria Garcia');
        }
    }, [checkingProfile, roleLoading, isElder]);

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

    // Caregiver-specific personalized insights (HAPPY vs STRESSED) - must be before early return (Rules of Hooks)
    const elderDisplayName = elderName || 'your loved one';
    const isStressed = analysis.stressLevel >= 50;
    const caregiverInsights = useMemo((): Insight[] => {
        const now = new Date();
        if (isStressed) {
            return [
                { id: 'c1', title: 'Increased Stress Periods', description: `${elderDisplayName}'s stress levels are slightly higher than their personal baseline this week.`, type: 'warning', timestamp: now },
                { id: 'c2', title: 'Connection Boost', description: 'Consider recording a brief voice message or sending a favorite photo to provide comfort and connection.', type: 'suggestion', timestamp: now },
                { id: 'c3', title: 'Proactive Shift', description: 'The data suggests a need for a shift in environment; perhaps suggest a change in music or a short walk.', type: 'suggestion', timestamp: now },
            ];
        }
        return [
            { id: 'c1', title: 'Positive Momentum', description: `${elderDisplayName} has been calm and happy most of this week. It's a great time to ask for a new photo for their digital frame.`, type: 'positive', timestamp: now },
            { id: 'c2', title: 'Reflective Growth', description: "We're seeing high emotional stability today. A prompt for their Gratitude Journal would be highly effective right now.", type: 'suggestion', timestamp: now },
            { id: 'c3', title: 'Optimal Relaxation', description: `${elderDisplayName} is in a very relaxed state. Playing their favorite music now will help maintain this peaceful "flow."`, type: 'suggestion', timestamp: now },
        ];
    }, [elderDisplayName, isStressed]);

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

    const displayName = caregiver?.name || '';
    const welcomeTitle = displayName ? `Welcome back, ${displayName}!` : 'Welcome back!';
    const welcomeSubtitle = elderName
        ? `Monitor ${elderName}'s emotional wellness below.`
        : "Monitor your loved one's emotional wellness below.";

    // Resolve banner avatar once and keep it stable so the image never flips back to initials
    const resolvedBannerAvatar = resolveAvatarUrl(caregiver?.avatarUrl ?? WELCOME_BANNER_AVATAR, displayName || 'User');
    if (resolvedBannerAvatar && !resolvedBannerAvatar.includes('ui-avatars.com')) {
        bannerAvatarUrlRef.current = resolvedBannerAvatar;
    }
    const bannerAvatarSrc = bannerAvatarUrlRef.current ?? resolvedBannerAvatar;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome banner – same layout as elder view (name + profile image) */}
            <Card className="mb-6 border border-sky-200/60 bg-white/95 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 shrink-0">
                            <AvatarImage
                                src={bannerAvatarSrc}
                                alt={displayName || 'Profile'}
                            />
                            <AvatarFallback className="bg-sky-100 text-sky-700 text-xl">
                                {displayName ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2) : <User className="w-8 h-8" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-foreground">
                                {welcomeTitle}
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1">
                                {welcomeSubtitle}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
                {/* Left Column - Current Emotional State & Weekly Overview (height matches right) */}
                <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
                    <EmotionalStateIndicator analysis={analysis} />
                    <div className="flex-1 min-h-0 flex flex-col">
                        <HistoricalChart data={historicalData} />
                    </div>
                </div>

                {/* Right Column - Personalized Insights */}
                <div className="flex flex-col min-h-0 w-full">
                    <InsightsPanel insights={caregiverInsights} className="flex-1 min-h-0" />
                </div>
            </div>

            {/* Bottom Section - Alerts (same width as chart) & Caregivers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Alerts, same width as Weekly Overview chart */}
                <div className="lg:col-span-2 space-y-6">
                    <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
                </div>

                {/* Right Column - Caregivers */}
                <div className="space-y-6 w-full">
                    <CaregiversPanel />
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
