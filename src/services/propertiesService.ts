import { getSupabaseClient } from '../lib/supabase';
import { Property, SupportedCityKey } from '../types';
import { PROPERTIES_DATA } from '../data/properties';

/**
 * Map DB row (snake_case) to Frontend Property (camelCase)
 */
export function dbToProperty(row: any): Property {
  return {
    id: String(row.id),
    title: row.title || '',
    slug: row.slug || `prop-${row.id}`,
    transactionType: row.transaction_type || row.transactionType || 'buy',
    propertyType: row.property_type || row.propertyType || 'apartment',
    price: Number(row.price || 0),
    rentPrice: row.rent_price !== undefined ? Number(row.rent_price) : undefined,
    depositPrice: row.deposit_price !== undefined ? Number(row.deposit_price) : undefined,
    location: row.location || '',
    neighborhood: row.neighborhood || '',
    city: (row.city || 'tehran') as SupportedCityKey,
    cityNameFa: row.city_name_fa || row.cityNameFa || 'تهران',
    area: Number(row.area || 0),
    bedrooms: Number(row.bedrooms || 1),
    bathrooms: Number(row.bathrooms || 1),
    parking: Number(row.parking || 1),
    floor: Number(row.floor || 1),
    totalFloors: Number(row.total_floors || row.totalFloors || 1),
    buildingAge: Number(row.building_age || row.buildingAge || 0),
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description || '',
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    agent: row.agent_data || row.agent || {
      id: 'agent-default',
      name: 'مشاور ارشد خانه آرمانی',
      role: 'کارشناس رسمی املاک و مستغلات لوکس',
      phone: '۰۲۱۲۲۰۰۰۰۰۰',
      whatsapp: '989121111111',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
      dealsCount: 120,
      experienceYears: 10,
    },
    coordinates: row.coordinates || { lat: 35.8, lng: 51.42 },
    status: row.status || 'sale',
    featured: Boolean(row.featured),
    virtualTourAvailable: Boolean(row.virtual_tour_available || row.virtualTourAvailable),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    viewsCount: Number(row.views_count || row.viewsCount || 0),
    completionYear: row.completion_year || row.completionYear,
    renovations: row.renovations,
  };
}

/**
 * Map Frontend Property (camelCase) to DB row (snake_case)
 */
export function propertyToDb(prop: Partial<Property>): any {
  const dbObj: any = {};
  if (prop.id) dbObj.id = prop.id;
  if (prop.title !== undefined) dbObj.title = prop.title;
  if (prop.slug !== undefined) dbObj.slug = prop.slug;
  if (prop.transactionType !== undefined) dbObj.transaction_type = prop.transactionType;
  if (prop.propertyType !== undefined) dbObj.property_type = prop.propertyType;
  if (prop.price !== undefined) dbObj.price = prop.price;
  if (prop.rentPrice !== undefined) dbObj.rent_price = prop.rentPrice;
  if (prop.depositPrice !== undefined) dbObj.deposit_price = prop.depositPrice;
  if (prop.location !== undefined) dbObj.location = prop.location;
  if (prop.neighborhood !== undefined) dbObj.neighborhood = prop.neighborhood;
  if (prop.city !== undefined) dbObj.city = prop.city;
  if (prop.cityNameFa !== undefined) dbObj.city_name_fa = prop.cityNameFa;
  if (prop.area !== undefined) dbObj.area = prop.area;
  if (prop.bedrooms !== undefined) dbObj.bedrooms = prop.bedrooms;
  if (prop.bathrooms !== undefined) dbObj.bathrooms = prop.bathrooms;
  if (prop.parking !== undefined) dbObj.parking = prop.parking;
  if (prop.floor !== undefined) dbObj.floor = prop.floor;
  if (prop.totalFloors !== undefined) dbObj.total_floors = prop.totalFloors;
  if (prop.buildingAge !== undefined) dbObj.building_age = prop.buildingAge;
  if (prop.images !== undefined) dbObj.images = prop.images;
  if (prop.description !== undefined) dbObj.description = prop.description;
  if (prop.amenities !== undefined) dbObj.amenities = prop.amenities;
  if (prop.agent !== undefined) {
    dbObj.agent_data = prop.agent;
    if (prop.agent.id && prop.agent.id.length > 20) {
      dbObj.agent_id = prop.agent.id;
    }
  }
  if (prop.coordinates !== undefined) dbObj.coordinates = prop.coordinates;
  if (prop.status !== undefined) dbObj.status = prop.status;
  if (prop.featured !== undefined) dbObj.featured = prop.featured;
  if (prop.virtualTourAvailable !== undefined) dbObj.virtual_tour_available = prop.virtualTourAvailable;
  if (prop.viewsCount !== undefined) dbObj.views_count = prop.viewsCount;
  dbObj.updated_at = new Date().toISOString();
  return dbObj;
}

