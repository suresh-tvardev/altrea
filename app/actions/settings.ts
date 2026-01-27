'use server';

import { createClient } from '@/lib/supabase/server';
import { Caregiver } from '@/types/eeg';

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
    const contacts: Caregiver[] = [];

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
        }));
        contacts.push(...convertedMembers);
    }

    // Also check profiles for partner caregiver (in case they weren't added to care_team_members)
    // This ensures we always show the partner caregiver to elder users
    if (currentUserRole === 'elder') {
        const { data: partnerProfiles } = await supabase
            .from('profiles')
            .select('id, full_name')
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
                    });
                }
            }
        }
    }

    return contacts;
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
