"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '@/types/eeg';
import { fetchUserRole } from '@/app/actions/user';
import { updateProfileRole } from '@/app/actions/profile';

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  isCaregiver: boolean;
  isElder: boolean;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load role from server on mount
    const initRole = async () => {
      try {
        const fetchedRole = await fetchUserRole();
        setRoleState(fetchedRole);
      } catch (error) {
        console.error("Failed to fetch user role", error);
      } finally {
        setLoading(false);
      }
    };
    initRole();
  }, []);

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    // Optimistically update, actual server update happens via actions in setup
  };

  const value: RoleContextType = {
    role,
    setRole,
    isCaregiver: role === 'caregiver',
    isElder: role === 'elder',
    loading
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
