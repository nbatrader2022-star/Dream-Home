import { getSupabaseClient } from '../lib/supabase';
import { UserProfile, AdminUserRecord } from '../types';

export interface AdminAuthState {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  user: UserProfile | null;
  adminRecord: AdminUserRecord | null;
  token: string | null;
}

// In-memory token cache for verified Supabase session
let inMemoryAdminToken: string | null = null;

/**
 * Verifies if a user has the 'superadmin' role in Supabase admin_users table.
 * Strictly requires a verified Supabase user and active superadmin status in public.admin_users.
 */
export async function verifySuperAdminRole(
  userId?: string,
  email?: string,
  accessToken?: string
): Promise<{ isSuperAdmin: boolean; adminRecord: AdminUserRecord | null }> {
  const supabase = getSupabaseClient();
  const targetEmail = (email || '').trim().toLowerCase();

  // 1. Cryptographically verify with server-side requireSuperAdmin middleware if accessToken is provided
  if (accessToken) {
    try {
      const res = await fetch('/api/auth/verify-superadmin', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isSuperAdmin && data.adminRecord?.role === 'superadmin' && data.adminRecord?.status === 'active') {
          return {
            isSuperAdmin: true,
            adminRecord: data.adminRecord,
          };
        }
      }
    } catch {
      // Continue to direct Supabase client query
    }
  }

  // 2. Direct Supabase query against admin_users table using the authenticated session (RLS protected)
  if (supabase && (userId || targetEmail)) {
    try {
      let query = supabase.from('admin_users').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.ilike('email', targetEmail);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data && data.role === 'superadmin' && data.status === 'active') {
        return {
          isSuperAdmin: true,
          adminRecord: {
            id: data.id,
            userId: data.user_id,
            email: data.email,
            name: data.name || 'مدیر ارشد',
            role: data.role,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
        };
      }
    } catch (err) {
      console.warn('Direct admin_users check error:', err);
    }
  }

  return { isSuperAdmin: false, adminRecord: null };
}

// Local listeners array for unified auth broadcasting
const localAuthListeners: Array<(state: AdminAuthState) => void> = [];

export function notifyAdminAuthListeners(state: AdminAuthState) {
  localAuthListeners.forEach((cb) => {
    try {
      cb(state);
    } catch (e) {
      console.warn('Auth listener notification error:', e);
    }
  });
}

/**
 * Retrieve current verified admin token from in-memory session
 */
export function getAdminSessionToken(): string | null {
  return inMemoryAdminToken;
}

export function setAdminSessionToken(token: string | null) {
  inMemoryAdminToken = token;
}

/**
 * Sign in with Supabase Email/Password with fallback to server BaaS
 */
export async function signInAdminWithSupabase(
  email: string,
  password: string
): Promise<AdminAuthState> {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try Supabase Auth first
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!error && data?.user) {
        const sbUser = data.user;
        const token = data.session?.access_token || null;

        const { isSuperAdmin, adminRecord } = await verifySuperAdminRole(
          sbUser.id,
          sbUser.email || normalizedEmail,
          token || undefined
        );

        if (isSuperAdmin) {
          inMemoryAdminToken = token;
          const userProfile: UserProfile = {
            uid: sbUser.id,
            displayName: adminRecord?.name || sbUser.user_metadata?.full_name || 'مدیر ارشد',
            email: sbUser.email || normalizedEmail,
            savedProperties: [],
            role: 'superadmin',
            createdAt: sbUser.created_at || new Date().toISOString(),
          };

          const authState: AdminAuthState = {
            isAuthenticated: true,
            isSuperAdmin: true,
            user: userProfile,
            adminRecord,
            token,
          };

          notifyAdminAuthListeners(authState);
          return authState;
        }
      }
    } catch (e) {
      console.warn('Supabase sign-in client attempt note:', e);
    }
  }

  // 2. Server API fallback (POST /api/auth/login)
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.isSuperAdmin && json.token) {
        inMemoryAdminToken = json.token;
        const userProfile: UserProfile = {
          uid: json.user?.id || 'admin-super-01',
          displayName: json.user?.name || 'مدیر کل سیستم',
          email: normalizedEmail,
          savedProperties: [],
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        };

        const adminRecord: AdminUserRecord = {
          id: json.adminRecord?.id || 'admin-super-01',
          userId: json.user?.id,
          email: normalizedEmail,
          name: json.user?.name || 'مدیر ارشد سیستم',
          role: 'superadmin',
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        const authState: AdminAuthState = {
          isAuthenticated: true,
          isSuperAdmin: true,
          user: userProfile,
          adminRecord,
          token: json.token,
        };

        notifyAdminAuthListeners(authState);
        return authState;
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'اطلاعات ورود نادرست است یا حساب شما مجوز مدیر ارشد ندارد.');
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  throw new Error('ورود ناموفق بود. لطفاً از ایمیل مدیر ارشد و رمز عبور معتبر استفاده فرمایید.');
}

/**
 * Sign Up new user via Supabase Auth
 */
