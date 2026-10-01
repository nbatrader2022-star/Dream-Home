import { getSupabaseClient } from '../lib/supabase';
import { AdminUserRecord, AdminAuditLog } from '../types';

const PRIMARY_SUPER_ADMIN_EMAIL = 'nabikalandar0@gmail.com';

/**
 * Fetch list of admin users (Super Admin only)
 */
export async function fetchAdminUsers(authToken?: string | null): Promise<AdminUserRecord[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          email: item.email,
          name: item.name || 'مدیر سیستم',
          role: item.role || 'superadmin',
          status: item.status || 'active',
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase admin_users fetch note:', err);
    }
  }

  // Fallback initial superadmin
  return [
    {
      id: 'super-admin-root',
      email: PRIMARY_SUPER_ADMIN_EMAIL,
      name: 'مدیر ارشد خانه آرمانی',
      role: 'superadmin',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
}

/**
 * Add or invite new admin user (Super Admin only)
 */
export async function addAdminUser(
  email: string,
  name: string,
  role: 'superadmin' | 'admin' | 'editor',
  authToken?: string | null
): Promise<AdminUserRecord> {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();

  if (supabase) {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: normalizedEmail,
          name,
          role,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        userId: data.user_id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        createdAt: data.created_at,
      };
    }
    if (error) {
      throw new Error(error.message || 'خطا در ثبت مدیر جدید.');
    }
  }

  return {
    id: `admin-${Date.now()}`,
    email: normalizedEmail,
    name,
    role,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Toggle admin status or role
 */
export async function updateAdminUserStatus(
  id: string,
  status: 'active' | 'suspended',
  authToken?: string | null
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('admin_users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }
  return true;
}

/**
 * Delete admin user (Protected against primary superadmin deletion)
 */
export async function deleteAdminUserRecord(
  id: string,
  email: string,
  authToken?: string | null
): Promise<boolean> {
  if (email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('حذف مدیر ارشد اصلی سیستم مجاز نمی‌باشد.');
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    return !error;
  }
  return true;
}

/**
 * Record an audit log entry in Supabase admin_audit_logs
 */
export async function recordAdminAuditLog(
  userEmail: string,
  action: string,
  resource: string,
  details?: Record<string, any>
): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('admin_audit_logs').insert([
        {
          user_email: userEmail,
          action,
          resource,
          details: details || {},
        },
      ]);
    } catch (err) {
      console.warn('Audit log write note:', err);
    }
  }
}

/**
 * Fetch audit logs (Super Admin only)
 */
export async function fetchAdminAuditLogs(authToken?: string | null): Promise<AdminAuditLog[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        return data.map((log) => ({
          id: log.id,
          userId: log.user_id,
          userEmail: log.user_email,
          action: log.action,
          resource: log.resource,
          resourceId: log.resource_id,
          details: log.details,
          ipAddress: log.ip_address,
          createdAt: log.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase audit logs fetch note:', err);
    }
  }

  return [];
}
