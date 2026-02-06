"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserRole } from '@/types/eeg';
import { getDemoRole, isDemoAuthenticated } from '@/lib/demo-auth';

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  refetchRole: () => Promise<void>;
  isCaregiver: boolean;
  isElder: boolean;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function loadRole(
  setRoleState: (r: UserRole | null) => void,
  setLoading: (l: boolean) => void
) {
  try {
    // Demo mode: get role from localStorage
    if (typeof window !== 'undefined' && isDemoAuthenticated()) {
      const demoRole = getDemoRole();
      setRoleState(demoRole);
    } else {
      setRoleState(null);
    }
  } catch (error) {
    console.error("Failed to fetch user role", error);
    setRoleState(null);
  } finally {
    setLoading(false);
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole(setRoleState, setLoading);
    
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      loadRole(setRoleState, setLoading);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for changes (storage event doesn't fire in same tab)
    const interval = setInterval(() => {
      loadRole(setRoleState, setLoading);
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const refetchRole = useCallback(async () => {
    setLoading(true);
    loadRole(setRoleState, setLoading);
  }, []);

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    // Store in localStorage for demo
    if (typeof window !== 'undefined') {
      localStorage.setItem('altrea_demo_role', newRole);
    }
  };

  const value: RoleContextType = {
    role,
    setRole,
    refetchRole,
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
