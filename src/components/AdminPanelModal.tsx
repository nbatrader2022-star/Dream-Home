import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BookOpen,
  Settings,
  Calendar,
  Search,
  Image as ImageIcon,
  ShieldCheck,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  BarChart3,
  Activity,
  Calculator,
  TrendingUp,
  RefreshCw,
  Zap,
  Bell,
  Sliders,
  Palette,
  ShieldAlert,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { Property, BlogPost, SiteSettings, VisitBooking, PropertyType, TransactionType, PropertyStatus, UserProfile } from '../types';
import { ADMIN_EMAIL } from '../data/settings';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { useTelemetry } from '../hooks/useTelemetry';
import { SUPPORTED_CITIES_LIST } from '../data/additionalCityProperties';
import { CMSStylerTab } from './admin/CMSStylerTab';
import { AdminManagementTab } from './admin/AdminManagementTab';
import { DynamicSEOTab } from './admin/DynamicSEOTab';
import { CMSElement } from '../types/cms';
import { isUserAuthorizedAdmin, SUPER_ADMIN_EMAIL } from '../data/admins';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import {
  signInAdminWithSupabase,
  signOutAdmin,
  getCurrentAdminSession,
  subscribeToSupabaseAuth,
  verifySuperAdminRole,
} from '../services/supabaseAuth';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'cms' | 'admins' | 'properties' | 'blog' | 'settings' | 'bookings' | 'analytics' | 'media' | 'seo';
  properties: Property[];
  blogPosts: BlogPost[];
  siteSettings: SiteSettings;
  bookings: VisitBooking[];
  user: UserProfile | null;
  cmsElements?: CMSElement[];
  onUpdateCMSElement?: (elementId: string, updates: Partial<CMSElement>) => void;
  onSaveCMSDraft?: () => Promise<boolean>;
  onPublishCMS?: () => Promise<any>;
  onResetCMS?: (elementId: string) => void;
  onAdminsUpdated?: () => void;
  onSaveProperty: (property: Property, isNew: boolean) => void;
  onDeleteProperty: (id: string) => void;
  onSaveBlogPost: (post: BlogPost, isNew: boolean) => void;
  onDeleteBlogPost: (id: string) => void;
  onSaveSiteSettings: (settings: SiteSettings) => void;
  onResetSiteSettings: () => void;
  onGoogleSignIn: () => void;
  onShowToast: (title: string, message: string) => void;
  onAdminAuthChange?: (isAdmin: boolean) => void;
  onAdminLogout?: () => Promise<void> | void;
  onTriggerTestPriceAlert?: () => void;
  onTriggerTestNewMatchAlert?: () => void;
  onOpenVisualEditor?: () => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  initialTab = 'cms',
  properties,
  blogPosts,
  siteSettings,
  bookings,
  user,
  cmsElements = [],
  onUpdateCMSElement,
  onSaveCMSDraft,
  onPublishCMS,
  onResetCMS,
  onAdminsUpdated,
  onSaveProperty,
  onDeleteProperty,
  onSaveBlogPost,
  onDeleteBlogPost,
  onSaveSiteSettings,
  onResetSiteSettings,
  onGoogleSignIn,
  onShowToast,
  onAdminAuthChange,
  onAdminLogout,
  onTriggerTestPriceAlert,
  onTriggerTestNewMatchAlert,
  onOpenVisualEditor,
}: AdminPanelModalProps) {
  const validTabs: Array<'cms' | 'admins' | 'properties' | 'blog' | 'settings' | 'bookings' | 'analytics' | 'media' | 'seo'> = [
    'cms', 'admins', 'properties', 'blog', 'settings', 'bookings', 'analytics', 'media', 'seo'
  ];
  const safeInitialTab = (typeof initialTab === 'string' && validTabs.includes(initialTab as any)) ? (initialTab as any) : 'cms';
  const [activeTab, setActiveTab] = useState<'cms' | 'admins' | 'properties' | 'blog' | 'settings' | 'bookings' | 'analytics' | 'media' | 'seo'>(safeInitialTab);

  useEffect(() => {
    if (isOpen) {
      const safe = (typeof initialTab === 'string' && validTabs.includes(initialTab as any)) ? (initialTab as any) : 'cms';
      setActiveTab(safe);
    }
  }, [isOpen, initialTab]);
  const { summary: telemetrySummary, clear: clearTelemetry, seed: seedTelemetry } = useTelemetry();
  
  // Lock body scroll when modal is open
  useLockBodyScroll(isOpen);

  // Supabase Super Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUserEmail, setAdminUserEmail] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>(ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Check Supabase session & verify superadmin role
  useEffect(() => {
    getCurrentAdminSession().then((session) => {
      if (session.isSuperAdmin) {
        setIsAdminAuthenticated(true);
        setAdminToken(session.token);
        setAdminUserEmail(session.user?.email || ADMIN_EMAIL);
        onAdminAuthChange?.(true);
      }
    });

    const unsubscribe = subscribeToSupabaseAuth((state) => {
      if (state.isSuperAdmin) {
        setIsAdminAuthenticated(true);
        setAdminToken(state.token);
        setAdminUserEmail(state.user?.email || ADMIN_EMAIL);
        onAdminAuthChange?.(true);
      } else {
        // If current Google user matches authorized list, verify with Supabase backend
        if (user?.email && isUserAuthorizedAdmin(user.email)) {
          verifySuperAdminRole(user.uid, user.email, state.token || undefined).then((res) => {
            if (res.isSuperAdmin) {
              setIsAdminAuthenticated(true);
              setAdminToken(state.token);
              setAdminUserEmail(user.email!);
              onAdminAuthChange?.(true);
            }
          });
        } else {
          setIsAdminAuthenticated(false);
          setAdminToken(null);
          setAdminUserEmail('');
          onAdminAuthChange?.(false);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.email, user?.uid, onAdminAuthChange]);

  // Property edit/add state
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isNewProperty, setIsNewProperty] = useState<boolean>(false);
  const [propSearch, setPropSearch] = useState<string>('');
  const [propCategoryFilter, setPropCategoryFilter] = useState<string>('all');

  // Blog edit/add state
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState<boolean>(false);
  const [blogSearch, setBlogSearch] = useState<string>('');

  // Settings form state
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);

  // Property Form Inputs
  const [propForm, setPropForm] = useState<{
    title: string;
    propertyType: PropertyType;
    transactionType: TransactionType;
    status: PropertyStatus;
    city: string;
    neighborhood: string;
    location: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    parking: number;
    buildingAge: number;
    description: string;
    imagesText: string;
    amenitiesText: string;
    featured: boolean;
    virtualTourAvailable: boolean;
  }>({
    title: '',
    propertyType: 'apartment',
    transactionType: 'buy',
    status: 'sale',
    city: 'tehran',
    neighborhood: 'الهیه',
    location: 'تهران، الهیه، خیابان فرشته',
    price: 35000000000,
    area: 250,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    buildingAge: 0,
    description: 'واحد لوکس نوساز با نورگیری فوق‌العاده و مشاعات کامل.',
    imagesText: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    amenitiesText: 'استخر, سونا, جکوزی, روف‌گاردن, لابی مجلل, نگهبانی ۲۴ ساعته',
    featured: true,
    virtualTourAvailable: true,
  });

  // Blog Form Inputs
  const [postForm, setPostForm] = useState<{
    title: string;
    category: 'legal' | 'guide' | 'tax' | 'invest' | 'market';
    categoryFa: string;
    author: string;
    readTime: string;
    image: string;
    excerpt: string;
    content: string;
  }>({
    title: '',
    category: 'legal',
    categoryFa: 'حقوقی و اسناد',
    author: 'تیم حقوقی خانه آرمانی',
    readTime: '۵ دقیقه مطالعه',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    excerpt: '',
    content: '',
  });

  if (!isOpen) return null;

  // Check if current user is admin via real Supabase Auth or Superadmin status
  const isAuthorizedEmail = Boolean(
    user?.email && (
      user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
      user.email.toLowerCase() === 'luxury.investor@gmail.com' ||
      user.email.toLowerCase() === 'nabikalandar0@gmail.com' ||
      isUserAuthorizedAdmin(user.email)
    )
  );
  const isActualAdmin = isAdminAuthenticated || isAuthorizedEmail;

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) {
      setAuthError('لطفاً ایمیل و رمز عبور را وارد نمایید.');
      return;
    }
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const authResult = await signInAdminWithSupabase(emailInput, passwordInput);
      if (authResult.isSuperAdmin) {
        setIsAdminAuthenticated(true);
        setAdminToken(authResult.token);
        setAdminUserEmail(authResult.user?.email || emailInput);
        onAdminAuthChange?.(true);
        onShowToast('ورود امن با سرور', `خوش آمدید، شما به عنوان مدیر ارشد سیستم (${authResult.user?.email || emailInput}) احراز هویت شدید.`);
      } else {
        setAuthError('دسترسی رد شد: این حساب کاربری فاقد مجوز مدیر ارشد (Super Admin) در پایگاه داده است.');
        onShowToast('خطای دسترسی', 'حساب کاربری مورد نظر مجوز سوپر ادمین ندارد.');
      }
    } catch (err: any) {
      const msg = err.message || 'خطا در احراز هویت. اطلاعات کاربری نادرست است.';
      setAuthError(msg);
      onShowToast('خطای ورود', msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = async () => {
    setIsAuthenticating(true);
    try {
      // 1. Invalidate Supabase session & local tokens
      await signOutAdmin();
      // 2. Clear app-level state and user credentials
      if (onAdminLogout) {
        await onAdminLogout();
      }
    } catch (err) {
      console.warn('Admin logout note:', err);
    } finally {
      // 3. Clear modal internal state
      setIsAdminAuthenticated(false);
      setAdminToken(null);
      setAdminUserEmail('');
      setEmailInput('');
      setPasswordInput('');
      setAuthError('');
      setIsAuthenticating(false);
      onAdminAuthChange?.(false);
      // 4. Completely close and unmount the modal
      onClose();
      onShowToast('خروج از پنل مدیریت', 'نشست مدیریت با موفقیت خاتمه یافت.');
    }
  };

  // Open property editor
  const handleOpenPropertyForm = (prop?: Property) => {
    if (prop) {
      setIsNewProperty(false);
      setEditingProperty(prop);
      setPropForm({
        title: prop.title,
        propertyType: prop.propertyType,
        transactionType: prop.transactionType,
        status: prop.status,
        city: prop.city,
        neighborhood: prop.neighborhood,
        location: prop.location,
        price: prop.price,
        area: prop.area,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        parking: prop.parking,
        buildingAge: prop.buildingAge,
        description: prop.description,
        imagesText: prop.images.join('\n'),
        amenitiesText: prop.amenities.join(', '),
        featured: prop.featured,
        virtualTourAvailable: prop.virtualTourAvailable,
      });
    } else {
      setIsNewProperty(true);
      setEditingProperty({
        id: `prop-${Date.now()}`,
        title: '',
        slug: `property-${Date.now()}`,
        transactionType: 'buy',
        propertyType: 'apartment',
        price: 45000000000,
        location: 'تهران، زعفرانیه',
        neighborhood: 'زعفرانیه',
        city: 'tehran',
        cityNameFa: 'تهران',
        area: 280,
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        floor: 6,
        totalFloors: 10,
        buildingAge: 0,
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        description: 'پنت‌هاوس مجلل با ویوی ابدی و متریال اروپایی.',
        amenities: ['استخر', 'سونا', 'روف‌گاردن'],
        agent: {
          id: 'agent-admin',
          name: 'نبی کلاندر (مدیریت کل)',
          role: 'کارشناس ارشد املاک لوکس',
          phone: siteSettings.contactPhone,
          whatsapp: siteSettings.contactPhone,
          photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
          rating: 5,
          dealsCount: 45,
          experienceYears: 12,
        },
        coordinates: { lat: 35.815, lng: 51.42 },
        status: 'sale',
        featured: true,
        virtualTourAvailable: true,
        createdAt: new Date().toISOString(),
        viewsCount: 15,
      });
      setPropForm({
        title: '',
        propertyType: 'apartment',
        transactionType: 'buy',
        status: 'sale',
        city: 'tehran',
        neighborhood: 'زعفرانیه',
        location: 'تهران، زعفرانیه',
        price: 45000000000,
        area: 280,
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        buildingAge: 0,
        description: 'پنت‌هاوس مجلل با ویوی ابدی و متریال اروپایی.',
        imagesText: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        amenitiesText: 'استخر, سونا, روف‌گاردن, لابی مجلل',
        featured: true,
        virtualTourAvailable: true,
      });
    }
  };

  const handleSavePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    const images = propForm.imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.startsWith('http'));

    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
    }

    const amenities = propForm.amenitiesText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const updatedProp: Property = {
      ...editingProperty,
      title: propForm.title || 'ملک لوکس پیشنهادی',
      propertyType: propForm.propertyType,
      transactionType: propForm.transactionType,
      status: propForm.status,
      city: propForm.city,
      cityNameFa:
        propForm.city === 'tehran'
          ? 'تهران'
          : propForm.city === 'karaj'
          ? 'کرج'
          : propForm.city === 'isfahan'
          ? 'اصفهان'
          : 'شیراز',
      neighborhood: propForm.neighborhood,
      location: propForm.location,
      price: Number(propForm.price) || 10000000000,
      area: Number(propForm.area) || 100,
      bedrooms: Number(propForm.bedrooms) || 0,
      bathrooms: Number(propForm.bathrooms) || 0,
      parking: Number(propForm.parking) || 0,
      buildingAge: Number(propForm.buildingAge) || 0,
      description: propForm.description,
      images,
      amenities,
      featured: propForm.featured,
      virtualTourAvailable: propForm.virtualTourAvailable,
    };

    onSaveProperty(updatedProp, isNewProperty);
    setEditingProperty(null);
    onShowToast(
      isNewProperty ? 'ملک جدید اضافه شد' : 'ملک با موفقیت ویرایش شد',
      `ملک «${updatedProp.title}» در پایگاه داده ذخیره گردید.`
    );
  };

  // Open blog editor
  const handleOpenBlogForm = (post?: BlogPost) => {
    if (post) {
      setIsNewPost(false);
      setEditingPost(post);
      setPostForm({
        title: post.title,
        category: post.category,
        categoryFa: post.categoryFa,
        author: post.author,
        readTime: post.readTime,
        image: post.image,
        excerpt: post.excerpt,
        content: post.content,
      });
    } else {
      setIsNewPost(true);
      setEditingPost({
        id: `blog-${Date.now()}`,
        title: '',
        slug: `article-${Date.now()}`,
        category: 'legal',
        categoryFa: 'حقوقی و اسناد',
        date: new Date().toLocaleDateString('fa-IR'),
        readTime: '۶ دقیقه مطالعه',
        author: 'نبی کلاندر (مدیریت حقوقی)',
        image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        excerpt: '',
        content: '',
      });
      setPostForm({
        title: '',
        category: 'legal',
        categoryFa: 'حقوقی و اسناد',
        author: 'نبی کلاندر (مدیریت حقوقی)',
        readTime: '۶ دقیقه مطالعه',
        image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        excerpt: '',
        content: '',
      });
    }
  };

  const handleSaveBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const categoryFaMap = {
      legal: 'حقوقی و اسناد',
      guide: 'آموزش و تحویل',
      tax: 'مالیات و عوارض',
      invest: 'سرمایه‌گذاری',
      market: 'تحلیل بازار',
    };

    const updatedPost: BlogPost = {
      ...editingPost,
      title: postForm.title || 'مقاله آموزشی جدید',
      category: postForm.category,
      categoryFa: categoryFaMap[postForm.category] || 'آموزشی',
      author: postForm.author,
      readTime: postForm.readTime,
      image: postForm.image || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      excerpt: postForm.excerpt,
      content: postForm.content,
    };

    onSaveBlogPost(updatedPost, isNewPost);
    setEditingPost(null);
    onShowToast(
      isNewPost ? 'مقاله جدید منتشر شد' : 'مقاله با موفقیت ویرایش شد',
      `مقاله «${updatedPost.title}» ذخیره گردید.`
    );
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSiteSettings(localSettings);
    onShowToast('تنظیمات ذخیره شد', 'اطلاعات و المان‌های سایت با موفقیت بروزرسانی شدند.');
  };

  // Filtered lists for admin overview
  const filteredProperties = properties.filter((p) => {
    const matchCat = propCategoryFilter === 'all' || p.propertyType === propCategoryFilter;
    const matchSearch =
      !propSearch.trim() ||
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(propSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredBlogPosts = blogPosts.filter((b) => {
    return (
      !blogSearch.trim() ||
      b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.categoryFa.toLowerCase().includes(blogSearch.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-[100000] pointer-events-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 text-right font-['Vazirmatn',sans-serif] overflow-y-auto animate-fadeIn">
      <div className="relative pointer-events-auto bg-[#121824] text-white w-full max-w-6xl rounded-3xl border border-[#C9A84C]/40 shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#0A0E17] px-5 sm:px-8 py-4 border-b border-[#C9A84C]/25 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#A07830] to-[#C9A84C] flex items-center justify-center text-[#1A1A2E] shadow-md font-black">
              <ShieldCheck className="w-5 h-5 text-[#1A1A2E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  پنل مدیریت خانه آرمانی
                </h2>
                <span className="bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#E4C675] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Admin Panel
                </span>
              </div>
              <div className="text-[11px] text-[#C9A84C] mt-0.5 flex items-center gap-1.5">
                <span>مدیر اختصاصی:</span>
                <span dir="ltr" className="font-mono font-bold text-white/90">
                  {ADMIN_EMAIL}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isActualAdmin && (
              <button
                onClick={handleAdminLogout}
                className="hidden sm:inline-flex text-[11px] text-white/60 hover:text-red-400 px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-400/40 transition-colors"
              >
                خروج از مدیریت
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              title="بستن پنل"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Gate if not authenticated */}
        {!isActualAdmin ? (
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center text-[#E4C675] mb-5 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              ورود اختصاصی مدیر ارشد (Super Admin)
            </h3>
            <p className="text-xs text-white/70 leading-relaxed mb-5">
              احراز هویت سروری امن از طریق <strong className="text-[#E4C675]">Supabase Auth</strong>. دسترسی به پنل مدیریت صرفاً برای مدیران ارشد تاییدشده در دیتابیس مجاز است.
            </p>

            <div className="flex flex-col gap-3.5 w-full">
              {/* Google Login Option */}
              <button
                onClick={onGoogleSignIn}
                className="w-full bg-white hover:bg-stone-100 text-[#1A1A2E] font-black py-3 px-5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2.5 text-xs shadow-md"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                <span>ورود با حساب گوگل ({ADMIN_EMAIL})</span>
              </button>

              <div className="flex items-center gap-3 my-1 text-white/30 text-xs">
                <span className="h-px bg-white/10 flex-1" />
                <span>یا ورود با ایمیل و گذرواژه Supabase</span>
                <span className="h-px bg-white/10 flex-1" />
              </div>

              {/* Supabase Email & Password Form */}
              <form onSubmit={handleSupabaseLogin} className="flex flex-col gap-3 w-full text-right">
                <div>
                  <label className="text-[11px] text-white/60 mb-1 block">ایمیل مدیر ارشد</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full bg-[#1A2234] border border-[#C9A84C]/30 focus:border-[#C9A84C] text-white text-xs px-4 py-3 rounded-xl outline-none placeholder:text-white/30 font-mono text-left"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white/60 mb-1 block">گذرواژه امنیتی</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="••••••••••••"
                    dir="ltr"
                    className="w-full bg-[#1A2234] border border-[#C9A84C]/30 focus:border-[#C9A84C] text-white text-xs px-4 py-3 rounded-xl outline-none placeholder:text-white/30 font-mono text-left"
                  />
                </div>

                {authError && (
                  <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 flex items-start gap-2 font-bold text-right">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-black py-3 px-6 rounded-xl shadow-[0_4px_16px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#1A1A2E]" />
                      <span>در حال اعتبارسنجی نشست در Supabase...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>ورود امن و احراز هویت با Supabase</span>
                    </>
                  )}
                </button>
              </form>

              <div className="bg-[#1A2234]/60 border border-white/5 rounded-xl p-3 text-[11px] text-white/50 text-right leading-normal mt-1">
                🔒 <strong className="text-white/80">امنیت چندلایه:</strong> دسترسی صرفاً بر اساس JWT معتبر و نقش تاییدشده در جدول <code className="text-[#E4C675] font-mono">admin_users</code> صادر می‌شود. کلید میانبر <kbd className="px-1.5 py-0.5 bg-black/40 rounded text-[#E4C675] font-mono">Ctrl+Shift+A</kbd> همیشه در دسترس شماست.
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Tabs Navigation */}
            <div className="bg-[#0F172A] px-5 sm:px-8 flex gap-2 border-b border-white/10 overflow-x-auto flex-shrink-0">
              {/* 1. CMS Visual Styler Tab (Primary User Request) */}
              <button
                onClick={() => setActiveTab('cms')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'cms'
                    ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4 text-[#C9A84C]" />
                <span>ویرایش ظاهر و استایل المان‌ها (سایز، رنگ، فونت، گردی)</span>
                <span className="bg-[#C9A84C]/20 text-[#E4C675] px-2 py-0.5 rounded-full text-[10px] font-bold">
                  CMS Styler
                </span>
              </button>

              {/* 2. Admin Security & Hide Mode Tab (Second and Third User Requests) */}
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'admins'
                    ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#C9A84C]" />
                <span>مدیریت مدیران و پنهان‌سازی (امنیت)</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  امنیت
                </span>
              </button>

              {/* 3. Dynamic SEO & Meta Tags Tab */}
              <button
                onClick={() => setActiveTab('seo')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'seo'
                    ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4 text-[#C9A84C]" />
                <span>متا-تگ‌های داینامیک و سئو (SEO)</span>
                <span className="bg-[#C9A84C]/20 text-[#E4C675] px-2 py-0.5 rounded-full text-[10px] font-bold">
                  index.html
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('properties');
                  setEditingProperty(null);
                }}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'properties'
                    ? 'border-[#C9A84C] text-[#E4C675]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>نمونه‌کارها و املاک</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
                  {toPersianDigits(properties.length)}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('blog');
                  setEditingPost(null);
                }}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'blog'
                    ? 'border-[#C9A84C] text-[#E4C675]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>مقالات و آموزش‌ها</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
                  {toPersianDigits(blogPosts.length)}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-[#C9A84C] text-[#E4C675]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>المان‌ها و تنظیمات سایت</span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'media'
                    ? 'border-[#C9A84C] text-[#E4C675]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>مدیریت فایل‌ها و رسانه</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'border-[#C9A84C] text-[#E4C675]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>نوبت‌های بازدید</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
                  {toPersianDigits(bookings.length)}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'border-[#C9A84C] text-[#E4C675]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>آمار و رفتار کاربران (Telemetry)</span>
                <span className="bg-[#C9A84C]/20 text-[#E4C675] px-2 py-0.5 rounded-full text-[10px]">
                  {toPersianDigits(telemetrySummary.totalEvents)}
                </span>
              </button>

              {/* Visual Page Builder Launch Button */}
              {onOpenVisualEditor && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenVisualEditor();
                  }}
                  className="my-auto mr-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A07830] text-[#0A0E17] text-xs font-black flex items-center gap-2 shadow-lg shadow-[#C9A84C]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title="ورود به استودیوی ویرایشگر بصری زنده"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ویرایشگر زنده بصری (Visual Page Builder)</span>
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* TAB 1: PROPERTIES MANAGEMENT */}
              {activeTab === 'properties' && (
                <div>
                  {editingProperty ? (
                    /* Property Add / Edit Form */
                    <form onSubmit={handleSavePropertySubmit} className="bg-[#0D131F] p-5 sm:p-7 rounded-2xl border border-white/10 flex flex-col gap-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2 font-bold text-sm text-[#E4C675]">
                          <Edit2 className="w-4 h-4" />
                          <span>{isNewProperty ? 'افزودن نمونه‌کار / ملک جدید' : `ویرایش ملک: ${editingProperty.title}`}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProperty(null)}
                          className="text-xs text-white/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                        >
                          انصراف و بازگشت
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        {/* Title */}
                        <div className="sm:col-span-2">
                          <label className="block text-white/80 font-bold mb-1.5">عنوان ملک / نمونه‌کار</label>
                          <input
                            type="text"
                            required
                            value={propForm.title}
                            onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                            placeholder="مثال: پنت‌هاوس تریپلکس ۳۶۰ درجه نیاوران"
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">نوع ملک</label>
                          <select
                            value={propForm.propertyType}
                            onChange={(e) => setPropForm({ ...propForm, propertyType: e.target.value as PropertyType })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          >
                            <option value="apartment">آپارتمان</option>
                            <option value="villa">ویلا</option>
                            <option value="commercial">تجاری</option>
                            <option value="land">زمین</option>
                            <option value="penthouse">پنت‌هاوس</option>
                          </select>
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">قیمت (تومان)</label>
                          <input
                            type="number"
                            required
                            value={propForm.price}
                            onChange={(e) => setPropForm({ ...propForm, price: Number(e.target.value) })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                          <span className="text-[10px] text-[#C9A84C] mt-1 block">
                            معادل: {formatPrice(propForm.price)}
                          </span>
                        </div>

                        {/* Area */}
                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">متراژ (مترمربع)</label>
                          <input
                            type="number"
                            required
                            value={propForm.area}
                            onChange={(e) => setPropForm({ ...propForm, area: Number(e.target.value) })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">شهر</label>
                          <select
                            value={propForm.city}
                            onChange={(e) => setPropForm({ ...propForm, city: e.target.value as any })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          >
                            {SUPPORTED_CITIES_LIST.map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.nameFa} ({c.province})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Neighborhood */}
                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">محله</label>
                          <input
                            type="text"
                            required
                            value={propForm.neighborhood}
                            onChange={(e) => setPropForm({ ...propForm, neighborhood: e.target.value })}
                            placeholder="مثال: الهیه، نیاوران، زعفرانیه"
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        {/* Full Location */}
                        <div className="sm:col-span-2">
                          <label className="block text-white/80 font-bold mb-1.5">آدرس و موقعیت دقیق</label>
                          <input
                            type="text"
                            required
                            value={propForm.location}
                            onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                            placeholder="مثال: تهران، الهیه، خیابان فرشته، پلاک..."
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        {/* Bedrooms, Bathrooms, Parking */}
                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">تعداد اتاق خواب</label>
                          <input
                            type="number"
                            value={propForm.bedrooms}
                            onChange={(e) => setPropForm({ ...propForm, bedrooms: Number(e.target.value) })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">سرویس حمام و بهداشتی</label>
                          <input
                            type="number"
                            value={propForm.bathrooms}
                            onChange={(e) => setPropForm({ ...propForm, bathrooms: Number(e.target.value) })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">تعداد پارکینگ سندی</label>
                          <input
                            type="number"
                            value={propForm.parking}
                            onChange={(e) => setPropForm({ ...propForm, parking: Number(e.target.value) })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>
                      </div>

                      {/* Image URLs */}
                      <div>
                        <label className="block text-white/80 font-bold mb-1.5 text-xs">
                          لینک تصاویر (هر خط یک آدرس تصویر Unsplash یا مستقیم)
                        </label>
                        <textarea
                          rows={3}
                          value={propForm.imagesText}
                          onChange={(e) => setPropForm({ ...propForm, imagesText: e.target.value })}
                          className="w-full bg-[#16213E] border border-white/15 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-[#C9A84C]"
                          dir="ltr"
                        />
                      </div>

                      {/* Amenities */}
                      <div>
                        <label className="block text-white/80 font-bold mb-1.5 text-xs">
                          امکانات و ویژگی‌ها (با کاما جدا کنید)
                        </label>
                        <input
                          type="text"
                          value={propForm.amenitiesText}
                          onChange={(e) => setPropForm({ ...propForm, amenitiesText: e.target.value })}
                          placeholder="استخر, سونا, روف‌گاردن, لابی مجلل, سرایداری"
                          className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#C9A84C]"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-white/80 font-bold mb-1.5 text-xs">
                          توضیحات تکمیلی کارشناسی ملک
                        </label>
                        <textarea
                          rows={3}
                          value={propForm.description}
                          onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                          className="w-full bg-[#16213E] border border-white/15 rounded-xl p-3 text-white text-xs outline-none focus:border-[#C9A84C]"
                        />
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-wrap items-center gap-6 text-xs text-white/80 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={propForm.featured}
                            onChange={(e) => setPropForm({ ...propForm, featured: e.target.checked })}
                            className="w-4 h-4 rounded text-[#C9A84C] accent-[#C9A84C]"
                          />
                          <span>نمایش در بخش پیشنهادهای ویژه صفحه اصلی</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={propForm.virtualTourAvailable}
                            onChange={(e) => setPropForm({ ...propForm, virtualTourAvailable: e.target.checked })}
                            className="w-4 h-4 rounded text-[#C9A84C] accent-[#C9A84C]"
                          />
                          <span>دارای تور مجازی ۳۶۰ درجه</span>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-2.5 px-6 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-xs cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          ذخیره تغییرات ملک
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProperty(null)}
                          className="bg-white/10 hover:bg-white/15 text-white py-2.5 px-5 rounded-xl transition-colors text-xs"
                        >
                          انصراف
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Property List View */
                    <div className="flex flex-col gap-4">
                      {/* Top Bar: Search, Category Filter, and Add Button */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D131F] p-3.5 rounded-2xl border border-white/10">
                        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                          <div className="relative flex-1 min-w-[180px]">
                            <Search className="w-4 h-4 text-[#C9A84C] absolute right-3 top-2.5 pointer-events-none" />
                            <input
                              type="text"
                              value={propSearch}
                              onChange={(e) => setPropSearch(e.target.value)}
                              placeholder="جستجو در املاک..."
                              className="w-full bg-[#16213E] border border-white/15 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A84C]"
                            />
                          </div>
                          <select
                            value={propCategoryFilter}
                            onChange={(e) => setPropCategoryFilter(e.target.value)}
                            className="bg-[#16213E] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                          >
                            <option value="all">همه دسته‌ها</option>
                            <option value="apartment">آپارتمان</option>
                            <option value="villa">ویلا</option>
                            <option value="commercial">تجاری</option>
                            <option value="land">زمین</option>
                            <option value="penthouse">پنت‌هاوس</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleOpenPropertyForm()}
                          className="bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs shadow-md hover:scale-105 transition-transform cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          افزودن ملک جدید
                        </button>
                      </div>

                      {/* Properties Table / Grid */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {filteredProperties.map((prop) => (
                          <div
                            key={prop.id}
                            className="bg-[#0D131F] hover:bg-[#16213E]/80 p-3 sm:p-4 rounded-2xl border border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={prop.images[0]}
                                alt={prop.title}
                                className="w-16 h-14 rounded-xl object-cover shrink-0 border border-white/15"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white truncate">
                                    {prop.title}
                                  </span>
                                  <span className="bg-[#C9A84C]/15 text-[#E4C675] text-[10px] px-2 py-0.5 rounded-full border border-[#C9A84C]/30 shrink-0">
                                    {prop.propertyType}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#C9A84C] font-black mt-0.5">
                                  {formatPrice(prop.price)}
                                </div>
                                <div className="text-[10px] text-white/60 truncate mt-0.5">
                                  {prop.location} • {toPersianDigits(prop.area)} متر
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => handleOpenPropertyForm(prop)}
                                className="bg-white/10 hover:bg-[#C9A84C] text-white hover:text-[#1A1A2E] p-2 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                                title="ویرایش ملک"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">ویرایش</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`آیا از حذف ملک «${prop.title}» اطمینان دارید؟`)) {
                                    onDeleteProperty(prop.id);
                                    onShowToast('ملک حذف شد', `ملک «${prop.title}» از سیستم حذف گردید.`);
                                  }
                                }}
                                className="bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                                title="حذف ملک"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">حذف</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        {filteredProperties.length === 0 && (
                          <div className="text-center py-12 text-white/50 text-xs">
                            هیچ ملکی مطابق با فیلتر انتخابی یافت نشد.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BLOG & LEGAL ARTICLES MANAGEMENT */}
              {activeTab === 'blog' && (
                <div>
                  {editingPost ? (
                    /* Blog Add / Edit Form */
                    <form onSubmit={handleSaveBlogSubmit} className="bg-[#0D131F] p-5 sm:p-7 rounded-2xl border border-white/10 flex flex-col gap-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2 font-bold text-sm text-[#E4C675]">
                          <BookOpen className="w-4 h-4" />
                          <span>{isNewPost ? 'نگارش مقاله جدید' : `ویرایش مقاله: ${editingPost.title}`}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingPost(null)}
                          className="text-xs text-white/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                        >
                          انصراف و بازگشت
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block text-white/80 font-bold mb-1.5">عنوان مقاله</label>
                          <input
                            type="text"
                            required
                            value={postForm.title}
                            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                            placeholder="مثال: راهنمای گام به گام استعلام سند تک‌برگ"
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">دسته‌بندی موضوعی</label>
                          <select
                            value={postForm.category}
                            onChange={(e) => setPostForm({ ...postForm, category: e.target.value as any })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          >
                            <option value="legal">حقوقی و اسناد ثبتی</option>
                            <option value="guide">آموزش و تحویل ملک</option>
                            <option value="tax">مالیات و عوارض مسکن</option>
                            <option value="invest">سرمایه‌گذاری ملکی</option>
                            <option value="market">تحلیل بازار مسکن</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white/80 font-bold mb-1.5">نویسنده / کارشناس حقوقی</label>
                          <input
                            type="text"
                            value={postForm.author}
                            onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                            placeholder="مثال: تیم حقوقی خانه آرمانی"
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-white/80 font-bold mb-1.5">آدرس تصویر شاخص مقاله</label>
                          <input
                            type="text"
                            value={postForm.image}
                            onChange={(e) => setPostForm({ ...postForm, image: e.target.value })}
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                            dir="ltr"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-white/80 font-bold mb-1.5">خلاصه مقاله (چکیده)</label>
                          <textarea
                            rows={2}
                            value={postForm.excerpt}
                            onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                            placeholder="خلاصه‌ای یک یا دو جمله‌ای از مهم‌ترین نکات مقاله..."
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl p-3 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-white/80 font-bold mb-1.5">متن کامل مقاله و راهنما</label>
                          <textarea
                            rows={7}
                            required
                            value={postForm.content}
                            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                            placeholder="متن تشریحی و جامع آموزشی و حقوقی مقاله را در اینجا وارد نمایید..."
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl p-3 text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-2.5 px-6 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-xs cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          ذخیره و انتشار مقاله
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPost(null)}
                          className="bg-white/10 hover:bg-white/15 text-white py-2.5 px-5 rounded-xl transition-colors text-xs"
                        >
                          انصراف
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Blog List View */
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D131F] p-3.5 rounded-2xl border border-white/10">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="w-4 h-4 text-[#C9A84C] absolute right-3 top-2.5 pointer-events-none" />
                          <input
                            type="text"
                            value={blogSearch}
                            onChange={(e) => setBlogSearch(e.target.value)}
                            placeholder="جستجو در مقالات..."
                            className="w-full bg-[#16213E] border border-white/15 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white outline-none focus:border-[#C9A84C]"
                          />
                        </div>

                        <button
                          onClick={() => handleOpenBlogForm()}
                          className="bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs shadow-md hover:scale-105 transition-transform cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          افزودن مقاله جدید
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {filteredBlogPosts.map((post) => (
                          <div
                            key={post.id}
                            className="bg-[#0D131F] hover:bg-[#16213E]/80 p-3 sm:p-4 rounded-2xl border border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-16 h-14 rounded-xl object-cover shrink-0 border border-white/15"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white truncate">
                                    {post.title}
                                  </span>
                                  <span className="bg-[#C9A84C]/15 text-[#E4C675] text-[10px] px-2 py-0.5 rounded-full border border-[#C9A84C]/30 shrink-0">
                                    {post.categoryFa}
                                  </span>
                                </div>
                                <div className="text-[10px] text-white/60 truncate mt-1">
                                  {post.author} • {post.date} • {post.readTime}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => handleOpenBlogForm(post)}
                                className="bg-white/10 hover:bg-[#C9A84C] text-white hover:text-[#1A1A2E] p-2 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                                title="ویرایش مقاله"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">ویرایش</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`آیا از حذف مقاله «${post.title}» اطمینان دارید؟`)) {
                                    onDeleteBlogPost(post.id);
                                    onShowToast('مقاله حذف شد', `مقاله «${post.title}» حذف گردید.`);
                                  }
                                }}
                                className="bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                                title="حذف مقاله"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">حذف</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SITE ELEMENTS & SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettingsSubmit} className="bg-[#0D131F] p-5 sm:p-7 rounded-2xl border border-white/10 flex flex-col gap-6 text-xs">
                  <div>
                    <h3 className="text-sm font-black text-[#E4C675] mb-1">
                      ویرایش المان‌ها، متون و اطلاعات سایت
                    </h3>
                    <p className="text-white/60 text-[11px]">
                      تغییرات اعمال‌شده در این بخش مستقیماً در هدر، فوتر، بنر اصلی و کارت‌های آماری نمایش داده خواهند شد.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Brand Titles */}
                    <div>
                      <label className="block text-white/80 font-bold mb-1.5">عنوان اصلی سایت (برند فارسی)</label>
                      <input
                        type="text"
                        value={localSettings.siteTitle}
                        onChange={(e) => setLocalSettings({ ...localSettings, siteTitle: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1.5">عنوان لاتین برند (زیرعنوان هدر)</label>
                      <input
                        type="text"
                        value={localSettings.siteSubtitle}
                        onChange={(e) => setLocalSettings({ ...localSettings, siteSubtitle: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    {/* Hero Headlines */}
                    <div className="sm:col-span-2">
                      <label className="block text-white/80 font-bold mb-1.5">تیتر بزرگ بنر اصلی (Hero Headline)</label>
                      <input
                        type="text"
                        value={localSettings.heroHeadline}
                        onChange={(e) => setLocalSettings({ ...localSettings, heroHeadline: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-white/80 font-bold mb-1.5">زیرتیتر بنر اصلی (Hero Subheadline)</label>
                      <input
                        type="text"
                        value={localSettings.heroSubheadline}
                        onChange={(e) => setLocalSettings({ ...localSettings, heroSubheadline: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    {/* Contact Info */}
                    <div>
                      <label className="block text-white/80 font-bold mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span>شماره تماس مدیریت</span>
                      </label>
                      <input
                        type="text"
                        value={localSettings.contactPhone}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span>ایمیل رسمی مدیریت</span>
                      </label>
                      <input
                        type="email"
                        value={localSettings.contactEmail}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                        dir="ltr"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-white/80 font-bold mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span>آدرس دفتر مرکزی</span>
                      </label>
                      <input
                        type="text"
                        value={localSettings.contactAddress}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactAddress: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    {/* Stats */}
                    <div>
                      <label className="block text-white/80 font-bold mb-1.5">آمار تعداد ملک‌های فعال</label>
                      <input
                        type="text"
                        value={localSettings.statsProperties}
                        onChange={(e) => setLocalSettings({ ...localSettings, statsProperties: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1.5">درصد رضایت مشتریان</label>
                      <input
                        type="text"
                        value={localSettings.statsSatisfaction}
                        onChange={(e) => setLocalSettings({ ...localSettings, statsSatisfaction: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1.5">معاملات موفق ثبت شده</label>
                      <input
                        type="text"
                        value={localSettings.statsDeals}
                        onChange={(e) => setLocalSettings({ ...localSettings, statsDeals: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1.5">سابقه فعالیت تخصصی</label>
                      <input
                        type="text"
                        value={localSettings.statsExperience}
                        onChange={(e) => setLocalSettings({ ...localSettings, statsExperience: e.target.value })}
                        className="w-full bg-[#16213E] border border-white/15 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-2.5 px-7 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      ذخیره تنظیمات سایت
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('آیا از بازنشانی تنظیمات به مقادیر پیش‌فرض اطمینان دارید؟')) {
                          onResetSiteSettings();
                          onShowToast('بازنشانی انجام شد', 'تنظیمات سایت به حالت پیش‌فرض بازگشت.');
                        }
                      }}
                      className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      بازنشانی به پیش‌فرض
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: BOOKINGS OVERVIEW */}
              {activeTab === 'bookings' && (
                <div className="flex flex-col gap-3">
                  <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">درخواست‌های ثبت‌شده بازدید حضوری و مجازی</div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        مجموعاً {toPersianDigits(bookings.length)} نوبت بازدید توسط کاربران رزرو شده است
                      </div>
                    </div>
                  </div>

                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={b.propertyImage}
                          alt={b.propertyTitle}
                          className="w-14 h-14 rounded-xl object-cover border border-white/15"
                        />
                        <div>
                          <div className="font-bold text-white mb-0.5">{b.propertyTitle}</div>
                          <div className="text-[#C9A84C] font-semibold text-[11px]">
                            متقاضی: {b.name} • تماس: <span dir="ltr">{b.phone}</span>
                          </div>
                          <div className="text-white/50 text-[10px] mt-0.5">
                            زمان: {b.date} ({b.timeSlot}) • نوع: {b.visitType === 'in-person' ? 'حضوری' : 'تور سه‌بعدی ۳D'}
                          </div>
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="text-[11px] text-white/60">کد رهگیری:</div>
                        <div className="font-mono font-bold text-[#E4C675] text-xs" dir="ltr">
                          {b.trackingCode}
                        </div>
                      </div>
                    </div>
                  ))}

                  {bookings.length === 0 && (
                    <div className="text-center py-12 text-white/50 text-xs">
                      هنوز هیچ نوبت بازدیدی رزرو نشده است.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: TELEMETRY & USER BEHAVIOR ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 text-xs">
                  {/* Top Bar / Actions */}
                  <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#C9A84C]" />
                        <span>سیستم تحلیل رفتار و تعاملات کاربران (Telemetry Engine)</span>
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">
                        رهگیری سبک و بلادرنگ الگوهای جستجو، بازدید از املاک، استفاده از ماشین‌حساب‌ها و نرخ تعامل
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          seedTelemetry(properties);
                          onShowToast('داده‌های نمونه بارگذاری شد', 'رویدادهای آزمایشی تله‌متری با موفقیت ثبت شدند.');
                        }}
                        className="bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#E4C675] border border-[#C9A84C]/40 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>تولید داده‌های نمونه آماری</span>
                      </button>
                      <button
                        onClick={() => {
                          clearTelemetry();
                          onShowToast('آمار پاک‌سازی شد', 'تاریخچه تله‌متری و رویدادهای تحلیلی ریست شدند.');
                        }}
                        className="bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>پاک‌سازی آمار</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-white/60 mb-2">
                        <span className="text-[11px] font-medium">مجموع رویدادهای ثبت‌شده</span>
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono">
                        {toPersianDigits(telemetrySummary.totalEvents)}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 mt-1 font-secondary">
                        ثبت بلادرنگ در LocalStorage
                      </div>
                    </div>

                    <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-white/60 mb-2">
                        <span className="text-[11px] font-medium">بازدید از املاک و پنت‌هاوس‌ها</span>
                        <Eye className="w-4 h-4 text-[#C9A84C]" />
                      </div>
                      <div className="text-2xl font-black text-[#E4C675] font-mono">
                        {toPersianDigits(telemetrySummary.propertyViewsCount)}
                      </div>
                      <div className="text-[10px] text-white/50 mt-1 font-secondary">
                        کلیک و مشاهده کارت و جزئیات ملک
                      </div>
                    </div>

                    <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-white/60 mb-2">
                        <span className="text-[11px] font-medium">جستجوهای انجام‌شده</span>
                        <Search className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="text-2xl font-black text-sky-400 font-mono">
                        {toPersianDigits(telemetrySummary.searchQueriesCount)}
                      </div>
                      <div className="text-[10px] text-white/50 mt-1 font-secondary">
                        فیلتر و واژه‌های تایپ‌شده توسط مخاطب
                      </div>
                    </div>

                    <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-white/60 mb-2">
                        <span className="text-[11px] font-medium">محاسبات مالی و اقساط</span>
                        <Calculator className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl font-black text-purple-400 font-mono">
                        {toPersianDigits(telemetrySummary.calculatorUsageCount)}
                      </div>
                      <div className="text-[10px] text-white/50 mt-1 font-secondary">
                        ماشین‌حساب وام مسکن و سودآوری ROI
                      </div>
                    </div>
                  </div>

                  {/* 2 Columns: Top Properties + Top Search Terms */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top Viewed Properties */}
                    <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10 flex flex-col">
                      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                        <div className="font-bold text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
                          <span>محبوب‌ترین املاک (بیشترین بازدید)</span>
                        </div>
                        <span className="text-[10px] text-white/50">برترین رتبه‌ها</span>
                      </div>

                      <div className="space-y-2.5 flex-1">
                        {telemetrySummary.topProperties.map((p, idx) => (
                          <div
                            key={p.id}
                            className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-[#C9A84C]/20 text-[#E4C675] flex items-center justify-center text-[10px] font-bold font-mono">
                                {idx + 1}
                              </span>
                              <div className="truncate">
                                <div className="font-bold text-white text-xs truncate">{p.title}</div>
                                <div className="text-[10px] text-white/50 truncate">
                                  {p.location} • {formatPrice(p.price)}
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#C9A84C]/20 text-[#E4C675] px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono whitespace-nowrap">
                              {toPersianDigits(p.views)} بازدید
                            </div>
                          </div>
                        ))}

                        {telemetrySummary.topProperties.length === 0 && (
                          <div className="text-center py-6 text-white/40 text-xs">
                            هنوز بازدیدی از املاک ثبت نشده است.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Search Queries & Alert Testing */}
                    <div className="space-y-4">
                      {/* Top Search Keywords */}
                      <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                          <div className="font-bold text-white flex items-center gap-2">
                            <Search className="w-4 h-4 text-sky-400" />
                            <span>بیشترین واژه‌های جستجو شده توسط کاربران</span>
                          </div>
                          <span className="text-[10px] text-white/50">تقاضای بازار</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {telemetrySummary.topSearchTerms.map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-[#16213E] hover:bg-[#1F2E54] border border-[#C9A84C]/30 text-white/90 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 transition-colors"
                            >
                              <span className="font-medium">{s.term}</span>
                              <span className="bg-[#C9A84C]/30 text-[#E4C675] text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold">
                                {toPersianDigits(s.count)}
                              </span>
                            </span>
                          ))}

                          {telemetrySummary.topSearchTerms.length === 0 && (
                            <div className="text-white/40 text-xs py-3">
                              هنوز کوئری جستجویی ثبت نشده است. با جستجو در بخش املاک عبارات ثبت می‌شوند.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notification System Test Box */}
                      <div className="bg-gradient-to-br from-[#121824] to-[#1A2234] p-4 rounded-2xl border border-[#C9A84C]/30 shadow-sm">
                        <div className="flex items-center gap-2 text-[#E4C675] font-bold text-xs mb-1">
                          <Bell className="w-4 h-4 text-[#C9A84C]" />
                          <span>سیستم نوتیفیکیشن هوشمند املاک (Alerts & Toasts)</span>
                        </div>
                        <p className="text-[11px] text-white/60 leading-relaxed mb-3">
                          به محض تغییر قیمت در املاک نشان‌شده کاربر، یا اضافه شدن ملکی جدید منطبق با معیارهای ذخیره‌شده او، یک هشدار آنی Toast نمایش داده می‌شود.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              onTriggerTestPriceAlert?.();
                              onShowToast(
                                '🔔 کاهش قیمت در ملک نشان‌شده شما',
                                'قیمت «آپارتمان لوکس الهیه» با ۵۰۰ میلیون تومان کاهش به ۱۸ میلیارد تومان رسید.'
                              );
                            }}
                            className="bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>تست هشدار تغییر قیمت</span>
                          </button>
                          <button
                            onClick={() => {
                              onTriggerTestNewMatchAlert?.();
                              onShowToast(
                                '✨ ملک جدید منطبق با جستجوی شما',
                                'ملک جدید «پنت‌هاوس نیاوران» با معیارهای جستجوی ذخیره‌شده شما ثبت گردید.'
                              );
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#C9A84C]" />
                            <span>تست هشدار ملک منطبق جدید</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Interaction Event Stream */}
                  <div className="bg-[#0D131F] p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>جریان بلادرنگ تعاملات و رخدادها (Live Event Stream)</span>
                      </div>
                      <span className="text-[10px] text-white/50 font-secondary">آخرین ۳۰ رخداد</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 scrollbar-thin text-[11px]">
                      {telemetrySummary.recentEvents.map((evt) => {
                        const typeLabels: Record<string, { label: string; color: string }> = {
                          property_view: { label: 'مشاهده ملک', color: 'bg-[#C9A84C]/20 text-[#E4C675]' },
                          search_query: { label: 'جستجو', color: 'bg-sky-500/20 text-sky-400' },
                          calculator_mortgage: { label: 'وام مسکن', color: 'bg-purple-500/20 text-purple-300' },
                          calculator_roi: { label: 'محاسبه ROI', color: 'bg-indigo-500/20 text-indigo-300' },
                          schedule_visit_click: { label: 'رزرو بازدید', color: 'bg-emerald-500/20 text-emerald-300' },
                          property_save_toggle: { label: 'نشان کردن', color: 'bg-rose-500/20 text-rose-300' },
                          property_compare_toggle: { label: 'مقایسه', color: 'bg-amber-500/20 text-amber-300' },
                        };
                        const config = typeLabels[evt.type] || { label: evt.type, color: 'bg-white/10 text-white/80' };

                        return (
                          <div
                            key={evt.id}
                            className="bg-white/5 hover:bg-white/10 p-2 rounded-xl flex items-center justify-between gap-3 border border-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${config.color}`}>
                                {config.label}
                              </span>
                              <span className="text-white/80 truncate">
                                {evt.details?.title ||
                                  (evt.details?.query ? `جستجوی: «${evt.details.query}»` : '') ||
                                  (evt.details?.propertyTitle ? `برای ملک: ${evt.details.propertyTitle}` : '') ||
                                  'ثبت فعالیت کاربری'}
                              </span>
                            </div>
                            <span className="text-[10px] text-white/40 font-mono shrink-0" dir="ltr">
                              {new Date(evt.timestamp).toLocaleTimeString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        );
                      })}

                      {telemetrySummary.recentEvents.length === 0 && (
                        <div className="text-center py-6 text-white/40 text-xs">
                          هنوز رویدادی ثبت نشده است.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CMS Visual Styler Tab Content */}
              {activeTab === 'cms' && (
                <CMSStylerTab
                  cmsElements={cmsElements}
                  onUpdateElement={(id, updates) => {
                    onUpdateCMSElement?.(id, updates);
                  }}
                  onSaveToLive={async () => {
                    if (onPublishCMS) {
                      await onPublishCMS();
                    } else if (onSaveCMSDraft) {
                      await onSaveCMSDraft();
                    }
                  }}
                  onResetElement={(id) => {
                    onResetCMS?.(id);
                  }}
                  onOpenVisualEditor={onOpenVisualEditor}
                  onShowToast={onShowToast}
                />
              )}

              {/* Media Management Tab Content */}
              {activeTab === 'media' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-[#1A2234] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#C9A84C]" />
                        <span>مدیریت فایل‌ها، عکس‌ها و تصاویر املاک</span>
                      </h4>
                      <p className="text-xs text-white/60 mt-1">
                        مشاهده، کپی نشانی و مدیریت تمامی رسانه‌های بارگذاری‌شده در سراسر وبسایت
                      </p>
                    </div>
                  </div>

                  {/* Media Grid from all properties */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {properties.flatMap((p) =>
                      p.images.map((img, idx) => ({
                        id: `${p.id}-${idx}`,
                        url: img,
                        title: `${p.title} (${toPersianDigits(idx + 1)})`,
                        tag: idx === 0 ? 'نمای اصلی' : 'فضای داخلی',
                      }))
                    ).map((media) => (
                      <div
                        key={media.id}
                        className="group relative bg-[#1A2234] border border-white/10 rounded-2xl overflow-hidden hover:border-[#C9A84C]/50 transition-all shadow-md flex flex-col justify-between"
                      >
                        <div className="relative h-28 w-full overflow-hidden bg-black/40">
                          <img
                            src={media.url}
                            alt={media.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1.5 right-1.5 bg-black/70 text-[#E4C675] text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                            {media.tag}
                          </div>
                        </div>
                        <div className="p-2 bg-[#1A2234] flex items-center justify-between gap-1">
                          <span className="text-[11px] text-white/80 font-bold truncate">
                            {media.title}
                          </span>
                          <button
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText(media.url);
                                onShowToast('کپی شد', 'آدرس تصویر در حافظه کپی شد.');
                              } catch {}
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C9A84C]/20 text-[#E4C675] transition-colors cursor-pointer"
                            title="کپی آدرس تصویر"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admins Management Tab Content */}
              {activeTab === 'admins' && (
                <AdminManagementTab
                  currentUser={user}
                  onShowToast={onShowToast}
                  onAdminsUpdated={onAdminsUpdated}
                />
              )}

              {/* Dynamic SEO & Meta Tags Tab Content */}
              {activeTab === 'seo' && (
                <DynamicSEOTab onShowToast={onShowToast} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
