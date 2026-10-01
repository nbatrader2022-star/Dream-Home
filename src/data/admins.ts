export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'editor';
  addedAt: string;
}

export const SUPER_ADMIN_EMAIL = 'luxury.investor@gmail.com';
export const SUPER_ADMIN_SECONDARY_EMAIL = 'nabikalandar0@gmail.com';

export const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin-super-1',
    email: 'luxury.investor@gmail.com',
    name: 'مدیر ارشد سامانه (Super Admin)',
    role: 'superadmin',
    addedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-super-2',
    email: 'nabikalandar0@gmail.com',
    name: 'مدیر ارشد سامانه (Super Admin)',
    role: 'superadmin',
    addedAt: '2025-01-01T00:00:00.000Z',
  },
];

const ADMINS_STORAGE_KEY = 'dream_home_admin_list';
const VISIBILITY_STORAGE_KEY = 'dream_home_admin_visibility_mode';

export function getStoredAdmins(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (raw) {
      let parsed: AdminUser[] = JSON.parse(raw);
      // Ensure super admins always exist in the list
      DEFAULT_ADMINS.forEach((defAdmin) => {
        if (!parsed.some((a) => a.email.toLowerCase() === defAdmin.email.toLowerCase())) {
          parsed.unshift(defAdmin);
        }
      });
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse admin list from storage', err);
  }
  return DEFAULT_ADMINS;
}

export function saveStoredAdmins(admins: AdminUser[]): void {
  try {
    const ensured = [...admins];
    DEFAULT_ADMINS.forEach((defAdmin) => {
      if (!ensured.some((a) => a.email.toLowerCase() === defAdmin.email.toLowerCase())) {
        ensured.unshift(defAdmin);
      }
    });
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(ensured));
  } catch (err) {
    console.error('Failed to save admin list', err);
  }
}

export function isUserAuthorizedAdmin(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  const normalized = userEmail.trim().toLowerCase();
  if (normalized === 'luxury.investor@gmail.com' || normalized === 'nabikalandar0@gmail.com') return true;

  const admins = getStoredAdmins();
  return admins.some((a) => a.email.toLowerCase() === normalized);
}

export function getAdminVisibilitySettings(): { hideFromNonAdmins: boolean } {
  try {
    const raw = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (raw !== null) {
      return { hideFromNonAdmins: raw === 'true' };
    }
  } catch {}
  // Default to strict mode: hide from non-admins!
  return { hideFromNonAdmins: true };
}

export function saveAdminVisibilitySettings(settings: { hideFromNonAdmins: boolean }): void {
  try {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, String(settings.hideFromNonAdmins));
  } catch {}
}
