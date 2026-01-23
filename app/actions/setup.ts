'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UserRole } from '@/types/eeg';

export async function checkSetupStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { isSetupComplete: false, account: null, role: null };
    }

    // Check if user has a profile with account_id and role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, account_id')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || !profile.account_id || !profile.role) {
        return { isSetupComplete: false, account: null, role: null };
    }

    // Fetch account details
    const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id, name, connection_info')
        .eq('id', profile.account_id)
        .single();

    if (accountError || !account) {
        return { isSetupComplete: false, account: null, role: null };
    }

    return {
        isSetupComplete: true,
        account: {
            id: account.id,
            name: account.name,
            deviceId: account.connection_info?.device_id || null
        },
        role: profile.role as UserRole
    };
}

export interface PartnerDetails {
    name: string;
    email: string;
    password: string;
    phone?: string;
    relationship?: string;
}

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

export async function completeSetupWithPartner(
    role: UserRole,
    accountName: string,
    deviceId: string,
    partnerDetails: PartnerDetails
) {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Determine partner role (opposite of current user's role)
    const partnerRole: UserRole = role === 'caregiver' ? 'elder' : 'caregiver';

    try {
        // Step 1: Create account first (before creating partner user)
        // Use admin client to bypass RLS policies
        const { data: accountData, error: accountCreateError } = await adminClient
            .from('accounts')
            .insert({
                name: accountName,
                connection_info: { device_id: deviceId }
            })
            .select('id')
            .single();

        if (accountCreateError || !accountData) {
            console.error('Failed to create account:', accountCreateError);
            return { error: accountCreateError?.message || 'Failed to create account' };
        }

        const accountId = accountData.id;

        // Step 2: Link current user to the account
        const { error: currentUserLinkError } = await supabase
            .from('profiles')
            .update({
                account_id: accountId,
                role: role,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (currentUserLinkError) {
            // Cleanup: delete account if linking fails
            await adminClient.from('accounts').delete().eq('id', accountId);
            console.error('Failed to link current user to account:', currentUserLinkError);
            return { error: 'Failed to link your account. Please try again.' };
        }

        // Step 3: Create partner user account via Admin API
        const { data: partnerUser, error: createUserError } = await adminClient.auth.admin.createUser({
            email: partnerDetails.email,
            password: partnerDetails.password,
            email_confirm: true, // Auto-confirm email for smoother onboarding
            user_metadata: {
                full_name: partnerDetails.name,
                role: partnerRole
            }
        });

        if (createUserError || !partnerUser.user) {
            // Cleanup: delete account if user creation fails
            await adminClient.from('accounts').delete().eq('id', accountId);
            // Check if email already exists
            if (createUserError?.message?.includes('already registered') || 
                createUserError?.message?.includes('already exists')) {
                return { error: 'This email is already registered. Please use a different email.' };
            }
            console.error('Failed to create partner user:', createUserError);
            return { error: createUserError?.message || 'Failed to create partner account' };
        }

        // Step 4: Wait for trigger to create profile, then update it
        // The trigger on_auth_user_created should create the profile automatically
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update partner profile with role, name, and link to account
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: partnerUser.user.id,
                role: partnerRole,
                full_name: partnerDetails.name,
                account_id: accountId,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            });

        if (profileError) {
            // Cleanup: delete partner user and account if profile update fails
            await adminClient.auth.admin.deleteUser(partnerUser.user.id);
            await adminClient.from('accounts').delete().eq('id', accountId);
            console.error('Failed to create/update partner profile:', profileError);
            return { error: `Failed to create partner profile: ${profileError.message}. Please try again.` };
        }

        // Step 5: Optionally add partner to care_team_members for easier access
        if (partnerDetails.phone || partnerDetails.relationship) {
            await adminClient
                .from('care_team_members')
                .insert({
                    account_id: accountId,
                    name: partnerDetails.name,
                    email: partnerDetails.email,
                    phone: partnerDetails.phone || null,
                    relationship: partnerDetails.relationship || (role === 'caregiver' ? 'Elder' : 'Caregiver'),
                    role: partnerRole,
                    is_primary: true,
                    alert_preferences: {
                        critical: true,
                        warning: true,
                        info: true
                    }
                });
        }

        return {
            success: true,
            accountId,
            partnerEmail: partnerDetails.email
        };
    } catch (error: any) {
        console.error('Setup with partner failed:', error);
        return { error: error.message || 'An unexpected error occurred during setup' };
    }
}
