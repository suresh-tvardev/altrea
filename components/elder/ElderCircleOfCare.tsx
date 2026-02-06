"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, User, Stethoscope, AlertCircle, Star } from 'lucide-react';
import { getCareTeamMembers } from '@/app/actions/settings';
import type { Caregiver } from '@/types/eeg';
import { useToast } from '@/hooks/use-toast';
import { cn, resolveAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const ElderCircleOfCare = () => {
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<(Caregiver & { avatarUrl?: string | null })[]>([]);

  useEffect(() => {
    loadCaregivers();
    // Refresh every 5 seconds to get updated contacts
    const interval = setInterval(loadCaregivers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadCaregivers = async () => {
    try {
      const loaded = await getCareTeamMembers();
    setCaregivers(loaded);
    } catch (error) {
      console.error('Error loading caregivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCall = (phone: string, name: string) => {
    // Create tel: link for actual calling
    window.location.href = `tel:${phone}`;
    toast({
      title: `Calling ${name}`,
      description: `Connecting to ${phone}...`,
    });
  };

  const handleEmergency = () => {
    // Call emergency services
    window.location.href = 'tel:911';
    toast({
      title: 'Emergency Services',
      description: 'Connecting to emergency services...',
      variant: 'destructive',
    });
  };

  const primaryCaregiver = caregivers.find(c => c.isPrimary);
  const familyMembers = caregivers.filter(c => !c.isPrimary && c.relationship.toLowerCase().includes('family'));
  const doctors = caregivers.filter(c => 
    c.relationship.toLowerCase().includes('doctor') || 
    c.relationship.toLowerCase().includes('physician') ||
    c.relationship.toLowerCase().includes('nurse')
  );

  return (
    <Card className="border border-sky-200/60 bg-white/95 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Your Circle of Care
            </h2>
            <p className="text-lg text-muted-foreground">
              People who care about you and are here to help
            </p>
          </div>

          {/* Emergency Services */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Emergency
            </h3>
            <Button
              onClick={handleEmergency}
              variant="outline"
              className="w-full h-16 text-lg font-bold border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800"
            >
              <Phone className="w-6 h-6 mr-2" />
              Emergency Services
            </Button>
          </div>

          {/* Primary Caregiver */}
          {primaryCaregiver && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                Primary Caregiver
              </h3>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={resolveAvatarUrl((primaryCaregiver as { avatarUrl?: string | null }).avatarUrl, primaryCaregiver.name)} alt={primaryCaregiver.name} />
                    <AvatarFallback className="bg-amber-200 text-amber-800 text-sm">
                      {primaryCaregiver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-foreground">
                      {primaryCaregiver.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {primaryCaregiver.relationship}
                    </div>
                    {primaryCaregiver.phone && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {primaryCaregiver.phone}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleCall(primaryCaregiver.phone, primaryCaregiver.name)}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"
                  disabled={!primaryCaregiver.phone}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          )}

          {/* Family Members */}
          {familyMembers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" />
                Family
              </h3>
              <div className="space-y-2">
                {familyMembers.map(caregiver => (
                  <div
                    key={caregiver.id}
                    className="p-3 bg-sky-50 rounded-lg border border-sky-200/60"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={resolveAvatarUrl((caregiver as { avatarUrl?: string | null }).avatarUrl, caregiver.name)} alt={caregiver.name} />
                        <AvatarFallback className="bg-sky-200 text-sky-800 text-xs">
                          {caregiver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {caregiver.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {caregiver.relationship}
                        </div>
                        {caregiver.phone && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {caregiver.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCall(caregiver.phone, caregiver.name)}
                      variant="outline"
                      className="w-full h-10"
                      disabled={!caregiver.phone}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctors */}
          {doctors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-500" />
                Doctors
              </h3>
              <div className="space-y-2">
                {doctors.map(caregiver => (
                  <div
                    key={caregiver.id}
                    className="p-3 bg-emerald-50 rounded-lg border border-emerald-200/60"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={resolveAvatarUrl((caregiver as { avatarUrl?: string | null }).avatarUrl, caregiver.name)} alt={caregiver.name} />
                        <AvatarFallback className="bg-emerald-200 text-emerald-800 text-xs">
                          {caregiver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {caregiver.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {caregiver.relationship}
                        </div>
                        {caregiver.phone && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {caregiver.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCall(caregiver.phone, caregiver.name)}
                      variant="outline"
                      className="w-full h-10"
                      disabled={!caregiver.phone}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {caregivers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No contacts configured</p>
              <p className="text-sm mt-1">
                Ask your caregiver to add contacts in settings
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
