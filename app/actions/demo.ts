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
    };
    caregiver: {
        email: string;
        password: string;
        name: string;
        phone?: string;
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
                role: 'elder'
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
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        // Step 3: Create caregiver user
        const { data: caregiverUser, error: caregiverError } = await adminClient.auth.admin.createUser({
            email: demoAccount.caregiver.email,
            password: demoAccount.caregiver.password,
            email_confirm: true,
            user_metadata: {
                full_name: demoAccount.caregiver.name,
                role: 'caregiver'
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
            accountName: 'Smith Family Care',
            deviceId: 'SN-DEMO-001',
            elder: {
                email: 'demo.elder@altrea.test',
                password: 'Demo123!',
                name: 'Margaret Smith',
                phone: '+1-555-0101'
            },
            caregiver: {
                email: 'demo.caregiver@altrea.test',
                password: 'Demo123!',
                name: 'John Smith',
                phone: '+1-555-0102'
            },
            careTeamMembers: [
                {
                    name: 'Sarah Smith',
                    email: 'sarah.smith@example.com',
                    phone: '+1-555-0103',
                    relationship: 'Daughter',
                    role: 'caregiver',
                    isPrimary: false
                },
                {
                    name: 'Dr. Emily Johnson',
                    email: 'dr.johnson@example.com',
                    phone: '+1-555-0104',
                    relationship: 'Primary Physician',
                    role: 'caregiver',
                    isPrimary: false
                }
            ]
        },
        {
            accountName: 'Johnson Wellness Circle',
            deviceId: 'SN-DEMO-002',
            elder: {
                email: 'demo.elder2@altrea.test',
                password: 'Demo123!',
                name: 'Robert Johnson',
                phone: '+1-555-0201'
            },
            caregiver: {
                email: 'demo.caregiver2@altrea.test',
                password: 'Demo123!',
                name: 'Lisa Johnson',
                phone: '+1-555-0202'
            },
            careTeamMembers: [
                {
                    name: 'Michael Johnson',
                    email: 'michael.j@example.com',
                    phone: '+1-555-0203',
                    relationship: 'Son',
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

