import { getSupabaseClient } from '../lib/supabase';
import { BookingRequest } from '../types';

export interface LeadSubmission {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  preferredContactMethod?: string;
  budgetRange?: string;
  targetNeighborhood?: string;
  propertyId?: string;
  status?: string;
  createdAt?: string;
}

/**
 * Submit a Viewing Request (Available to all visitors)
 */
export async function submitViewingRequest(booking: Partial<BookingRequest>): Promise<boolean> {
  const supabase = getSupabaseClient();
  const dbPayload = {
    id: booking.id || `book-${Date.now()}`,
    property_id: booking.propertyId && booking.propertyId.length > 20 ? booking.propertyId : null,
    property_title: booking.propertyTitle || 'مشاوره اختصاصی ملک',
    property_location: (booking as any).propertyLocation || 'تهران',
    property_image: booking.propertyImage || '',
    name: booking.name || '',
    phone: booking.phone || '',
    preferred_date: booking.date || (booking as any).preferredDate || new Date().toISOString(),
    preferred_time: booking.timeSlot || (booking as any).preferredTime || '14:00',
    notes: booking.notes || '',
    visit_type: booking.visitType === 'virtual-3d' ? 'virtual_tour' : 'in_person',
    status: 'pending',
  };

  // 1. Direct Supabase insert (RLS policy allows INSERT with check true)
  if (supabase) {
    try {
      const { error } = await supabase.from('viewing_requests').insert([dbPayload]);
      if (!error) return true;
      console.warn('Supabase viewing request insert note:', error.message);
    } catch (err) {
      console.warn('Direct viewing request insert note:', err);
    }
  }

  // 2. Server API fallback
  try {
    const res = await fetch('/api/viewing-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    return res.ok;
  } catch (err) {
    console.warn('API viewing request note:', err);
    return false;
  }
}

/**
 * Fetch Viewing Requests (Protected: Super Admin only)
 */
export async function fetchViewingRequests(authToken?: string | null): Promise<any[]> {
  const supabase = getSupabaseClient();

  // 1. Direct Supabase query (protected by RLS is_super_admin())
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('viewing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          propertyId: item.property_id,
          propertyTitle: item.property_title,
          propertyLocation: item.property_location,
          propertyImage: item.property_image,
          name: item.name,
          phone: item.phone,
          preferredDate: item.preferred_date,
          preferredTime: item.preferred_time,
          notes: item.notes,
          visitType: item.visit_type === 'virtual_tour' ? 'virtual-3d' : 'in-person',
          status: item.status,
          trackingCode: `TRK-${item.id.slice(0, 6)}`,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase viewing_requests select note:', err);
    }
  }

  // 2. Server API query with Bearer token
  if (authToken) {
    try {
      const res = await fetch('/api/viewing-requests', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.bookings || [];
      }
    } catch (err) {
      console.warn('API viewing_requests fetch note:', err);
    }
  }

  return [];
}

/**
 * Submit a Lead / Consultation Request (Available to all visitors)
 */
export async function submitLead(lead: LeadSubmission): Promise<boolean> {
  const supabase = getSupabaseClient();
  const dbPayload = {
    id: lead.id || `lead-${Date.now()}`,
    full_name: lead.fullName,
    phone: lead.phone,
    email: lead.email || null,
    subject: lead.subject || 'درخواست مشاوره ملکی',
    message: lead.message,
    preferred_contact_method: lead.preferredContactMethod || 'phone',
    budget_range: lead.budgetRange || null,
    target_neighborhood: lead.targetNeighborhood || null,
    property_id: lead.propertyId && lead.propertyId.length > 20 ? lead.propertyId : null,
    status: 'new',
  };

  // 1. Direct Supabase insert (RLS policy allows INSERT with check true)
  if (supabase) {
    try {
      const { error } = await supabase.from('leads').insert([dbPayload]);
      if (!error) return true;
      console.warn('Supabase lead insert note:', error.message);
    } catch (err) {
      console.warn('Direct lead insert note:', err);
    }
  }

  // 2. Server API fallback
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    return res.ok;
  } catch (err) {
    console.warn('API lead submission note:', err);
    return false;
  }
}

/**
 * Fetch Leads (Protected: Super Admin only)
 */
export async function fetchLeads(authToken?: string | null): Promise<any[]> {
  const supabase = getSupabaseClient();

  // 1. Direct Supabase query (protected by RLS is_super_admin())
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          fullName: item.full_name,
          name: item.full_name,
          phone: item.phone,
          email: item.email,
          subject: item.subject,
          message: item.message,
          preferredContactMethod: item.preferred_contact_method,
          budgetRange: item.budget_range,
          targetNeighborhood: item.target_neighborhood,
          propertyId: item.property_id,
          status: item.status,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase leads select note:', err);
    }
  }

  // 2. Server API query with Bearer token
  if (authToken) {
    try {
      const res = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.leads || [];
      }
    } catch (err) {
      console.warn('API leads fetch note:', err);
    }
  }

  return [];
}
