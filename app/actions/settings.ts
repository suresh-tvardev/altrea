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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, account_id')
        .eq('id', user.id)
        .single();

    if (!profile?.full_name) return null;

    // Use same list as Settings: getCareTeamMembers() so we resolve avatar the same way (care_team + profile fallback)
    const members = await getCareTeamMembers();
    const self = members.find(
        (m) =>
            (user.email && m.email && norm(m.email) === norm(user.email!)) ||
            (profile.full_name && m.name && norm(m.name) === norm(profile.full_name))
    );

    const avatarUrl = profile.avatar_url ?? self?.avatarUrl ?? DEFAULT_CAREGIVER_AVATAR;
    return { name: profile.full_name, avatarUrl };
}

export async function getElderForAccount(): Promise<{ id: string; name: string; email?: string; phone?: string; avatarUrl?: string | null } | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', user.id)
        .single();

    if (!profile?.account_id) return null;

    const { data: elderProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('account_id', profile.account_id)
        .eq('role', 'elder')
        .single();

    if (!elderProfile?.full_name) return null;

    let email: string | undefined;
    try {
        const admin = createAdminClient();
        const { data: elderAuthUser } = await admin.auth.admin.getUserById(elderProfile.id);
        email = elderAuthUser?.user?.email || undefined;
    } catch {
        // Admin API may fail in some envs; still return profile with name and avatar
    }

    return {
        id: elderProfile.id,
        name: elderProfile.full_name,
        email,
        avatarUrl: elderProfile.avatar_url ?? null,
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
    const supabase = await createClient();

    // We get the account_id and role from the user's profile first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
        .from('profiles')
        .select('account_id, role')
        .eq('id', user.id)
        .single();

    if (!profile?.account_id) return [];

    const currentUserRole = profile.role;
    const contacts: (Caregiver & { avatarUrl?: string | null })[] = [];

    // Get caregiver profiles (with avatar_url) for this account to match by email
    const { data: caregiverProfiles } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('account_id', profile.account_id)
        .eq('role', 'caregiver');

    const getAvatarForCaregiver = (name: string) => {
        const match = caregiverProfiles?.find(p =>
            p.full_name && name && p.full_name === name
        );
        return match?.avatar_url || null;
    };

    // Get care team members from care_team_members table
    // Filter based on role:
    // - Elder sees: caregivers (role='caregiver') - these are their contacts
    // - Caregiver sees: other caregivers (role='caregiver'), NOT elder (role='elder')
    // Both should see caregivers, so we filter for role='caregiver'
    const { data: teamMembers, error } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('account_id', profile.account_id)
        .eq('role', 'caregiver') // Both elder and caregiver should see caregivers (not elder)
        .order('is_primary', { ascending: false }) // Primary caregivers first
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching care team members:', error);
    } else if (teamMembers) {
        // Convert care_team_members to Caregiver format
        const convertedMembers = teamMembers.map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            relationship: member.relationship || 'Caregiver',
            isPrimary: member.is_primary || false,
            alertPreferences: member.alert_preferences || {
                critical: true,
                warning: true,
                info: false,
            },
            // Use avatar_url from DB if available, otherwise try to match from profiles
            avatarUrl: member.avatar_url || getAvatarForCaregiver(member.name),
        }));
        contacts.push(...convertedMembers);
    }

    // Also check profiles for partner caregiver (in case they weren't added to care_team_members)
    // This ensures we always show the partner caregiver to elder users
    if (currentUserRole === 'elder') {
        const { data: partnerProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('account_id', profile.account_id)
            .eq('role', 'caregiver')
            .neq('id', user.id);

        if (partnerProfiles && partnerProfiles.length > 0) {
            for (const partner of partnerProfiles) {
                // Check if partner is already in contacts (from care_team_members)
                const existsInContacts = contacts.some(c => {
                    // Match by email or by checking if it's a UUID (profile id)
                    return c.email && partner.id && (
                        c.id === partner.id || 
                        c.email.includes(partner.id.substring(0, 8))
                    );
                });

                if (!existsInContacts) {
                    // Partner not in care_team_members, add them from profile
                    // Try to find matching member by name
                    const matchingMember = teamMembers?.find(m => 
                        m.name === partner.full_name
                    );

                    contacts.push({
                        id: partner.id,
                        name: partner.full_name || 'Caregiver',
                        email: matchingMember?.email || '',
                        phone: matchingMember?.phone || '',
                        relationship: matchingMember?.relationship || 'Primary Caregiver',
                        isPrimary: true,
                        alertPreferences: matchingMember?.alert_preferences || {
                            critical: true,
                            warning: true,
                            info: false,
                        },
                        avatarUrl: (partner as { avatar_url?: string })?.avatar_url || null,
                    });
                }
            }
        }
    }

    return contacts;
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
