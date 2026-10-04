import { getSupabaseClient } from '../lib/supabase';
import { UserProfile } from '../types';

export interface UserProfileRecord {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  phone_number?: string;
  saved_properties: string[];
  created_at: string;
  updated_at: string;
}

// In-memory normal user state (strictly derived from Supabase Auth)
let currentNormalUser: UserProfile | null = null;
const authListeners: Array<(user: UserProfile | null) => void> = [];

function notifyListeners(user: UserProfile | null) {
  currentNormalUser = user;
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.warn('User auth listener error:', e);
    }
  });
}

/**
 * Sync user profile from Supabase profiles table.
 * If the profile row does not exist yet, it creates it with metadata from Google.
 */
export async function syncUserProfile(
  userId: string,
  userMetadata?: any,
  userEmail?: string
): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;

  try {
    // 1. Query existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Profile fetch warning:', error);
    }

    if (profile) {
      const userProfile: UserProfile = {
        uid: profile.id,
        displayName: profile.full_name || userMetadata?.full_name || userMetadata?.name || 'کاربر گرامی',
        email: profile.email || userEmail || '',
        photoURL: profile.avatar_url || userMetadata?.avatar_url || userMetadata?.picture || undefined,
        phoneNumber: profile.phone_number || undefined,
        savedProperties: Array.isArray(profile.saved_properties) ? profile.saved_properties : [],
        role: 'client', // Normal users are always clients
        createdAt: profile.created_at || new Date().toISOString(),
      };
      return userProfile;
    }

    // 2. Profile does not exist yet, create initial profile
    const initialProfile = {
      id: userId,
      full_name: userMetadata?.full_name || userMetadata?.name || 'کاربر گرامی',
      avatar_url: userMetadata?.avatar_url || userMetadata?.picture || '',
      email: userEmail || '',
      saved_properties: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert(initialProfile)
      .select()
      .maybeSingle();

    if (!insertError && created) {
      return {
        uid: created.id,
        displayName: created.full_name,
        email: created.email,
        photoURL: created.avatar_url || undefined,
        phoneNumber: created.phone_number || undefined,
        savedProperties: created.saved_properties || [],
        role: 'client',
        createdAt: created.created_at,
      };
    }

    // Fallback if table insert is restricted or pending
    return {
      uid: userId,
      displayName: initialProfile.full_name,
      email: initialProfile.email,
      photoURL: initialProfile.avatar_url || undefined,
      savedProperties: [],
      role: 'client',
      createdAt: initialProfile.created_at,
    };
  } catch (err) {
    console.warn('Sync user profile error:', err);
    return null;
  }
}

/**
 * Get current normal user session.
 * Source of truth is strictly:
 * supabase.auth.getSession() and supabase.auth.getUser().
 * NEVER reads from localStorage or fake tokens.
 */
export async function getCurrentNormalUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    currentNormalUser = null;
    return null;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      currentNormalUser = null;
      return null;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      currentNormalUser = null;
      return null;
    }

    // Load profile from public.profiles table
    const profile = await syncUserProfile(user.id, user.user_metadata, user.email);
    if (profile) {
      currentNormalUser = profile;
      return profile;
    }

    // Direct fallback from real Supabase user object
    const fallbackProfile: UserProfile = {
      uid: user.id,
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'کاربر گرامی',
      email: user.email || '',
      photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
      phoneNumber: user.phone || undefined,
      savedProperties: [],
      role: 'client',
      createdAt: user.created_at || new Date().toISOString(),
    };
    currentNormalUser = fallbackProfile;
    return fallbackProfile;
  } catch (err) {
    console.warn('Error retrieving current normal user:', err);
    currentNormalUser = null;
    return null;
  }
}

/**
 * Sign in normal user using Supabase Google OAuth.
 * Uses:
 * supabase.auth.signInWithOAuth({ provider: 'google' })
 */
