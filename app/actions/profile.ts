'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/eeg';

export async function updateProfileRole(role: UserRole) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: role,
            updated_at: new Date().toISOString()
        });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function getProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        return null;
    }

    return data;
}

export async function getFullProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return {
        ...profile,
        email: user.email,
        name: user.user_metadata?.full_name,
        created_at: user.created_at
    };
}
