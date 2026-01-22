'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/eeg';

export async function completeSetup(role: UserRole, accountName: string, deviceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Call the secure RPC function to create account and link user
    const { data, error } = await supabase.rpc('create_account_and_link_user', {
        account_name: accountName,
        device_id: deviceId,
        user_role: role
    });

    if (error) {
        console.error('Setup failed:', error);
        return { error: error.message };
    }

    return { success: true, accountId: data };
}