/**
 * Fetch all properties from Supabase or server API
 */
export async function fetchAllProperties(): Promise<Property[]> {
  const supabase = getSupabaseClient();

  // 1. First attempt: Direct Supabase PostgreSQL query
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(dbToProperty);
      }
    } catch (err) {
      console.warn('Supabase properties fetch note:', err);
    }
  }

  // 2. Second attempt: API server endpoint
  try {
    const res = await fetch('/api/properties');
    if (res.ok) {
      const json = await res.json();
      if (json.properties && Array.isArray(json.properties) && json.properties.length > 0) {
        return json.properties.map((p: any) => (p.transaction_type ? dbToProperty(p) : p));
      }
    }
  } catch (err) {
    console.warn('API properties fetch note:', err);
  }

  // 3. Fallback: Default mock initial data
  return PROPERTIES_DATA;
}

/**
 * Fetch a single property dynamically by Slug or ID from Supabase / Database / API
 */
export async function fetchPropertyBySlugOrId(slugOrId: string): Promise<Property | null> {
  if (!slugOrId) return null;
  const decoded = decodeURIComponent(slugOrId).trim().toLowerCase();
  const supabase = getSupabaseClient();

  // 1. Direct Supabase query
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`id.eq.${slugOrId},slug.eq.${slugOrId},slug.eq.${decoded}`)
        .maybeSingle();

      if (!error && data) {
        return dbToProperty(data);
      }
    } catch (err) {
      console.warn('Supabase fetchPropertyBySlugOrId note:', err);
    }
  }

  // 2. Server BaaS REST endpoint
  try {
    const res = await fetch(`/api/properties/${encodeURIComponent(slugOrId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.property) {
        return json.property.transaction_type ? dbToProperty(json.property) : json.property;
      }
    }
  } catch (err) {
    console.warn('API fetchPropertyBySlugOrId note:', err);
  }

  // 3. Fallback to bundled dataset by ID or slug matching
  const found = PROPERTIES_DATA.find((p) => {
    const pid = String(p.id).toLowerCase();
    const pslug = String(p.slug || '').toLowerCase();
    return (
      pid === decoded ||
      pslug === decoded ||
      pslug.replace(/-/g, '') === decoded.replace(/-/g, '') ||
      (decoded.includes('zafaraniyeh') && pslug.includes('zafaraniyeh')) ||
      (decoded.includes('penthouse') && pslug.includes('penthouse') && pslug.includes('zafaraniyeh'))
    );
  });

  return found || null;
}

/**
 * Save new property (Super Admin only)
 */
export async function saveNewProperty(
  newProp: Property,
  authToken?: string | null
): Promise<Property> {
  const supabase = getSupabaseClient();
  const dbPayload = propertyToDb(newProp);

  // 1. Direct Supabase insert
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([dbPayload])
        .select()
        .single();

      if (!error && data) {
        return dbToProperty(data);
      }
      if (error) {
        console.warn('Direct Supabase insert note:', error.message);
      }
    } catch (err) {
      console.warn('Direct Supabase insert error:', err);
    }
  }

  // 2. Server API fallback with Bearer token
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch('/api/properties', {
      method: 'POST',
      headers,
      body: JSON.stringify(newProp),
    });

    if (res.ok) {
      const result = await res.json();
      return result.property || newProp;
    } else {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'خطا در ثبت ملک در سرور.');
    }
  } catch (err: any) {
    throw new Error(err.message || 'خطا در ثبت ملک.');
  }
}

/**
 * Update property (Super Admin only)
 */
export async function updateProperty(
  prop: Property,
  authToken?: string | null
): Promise<Property> {
  const supabase = getSupabaseClient();
  const dbPayload = propertyToDb(prop);

  // 1. Direct Supabase update
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(dbPayload)
        .eq('id', prop.id)
        .select()
        .single();

      if (!error && data) {
        return dbToProperty(data);
      }
    } catch (err) {
      console.warn('Direct Supabase update note:', err);
    }
  }

  // 2. Server API update with Bearer token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`/api/properties/${prop.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(prop),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'خطا در به‌روزرسانی ملک در سرور.');
  }

  const result = await res.json();
  return result.property || prop;
}

/**
 * Delete property (Super Admin only)
 */
export async function deleteProperty(
  id: string,
  authToken?: string | null
): Promise<void> {
  const supabase = getSupabaseClient();

  // 1. Direct Supabase delete
  if (supabase) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (!error) return;
    } catch (err) {
      console.warn('Direct Supabase delete note:', err);
    }
  }

  // 2. Server API delete with Bearer token
  const headers: Record<string, string> = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'خطا در حذف ملک در سرور.');
  }
}
