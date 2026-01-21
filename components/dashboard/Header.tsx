import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Activity, Settings, User, Wifi, WifiOff } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { useRole } from '@/contexts/RoleContext';

interface HeaderProps {
  isConnected: boolean;
  onToggleConnection: () => void;
}

export const Header = ({ isConnected, onToggleConnection }: HeaderProps) => {
  const { isElder } = useRole();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href={isElder ? "/elder" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Altrea</h1>
                <p className="text-xs text-muted-foreground">EEG Emotional Wellness</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <RoleSwitcher />
            
            {!isElder && (
              <>
                <Button
                  variant={isConnected ? "default" : "secondary"}
                  size="sm"
                  onClick={onToggleConnection}
                  className={isConnected ? "bg-success hover:bg-success/90" : ""}
                >
                  {isConnected ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span className="hidden sm:inline">Device Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span className="hidden sm:inline">Connect Device</span>
                    </>
                  )}
                </Button>

                <Link href="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            )}

            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