export async function signUpAdminWithSupabase(
  email: string,
  password: string,
  displayName: string
): Promise<AdminAuthState> {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    throw new Error('تنظیمات اتصال به Supabase پیکربندی نشده است.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: displayName,
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'خطا در ثبت‌نام حساب کاربری.');
  }

  const sbUser = data.user;
  const token = data.session?.access_token || null;

  if (!sbUser) {
    throw new Error('ثبت نام انجام شد اما اطلاعات کاربر دریافت نشد.');
  }

  const { isSuperAdmin, adminRecord } = await verifySuperAdminRole(
    sbUser.id,
    sbUser.email || normalizedEmail,
    token || undefined
  );

  const userProfile: UserProfile = {
    uid: sbUser.id,
    displayName,
    email: sbUser.email || normalizedEmail,
    savedProperties: [],
    role: isSuperAdmin ? 'superadmin' : 'client',
    createdAt: sbUser.created_at || new Date().toISOString(),
  };

  return {
    isAuthenticated: Boolean(data.session),
    isSuperAdmin,
    user: userProfile,
    adminRecord,
    token,
  };
}

/**
 * Sign out admin session
 */
export async function signOutAdmin(): Promise<void> {
  inMemoryAdminToken = null;

  try {
    localStorage.removeItem('dream_home_admin_session');
    localStorage.removeItem('dream_home_auth_user');
    // Clear any Supabase cached auth tokens
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
        localStorage.removeItem(key);
      }
    }
  } catch {}

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      console.warn('Supabase sign out note:', e);
    }
  }

  notifyAdminAuthListeners({
    isAuthenticated: false,
    isSuperAdmin: false,
    user: null,
    adminRecord: null,
    token: null,
  });
}

/**
 * Get current authenticated Supabase session & verify superadmin.
 * Supabase Auth is the ONLY source of truth.
 */
export async function getCurrentAdminSession(): Promise<AdminAuthState> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session.access_token) {
        const sbUser = session.user;
        const token = session.access_token;
        const { isSuperAdmin, adminRecord } = await verifySuperAdminRole(
          sbUser.id,
          sbUser.email,
          token
        );

        if (isSuperAdmin && adminRecord) {
          inMemoryAdminToken = token;
          const profile: UserProfile = {
            uid: sbUser.id,
            displayName: adminRecord?.name || sbUser.user_metadata?.full_name || 'مدیر کل سیستم',
            email: sbUser.email || '',
            savedProperties: [],
            role: 'superadmin',
            createdAt: sbUser.created_at || new Date().toISOString(),
          };

          return {
            isAuthenticated: true,
            isSuperAdmin: true,
            user: profile,
            adminRecord,
            token,
          };
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
    }
  }

  // 2. Check in-memory admin token if active in current session
  if (inMemoryAdminToken) {
    try {
      const res = await fetch('/api/auth/verify-superadmin', {
        headers: { Authorization: `Bearer ${inMemoryAdminToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.isSuperAdmin && json.user) {
          return {
            isAuthenticated: true,
            isSuperAdmin: true,
            user: {
              uid: json.user.id || 'admin-super-01',
              displayName: json.user.name || 'مدیر کل سیستم',
              email: json.user.email || '',
              savedProperties: [],
              role: 'superadmin',
              createdAt: new Date().toISOString(),
            },
            adminRecord: json.adminRecord || null,
            token: inMemoryAdminToken,
          };
        }
      }
    } catch {}
  }

  inMemoryAdminToken = null;
  return {
    isAuthenticated: false,
    isSuperAdmin: false,
    user: null,
    adminRecord: null,
    token: null,
  };
}

/**
 * Subscribe to Supabase and Unified Auth state changes
 */
export function subscribeToSupabaseAuth(
  callback: (state: AdminAuthState) => void
) {
  localAuthListeners.push(callback);

  // Send current verified session state immediately
  getCurrentAdminSession().then((curr) => {
    callback(curr);
  });

  const supabase = getSupabaseClient();
  let unsubSupabase: (() => void) | null = null;

  if (supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user && session.access_token) {
          const sbUser = session.user;
          const token = session.access_token;
          const { isSuperAdmin, adminRecord } = await verifySuperAdminRole(
            sbUser.id,
            sbUser.email,
            token
          );

          if (isSuperAdmin && adminRecord) {
            inMemoryAdminToken = token;
            const state: AdminAuthState = {
              isAuthenticated: true,
              isSuperAdmin: true,
              user: {
                uid: sbUser.id,
                displayName: adminRecord?.name || sbUser.user_metadata?.full_name || 'مدیر ارشد',
                email: sbUser.email || '',
                savedProperties: [],
                role: 'superadmin',
                createdAt: sbUser.created_at || new Date().toISOString(),
              },
              adminRecord,
              token,
            };
            callback(state);
            return;
          }
        }

        inMemoryAdminToken = null;
        callback({
          isAuthenticated: false,
          isSuperAdmin: false,
          user: null,
          adminRecord: null,
          token: null,
        });
      }
    );
    unsubSupabase = () => subscription.unsubscribe();
  }

  return () => {
    const idx = localAuthListeners.indexOf(callback);
    if (idx !== -1) localAuthListeners.splice(idx, 1);
    if (unsubSupabase) unsubSupabase();
  };
}
