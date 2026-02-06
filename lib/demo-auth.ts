/**
 * Demo Authentication System
 * Simple localStorage-based authentication for demo purposes
 * No Supabase dependency
 */

export type DemoUserRole = 'elder' | 'caregiver';

export interface DemoUser {
  id: string;
  email: string;
  role: DemoUserRole;
  name: string;
  avatarUrl?: string | null;
}

const DEMO_USERS: Record<string, DemoUser> = {
  'elder@demo.com': {
    id: 'demo-elder-1',
    email: 'elder@demo.com',
    role: 'elder',
    name: 'Dave Stanley',
    avatarUrl: null,
  },
  'caregiver@demo.com': {
    id: 'demo-caregiver-1',
    email: 'caregiver@demo.com',
    role: 'caregiver',
    name: 'Sara Zhou',
    avatarUrl: null,
  },
};

const DEMO_PASSWORDS: Record<string, string> = {
  'elder@demo.com': 'demo123',
  'caregiver@demo.com': 'demo123',
};

const STORAGE_KEY = 'altrea_demo_session';
const ROLE_STORAGE_KEY = 'altrea_demo_role';

/**
 * Demo login - accepts any email/password, assigns role based on roleIntent (takes precedence)
 */
export function demoLogin(email: string, password: string, roleIntent?: DemoUserRole): { success: boolean; error?: string; user?: DemoUser } {
  // roleIntent takes precedence - use it to determine the role
  const role = roleIntent || 'elder';
  
  // Check if email matches a demo user, but override role with roleIntent if provided
  let user: DemoUser | undefined = DEMO_USERS[email.toLowerCase()];
  
  if (user && roleIntent) {
    // Override the role if roleIntent is provided (user selected a specific role)
    user = {
      ...user,
      role: roleIntent,
    };
  } else if (!user) {
    // Create a demo user based on roleIntent or default to elder
    user = {
      id: `demo-${role}-${Date.now()}`,
      email: email.toLowerCase(),
      role,
      name: role === 'elder' ? 'Demo Elder' : 'Demo Caregiver',
      avatarUrl: null,
    };
  }

  // Store session
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatarUrl: user.avatarUrl,
      timestamp: Date.now(),
    }));
    localStorage.setItem(ROLE_STORAGE_KEY, user.role);
  }

  return { success: true, user };
}

/**
 * Demo signup - creates a new demo user
 */
export function demoSignup(email: string, password: string, role: DemoUserRole): { success: boolean; error?: string; user?: DemoUser } {
  const user: DemoUser = {
    id: `demo-${role}-${Date.now()}`,
    email: email.toLowerCase(),
    role,
    name: email.split('@')[0] || 'Demo User',
    avatarUrl: null,
  };

  // Store session
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatarUrl: user.avatarUrl,
      timestamp: Date.now(),
    }));
    localStorage.setItem(ROLE_STORAGE_KEY, user.role);
  }

  return { success: true, user };
}

/**
 * Get current demo user from localStorage
 */
export function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem(STORAGE_KEY);
  if (!sessionData) return null;

  try {
    const session = JSON.parse(sessionData);
    return {
      id: session.userId,
      email: session.email,
      role: session.role,
      name: session.name,
      avatarUrl: session.avatarUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Get current demo role
 */
export function getDemoRole(): DemoUserRole | null {
  if (typeof window === 'undefined') return null;
  
  const role = localStorage.getItem(ROLE_STORAGE_KEY);
  return role as DemoUserRole | null;
}

/**
 * Demo logout
 */
export function demoLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  }
}

/**
 * Check if user is authenticated (demo)
 */
export function isDemoAuthenticated(): boolean {
  return getDemoUser() !== null;
}

