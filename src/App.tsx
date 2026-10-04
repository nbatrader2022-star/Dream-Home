import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsBar } from './components/StatsBar';
import { CategoriesSection } from './components/CategoriesSection';
import { PropertyListingSection } from './components/PropertyListingSection';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { MapExplorerModal } from './components/MapExplorerModal';
import { CompareModal } from './components/CompareModal';
import { SavedPropertiesDrawer } from './components/SavedPropertiesDrawer';
import { ScheduleVisitModal } from './components/ScheduleVisitModal';
import { MortgageCalculatorModal } from './components/MortgageCalculatorModal';
import { RoiCalculatorModal } from './components/RoiCalculatorModal';
import { NeighborhoodsSection } from './components/NeighborhoodsSection';
import { VirtualTourSection } from './components/VirtualTourSection';
import { ValuationSection } from './components/ValuationSection';
import { BlogSection } from './components/BlogSection';
import { Footer } from './components/Footer';
import { CustomCursor, ToastContainer, ToastMessage } from './components/CustomCursor';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AdminPanelModal } from './components/AdminPanelModal';
import { LoginModal } from './components/LoginModal';
import { VisualEditorModal } from './components/VisualEditor/VisualEditorModal';
import { useCMS } from './hooks/useCMS';
import { PROPERTIES_DATA } from './data/properties';
import { BLOG_POSTS_DATA } from './data/blog';
import { getStoredSiteSettings, saveStoredSiteSettings, DEFAULT_SITE_SETTINGS, ADMIN_EMAIL } from './data/settings';
import { isUserAuthorizedAdmin, getAdminVisibilitySettings } from './data/admins';
import { Property, PropertyType, VisitBooking, UserProfile, BlogPost, SiteSettings, Agent, PropertyAgent } from './types';
import { subscribeToSupabaseAuth, getCurrentAdminSession } from './services/supabaseAuth';
import { getSupabaseClient } from './lib/supabase';
import { PropertyJourneySection } from './components/PropertyJourneySection';
import { ConsultantProfileModal } from './components/ConsultantProfileModal';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { SupportPage } from './components/pages/SupportPage';
import { HowItWorksPage } from './components/pages/HowItWorksPage';
import { ConsultantsPage } from './components/pages/ConsultantsPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { PropertyDetailPage } from './components/pages/PropertyDetailPage';
import { AccessDeniedPage } from './components/pages/AccessDeniedPage';
import { saveNewProperty, updateProperty, deleteProperty } from './services/propertiesService';
import { getAdminSessionToken, signOutAdmin } from './services/supabaseAuth';
import {
  signInNormalUserWithGoogle,
  signOutNormalUser,
  saveUserFavoriteProperties,
  subscribeToNormalUserAuth,
  getCurrentNormalUser,
} from './services/supabaseUserAuth';
import { UserProfileModal } from './components/UserProfileModal';
import { updatePropertySEO, applyPageSEO, fetchServerSEOConfig } from './utils/seo';
import {
  checkSavedPropertiesPriceChanges,
  checkNewPropertiesForSavedSearches,
  addSavedSearch,
  getStoredSavedSearches,
} from './utils/notifications';
import { useTelemetry } from './hooks/useTelemetry';

