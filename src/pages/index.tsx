import { Header } from '@/components/dashboard/Header';
import { EmotionalStateIndicator } from '@/components/dashboard/EmotionalStateIndicator';
import { EEGWaveform } from '@/components/dashboard/EEGWaveform';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { CaregiversPanel } from '@/components/dashboard/CaregiversPanel';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const {
    readings,
    analysis,
    alerts,
    historicalData,
    insights,
    isConnected,
    setIsConnected,
    acknowledgeAlert,
  } = useEEGSimulation();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isConnected={isConnected} 
        onToggleConnection={() => setIsConnected(!isConnected)} 
      />

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
      </main>

      <Toaster />
    </div>
  );
};

export default Index;
