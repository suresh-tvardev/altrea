"use client";

import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';

export default function Template({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(true);

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
