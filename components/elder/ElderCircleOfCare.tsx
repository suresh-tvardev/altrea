"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, User, Stethoscope, AlertCircle, Star } from 'lucide-react';
import { getCareTeamMembers } from '@/app/actions/settings';
import type { Caregiver } from '@/types/eeg';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const ElderCircleOfCare = () => {
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);

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
    <Card className="border-2 border-pink-200 bg-white/90 shadow-lg">
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
              <AlertCircle className="w-5 h-5 text-red-500" />
              Emergency
            </h3>
            <Button
              onClick={handleEmergency}
              className="w-full h-16 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <Phone className="w-6 h-6 mr-2" />
              Emergency Services
            </Button>
          </div>

          {/* Primary Caregiver */}
          {primaryCaregiver && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Primary Caregiver
              </h3>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
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
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
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
                <User className="w-5 h-5 text-blue-500" />
                Family
              </h3>
              <div className="space-y-2">
                {familyMembers.map(caregiver => (
                  <div
                    key={caregiver.id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-foreground">
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
                <Stethoscope className="w-5 h-5 text-green-500" />
                Doctors
              </h3>
              <div className="space-y-2">
                {doctors.map(caregiver => (
                  <div
                    key={caregiver.id}
                    className="p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-foreground">
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
