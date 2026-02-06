"use client";

import { useState } from 'react';
import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { ElderDashboard } from '@/components/elder/ElderDashboard';
import { EmotionalStateIndicator } from '@/components/dashboard/EmotionalStateIndicator';
import { EEGWaveform } from '@/components/dashboard/EEGWaveform';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { CaregiversPanel } from '@/components/dashboard/CaregiversPanel';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { InterventionDialog } from '@/components/dashboard/InterventionDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserRound, HeartHandshake, ExternalLink, LogIn } from 'lucide-react';
import { login } from '@/app/actions/auth';
import { toast } from 'sonner';
import type { MoodSelection } from '@/types/eeg';

// Demo account credentials (Garcia Care Team)
const DEMO_ACCOUNT = {
    elder: {
        email: 'davestanley@gmail.com',
        password: 'Demo123!',
    },
    caregiver: {
        email: 'saraz@mit.edu',
        password: 'Demo123!',
    },
};

export default function ComparisonPage() {
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

    // Default mood for elder view (can be changed if needed)
    const [elderMood] = useState<MoodSelection>('calm');
    const [isLoggingIn, setIsLoggingIn] = useState<'elder' | 'caregiver' | null>(null);

    const handleLoginAndOpen = async (role: 'elder' | 'caregiver') => {
        setIsLoggingIn(role);
        try {
            const credentials = DEMO_ACCOUNT[role];
            const formData = new FormData();
            formData.append('email', credentials.email);
            formData.append('password', credentials.password);
            
            const result = await login(formData);
            if (result.error) {
                toast.error(result.error);
                setIsLoggingIn(null);
                return;
            }

            toast.success(`Logged in as ${role === 'elder' ? 'Elder' : 'Caregiver'}`);
            
            // Open the appropriate page in a new tab
            const url = role === 'elder' ? '/elder' : '/caregiver';
            window.open(url, '_blank');
            
            setIsLoggingIn(null);
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            setIsLoggingIn(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Side-by-Side View Comparison</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Compare Elder and Caregiver dashboards side by side
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="px-3 py-1">
                                <UserRound className="w-4 h-4 mr-1" />
                                Elder View
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1">
                                <HeartHandshake className="w-4 h-4 mr-1" />
                                Caregiver View
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side-by-Side Content */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-full px-4 py-4">
                {/* Elder View - Left Side */}
                <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                    <div className="bg-pink-50 px-4 py-2 border-b border-pink-200 sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <UserRound className="w-5 h-5 text-pink-600" />
                            <h2 className="text-lg font-semibold text-pink-900">Elder Dashboard</h2>
                            <Badge variant="secondary" className="ml-auto">Simplified View</Badge>
                            <Button
                                onClick={() => handleLoginAndOpen('elder')}
                                disabled={isLoggingIn !== null}
                                size="sm"
                                variant="outline"
                                className="ml-2"
                            >
                                {isLoggingIn === 'elder' ? (
                                    <>
                                        <LogIn className="w-4 h-4 mr-1 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Open in New Tab
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="p-4">
                        <ElderDashboard selectedMood={elderMood} />
                    </div>
                </div>

                {/* Caregiver View - Right Side */}
                <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-200 sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <HeartHandshake className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-blue-900">Caregiver Dashboard</h2>
                            <Badge variant="secondary" className="ml-auto">Detailed View</Badge>
                            <Button
                                onClick={() => handleLoginAndOpen('caregiver')}
                                disabled={isLoggingIn !== null}
                                size="sm"
                                variant="outline"
                                className="ml-2"
                            >
                                {isLoggingIn === 'caregiver' ? (
                                    <>
                                        <LogIn className="w-4 h-4 mr-1 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Open in New Tab
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="p-4">
                        <main className="max-w-7xl mx-auto">
                            {/* Weekly Overview & Personalized Insights - Top */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <HistoricalChart data={historicalData} />
                                <InsightsPanel insights={insights} />
                            </div>

                            <section className="mb-6">
                                <QuickStats data={historicalData} />
                            </section>

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Real-time Monitoring */}
                                <div className="lg:col-span-2 space-y-6">
                                    <EmotionalStateIndicator analysis={analysis} />
                                    <EEGWaveform readings={readings} isConnected={isConnected} />
                                </div>

                                {/* Right Column - Alerts, Caregivers */}
                                <div className="space-y-6">
                                    <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
                                    <CaregiversPanel />
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Intervention Dialog */}
            <InterventionDialog
                analysis={analysis}
                open={shouldShowIntervention}
                onOpenChange={setShouldShowIntervention}
            />
        </div>
    );
}

