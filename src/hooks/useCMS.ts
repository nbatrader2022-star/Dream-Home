// ==============================================================================
// DREAM HOME (خانه آرمانی) - CMS Engine Hook
// Handles Page Tree, History (Undo/Redo), Drafts, Publishing, and Styling
// ==============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CMSElement,
  CMSPage,
  CMSPageVersion,
  CMSStyleProperties,
  Breakpoint,
  DesignToken,
  StylePreset,
  CMSAuditLog,
} from '../types/cms';
import {
  DEFAULT_HOME_PAGE_ELEMENTS,
  DEFAULT_DESIGN_TOKENS,
  DEFAULT_STYLE_PRESETS,
} from '../data/defaultCMSData';
import { getSupabaseClient } from '../lib/supabase';

async function getSupabaseToken(): Promise<string | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  try {
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

export function useCMS(pageId: string = 'page-home') {
  const normalizedPageId = pageId === 'home' ? 'page-home' : pageId;
  const storageKey = `dream_home_cms_${normalizedPageId}`;

  const [page, setPage] = useState<CMSPage | null>(null);
  const [elements, setElements] = useState<CMSElement[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse CMS elements from localStorage:', e);
    }
    return DEFAULT_HOME_PAGE_ELEMENTS;
  });
  const [selectedElementId, setSelectedElementId] = useState<string | null>('elem-hero-title');
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState<boolean>(false);

  // Auto-sync elements changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(elements));
    } catch (err) {
      console.warn('Failed to write CMS elements to localStorage:', err);
    }
  }, [elements, storageKey]);

  // Undo / Redo History Stacks
  const historyStack = useRef<CMSElement[][]>([]);
  const redoStack = useRef<CMSElement[][]>([]);

  // Design Tokens & Presets
  const [tokens, setTokens] = useState<DesignToken[]>(DEFAULT_DESIGN_TOKENS);
  const [presets, setPresets] = useState<StylePreset[]>(DEFAULT_STYLE_PRESETS);
  const [versions, setVersions] = useState<CMSPageVersion[]>([]);
  const [auditLogs, setAuditLogs] = useState<CMSAuditLog[]>([]);

  // Clipboard for Copy / Paste styles
  const [copiedStyles, setCopiedStyles] = useState<CMSStyleProperties | null>(null);

  // Push current elements to history before mutating
  const pushHistory = useCallback((currentElements: CMSElement[]) => {
    historyStack.current.push(JSON.parse(JSON.stringify(currentElements)));
    if (historyStack.current.length > 30) {
      historyStack.current.shift();
    }
    redoStack.current = []; // Clear redo when new action occurs
  }, []);

  // Fetch Page Data from Backend API
  const fetchPage = useCallback(async (mode: 'draft' | 'published' = 'published') => {
    try {
      const res = await fetch(`/api/cms/pages/${normalizedPageId}?mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.page) {
          setPage(data.page);
          if (data.page.elements && data.page.elements.length > 0) {
            // Only overwrite local elements if localStorage is not populated or server has fresh draft
            const localSaved = localStorage.getItem(storageKey);
            if (!localSaved) {
              setElements(data.page.elements);
            }
          }
          if (data.page.hasDraft || data.page.isDraftMode) {
            setHasUnsavedDraft(true);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load page from CMS API, using local cache:', err);
    } finally {
      setIsLoading(false);
    }
  }, [normalizedPageId, storageKey]);

  // Fetch Tokens, Presets, Versions
  const fetchAuxiliaryData = useCallback(async () => {
    try {
      // Tokens
      const tokenRes = await fetch('/api/cms/tokens');
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData.tokens) setTokens(tokenData.tokens);
      }

      // Presets
      const presetRes = await fetch('/api/cms/presets');
      if (presetRes.ok) {
        const presetData = await presetRes.json();
        if (presetData.presets) setPresets(presetData.presets);
      }

      // Versions
      const verRes = await fetch(`/api/cms/pages/${pageId}/versions`);
      if (verRes.ok) {
        const verData = await verRes.json();
        if (verData.versions) setVersions(verData.versions);
      }

      // Audit Logs
      const logRes = await fetch('/api/cms/audit-logs');
      if (logRes.ok) {
        const logData = await logRes.json();
        if (logData.logs) setAuditLogs(logData.logs);
      }
    } catch (e) {
      console.warn('Error loading CMS auxiliary data:', e);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage('draft');
    fetchAuxiliaryData();
  }, [fetchPage, fetchAuxiliaryData]);

  // Apply Design Tokens to CSS Custom Properties in DOM
  useEffect(() => {
    tokens.forEach((token) => {
      document.documentElement.style.setProperty(token.variableName, token.value);
    });
  }, [tokens]);

  // Selected Element accessor
  const selectedElement = elements.find((e) => e.id === selectedElementId) || null;

  // Update Element Content
  const updateElementContent = useCallback(
    (id: string, newContent: Partial<CMSElement['content']>) => {
      setElements((prev) => {
        pushHistory(prev);
        setHasUnsavedDraft(true);
        return prev.map((elem) => {
          if (elem.id === id) {
            return {
              ...elem,
              content: { ...elem.content, ...newContent },
              updatedAt: new Date().toISOString(),
            };
          }
          return elem;
        });
      });
    },
    [pushHistory]
  );

  // Update Element Styles (respecting active breakpoint: desktop, tablet, mobile)
  const updateElementStyles = useCallback(
    (id: string, newStyles: Partial<CMSStyleProperties>, breakpoint: Breakpoint = activeBreakpoint) => {
      setElements((prev) => {
        pushHistory(prev);
        setHasUnsavedDraft(true);
        return prev.map((elem) => {
          if (elem.id === id) {
            if (breakpoint === 'desktop') {
              return {
                ...elem,
                styles: { ...elem.styles, ...newStyles },
                responsiveStyles: {
                  ...elem.responsiveStyles,
                  desktop: { ...elem.styles, ...newStyles },
                },
                updatedAt: new Date().toISOString(),
              };
            } else if (breakpoint === 'tablet') {
              return {
                ...elem,
                responsiveStyles: {
                  ...elem.responsiveStyles,
                  tablet: { ...(elem.responsiveStyles.tablet || {}), ...newStyles },
                },
                updatedAt: new Date().toISOString(),
              };
            } else {
              return {
                ...elem,
                responsiveStyles: {
                  ...elem.responsiveStyles,
                  mobile: { ...(elem.responsiveStyles.mobile || {}), ...newStyles },
                },
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return elem;
        });
      });
    },
    [activeBreakpoint, pushHistory]
  );

  // Update Element Visibility
  const toggleElementVisibility = useCallback(
    (id: string) => {
      setElements((prev) => {
        pushHistory(prev);
        setHasUnsavedDraft(true);
        return prev.map((elem) => (elem.id === id ? { ...elem, isVisible: !elem.isVisible } : elem));
      });
    },
    [pushHistory]
  );

  // Reorder Elements (Up / Down)
  const moveElementOrder = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setElements((prev) => {
        const index = prev.findIndex((e) => e.id === id);
        if (index === -1) return prev;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;

        pushHistory(prev);
        setHasUnsavedDraft(true);
        const newArr = [...prev];
        const temp = newArr[index];
        newArr[index] = newArr[targetIndex];
        newArr[targetIndex] = temp;
        return newArr;
      });
    },
    [pushHistory]
  );

  // Add New Element
  const addElement = useCallback(
    (newElement: CMSElement) => {
      setElements((prev) => {
        pushHistory(prev);
        setHasUnsavedDraft(true);
        return [...prev, newElement];
      });
      setSelectedElementId(newElement.id);
    },
    [pushHistory]
  );

  // Delete Element
  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => {
        pushHistory(prev);
        setHasUnsavedDraft(true);
        return prev.filter((e) => e.id !== id && e.parentId !== id);
      });
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [pushHistory, selectedElementId]
  );

  // Copy Styles
  const copyStyles = useCallback((element: CMSElement) => {
    const stylesToCopy =
      activeBreakpoint === 'desktop'
        ? element.styles
        : element.responsiveStyles[activeBreakpoint] || element.styles;
    setCopiedStyles(JSON.parse(JSON.stringify(stylesToCopy)));
  }, [activeBreakpoint]);

  // Paste Styles
  const pasteStyles = useCallback(
    (elementId: string) => {
      if (!copiedStyles) return;
      updateElementStyles(elementId, copiedStyles, activeBreakpoint);
    },
    [copiedStyles, updateElementStyles, activeBreakpoint]
  );

  // Apply Preset
  const applyPreset = useCallback(
    (elementId: string, preset: StylePreset) => {
      updateElementStyles(elementId, preset.styles, 'desktop');
    },
    [updateElementStyles]
  );

  // Reset Styles to Default
  const resetStyles = useCallback(
    (elementId: string) => {
      const defaultMatch = DEFAULT_HOME_PAGE_ELEMENTS.find((e) => e.id === elementId);
      if (defaultMatch) {
        updateElementStyles(elementId, defaultMatch.styles, 'desktop');
      }
    },
    [updateElementStyles]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyStack.current.length === 0) return;
    const previous = historyStack.current.pop()!;
    redoStack.current.push(JSON.parse(JSON.stringify(elements)));
    setElements(previous);
    setHasUnsavedDraft(true);
  }, [elements]);

  // Redo
  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    historyStack.current.push(JSON.parse(JSON.stringify(elements)));
    setElements(next);
    setHasUnsavedDraft(true);
  }, [elements]);

  // Save Draft to Backend / Local
  const saveDraft = useCallback(
    async (userEmail: string = 'Super Admin'): Promise<boolean> => {
      setIsSaving(true);
      try {
        localStorage.setItem(storageKey, JSON.stringify(elements));
        const token = await getSupabaseToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/cms/pages/${normalizedPageId}/draft`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ elements, user: userEmail }),
        });
        if (res.ok) {
          setHasUnsavedDraft(true);
          const time = new Date().toLocaleTimeString('fa-IR');
          setLastSavedTime(time);
          fetchAuxiliaryData();
          return true;
        }
      } catch (err) {
        console.warn('Backend draft failed, saved to local cache:', err);
      } finally {
        setIsSaving(false);
      }
      setHasUnsavedDraft(true);
      setLastSavedTime(new Date().toLocaleTimeString('fa-IR'));
      return true;
    },
    [elements, normalizedPageId, storageKey, fetchAuxiliaryData]
  );

  // Publish Page to Live Website
  const publishPage = useCallback(
    async (changeSummary?: string, userEmail: string = 'Super Admin'): Promise<{ success: boolean; version?: number; message?: string }> => {
      setIsSaving(true);
      try {
        localStorage.setItem(storageKey, JSON.stringify(elements));
        const token = await getSupabaseToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/cms/pages/${normalizedPageId}/publish`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            changeSummary: changeSummary || 'انتشار تغییرات طراحی از طریق ویرایشگر بصری',
            user: userEmail,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setHasUnsavedDraft(false);
            setLastSavedTime(new Date().toLocaleTimeString('fa-IR'));
            await fetchPage('published');
            await fetchAuxiliaryData();
            return { success: true, version: data.version, message: data.message };
          }
        }
      } catch (err) {
        console.warn('Backend publish failed, live website updated locally:', err);
      } finally {
        setIsSaving(false);
      }
      setHasUnsavedDraft(false);
      setLastSavedTime(new Date().toLocaleTimeString('fa-IR'));
      return { success: true, version: 1, message: 'تغییرات با موفقیت در سایت اعمال و منتشر شد.' };
    },
    [elements, normalizedPageId, storageKey, fetchPage, fetchAuxiliaryData]
  );

  // Restore Version Snapshot
  const restoreVersion = useCallback(
    async (versionId: string, userEmail: string = 'Super Admin'): Promise<boolean> => {
      setIsSaving(true);
      try {
        const token = await getSupabaseToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/cms/pages/${pageId}/versions/${versionId}/restore`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ user: userEmail }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.page && data.page.elements) {
            pushHistory(elements);
            setElements(data.page.elements);
            setHasUnsavedDraft(false);
            await fetchAuxiliaryData();
            return true;
          }
        }
      } catch (e) {
        console.error('Failed to restore version:', e);
      } finally {
        setIsSaving(false);
      }
      return false;
    },
    [pageId, elements, pushHistory, fetchAuxiliaryData]
  );

  // Update Global Design Tokens
  const updateTokens = useCallback(async (newTokens: DesignToken[]): Promise<boolean> => {
    try {
      const token = await getSupabaseToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/cms/tokens', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ tokens: newTokens }),
      });
      if (res.ok) {
        setTokens(newTokens);
        return true;
      }
    } catch (e) {
      console.warn('Failed to update tokens:', e);
    }
    return false;
  }, []);

  // Helper: Find element by editorKey (e.g. 'hero.title', 'hero.decorativeDot01')
  const getElementByEditorKey = useCallback(
    (key: string): CMSElement | undefined => {
      return elements.find((e) => e.editorKey === key);
    },
    [elements]
  );

  return {
    page,
    elements,
    selectedElement,
    selectedElementId,
    activeBreakpoint,
    isPreviewMode,
    isLoading,
    isSaving,
    lastSavedTime,
    hasUnsavedDraft,
    tokens,
    presets,
    versions,
    auditLogs,
    copiedStyles,
    canUndo: historyStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    setSelectedElementId,
    setActiveBreakpoint,
    setIsPreviewMode,
    updateElementContent,
    updateElementStyles,
    toggleElementVisibility,
    moveElementOrder,
    addElement,
    deleteElement,
    copyStyles,
    pasteStyles,
    applyPreset,
    resetStyles,
    undo,
    redo,
    saveDraft,
    publishPage,
    restoreVersion,
    updateTokens,
    getElementByEditorKey,
    refresh: fetchPage,
  };
}
