import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Resolve avatar URL: use Supabase storage URL when available, else ui-avatars fallback */
export function resolveAvatarUrl(
  avatarUrl: string | null | undefined,
  name: string
): string {
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&size=96&background=6366f1&color=fff`;
  }
  // Full URL from Supabase upload
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  // Storage path - construct full Supabase public URL
  const base = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : '';
  if (base) {
    const path = avatarUrl.startsWith('avatars/') ? avatarUrl : `avatars/${avatarUrl}`;
    return `${base}/storage/v1/object/public/altrea/${path}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&size=96&background=6366f1&color=fff`;
}
