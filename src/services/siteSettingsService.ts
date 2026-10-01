import { getSupabaseClient } from '../lib/supabase';
import { SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data/settings';

/**
 * Fetch Site Settings from Supabase
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'general')
        .maybeSingle();

      if (!error && data?.value) {
        return { ...DEFAULT_SITE_SETTINGS, ...data.value };
      }
    } catch (err) {
      console.warn('Supabase site_settings fetch note:', err);
    }
  }

  return DEFAULT_SITE_SETTINGS;
}

/**
 * Save Site Settings to Supabase (Super Admin only)
 */
export async function saveSiteSettings(
  settings: SiteSettings,
  authToken?: string | null
): Promise<SiteSettings> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'general',
          value: settings,
          updated_at: new Date().toISOString(),
        });

      if (!error) return settings;
      console.warn('Supabase site_settings upsert note:', error.message);
    } catch (err) {
      console.warn('Direct site_settings save note:', err);
    }
  }

  return settings;
}
