import { getSupabaseClient } from '../lib/supabase';
import { UserProfile, AdminUserRecord } from '../types';
import { SUPER_ADMIN_EMAIL } from '../data/admins';

export interface AdminAuthState {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  user: UserProfile | null;
  adminRecord: AdminUserRecord | null;
  token: string | null;
}

const SUPER_ADMIN_FALLBACK_EMAIL = 'luxury.investor@gmail.com';
const SUPER_ADMIN_SECONDARY_EMAIL = 'nabikalandar0@gmail.com';

/**
 * Verifies if a user has the 'superadmin' role in Supabase admin_users table
 */
export async function verifySuperAdminRole(
  userId?: string,
  email?: string,
  accessToken?: string
): Promise<{ isSuperAdmin: boolean; adminRecord: AdminUserRecord | null }> {
  const supabase = getSupabaseClient();
  const targetEmail = (email || '').trim().toLowerCase();

  // 1. Try server-side verification with JWT if accessToken is present
  if (accessToken) {
    try {
      const res = await fetch('/api/auth/verify-superadmin', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isSuperAdmin) {
          return {
            isSuperAdmin: true,
            adminRecord: data.adminRecord || {
              id: data.adminRecord?.id || 'admin-super',
              userId: userId,
              email: targetEmail,
              name: data.adminRecord?.name || 'مدیر ارشد سرمایه‌گذاری (Super Admin)',
              role: 'superadmin',
              status: 'active',
              createdAt: new Date().toISOString(),
            },
          };
        }
      }
    } catch {
      // Fallback to role check API or direct Supabase client query
    }
  }

  // 2. Query backend RBAC endpoint that inspects Supabase admin_users table
  if (targetEmail) {
    try {
      const res = await fetch(`/api/auth/check-role?email=${encodeURIComponent(targetEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.isSuperAdmin && data.role === 'superadmin' && data.status === 'active') {
          return {
            isSuperAdmin: true,
            adminRecord: data.adminRecord || {
              id: data.adminRecord?.id || 'admin-super-01',
              userId: userId,
              email: targetEmail,
              name: data.adminRecord?.name || 'مدیر ارشد سرمایه‌گذاری (Super Admin)',
              role: 'superadmin',
              status: 'active',
              createdAt: new Date().toISOString(),
            },
          };
        }
      }
    } catch {
      // Continue to direct Supabase query
    }
  }

  // 3. Direct Supabase query against admin_users table (RLS protected)
  if (supabase && (userId || targetEmail)) {
    try {
      let query = supabase.from('admin_users').select('*');
      if (userId) {
        query = query.or(`user_id.eq.${userId},email.ilike.${targetEmail}`);
      } else {
        query = query.ilike('email', targetEmail);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        const isSuper = data.role === 'superadmin' && data.status === 'active';
        return {
          isSuperAdmin: isSuper,
          adminRecord: {
            id: data.id,
            userId: data.user_id,
            email: data.email,
            name: data.name || 'مدیر ارشد سرمایه‌گذاری (Super Admin)',
            role: data.role,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
        };
      }
    } catch (err) {
      console.warn('Direct admin_users check note:', err);
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
 * Retrieve current cached admin token
 */
export function getAdminSessionToken(): string | null {
  try {
    const raw = localStorage.getItem('dream_home_admin_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) return parsed.token;
    }
  } catch {}
  return null;
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

          try {
            localStorage.setItem('dream_home_admin_session', JSON.stringify(authState));
          } catch {}

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
      if (json.success && json.isSuperAdmin) {
        const userProfile: UserProfile = {
          uid: json.user?.id || 'admin-super-01',
          displayName: json.user?.name || 'مدیر کل سیستم',
          email: normalizedEmail,
          savedProperties: [],
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        };

        const adminRecord: AdminUserRecord = {
          id: 'admin-super-01',
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

        try {
          localStorage.setItem('dream_home_admin_session', JSON.stringify(authState));
        } catch {}

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
 * Get current authenticated Supabase session & verify superadmin
 */
export async function getCurrentAdminSession(): Promise<AdminAuthState> {
  const supabase = getSupabaseClient();

  // 1. Check Supabase session first if available
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const sbUser = session.user;
        const token = session.access_token;
        const { isSuperAdmin, adminRecord } = await verifySuperAdminRole(
          sbUser.id,
          sbUser.email,
          token
        );

        if (isSuperAdmin) {
          const profile: UserProfile = {
            uid: sbUser.id,
            displayName: adminRecord?.name || sbUser.user_metadata?.full_name || 'مدیر کل سیستم',
            email: sbUser.email || '',
            savedProperties: [],
            role: 'superadmin',
            createdAt: sbUser.created_at || new Date().toISOString(),
          };

          const state: AdminAuthState = {
            isAuthenticated: true,
            isSuperAdmin: true,
            user: profile,
            adminRecord,
            token,
          };

          try {
            localStorage.setItem('dream_home_admin_session', JSON.stringify(state));
          } catch {}

          return state;
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
    }
  }

  // 2. Check cached local admin session and strictly re-verify against database
  try {
    const raw = localStorage.getItem('dream_home_admin_session');
    if (raw) {
      const parsed: AdminAuthState = JSON.parse(raw);
      if (parsed?.token || parsed?.user?.email) {
        const verifyRes = await verifySuperAdminRole(
          parsed.user?.uid,
          parsed.user?.email,
          parsed.token || undefined
        );
        if (verifyRes.isSuperAdmin) {
          parsed.isSuperAdmin = true;
          parsed.adminRecord = verifyRes.adminRecord;
          return parsed;
        } else {
          // Token or user is no longer an active super admin in database
          localStorage.removeItem('dream_home_admin_session');
        }
      }
    }
  } catch {}

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

  // Send current cached state immediately
  getCurrentAdminSession().then((curr) => {
    if (curr.isSuperAdmin) {
      callback(curr);
    }
  });

  const supabase = getSupabaseClient();
  let unsubSupabase: (() => void) | null = null;

  if (supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const sbUser = session.user;
          const token = session.access_token;
          const { isSuperAdmin, adminRecord } = await verifySuperAdminRole(
            sbUser.id,
            sbUser.email,
            token
          );

          const state: AdminAuthState = {
            isAuthenticated: true,
            isSuperAdmin,
            user: {
              uid: sbUser.id,
              displayName: adminRecord?.name || sbUser.user_metadata?.full_name || 'مدیر ارشد',
              email: sbUser.email || '',
              savedProperties: [],
              role: isSuperAdmin ? 'superadmin' : 'client',
              createdAt: sbUser.created_at || new Date().toISOString(),
            },
            adminRecord,
            token,
          };

          if (isSuperAdmin) {
            try {
              localStorage.setItem('dream_home_admin_session', JSON.stringify(state));
            } catch {}
          }

          callback(state);
        } else {
          // If no supabase session, check local session before clearing
          const local = getAdminSessionToken();
          if (!local) {
            callback({
              isAuthenticated: false,
              isSuperAdmin: false,
              user: null,
              adminRecord: null,
              token: null,
            });
          }
        }
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
