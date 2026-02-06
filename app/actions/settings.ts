'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Caregiver } from '@/types/eeg';

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

/** Default caregiver profile image when none is set (Supabase storage). */
const DEFAULT_CAREGIVER_AVATAR =
    'https://ogrefwgsopzhxgfvomro.supabase.co/storage/v1/object/public/altrea/avatars/1770215957098-21ffqi.jpeg';

/** Caregiver name + avatar for welcome banner. Uses same source as Settings so avatar matches what they see in Settings. */
export async function getCaregiverWelcomeInfo(): Promise<{ name: string; avatarUrl?: string | null } | null> {
    // Demo mode: return demo caregiver info
    return { name: 'Sara Zhou', avatarUrl: '/images/profile/sara.jpg' };
}

export async function getElderForAccount(): Promise<{ id: string; name: string; email?: string; phone?: string; avatarUrl?: string | null } | null> {
    // Demo mode: return demo elder info
    return {
        id: 'demo-elder-1',
        name: 'Dave Stanley',
        email: 'elder@demo.com',
        avatarUrl: '/images/profile/maria.jpg',
    };
}

export async function updateElderProfile(id: string, updates: { name?: string; avatarUrl?: string | null }) {
    // Use admin client - caregivers need to update elder's profile (RLS blocks own-profile-only updates)
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) {
        updateData.full_name = updates.name;
    }
    if (updates.avatarUrl !== undefined) {
        updateData.avatar_url = updates.avatarUrl;
    }

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}

export async function getCareTeamMembers() {
    // Demo mode: return demo caregiver and primary physician
    return [
        {
            id: 'demo-caregiver-1',
            name: 'Sara Zhou',
            email: 'caregiver@demo.com',
            phone: '',
            relationship: 'Primary Caregiver',
            isPrimary: true,
            alertPreferences: {
                critical: true,
                warning: true,
                info: false,
            },
            avatarUrl: '/images/profile/sara.jpg',
        },
        {
            id: 'demo-physician-1',
            name: 'Dr. Meredith Grey',
            email: 'meredith@gmail.com',
            phone: '',
            relationship: 'Primary Physician',
            isPrimary: false,
            alertPreferences: {
                critical: true,
                warning: true,
                info: false,
            },
            avatarUrl: '/images/profile/doctor.jpg',
        },
    ] as (Caregiver & { avatarUrl?: string | null })[];
}

export async function addCareTeamMember(member: Omit<Caregiver, 'id'> & { avatarUrl?: string | null }) {
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

    // Convert camelCase to snake_case for DB
    const { avatarUrl, alertPreferences, isPrimary, ...restMember } = member as any;

    const { data, error } = await supabase
        .from('care_team_members')
        .insert({
            ...restMember,
            avatar_url: avatarUrl || null,
            alert_preferences: alertPreferences || { critical: true, warning: true, info: false },
            is_primary: isPrimary || false,
            account_id: profile.account_id
        })
        .select()
        .single();

    if (error) return { error: error.message };

    // Mirror elder: sync avatar to profiles when caregiver adds themselves so welcome banner loads it
    if (avatarUrl) {
        const { data: profileRow } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        const isSelf =
            (member.email && user.email && member.email.toLowerCase() === user.email.toLowerCase()) ||
            (profileRow?.full_name && member.name && profileRow.full_name === member.name);
        if (isSelf) {
            await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
        }
    }

    return { data };
}

export async function updateCareTeamMember(id: string, member: Partial<Caregiver> & { avatarUrl?: string | null }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Convert camelCase to snake_case for DB
    const { avatarUrl, alertPreferences, isPrimary, ...restMember } = member as any;
    const updateData: any = { ...restMember };

    if (avatarUrl !== undefined) {
        updateData.avatar_url = avatarUrl;
    }
    if (alertPreferences !== undefined) {
        updateData.alert_preferences = alertPreferences;
    }
    if (isPrimary !== undefined) {
        updateData.is_primary = isPrimary;
    }

    const { error } = await supabase
        .from('care_team_members')
        .update(updateData)
        .eq('id', id);

    if (error) return { error: error.message };

    // Mirror elder behavior: when caregiver updates their own entry, sync avatar to profiles so welcome banner loads it
    if (avatarUrl !== undefined) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        const memberEmail = (member as any).email;
        const isCurrentUser =
            (memberEmail && user.email && memberEmail.toLowerCase() === user.email.toLowerCase()) ||
            (profile?.full_name && (member as any).name && profile.full_name === (member as any).name);
        if (isCurrentUser) {
            await supabase.from('profiles').update({ avatar_url: avatarUrl ?? null }).eq('id', user.id);
        }
    }

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