export default function App() {
  // Telemetry Engine
  const {
    track,
    trackPropertyView,
    trackSearch,
    trackCalculator,
    trackScheduleVisit,
  } = useTelemetry();
  // Auth user state - Strictly populated from Supabase Auth (no localStorage fakes)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState<boolean>(false);

  // Persistence state
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dream_home_saved');
      return saved ? JSON.parse(saved) : ['prop-1', 'prop-3'];
    } catch {
      return ['prop-1', 'prop-3'];
    }
  });

  const [comparePropertyIds, setComparePropertyIds] = useState<string[]>(() => {
    try {
      const comp = localStorage.getItem('dream_home_compare');
      return comp ? JSON.parse(comp) : ['prop-1', 'prop-2'];
    } catch {
      return ['prop-1', 'prop-2'];
    }
  });

  const [bookings, setBookings] = useState<VisitBooking[]>(() => {
    try {
      const b = localStorage.getItem('dream_home_bookings');
      return b ? JSON.parse(b) : [];
    } catch {
      return [];
    }
  });

  // Modal / Drawer visibility states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isMapExplorerOpen, setIsMapExplorerOpen] = useState<boolean>(false);
  const [isMortgageModalOpen, setIsMortgageModalOpen] = useState<boolean>(false);
  const [isRoiModalOpen, setIsRoiModalOpen] = useState<boolean>(false);
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState<boolean>(false);
  const [scheduleTargetProperty, setScheduleTargetProperty] = useState<Property | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | PropertyAgent | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState<boolean>(false);
  
  // Full Dynamic Visual CMS Engine
  const cms = useCMS('page-home');

  const [isAdminSession, setIsAdminSession] = useState<boolean>(false);

  useEffect(() => {
    getCurrentAdminSession().then((session) => {
      if (session.isSuperAdmin) setIsAdminSession(true);
    });

    const unsub = subscribeToSupabaseAuth((state) => {
      setIsAdminSession(state.isSuperAdmin);
    });

    return () => unsub();
  }, []);

  const [adminVisibilitySettings, setAdminVisibilitySettings] = useState(() => getAdminVisibilitySettings());

  // Listen to visibility changes
  useEffect(() => {
    const handleStorage = () => {
      setAdminVisibilitySettings(getAdminVisibilitySettings());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dream_home_admin_settings_changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dream_home_admin_settings_changed', handleStorage);
    };
  }, []);

  // Admin authorization is strictly based on a verified active Supabase session
  const isUserAdmin = Boolean(isAdminSession);

  // Super Admin secret shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
  // Only opens the administrative interface if the current real Supabase session has already been verified as an active Super Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش')) {
        e.preventDefault();
        if (isAdminSession) {
          setIsAdminModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminSession]);

  // Dynamic Properties (stored in localStorage for persistence)
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('dream_home_properties_list');
      return saved ? JSON.parse(saved) : PROPERTIES_DATA;
    } catch {
      return PROPERTIES_DATA;
    }
  });

  // Fetch properties from backend API on mount
  useEffect(() => {
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (data.properties && Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties);
        }
      })
      .catch((err) => console.warn('Could not fetch properties from API:', err));
  }, []);

  // Dynamic Blog Posts (stored in localStorage for persistence)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('dream_home_blog_list');
      return saved ? JSON.parse(saved) : BLOG_POSTS_DATA;
    } catch {
      return BLOG_POSTS_DATA;
    }
  });

  // Dynamic Site Settings (stored in localStorage for persistence)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getStoredSiteSettings());

  // Search and Filter states
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast Notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth listener and cloud synchronization (Strictly Supabase Auth)
  useEffect(() => {
    const unsubscribe = subscribeToNormalUserAuth((user) => {
      setCurrentUser(user);
      if (user && user.savedProperties && user.savedProperties.length > 0) {
        setSavedPropertyIds((prev) => Array.from(new Set([...prev, ...(user.savedProperties || [])])));
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync saved properties to Supabase profiles table when logged in
  useEffect(() => {
    if (currentUser?.uid) {
      saveUserFavoriteProperties(currentUser.uid, savedPropertyIds);
    }
  }, [currentUser, savedPropertyIds]);

  // Property View Telemetry
  useEffect(() => {
    if (selectedProperty) {
      trackPropertyView(selectedProperty.id, selectedProperty.title, {
        price: selectedProperty.price,
        location: selectedProperty.location,
        city: selectedProperty.city,
      });
    }
  }, [selectedProperty]);

  // Automated Notification Engine: Price Changes & Matching New Listings
  useEffect(() => {
    // 1. Alert if saved property had a price change
    checkSavedPropertiesPriceChanges(savedPropertyIds, properties, (title, message) => {
      showToast(title, message);
    });

    // 2. Alert if a new property matches saved search criteria
    const savedSearches = getStoredSavedSearches();
    checkNewPropertiesForSavedSearches(savedSearches, properties, (title, message) => {
      showToast(title, message);
    });
  }, [properties, savedPropertyIds]);

  // Save search criteria for alerts
  const handleSaveCurrentSearch = (criteria: {
    title: string;
    city?: string;
    neighborhood?: string;
    propertyType?: PropertyType | 'all';
    maxPrice?: number;
    minBedrooms?: number;
  }) => {
    addSavedSearch({
      ...criteria,
      propertyType: criteria.propertyType as PropertyType | 'all',
    });
    showToast(
      'جستجوی شما ذخیره شد',
      `به محض تغییر قیمت یا اضافه شدن ملکی مطابق با «${criteria.title}»، هشدار اختصاصی دریافت خواهید کرد.`
    );
    trackSearch(criteria.title, { ...criteria, action: 'save_search' });
  };

  // Test Notification Triggers for Admin Panel
  const handleTriggerTestPriceAlert = () => {
    if (properties.length > 0) {
      const target = properties[0];
      showToast(
        '🔔 کاهش قیمت در ملک نشان‌شده شما',
        `قیمت «${target.title}» در ${target.location} با ۱,۲۰۰,۰۰۰,۰۰۰ تومان کاهش به روزرسانی شد.`
      );
    }
  };

  const handleTriggerTestNewMatchAlert = () => {
    if (properties.length > 1) {
      const target = properties[1];
      showToast(
        '✨ ملک جدید منطبق با جستجوی شما',
        `ملک جدید «${target.title}» با معیارهای جستجوی ذخیره‌شده شما ثبت گردید.`
      );
    }
  };

  // Global Admin Access Shortcut (Ctrl+Shift+A or Alt+A)
  useEffect(() => {
    const handleAdminHotKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleAdminHotKey);
    return () => window.removeEventListener('keydown', handleAdminHotKey);
  }, []);

  const handleSuccessAdminLogin = (authState: any) => {
    setIsAdminSession(true);
    if (authState?.user) {
      setCurrentUser(authState.user);
    }
    setIsLoginModalOpen(false);
    // User requirement: "بعد از تأیید صحیح، مستقیم وارد پنل مدیریت سایت بشه"
    setIsAdminModalOpen(true);
    showToast('ورود موفق به پنل مدیریت', 'با موفقیت وارد شدید و به پنل مدیریت هدایت شدید.');
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInNormalUserWithGoogle({
        savedPropertyIds,
      });
      if (result.openedPopup) {
        showToast('احراز هویت با گوگل', 'پنجره ورود گوگل باز شد. لطفاً حساب کاربری خود را انتخاب فرمایید.');
      }
    } catch (err: any) {
      console.warn('Google sign-in attempt notice:', err?.message || err);
      showToast('راهنمای ورود با گوگل', err?.message || 'خطا در برقراری ارتباط با سامانه ورود گوگل.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
    } catch (err) {
      console.warn('signOutAdmin err:', err);
    }
    try {
      await signOutNormalUser();
    } catch (err) {
      console.error(err);
    }
    try {
      localStorage.removeItem('dream_home_admin_session');
      localStorage.removeItem('dream_home_auth_user');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Storage cleanup err:', e);
    }
    setCurrentUser(null);
    setIsAdminSession(false);
    setIsAdminModalOpen(false);
    setIsVisualEditorOpen(false);
    if (currentPage === 'admin') {
      setCurrentPage('home');
      try {
        window.history.pushState(null, '', '/');
      } catch {
        window.location.hash = '/';
      }
    }
    showToast('خروج از حساب', 'با موفقیت از حساب کاربری خارج شدید.');
  };

  const handleAdminLogout = async () => {
    try {
      await signOutAdmin();
    } catch (err) {
      console.warn('signOutAdmin err:', err);
    }
    try {
      await signOutNormalUser();
    } catch (err) {
      console.error(err);
    }
    try {
      localStorage.removeItem('dream_home_admin_session');
      localStorage.removeItem('dream_home_auth_user');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Storage cleanup err:', e);
    }
    setCurrentUser(null);
    setIsAdminSession(false);
    setIsAdminModalOpen(false);
    setIsVisualEditorOpen(false);
    setSelectedAgent(null);

    // Return to public homepage
    setCurrentPage('home');
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '/';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast('خروج از پنل مدیریت', 'نشست مدیریت با موفقیت خاتمه یافت.');
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dream_home_saved', JSON.stringify(savedPropertyIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedPropertyIds]);

  useEffect(() => {
    try {
      localStorage.setItem('dream_home_compare', JSON.stringify(comparePropertyIds));
    } catch (e) {
      console.error(e);
    }
  }, [comparePropertyIds]);

  useEffect(() => {
    try {
      localStorage.setItem('dream_home_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('dream_home_properties_list', JSON.stringify(properties));
    } catch (e) {
      console.error(e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('dream_home_blog_list', JSON.stringify(blogPosts));
    } catch (e) {
      console.error(e);
    }
  }, [blogPosts]);

  // Admin Management Handlers
  const handleSaveProperty = async (prop: Property, isNew: boolean) => {
    if (isNew) {
      setProperties((prev) => [prop, ...prev]);
    } else {
      setProperties((prev) => prev.map((p) => (p.id === prop.id ? prop : p)));
    }
    if (selectedProperty && selectedProperty.id === prop.id) {
      setSelectedProperty(prop);
    }

    try {
      const sb = getSupabaseClient();
      const { data: { session } } = (await sb?.auth.getSession()) || { data: { session: null } };
      const token = session?.access_token || getAdminSessionToken();
      if (isNew) {
        await saveNewProperty(prop, token);
      } else {
        await updateProperty(prop, token);
      }
    } catch (e) {
      console.warn('Backend sync note:', e);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setSavedPropertyIds((prev) => prev.filter((item) => item !== id));
    setComparePropertyIds((prev) => prev.filter((item) => item !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }

    try {
      const sb = getSupabaseClient();
      const { data: { session } } = (await sb?.auth.getSession()) || { data: { session: null } };
      const token = session?.access_token || getAdminSessionToken();
      await deleteProperty(id, token);
    } catch (e) {
      console.warn('Backend delete note:', e);
    }
  };

  const handleSaveBlogPost = (post: BlogPost, isNew: boolean) => {
    if (isNew) {
      setBlogPosts((prev) => [post, ...prev]);
    } else {
      setBlogPosts((prev) => prev.map((b) => (b.id === post.id ? post : b)));
    }
  };

  const handleDeleteBlogPost = (id: string) => {
    setBlogPosts((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveSiteSettings = (settings: SiteSettings) => {
    setSiteSettings(settings);
    saveStoredSiteSettings(settings);
  };

  const handleResetSiteSettings = () => {
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    saveStoredSiteSettings(DEFAULT_SITE_SETTINGS);
  };

  // Save / Favorite toggle
  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const prop = properties.find((p) => p.id === id);
    setSavedPropertyIds((prev) => {
      const exists = prev.includes(id);
      track('property_save_toggle', { propertyId: id, saved: !exists, title: prop?.title });
      if (exists) {
        showToast('حذف از نشان‌شده‌ها', 'ملک مورد نظر از لیست علاقه‌مندی‌های شما حذف گردید.');
        return prev.filter((item) => item !== id);
      } else {
        showToast('نشان شد', 'این ملک به لیست نشان‌شده‌های شما افزوده شد.');
        return [...prev, id];
      }
    });
  };

  // Compare toggle (max 3)
  const handleToggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const prop = properties.find((p) => p.id === id);
    setComparePropertyIds((prev) => {
      const exists = prev.includes(id);
      track('property_compare_toggle', { propertyId: id, compare: !exists, title: prop?.title });
      if (exists) {
        showToast('حذف از مقایسه', 'ملک از جدول مقایسه برداشته شد.');
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          showToast('سقف مقایسه', 'حداکثر ۳ ملک را می‌توانید هم‌زمان مقایسه نمایید.');
          return prev;
        }
        showToast('افزوده شد به مقایسه', 'ملک به جدول مقایسه هوشمند اضافه شد.');
        return [...prev, id];
      }
    });
  };

  // Clear compare
  const handleClearCompare = () => {
    setComparePropertyIds([]);
    showToast('لیست مقایسه پاک شد', 'تمامی موارد از جدول مقایسه حذف گردیدند.');
  };

  // Remove saved
  const handleRemoveSaved = (id: string) => {
    setSavedPropertyIds((prev) => prev.filter((item) => item !== id));
  };

  // Clear all saved
  const handleClearAllSaved = () => {
    setSavedPropertyIds([]);
    showToast('نشان‌شده‌ها پاک شد', 'لیست موارد ذخیره‌شده شما خالی شد.');
  };

  // Handle schedule visit trigger
  const handleScheduleVisit = (property: Property) => {
    setScheduleTargetProperty(property);
    setIsScheduleVisitOpen(true);
    trackScheduleVisit(property.id, property.title);
  };

  // Handle save booking
  const handleSaveBooking = (booking: VisitBooking) => {
    setBookings((prev) => [booking, ...prev]);
    showToast('نوبت ثبت شد', `کد رهگیری: ${booking.trackingCode}`);
  };

  // Current Page Route (home, privacy, terms, support, how-it-works, consultants, services, property, admin)
  const [currentPage, setCurrentPage] = useState<
    'home' | 'privacy' | 'terms' | 'support' | 'how-it-works' | 'consultants' | 'services' | 'property' | 'admin'
  >('home');
  const [currentPropertySlug, setCurrentPropertySlug] = useState<string | null>(null);

  // Initial server-side SEO config fetch from /api/admin/seo
  useEffect(() => {
    fetchServerSEOConfig().then(() => {
      applyPageSEO(currentPage);
    });
  }, []);

  // Synchronize dynamic SEO meta tags & Title for every active page
  useEffect(() => {
    if (currentPage === 'property') {
      const prop = selectedProperty || properties.find(p => p.slug === currentPropertySlug || p.id === currentPropertySlug);
      applyPageSEO('property', { property: prop || null });
    } else {
      applyPageSEO(currentPage);
    }
  }, [currentPage, selectedProperty, currentPropertySlug, properties]);

  // Parse current route from window.location (supports pathname: /property/:slug, /admin & hash: #/property/:slug)
  const parseRouteFromLocation = (): {
    page: 'home' | 'privacy' | 'terms' | 'support' | 'how-it-works' | 'consultants' | 'services' | 'property' | 'admin';
    slug?: string;
  } => {
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    const rawHash = window.location.hash.replace(/^#\/?/, '');

    // If the browser loaded with #support or support hash, clean it up so reload always shows the landing page
    if (rawHash === 'support' || window.location.hash.includes('support')) {
      try {
        window.history.replaceState(null, '', window.location.pathname || '/');
      } catch {
        window.location.hash = '';
      }
      return { page: 'home' };
    }

    // 1. Check pathname: /property/:slug or /properties/:id
    const pathMatch = pathname.match(/^\/(?:property|properties)\/([^/]+)/i);
    if (pathMatch && pathMatch[1]) {
      return { page: 'property', slug: decodeURIComponent(pathMatch[1]) };
    }

    // 2. Check hash: #/property/:slug or #property/:slug
    const hashMatch = rawHash.match(/^(?:property|properties)\/([^/]+)/i);
    if (hashMatch && hashMatch[1]) {
      return { page: 'property', slug: decodeURIComponent(hashMatch[1]) };
    }

    // 3. Admin routes: /admin or #admin or #/admin
    if (pathname === '/admin' || rawHash === 'admin' || rawHash === '/admin') {
      return { page: 'admin' };
    }

    // 4. Other sub-pages (explicit pathname only)
    const pageKey = pathname.replace(/^\//, '');
    if (['privacy', 'terms', 'how-it-works', 'how', 'consultants', 'agents', 'services'].includes(pageKey)) {
      if (pageKey === 'how') return { page: 'how-it-works' };
      if (pageKey === 'agents') return { page: 'consultants' };
      return { page: pageKey as any };
    }

    return { page: 'home' };
  };

  // URL Sync for Deep Linking, Refresh, and Browser Navigation
  useEffect(() => {
    // If browser URL has leftover #support hash, clean it up
    if (window.location.hash.includes('support')) {
      try {
        window.history.replaceState(null, '', window.location.pathname || '/');
      } catch {
        window.location.hash = '';
      }
    }

    const applyCurrentRoute = () => {
      const route = parseRouteFromLocation();
      if (route.page === 'property' && route.slug) {
        setCurrentPropertySlug(route.slug);
        setCurrentPage('property');
      } else if (route.page === 'admin') {
        setCurrentPage('admin');
        if (isUserAdmin) {
          setIsAdminModalOpen(true);
        }
      } else {
        setCurrentPropertySlug(null);
        setCurrentPage(route.page);
      }
    };

    applyCurrentRoute();

    window.addEventListener('popstate', applyCurrentRoute);
    window.addEventListener('hashchange', applyCurrentRoute);
    return () => {
      window.removeEventListener('popstate', applyCurrentRoute);
      window.removeEventListener('hashchange', applyCurrentRoute);
    };
  }, [isUserAdmin]);

  // Navigate to dedicated property page
  const handleOpenPropertyPage = (slugOrId: string) => {
    setCurrentPropertySlug(slugOrId);
    setCurrentPage('property');
    const newPath = `/property/${encodeURIComponent(slugOrId)}`;
    try {
      window.history.pushState(null, '', newPath);
    } catch {
      window.location.hash = `/property/${encodeURIComponent(slugOrId)}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to home page
  const handleBackToHome = () => {
    setCurrentPage('home');
    setCurrentPropertySlug(null);
    try {
      window.history.replaceState(null, '', window.location.pathname || '/');
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin initial tab state
  const [adminInitialTab, setAdminInitialTab] = useState<'cms' | 'admins' | 'properties' | 'blog' | 'settings' | 'bookings' | 'analytics' | 'media' | 'seo'>('cms');

  // Open Admin handler with protection check
  const handleOpenAdmin = (tab?: 'cms' | 'admins' | 'properties' | 'blog' | 'settings' | 'bookings' | 'analytics' | 'media' | 'seo' | any) => {
    const validTabs = ['cms', 'admins', 'properties', 'blog', 'settings', 'bookings', 'analytics', 'media', 'seo'];
    const safeTab = (typeof tab === 'string' && validTabs.includes(tab)) ? tab : 'cms';
    setAdminInitialTab(safeTab as any);
    if (isUserAdmin) {
      setIsAdminModalOpen(true);
    } else {
      setCurrentPage('admin');
      try {
        window.history.pushState(null, '', '/admin');
      } catch {
        window.location.hash = '/admin';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigation / Scroll helper
  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'admin') {
      handleOpenAdmin();
      return;
    }
    if (
      sectionId === 'privacy' ||
      sectionId === 'terms' ||
      sectionId === 'support' ||
      sectionId === 'how-it-works' ||
      sectionId === 'consultants' ||
      sectionId === 'services'
    ) {
      setCurrentPage(sectionId);
      try {
        window.history.replaceState(null, '', window.location.pathname || '/');
      } catch {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'how') {
      setCurrentPage('how-it-works');
      try {
        window.history.replaceState(null, '', window.location.pathname || '/');
      } catch {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'agents') {
      setCurrentPage('consultants');
      try {
        window.history.replaceState(null, '', window.location.pathname || '/');
      } catch {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'home') {
      handleBackToHome();
      return;
    }
    const scrollToTarget = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -85;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    };

    if (currentPage !== 'home') {
      setCurrentPage('home');
      setCurrentPropertySlug(null);
      try {
        window.history.replaceState(null, '', window.location.pathname || '/');
      } catch {
        window.location.hash = '';
      }
      setTimeout(() => {
        scrollToTarget(sectionId);
      }, 120);
      return;
    }
    scrollToTarget(sectionId);
  };

  // Hero search submission
  const handleHeroSearch = (filters: { query: string; type: PropertyType | 'all'; city: string }) => {
    setSearchQuery(filters.query);
    setSelectedType(filters.type);
    setSelectedCity(filters.city);
    handleNavigate('properties');
  };

  // Filter reset
  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedCity('');
    setSearchQuery('');
  };

  // Category select
  const handleSelectCategory = (type: PropertyType) => {
    setSelectedType(type);
    handleNavigate('properties');
  };

  // Neighborhood select
  const handleSelectNeighborhood = (neighborhoodName: string) => {
    setSearchQuery(neighborhoodName);
    handleNavigate('properties');
  };

  // Gather saved and compared property objects
  const savedProperties = properties.filter((p) => savedPropertyIds.includes(p.id));
  const compareProperties = properties.filter((p) => comparePropertyIds.includes(p.id));

  // Similar properties for modal
  const similarProperties = selectedProperty
    ? properties.filter((p) => p.id !== selectedProperty.id && p.city === selectedProperty.city)
    : [];

  return (
    <div className="min-h-screen bg-[#F8F4EF] text-[#1A1A2E] selection:bg-[#C9A84C]/30 selection:text-[#1A1A2E]">
      {/* Desktop Custom Cursor */}
      <CustomCursor />

      {/* Real-time Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Main Global Navigation */}
      <Navbar
        savedCount={savedPropertyIds.length}
        compareCount={comparePropertyIds.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenMap={() => setIsMapExplorerOpen(true)}
        onOpenMapExplorer={() => setIsMapExplorerOpen(true)}
        onOpenMortgage={() => {
          setIsMortgageModalOpen(true);
          trackCalculator('mortgage');
        }}
        onOpenMortgageCalculator={() => {
          setIsMortgageModalOpen(true);
          trackCalculator('mortgage');
        }}
        onOpenRoi={() => {
          setIsRoiModalOpen(true);
          trackCalculator('roi');
        }}
        onOpenAdmin={handleOpenAdmin}
        onOpenVisualEditor={() => setIsVisualEditorOpen(true)}
        isAdmin={isUserAdmin}
        onNavigate={handleNavigate}
        user={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        currentPage={currentPage}
      />

      {/* Centralized Global Dedicated Pages Wrapper */}
      {currentPage !== 'home' && (
        <main id="dedicated-page-container" className="relative w-full">
          {currentPage === 'privacy' && (
            <PrivacyPolicyPage onBackToHome={() => handleNavigate('home')} />
          )}
          {currentPage === 'terms' && (
            <TermsPage onBackToHome={() => handleNavigate('home')} />
          )}
          {currentPage === 'support' && (
            <SupportPage onBackToHome={() => handleNavigate('home')} />
          )}
          {currentPage === 'how-it-works' && (
            <HowItWorksPage
              onBackToHome={() => handleNavigate('home')}
              onNavigateToProperties={() => handleNavigate('home')}
              onOpenConsultation={() => setIsScheduleVisitOpen(true)}
            />
          )}
          {currentPage === 'consultants' && (
            <ConsultantsPage
              onBackToHome={() => handleNavigate('home')}
              onSelectAgent={(agent) => setSelectedAgent(agent)}
              onScheduleVisit={handleScheduleVisit}
              properties={properties}
            />
          )}
          {currentPage === 'services' && (
            <ServicesPage
              onBackToHome={() => handleNavigate('home')}
              onOpenConsultation={() => setIsScheduleVisitOpen(true)}
              onShowToast={showToast}
            />
          )}
          {currentPage === 'property' && currentPropertySlug && (
            <PropertyDetailPage
              slug={currentPropertySlug}
              allProperties={properties}
              savedIds={savedPropertyIds}
              compareIds={comparePropertyIds}
              onBackToHome={handleBackToHome}
              onToggleSave={handleToggleSave}
              onToggleCompare={handleToggleCompare}
              onSelectProperty={(prop) => handleOpenPropertyPage(prop.slug || prop.id)}
              onScheduleVisit={handleScheduleVisit}
              onShowToast={showToast}
              onSelectAgent={(agent) => setSelectedAgent(agent)}
            />
          )}
          {currentPage === 'admin' && (
            !isUserAdmin ? (
              <AccessDeniedPage
                userEmail={currentUser?.email || null}
                onBackToHome={handleBackToHome}
                onOpenSignIn={() => setIsLoginModalOpen(true)}
              />
            ) : null
          )}
        </main>
      )}

      {/* Main Home Page Sections */}
      {currentPage === 'home' && (
        <>
          {/* Hero Section with Interactive Live Search & Float Cards */}
          <HeroSection
            onSearch={handleHeroSearch}
            onSelectProperty={(prop) => handleOpenPropertyPage(prop.slug || prop.id)}
            onOpenMap={() => setIsMapExplorerOpen(true)}
            headline={siteSettings.heroHeadline}
            subheadline={siteSettings.heroSubheadline}
            cmsElements={cms.elements}
          />

          {/* Animated Counter Statistics Bar */}
          <StatsBar cmsElements={cms.elements} />

          {/* Property Categories Carousel / Grid */}
          <CategoriesSection
            selectedType={selectedType}
            onSelectType={handleSelectCategory}
            cmsElements={cms.elements}
          />

          {/* Featured Properties Listing with Filters, Grid/List and Sorters */}
          <PropertyListingSection
            properties={properties}
            savedIds={savedPropertyIds}
            compareIds={comparePropertyIds}
            selectedType={selectedType}
            selectedCity={selectedCity}
            searchQuery={searchQuery}
            onSelectType={(type) => setSelectedType(type)}
            onSelectCity={(city) => setSelectedCity(city)}
            onSearchQueryChange={(q) => setSearchQuery(q)}
            onClearFilters={handleClearFilters}
            onToggleSave={handleToggleSave}
            onToggleCompare={handleToggleCompare}
            onSelectProperty={(prop) => handleOpenPropertyPage(prop.slug || prop.id)}
            onOpenMapExplorer={() => setIsMapExplorerOpen(true)}
            onSaveCurrentSearch={handleSaveCurrentSearch}
            cmsElements={cms.elements}
          />

          {/* Interactive 3D Virtual Tour Showcase */}
          <VirtualTourSection />

          {/* 8-Step Intelligent Customer Journey from Search to Contract Signing */}
          <PropertyJourneySection
            onOpenSearch={() => {
              const el = document.getElementById('search-filters');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 700, behavior: 'smooth' });
              }
            }}
            onOpenMap={() => setIsMapExplorerOpen(true)}
            onOpenRoi={() => setIsRoiModalOpen(true)}
            onOpenCompare={() => setIsCompareModalOpen(true)}
            onOpenSaved={() => setIsSavedDrawerOpen(true)}
            onOpenSchedule={() => {
              setScheduleTargetProperty(null);
              setIsScheduleVisitOpen(true);
            }}
            onOpenConsultant={() => {
              if (properties[0]?.agent) {
                setSelectedAgent(properties[0].agent);
              }
            }}
          />

          {/* Free Valuation & In-Person Appraisal Section */}
          <ValuationSection />

          {/* Prime Cities, Projects & Neighborhoods Guide */}
          <NeighborhoodsSection
            onSelectNeighborhood={handleSelectNeighborhood}
            onSelectProperty={(prop) => handleOpenPropertyPage(prop.slug || prop.id)}
            onSelectCity={(cityKey) => {
              setSelectedCity(cityKey);
              const el = document.getElementById('properties');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Real Estate Blog & Market Analysis */}
          <BlogSection posts={blogPosts} />
        </>
      )}

      {/* Global Persian Luxury Footer */}
      <Footer
        onNavigate={handleNavigate}
        onShowToast={showToast}
        settings={siteSettings}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isUserAdmin}
      />

      {/* Full Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          isSaved={savedPropertyIds.includes(selectedProperty.id)}
          isCompared={comparePropertyIds.includes(selectedProperty.id)}
          similarProperties={similarProperties}
          onClose={() => setSelectedProperty(null)}
          onToggleSave={handleToggleSave}
          onToggleCompare={handleToggleCompare}
          onSelectSimilar={(prop) => handleOpenPropertyPage(prop.slug || prop.id)}
          onScheduleVisit={handleScheduleVisit}
          onShowToast={showToast}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
        />
      )}

      {/* Interactive Map Explorer Modal */}
      {isMapExplorerOpen && (
        <MapExplorerModal
          properties={properties}
          onClose={() => setIsMapExplorerOpen(false)}
          onSelectProperty={(prop) => {
            setIsMapExplorerOpen(false);
            handleOpenPropertyPage(prop.slug || prop.id);
          }}
        />
      )}

      {/* Property Comparison Matrix Modal */}
      {isCompareModalOpen && (
        <CompareModal
          properties={compareProperties}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveFromCompare={(id) =>
            setComparePropertyIds((prev) => prev.filter((item) => item !== id))
          }
          onClearCompare={handleClearCompare}
          onSelectProperty={(prop) => {
            setIsCompareModalOpen(false);
            handleOpenPropertyPage(prop.slug || prop.id);
          }}
        />
      )}

      {/* Saved Properties Drawer */}
      <SavedPropertiesDrawer
        isOpen={isSavedDrawerOpen}
        savedProperties={savedProperties}
        onClose={() => setIsSavedDrawerOpen(false)}
        onRemove={handleRemoveSaved}
        onClearAll={handleClearAllSaved}
        onSelectProperty={(prop) => {
          setIsSavedDrawerOpen(false);
          handleOpenPropertyPage(prop.slug || prop.id);
        }}
        user={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Schedule Visit Modal */}
      {isScheduleVisitOpen && (
        <ScheduleVisitModal
          property={scheduleTargetProperty || properties[0]}
          onClose={() => setIsScheduleVisitOpen(false)}
          onSaveBooking={handleSaveBooking}
          user={currentUser}
        />
      )}

      {/* Mortgage Calculator Modal */}
      <MortgageCalculatorModal
        isOpen={isMortgageModalOpen}
        onClose={() => setIsMortgageModalOpen(false)}
      />

      {/* Context-Aware Gemini AI Chatbot */}
      <GeminiChatbot
        currentProperty={selectedProperty}
        onOpenMortgage={() => setIsMortgageModalOpen(true)}
        onOpenScheduleVisit={(prop) => {
          if (prop) setScheduleTargetProperty(prop);
          setIsScheduleVisitOpen(true);
        }}
        onOpenMap={() => setIsMapExplorerOpen(true)}
        onSelectProperty={(prop) => handleOpenPropertyPage(prop.slug || prop.id)}
      />

      {/* Unified Login Modal (Username/Password or Google OAuth) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessAdminLogin={handleSuccessAdminLogin}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* User Profile Modal for Normal Users (Supabase Google Auth) */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        user={currentUser}
        savedCount={savedPropertyIds.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onSignOut={handleSignOut}
        onUpdateUser={(updated) => setCurrentUser(updated)}
      />

      {/* Admin Panel Modal for Site Elements, Properties, Articles Management */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        initialTab={adminInitialTab}
        properties={properties}
        blogPosts={blogPosts}
        siteSettings={siteSettings}
        bookings={bookings}
        user={currentUser}
        cmsElements={cms.elements}
        onUpdateCMSElement={(elementId, updates) => {
          if (updates.styles) {
            cms.updateElementStyles(elementId, updates.styles);
          }
          if (updates.content) {
            cms.updateElementContent(elementId, updates.content);
          }
        }}
        onSaveCMSDraft={() => cms.saveDraft(currentUser?.email || 'Super Admin')}
        onPublishCMS={() => cms.publishPage('انتشار تغییرات استایل از پنل ادمین', currentUser?.email || 'Super Admin')}
        onResetCMS={(elementId) => cms.resetStyles(elementId)}
        onAdminsUpdated={() => {
          setAdminVisibilitySettings(getAdminVisibilitySettings());
        }}
        onSaveProperty={handleSaveProperty}
        onDeleteProperty={handleDeleteProperty}
        onSaveBlogPost={handleSaveBlogPost}
        onDeleteBlogPost={handleDeleteBlogPost}
        onSaveSiteSettings={handleSaveSiteSettings}
        onResetSiteSettings={handleResetSiteSettings}
        onGoogleSignIn={handleGoogleSignIn}
        onShowToast={showToast}
        onAdminAuthChange={(val) => setIsAdminSession(val)}
        onAdminLogout={handleAdminLogout}
        onTriggerTestPriceAlert={handleTriggerTestPriceAlert}
        onTriggerTestNewMatchAlert={handleTriggerTestNewMatchAlert}
        onOpenVisualEditor={() => setIsVisualEditorOpen(true)}
      />

      {/* Visual Page Builder & CMS Studio Modal */}
      {isVisualEditorOpen && (
        <VisualEditorModal
          isOpen={isVisualEditorOpen}
          onClose={() => setIsVisualEditorOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Global Standalone ROI & Renovation Calculator Modal */}
      {isRoiModalOpen && (
        <RoiCalculatorModal
          isOpen={isRoiModalOpen}
          initialProperty={selectedProperty || properties[0]}
          onClose={() => setIsRoiModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Dedicated Real Estate Consultant Profile Modal */}
      {selectedAgent && (
        <ConsultantProfileModal
          agent={selectedAgent}
          properties={properties}
          onClose={() => setSelectedAgent(null)}
          onSelectProperty={(prop) => {
            setSelectedAgent(null);
            setSelectedProperty(prop);
          }}
          onScheduleVisit={(prop) => {
            setSelectedAgent(null);
            handleScheduleVisit(prop);
          }}
        />
      )}
    </div>
  );
}
