'use server';

import { getDemoRole, getDemoUser, isDemoAuthenticated } from '@/lib/demo-auth';
import { UserRole } from '@/types/eeg';

export async function fetchUserRole(): Promise<UserRole | null> {
    try {
        // For demo, get role from localStorage via client-side check
        // Since this is a server action, we need to handle it differently
        // Return null and let client-side handle it
        return null;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}

/**
 * Check if user is authenticated but missing a profile (no role or account_id)
 * Returns true if user is logged in but needs to complete setup
 * For demo, always return false (no setup needed)
 */
export async function isAuthenticatedButMissingProfile(): Promise<boolean> {
    // Demo mode: always return false (no setup needed)
    return false;
}
