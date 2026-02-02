'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { UserRole } from '@/types/eeg';

export interface DemoAccount {
    accountName: string;
    deviceId: string;
    elder: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        avatarUrl?: string;
    };
    caregiver: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        avatarUrl?: string;
    };
    careTeamMembers?: Array<{
        name: string;
        email: string;
        phone?: string;
        relationship: string;
        role: 'caregiver';
        isPrimary?: boolean;
    }>;
}

export async function createDemoAccount(demoAccount: DemoAccount) {
    const adminClient = createAdminClient();

    try {
        // Step 1: Create account
        const { data: accountData, error: accountError } = await adminClient
            .from('accounts')
            .insert({
                name: demoAccount.accountName,
                connection_info: { device_id: demoAccount.deviceId }
            })
            .select('id')
            .single();

        if (accountError || !accountData) {
            return { error: accountError?.message || 'Failed to create account' };
        }

        const accountId = accountData.id;

        // Step 2: Create elder user
        const { data: elderUser, error: elderError } = await adminClient.auth.admin.createUser({
            email: demoAccount.elder.email,
            password: demoAccount.elder.password,
            email_confirm: true,
            user_metadata: {
                full_name: demoAccount.elder.name,
                role: 'elder',
                avatar_url: demoAccount.elder.avatarUrl || null
            }
        });

        if (elderError || !elderUser.user) {
            await adminClient.from('accounts').delete().eq('id', accountId);
            return { error: elderError?.message || 'Failed to create elder user' };
        }

        // Wait for profile trigger
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update elder profile
        await adminClient
            .from('profiles')
            .upsert({
                id: elderUser.user.id,
                role: 'elder',
                full_name: demoAccount.elder.name,
                account_id: accountId,
                avatar_url: demoAccount.elder.avatarUrl || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        // Step 3: Create caregiver user
        const { data: caregiverUser, error: caregiverError } = await adminClient.auth.admin.createUser({
            email: demoAccount.caregiver.email,
            password: demoAccount.caregiver.password,
            email_confirm: true,
            user_metadata: {
                full_name: demoAccount.caregiver.name,
                role: 'caregiver',
                avatar_url: demoAccount.caregiver.avatarUrl || null
            }
        });

        if (caregiverError || !caregiverUser.user) {
            await adminClient.auth.admin.deleteUser(elderUser.user.id);
            await adminClient.from('accounts').delete().eq('id', accountId);
            return { error: caregiverError?.message || 'Failed to create caregiver user' };
        }

        // Wait for profile trigger
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update caregiver profile
        await adminClient
            .from('profiles')
            .upsert({
                id: caregiverUser.user.id,
                role: 'caregiver',
                full_name: demoAccount.caregiver.name,
                account_id: accountId,
                avatar_url: demoAccount.caregiver.avatarUrl || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        // Step 4: Add caregiver to care_team_members (so elder can see them)
        await adminClient
            .from('care_team_members')
            .insert({
                account_id: accountId,
                name: demoAccount.caregiver.name,
                email: demoAccount.caregiver.email,
                phone: demoAccount.caregiver.phone || null,
                relationship: 'Primary Caregiver',
                role: 'caregiver',
                is_primary: true,
                alert_preferences: {
                    critical: true,
                    warning: true,
                    info: true
                }
            });

        // Step 5: Add additional care team members if provided
        if (demoAccount.careTeamMembers && demoAccount.careTeamMembers.length > 0) {
            const careTeamData = demoAccount.careTeamMembers.map(member => ({
                account_id: accountId,
                name: member.name,
                email: member.email,
                phone: member.phone || null,
                relationship: member.relationship,
                role: member.role,
                is_primary: member.isPrimary || false,
                alert_preferences: {
                    critical: true,
                    warning: true,
                    info: false
                }
            }));

            await adminClient
                .from('care_team_members')
                .insert(careTeamData);
        }

        return {
            success: true,
            accountId,
            elderEmail: demoAccount.elder.email,
            caregiverEmail: demoAccount.caregiver.email
        };
    } catch (error: any) {
        console.error('Demo account creation failed:', error);
        return { error: error.message || 'An unexpected error occurred' };
    }
}

export async function setupDemoEnvironment() {
    const demoAccounts: DemoAccount[] = [
        {
            accountName: 'Garcia Care Team',
            deviceId: 'SN-DEMO-001',
            elder: {
                email: 'mariagarcia@gmail.com',
                password: 'Demo123!',
                name: 'Maria Garcia',
                phone: '+1-555-0101',
                avatarUrl: 'https://ui-avatars.com/api/?name=Maria+Garcia&size=128&background=ec4899&color=fff'
            },
            caregiver: {
                email: 'saraz@mit.edu',
                password: 'Demo123!',
                name: 'Sara Zhou',
                phone: '+1-555-0102',
                avatarUrl: 'https://ui-avatars.com/api/?name=Sara+Zhou&size=128&background=3b82f6&color=fff'
            },
            careTeamMembers: [
                {
                    name: 'Dr. Meredith Grey',
                    email: 'meredith@gmail.com',
                    phone: '+1-555-0104',
                    relationship: 'Primary Physician',
                    role: 'caregiver',
                    isPrimary: false
                }
            ]
        }
    ];

    const results = [];
    for (const account of demoAccounts) {
        const result = await createDemoAccount(account);
        results.push({
            accountName: account.accountName,
            ...result
        });
    }

    return {
        success: results.every(r => r.success),
        results
    };
}

export async function clearDemoEnvironment() {
    const adminClient = createAdminClient();

    try {
        const demoEmails = [
            'mariagarcia@gmail.com',
            'saraz@mit.edu'
        ];

        const demoAccountNames = [
            'Garcia Care Team'
        ];

        const demoDeviceIds = [
            'SN-DEMO-001'
        ];

        // Step 1: Find demo accounts by name
        const { data: accountsByName } = await adminClient
            .from('accounts')
            .select('id, name, connection_info')
            .in('name', demoAccountNames);

        // Get all accounts and filter by device ID (since JSONB queries can be tricky)
        const { data: allAccounts } = await adminClient
            .from('accounts')
            .select('id, name, connection_info');

        // Filter accounts by device ID
        const accountsByDevice = (allAccounts || []).filter(acc => {
            const deviceId = (acc.connection_info as any)?.device_id;
            return deviceId && demoDeviceIds.includes(deviceId);
        });

        // Combine and deduplicate account IDs
        const allDemoAccounts = [...(accountsByName || []), ...accountsByDevice];
        const uniqueAccounts = Array.from(new Map(allDemoAccounts.map(a => [a.id, a])).values());
        const accountIds: string[] = uniqueAccounts.map(a => a.id);
        const userIds: string[] = [];

        if (accountIds.length > 0) {

            // Step 2: Delete care team members for these accounts
            await adminClient
                .from('care_team_members')
                .delete()
                .in('account_id', accountIds);

            // Step 3: Find users by email and get their IDs
            for (const email of demoEmails) {
                try {
                    const { data: users } = await adminClient.auth.admin.listUsers();
                    const user = users?.users.find(u => u.email === email);
                    if (user) {
                        userIds.push(user.id);
                    }
                } catch (error) {
                    console.error(`Error finding user ${email}:`, error);
                }
            }

            // Step 4: Delete profiles for demo users
            if (userIds.length > 0) {
                await adminClient
                    .from('profiles')
                    .delete()
                    .in('id', userIds);
            }

            // Step 5: Delete auth users
            for (const userId of userIds) {
                try {
                    await adminClient.auth.admin.deleteUser(userId);
                } catch (error) {
                    console.error(`Error deleting user ${userId}:`, error);
                }
            }

            // Step 6: Delete accounts
            await adminClient
                .from('accounts')
                .delete()
                .in('id', accountIds);
        }

        return {
            success: true,
            deletedAccounts: accountIds.length,
            deletedUsers: userIds.length
        };
    } catch (error: any) {
        console.error('Demo cleanup failed:', error);
        return { error: error.message || 'An unexpected error occurred during cleanup' };
    }
}

export async function checkDemoUsersExist() {
    const adminClient = createAdminClient();

    try {
        const demoEmails = [
            'mariagarcia@gmail.com',
            'saraz@mit.edu'
        ];

        // Check if any demo users exist by email
        const { data: users } = await adminClient.auth.admin.listUsers();
        const demoUsersExist = users?.users.some(user => 
            user.email && demoEmails.includes(user.email)
        ) || false;

        return {
            exists: demoUsersExist
        };
    } catch (error: any) {
        console.error('Error checking demo users:', error);
        return { exists: false, error: error.message };
    }
}


