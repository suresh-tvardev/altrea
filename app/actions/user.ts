'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRole, Caregiver } from '@/types/eeg';

export async function fetchUserRole(): Promise<UserRole | null> {
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
}
