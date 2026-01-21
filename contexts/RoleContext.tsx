"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '@/types/eeg';
import { storageService } from '@/services/storage';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isCaregiver: boolean;
  isElder: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('caregiver');

  useEffect(() => {
    // Load role from storage on mount
    const storedRole = storageService.getUserRole();
    setRoleState(storedRole);
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    storageService.saveUserRole(newRole);
  };

  const value: RoleContextType = {
    role,
    setRole,
    isCaregiver: role === 'caregiver',
    isElder: role === 'elder',
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
