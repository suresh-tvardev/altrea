"use client";

import { Header } from '@/components/dashboard/Header';
import { useEEGSimulation } from '@/hooks/useEEGSimulation';

export default function Template({ children }: { children: React.ReactNode }) {
    const { isConnected, setIsConnected } = useEEGSimulation();

    return (
        <div className="min-h-screen bg-background">
            <Header
                isConnected={isConnected}
                onToggleConnection={() => setIsConnected(!isConnected)}
            />
            {children}
        </div>
    );
}
