'use server';

import { demoLogin, demoSignup, demoLogout } from '@/lib/demo-auth';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const roleIntent = formData.get('roleIntent') as 'elder' | 'caregiver' | null;

    const result = demoLogin(email, password, roleIntent || undefined);
    
    if (!result.success) {
        return { error: result.error || 'Login failed' };
    }

    return { success: true };
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'elder' | 'caregiver' | null;

    if (!role) {
        return { error: 'Role is required' };
    }

    const result = demoSignup(email, password, role);
    
    if (!result.success) {
        return { error: result.error || 'Signup failed' };
    }

    return { success: true };
}

export async function signOut() {
    demoLogout();
    return { success: true };
}
