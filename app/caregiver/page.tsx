"use client";

import { useEffect, useState } from 'react';
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
    } = useEEGSimulation();

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
        </main>
    );
}
