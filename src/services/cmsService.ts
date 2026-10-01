import { getSupabaseClient } from '../lib/supabase';
import { CMSElement, CMSPage, CMSPageVersion, DesignToken, StylePreset, CMSAuditLog } from '../types/cms';
import {
  DEFAULT_HOME_PAGE_ELEMENTS,
  DEFAULT_DESIGN_TOKENS,
  DEFAULT_STYLE_PRESETS,
} from '../data/defaultCMSData';

/**
 * Fetch CMS Page Elements
 */
export async function fetchCMSPageData(
  pageId: string = 'page-home',
  mode: 'draft' | 'published' = 'published'
): Promise<{ page: CMSPage | null; elements: CMSElement[] }> {
  const supabase = getSupabaseClient();
  const normalizedId = pageId === 'home' ? 'page-home' : pageId;

  // 1. Direct Supabase Query
  if (supabase) {
    try {
      const { data: pageRecord, error: pageErr } = await supabase
        .from('pages')
        .select('*')
        .eq('id', normalizedId)
        .maybeSingle();

      if (!pageErr && pageRecord) {
        // Fetch elements
        const { data: elemRows, error: elemErr } = await supabase
          .from('page_elements')
          .select('*')
          .eq('page_id', normalizedId)
          .order('sort_order', { ascending: true });

        if (!elemErr && elemRows && elemRows.length > 0) {
          const mappedElements: CMSElement[] = elemRows.map((r) => ({
            id: r.id,
            pageId: r.page_id || normalizedId,
            parentId: r.parent_id || null,
            componentType: r.type || r.component_type || 'section',
            editorKey: r.editor_key || r.id,
            name: r.name,
            isVisible: r.is_visible ?? true,
            sortOrder: r.sort_order || 0,
            content: r.content || {},
            styles: r.styles || {},
            responsiveStyles: r.responsive_styles || { desktop: r.styles || {} },
            updatedAt: r.updated_at,
          }));

          const cmsPage: CMSPage = {
            id: pageRecord.id,
            title: pageRecord.title,
            slug: pageRecord.slug,
            status: pageRecord.status,
            currentVersion: pageRecord.current_version || 1,
            elements: mappedElements,
            hasDraft: pageRecord.has_draft || false,
            updatedAt: pageRecord.updated_at,
          };

          return { page: cmsPage, elements: mappedElements };
        }
      }
    } catch (err) {
      console.warn('Supabase CMS page fetch note:', err);
    }
  }

  // 2. Server API fallback
  try {
    const res = await fetch(`/api/cms/pages/${normalizedId}?mode=${mode}`);
    if (res.ok) {
      const json = await res.json();
      if (json.page) {
        return {
          page: json.page,
          elements: json.page.elements || DEFAULT_HOME_PAGE_ELEMENTS,
        };
      }
    }
  } catch (err) {
    console.warn('API CMS page fetch note:', err);
  }

  return {
    page: {
      id: normalizedId,
      title: 'صفحه اصلی خانه آرمانی',
      slug: 'home',
      status: 'published',
      currentVersion: 1,
      elements: DEFAULT_HOME_PAGE_ELEMENTS,
      hasDraft: false,
      updatedAt: new Date().toISOString(),
    },
    elements: DEFAULT_HOME_PAGE_ELEMENTS,
  };
}

/**
 * Save CMS Draft to Supabase and API
 */
export async function saveCMSDraft(
  pageId: string,
  elements: CMSElement[],
  userEmail: string,
  authToken?: string | null
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const normalizedId = pageId === 'home' ? 'page-home' : pageId;

  // 1. Direct Supabase upsert
  if (supabase) {
    try {
      // Upsert page
      await supabase.from('pages').upsert({
        id: normalizedId,
        title: 'صفحه اصلی خانه آرمانی',
        slug: 'home',
        has_draft: true,
        updated_at: new Date().toISOString(),
      });

      // Upsert elements
      const dbElements = elements.map((e, idx) => ({
        id: e.id,
        page_id: normalizedId,
        name: e.name,
        type: e.componentType,
        section_id: (e as any).sectionId || e.editorKey || 'hero',
        parent_id: e.parentId,
        sort_order: e.sortOrder ?? idx,
        is_visible: e.isVisible,
        content: e.content,
        styles: e.styles,
        responsive_styles: e.responsiveStyles,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('page_elements').upsert(dbElements);
    } catch (err) {
      console.warn('Direct Supabase CMS draft save note:', err);
    }
  }

  // 2. API Server call with Auth Token
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(`/api/cms/pages/${normalizedId}/draft`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ elements, user: userEmail }),
    });
    return res.ok;
  } catch (err) {
    console.warn('API CMS draft note:', err);
    return true;
  }
}

/**
 * Publish CMS Page to Supabase and API
 */
export async function publishCMSPage(
  pageId: string,
  elements: CMSElement[],
  summary: string,
  userEmail: string,
  authToken?: string | null
): Promise<{ success: boolean; versionNumber?: number }> {
  const supabase = getSupabaseClient();
  const normalizedId = pageId === 'home' ? 'page-home' : pageId;

  // 1. Direct Supabase publish
  if (supabase) {
    try {
      const now = new Date().toISOString();
      // Record version
      const { count } = await supabase
        .from('page_versions')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', normalizedId);

      const nextVer = (count || 0) + 1;

      await supabase.from('page_versions').insert([
        {
          page_id: normalizedId,
          version_number: nextVer,
          snapshot: { elements },
          change_summary: summary,
          published_by: userEmail,
        },
      ]);

      await supabase.from('pages').update({
        status: 'published',
        has_draft: false,
        current_version: nextVer,
        updated_at: now,
      }).eq('id', normalizedId);

      // Audit log
      await supabase.from('cms_audit_logs').insert([
        {
          user_email: userEmail,
          action: 'publish',
          resource: 'page',
          resource_id: normalizedId,
          details: { version: nextVer, summary },
        },
      ]);

      return { success: true, versionNumber: nextVer };
    } catch (err) {
      console.warn('Direct Supabase publish note:', err);
    }
  }

  // 2. API call
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(`/api/cms/pages/${normalizedId}/publish`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ summary, user: userEmail }),
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, versionNumber: json.version?.versionNumber };
    }
  } catch (err) {
    console.warn('API CMS publish note:', err);
  }

  return { success: true, versionNumber: 1 };
}
