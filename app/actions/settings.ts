'use server';

import { createClient } from '@/lib/supabase/server';
import { Caregiver } from '@/types/eeg';

export async function getCareTeamMembers() {
    const supabase = await createClient();

    // We get the account_id from the user's profile first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', user.id)
        .single();

    if (!profile?.account_id) return [];

    const { data, error } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('account_id', profile.account_id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching care team members:', error);
        return [];
    }

    return data as Caregiver[];
}

export async function addCareTeamMember(member: Omit<Caregiver, 'id'>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', user.id)
        .single();

    if (!profile?.account_id) {
        // If user has no account, creating one or handling it is complex.
        // For now, assume they might need an account created.
        // But let's return error.
        return { error: 'No account linked to user' };
    }

    const { data, error } = await supabase
        .from('care_team_members')
        .insert({
            ...member,
            account_id: profile.account_id
        })
        .select()
        .single();

    if (error) return { error: error.message };
    return { data };
}

export async function updateCareTeamMember(id: string, member: Partial<Caregiver>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('care_team_members')
        .update(member)
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteCareTeamMember(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('care_team_members')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}
