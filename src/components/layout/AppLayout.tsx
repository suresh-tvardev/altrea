import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/dashboard/Header';

export const AppLayout = () => {
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isConnected={isConnected} 
        onToggleConnection={() => setIsConnected(!isConnected)} 
      />
      <Outlet />
    </div>
  );
};