export async function signInNormalUserWithGoogle(options?: {
  redirectTo?: string;
  savedPropertyIds?: string[];
}): Promise<{ url?: string; openedPopup: boolean }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('سیستم احراز هویت Supabase پیکربندی نشده است. لطفاً متغیرهای VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY را بررسی فرمایید.');
  }

  const origin = window.location.origin;
  const redirectUri = options?.redirectTo || `${origin}/auth/callback`;

  // Request OAuth authorization URL with skipBrowserRedirect: true
  // This allows opening directly in popup for preview or full redirect if needed
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'خطا در برقراری ارتباط با سرویس ورود گوگل.');
  }

  if (!data?.url) {
    throw new Error('آدرس احراز هویت گوگل از سرور دریافت نشد.');
  }

  // Attempt to open in a centered popup window
  const width = 520;
  const height = 650;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;

  try {
    const popup = window.open(
      data.url,
      'supabase_google_auth',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (popup && !popup.closed) {
      return { url: data.url, openedPopup: true };
    }
  } catch (e) {
    console.warn('Popup blocked, falling back to direct redirect:', e);
  }

  // If popup was blocked by browser or iframe, navigate current window
  window.location.href = data.url;
  return { url: data.url, openedPopup: false };
}

/**
 * Sign out normal user from Supabase session
 */
export async function signOutNormalUser(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error during Supabase sign out:', e);
    }
  }

  // Clean local memory
  currentNormalUser = null;
  notifyListeners(null);
}

/**
 * Save user's favorite properties in Supabase profiles table
 */
export async function saveUserFavoriteProperties(
  userId: string,
  savedPropertyIds: string[]
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  try {
    await supabase
      .from('profiles')
      .update({
        saved_properties: savedPropertyIds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (currentNormalUser && currentNormalUser.uid === userId) {
      currentNormalUser.savedProperties = savedPropertyIds;
      notifyListeners({ ...currentNormalUser });
    }
  } catch (err) {
    console.warn('Failed to update saved_properties in profiles table:', err);
  }
}

/**
 * Update user's profile information
 */
export async function updateUserProfile(
  userId: string,
  updates: { full_name?: string; phone_number?: string; avatar_url?: string }
): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (!error && data) {
      const updatedUser: UserProfile = {
        uid: data.id,
        displayName: data.full_name,
        email: data.email,
        photoURL: data.avatar_url || undefined,
        phoneNumber: data.phone_number || undefined,
        savedProperties: data.saved_properties || [],
        role: 'client',
        createdAt: data.created_at,
      };
      notifyListeners(updatedUser);
      return updatedUser;
    }
  } catch (err) {
    console.warn('Failed to update user profile:', err);
  }
  return null;
}

/**
 * Subscribe to Supabase normal user authentication changes
 */
export function subscribeToNormalUserAuth(
  callback: (user: UserProfile | null) => void
): () => void {
  authListeners.push(callback);

  // Immediately invoke with current state
  getCurrentNormalUser().then((user) => {
    callback(user);
  });

  const supabase = getSupabaseClient();
  let unsubSupabase: (() => void) | null = null;

  // Listen for popup callback message
  const handleMessage = async (event: MessageEvent) => {
    if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
      if (event.data.hash) {
        const hash = event.data.hash.replace(/^#/, '');
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken && supabase) {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          } catch (e) {
            console.warn('Error setting Supabase session from OAuth popup callback:', e);
          }
        }
      }

      const refreshedUser = await getCurrentNormalUser();
      notifyListeners(refreshedUser);
    }
  };
  window.addEventListener('message', handleMessage);

  if (supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const profile = await syncUserProfile(
              session.user.id,
              session.user.user_metadata,
              session.user.email
            );
            notifyListeners(profile);
            return;
          }
        } else if (event === 'SIGNED_OUT') {
          notifyListeners(null);
          return;
        }

        const curr = await getCurrentNormalUser();
        notifyListeners(curr);
      }
    );
    unsubSupabase = () => subscription.unsubscribe();
  }

  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) authListeners.splice(idx, 1);
    window.removeEventListener('message', handleMessage);
    if (unsubSupabase) unsubSupabase();
  };
}
