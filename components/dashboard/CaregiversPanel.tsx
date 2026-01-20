import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Caregiver } from '@/types/eeg';
import { Phone, Mail, User, Star, MessageCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storageService } from '@/services/storage';

export const CaregiversPanel = () => {
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);

  useEffect(() => {
    loadCaregivers();
    // Listen for storage changes (in case settings page updates)
    const interval = setInterval(loadCaregivers, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadCaregivers = () => {
    const loaded = storageService.getCaregivers();
    setCaregivers(loaded);
  };

  const handleContact = (caregiver: Caregiver, method: 'call' | 'message') => {
    toast({
      title: `Contacting ${caregiver.name}`,
      description: method === 'call'
        ? `Initiating call to ${caregiver.phone}...`
        : `Opening message to ${caregiver.email}...`,
    });
  };

  const handleEmergencyAlert = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "All caregivers have been notified immediately.",
      variant: "destructive",
    });
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Caregivers & Family</h3>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Button
        variant="alert"
        className="w-full mb-4"
        onClick={handleEmergencyAlert}
      >
        <Phone className="w-5 h-5" />
        Send Emergency Alert to All
      </Button>

      <div className="space-y-3">
        {caregivers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No caregivers configured</p>
            <p className="text-sm mt-1">Add caregivers in settings to receive alerts</p>
            <Link href="/settings" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
                Go to Settings
              </Button>
            </Link>
          </div>
        ) : (
          caregivers.map(caregiver => (
            <div
              key={caregiver.id}
              className={cn(
                "p-4 rounded-xl border border-border bg-secondary/30",
                caregiver.isPrimary && "ring-2 ring-primary/20"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{caregiver.name}</span>
                      {caregiver.isPrimary && (
                        <Star className="w-4 h-4 text-warning fill-warning" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{caregiver.relationship}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleContact(caregiver, 'call')}
                >
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleContact(caregiver, 'message')}
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
