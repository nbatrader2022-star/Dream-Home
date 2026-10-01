import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-initialized Supabase Client
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (url && anonKey) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return clientInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export interface DatabaseStatus {
  connected: boolean;
  provider: 'Supabase PostgreSQL' | 'Backend In-Memory / Local Cache';
  urlConfigured: boolean;
  tables: {
    properties: number;
    agents: number;
    neighborhoods: number;
    blog_posts: number;
    viewing_requests: number;
    leads: number;
  };
}

// Check database connection status
export async function checkDatabaseHealth(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/database-status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Database health check error:', e);
  }

  return {
    connected: false,
    provider: 'Backend In-Memory / Local Cache',
    urlConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL),
    tables: {
      properties: 12,
      agents: 4,
      neighborhoods: 6,
      blog_posts: 6,
      viewing_requests: 2,
      leads: 3,
    },
  };
}
