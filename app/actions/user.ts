'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRole, Caregiver } from '@/types/eeg';

export async function fetchUserRole(): Promise<UserRole | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data || !data.role) return null;

        return data.role as UserRole;
    } catch (error) {
        // If there's any error (e.g., missing env vars, database connection issue), return null
        // This allows the page to show the landing page instead of crashing
        console.error('Error fetching user role:', error);
        return null;
    }
}

/**
 * Check if user is authenticated but missing a profile (no role or account_id)
 * Returns true if user is logged in but needs to complete setup
 */
export async function isAuthenticatedButMissingProfile(): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false; // Not authenticated

        const { data, error } = await supabase
            .from('profiles')
            .select('role, account_id')
            .eq('id', user.id)
            .single();

        // If profile doesn't exist or is missing role/account_id, user needs setup
        if (error || !data || !data.role || !data.account_id) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking profile status:', error);
        return false;
    }
}
