import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Palette,
  Settings,
  Image as ImageIcon,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  DollarSign,
  MapPin,
  Tag,
  Clock,
  Layers,
  LogOut,
  Globe,
} from 'lucide-react';
import {
  Property,
  BlogPost,
  SiteSettings,
  VisitBooking,
  UserProfile,
  PropertyType,
  TransactionType,
  PropertyStatus,
} from '../../types';
import { CMSElement } from '../../types/cms';
import { toPersianDigits, formatPrice } from '../../utils/formatters';
import { AdminManagementTab } from '../admin/AdminManagementTab';
import { DynamicSEOTab } from '../admin/DynamicSEOTab';

interface AdminCMSPageProps {
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
  onSaveProperty: (property: Property, isNew: boolean) => void;
  onDeleteProperty: (id: string) => void;
  onSaveBlogPost: (post: BlogPost, isNew: boolean) => void;
  onDeleteBlogPost: (id: string) => void;
  onSaveSiteSettings: (settings: SiteSettings) => void;
  onResetSiteSettings: () => void;
  onShowToast: (title: string, message: string) => void;
  onBackToHome: () => void;
  onOpenVisualEditor: () => void;
}

export function AdminCMSPage({
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
  onSaveProperty,
  onDeleteProperty,
  onSaveBlogPost,
  onDeleteBlogPost,
  onSaveSiteSettings,
  onResetSiteSettings,
  onShowToast,
  onBackToHome,
  onOpenVisualEditor,
}: AdminCMSPageProps) {
  const [activeTab, setActiveTab] = useState<
    'cms' | 'properties' | 'blog' | 'settings' | 'media' | 'admins' | 'bookings' | 'seo'
  >('cms');

  // Properties Filter & Edit State
  const [propSearch, setPropSearch] = useState('');
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [isNewProp, setIsNewProp] = useState(false);

  // Property Form State
  const [propForm, setPropForm] = useState({
    title: '',
    propertyType: 'apartment' as PropertyType,
    transactionType: 'buy' as TransactionType,
    status: 'sale' as PropertyStatus,
    city: 'tehran',
    neighborhood: '',
    location: '',
    price: 35000000000,
    area: 250,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    buildingAge: 0,
    description: '',
    imagesText: '',
    amenitiesText: '',
    featured: true,
  });

  // Blog State
  const [blogSearch, setBlogSearch] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    category: 'legal' as 'legal' | 'guide' | 'tax' | 'invest' | 'market',
    author: 'تیم حقوقی و سرمایه‌گذاری خانه آرمانی',
    readTime: '۵ دقیقه',
    image: '',
    excerpt: '',
    content: '',
  });

  // Media Manager State
  const [mediaList, setMediaList] = useState<Array<{ id: string; url: string; title: string; tag: string }>>(() => {
    const list: Array<{ id: string; url: string; title: string; tag: string }> = [];
    properties.forEach((p) => {
      p.images.forEach((img, idx) => {
        list.push({
          id: `${p.id}-img-${idx}`,
          url: img,
          title: `${p.title} (تصویر ${toPersianDigits(idx + 1)})`,
          tag: idx === 0 ? 'نمای اصلی' : 'فضای داخلی',
        });
      });
    });
    blogPosts.forEach((b) => {
      if (b.image) {
        list.push({
          id: `blog-${b.id}`,
          url: b.image,
          title: `مقاله: ${b.title}`,
          tag: 'وبلاگ',
        });
      }
    });
    return list;
  });
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaTag, setNewMediaTag] = useState('فضای داخلی');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Settings State
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.cityNameFa.includes(propSearch)
  );

  const filteredBlogPosts = blogPosts.filter(
    (b) =>
      b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.categoryFa.includes(blogSearch)
  );

  const handleCopy = (url: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      onShowToast('لینک کپی شد', 'آدرس تصویر در حافظه کپی شد.');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {}
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim() || !newMediaUrl.startsWith('http')) {
      onShowToast('خطا', 'لطفاً یک آدرس اینترنتی معتبر وارد کنید.');
      return;
    }
    const item = {
      id: `media-${Date.now()}`,
      url: newMediaUrl.trim(),
      title: newMediaTitle.trim() || 'رسانه جدید',
      tag: newMediaTag,
    };
    setMediaList((prev) => [item, ...prev]);
    setNewMediaUrl('');
    setNewMediaTitle('');
    onShowToast('رسانه افزوده شد', 'فایل جدید به گالری رسانه‌ها اضافه شد.');
  };

  const handleOpenPropEdit = (p?: Property) => {
    if (p) {
      setIsNewProp(false);
      setEditingProp(p);
      setPropForm({
        title: p.title,
        propertyType: p.propertyType,
        transactionType: p.transactionType,
        status: p.status,
        city: p.city,
        neighborhood: p.neighborhood,
        location: p.location,
        price: p.price,
        area: p.area,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        parking: p.parking,
        buildingAge: p.buildingAge,
        description: p.description,
        imagesText: p.images.join('\n'),
        amenitiesText: p.amenities.join(', '),
        featured: p.featured,
      });
    } else {
      setIsNewProp(true);
      setEditingProp({
        id: `prop-${Date.now()}`,
        slug: `property-${Date.now()}`,
        title: '',
        propertyType: 'apartment',
        transactionType: 'buy',
        status: 'sale',
        city: 'tehran',
        cityNameFa: 'تهران',
        neighborhood: 'الهیه',
        location: 'تهران، الهیه',
        price: 45000000000,
        area: 280,
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        buildingAge: 0,
        description: '',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
        amenities: ['استخر', 'سونا', 'جکوزی', 'لابی مجلل'],
        featured: true,
        virtualTourAvailable: true,
      });
      setPropForm({
        title: '',
        propertyType: 'apartment',
        transactionType: 'buy',
        status: 'sale',
        city: 'tehran',
        neighborhood: 'الهیه',
        location: 'تهران، الهیه',
        price: 45000000000,
        area: 280,
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        buildingAge: 0,
        description: '',
        imagesText: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        amenitiesText: 'استخر, سونا, جکوزی, لابی مجلل',
        featured: true,
      });
    }
  };

  const handleSavePropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    const images = propForm.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http'));
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
    }
    const amenities = propForm.amenitiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: Property = {
      ...editingProp,
      title: propForm.title || 'ملک لوکس جدید',
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
      bedrooms: Number(propForm.bedrooms) || 1,
      bathrooms: Number(propForm.bathrooms) || 1,
      parking: Number(propForm.parking) || 1,
      buildingAge: Number(propForm.buildingAge) || 0,
      description: propForm.description,
      images,
      amenities,
      featured: propForm.featured,
    };
    onSaveProperty(updated, isNewProp);
    setEditingProp(null);
    onShowToast('ذخیره شد', `ملک «${updated.title}» ذخیره گردید.`);
  };

  const handleOpenBlogEdit = (post?: BlogPost) => {
    if (post) {
      setIsNewPost(false);
      setEditingPost(post);
      setPostForm({
        title: post.title,
        category: post.category,
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
        slug: `post-${Date.now()}`,
        category: 'legal',
        categoryFa: 'حقوقی و اسناد',
        date: new Date().toLocaleDateString('fa-IR'),
        readTime: '۵ دقیقه',
        author: 'تیم حقوقی و سرمایه‌گذاری خانه آرمانی',
        image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        excerpt: '',
        content: '',
      });
      setPostForm({
        title: '',
        category: 'legal',
        author: 'تیم حقوقی و سرمایه‌گذاری خانه آرمانی',
        readTime: '۵ دقیقه',
        image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        excerpt: '',
        content: '',
      });
    }
  };

  const handleSaveBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    const catMap: Record<string, string> = {
      legal: 'حقوقی و اسناد',
      guide: 'آموزش و تحویل',
      tax: 'مالیات و عوارض',
      invest: 'سرمایه‌گذاری',
      market: 'تحلیل بازار',
    };
    const updated: BlogPost = {
      ...editingPost,
      title: postForm.title || 'مقاله جدید',
      category: postForm.category,
      categoryFa: catMap[postForm.category] || 'آموزشی',
      author: postForm.author,
      readTime: postForm.readTime,
      image: postForm.image,
      excerpt: postForm.excerpt,
      content: postForm.content,
    };
    onSaveBlogPost(updated, isNewPost);
    setEditingPost(null);
    onShowToast('ذخیره شد', `مقاله «${updated.title}» ذخیره گردید.`);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8F4EF] font-secondary text-right" dir="rtl">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-[#1A1A2E]/95 backdrop-blur-xl border-b border-[#C9A84C]/30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E4C675] border border-[#C9A84C]/30 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="بازگشت به وبسایت"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">بازگشت به سایت</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white font-primary">
                سامانه مدیریت محتوا و پنل ارشد CMS
              </span>
              <span className="bg-[#C9A84C] text-[#1A1A2E] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <span className="text-xs text-white/50 block">
              احراز هویت شده به عنوان: {user?.email || 'nabikalandar0@gmail.com'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenVisualEditor}
            className="bg-gradient-to-r from-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-black text-xs px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#1A1A2E]" />
            <span className="hidden md:inline">ویرایشگر زنده قالب</span>
            <span className="md:hidden">ویرایشگر</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-[#0F172A] px-4 sm:px-8 border-b border-white/10 flex items-center gap-2 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('cms')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'cms'
              ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-[#C9A84C]" />
          <span>داشبورد CMS و استایلر بصری</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('properties');
            setEditingProp(null);
          }}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'properties'
              ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>مدیریت املاک ({toPersianDigits(properties.length)})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('blog');
            setEditingPost(null);
          }}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'blog'
              ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>مدیریت وبلاگ ({toPersianDigits(blogPosts.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>مدیریت فایل‌ها و رسانه ({toPersianDigits(mediaList.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>تنظیمات سامانه</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'admins'
              ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>امنیت و جدول Super Admin</span>
        </button>

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
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-[#C9A84C] text-[#E4C675] bg-[#C9A84C]/10'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>درخواست‌های بازدید ({toPersianDigits(bookings.length)})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 1. CMS DASHBOARD & STYLER */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#1A2234] border border-white/10 rounded-2xl p-4">
                <div className="text-white/50 text-xs font-bold mb-1">املاک فعال در سیستم</div>
                <div className="text-2xl sm:text-3xl font-black text-[#E4C675]">
                  {toPersianDigits(properties.length)}
                </div>
              </div>
              <div className="bg-[#1A2234] border border-white/10 rounded-2xl p-4">
                <div className="text-white/50 text-xs font-bold mb-1">مقالات و راهنماها</div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {toPersianDigits(blogPosts.length)}
                </div>
              </div>
              <div className="bg-[#1A2234] border border-white/10 rounded-2xl p-4">
                <div className="text-white/50 text-xs font-bold mb-1">فایل‌های چندرسانه‌ای</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {toPersianDigits(mediaList.length)}
                </div>
              </div>
              <div className="bg-[#1A2234] border border-white/10 rounded-2xl p-4">
                <div className="text-white/50 text-xs font-bold mb-1">المان‌های زنده CMS</div>
                <div className="text-2xl sm:text-3xl font-black text-[#C9A84C]">
                  {toPersianDigits(cmsElements.length)}
                </div>
              </div>
            </div>

            {/* CMS Visual Editor Banner */}
            <div className="bg-gradient-to-r from-[#1A1A2E] via-[#0F172A] to-[#1E293B] border border-[#C9A84C]/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#C9A84C]/20 border border-[#C9A84C]/40 px-3 py-1 rounded-full text-xs text-[#E4C675] font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  ویرایشگر زنده و بصری سایت (Visual WYSIWYG)
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 font-primary">
                  قالب‌بندی و ویرایش زنده تیترها، رنگ‌ها، گرادینت و سایز المان‌ها
                </h3>
                <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
                  با فشردن دکمه زیر می‌توانید تمام بخش‌های سایت را مستقیماً به صورت زنده ویرایش کنید و پیش‌نمایش آنی تغییرات را قبل از انتشار مشاهده نمایید.
                </p>
              </div>
              <button
                onClick={onOpenVisualEditor}
                className="bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-black text-sm px-6 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_28px_rgba(201,168,76,0.5)] transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                اجرای ویرایشگر زنده قالب
              </button>
            </div>

            {/* CMS Elements Styler Table */}
            <div className="bg-[#1A2234] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-white">المان‌های قابل تنظیم در صفحه اصلی</h4>
                {onPublishCMS && (
                  <button
                    onClick={async () => {
                      await onPublishCMS();
                      onShowToast('منتشر شد', 'تمام تغییرات المان‌ها ذخیره و منتشر شدند.');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    انتشار تغییرات زنده
                  </button>
                )}
              </div>

              {cmsElements.length === 0 ? (
                <div className="text-center py-8 text-white/50 text-xs">
                  در حال حاضر المان‌های اصلی مستقیماً از بخش تنظیمات و فایل دیتای سایت بارگذاری می‌شوند.
                </div>
              ) : (
                <div className="space-y-4">
                  {cmsElements.map((el) => {
                    const textContent = el.content?.text || (typeof el.content === 'string' ? (el.content as string) : '');
                    return (
                      <div
                        key={el.id}
                        className="bg-[#0F172A] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-[#C9A84C]" />
                            <span>{el.name || el.id}</span>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">
                              {el.componentType || 'element'}
                            </span>
                          </div>
                          <div className="text-xs text-[#E4C675] mt-1 font-mono">{textContent || '(بدون محتوا)'}</div>
                        </div>

                        {onUpdateCMSElement && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={textContent}
                              onBlur={(e) => onUpdateCMSElement(el.id, { content: { ...el.content, text: e.target.value } })}
                              className="bg-[#1A2234] border border-white/15 text-white text-xs px-3 py-1.5 rounded-lg w-48 outline-none focus:border-[#C9A84C]"
                              placeholder="متن جدید..."
                            />
                            <button
                              onClick={() => onResetCMS && onResetCMS(el.id)}
                              className="text-white/40 hover:text-white text-xs p-1.5 rounded bg-white/5"
                              title="بازنشانی"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MANAGE PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  placeholder="جستجو در املاک..."
                  className="w-full bg-[#1A2234] border border-white/15 text-white text-xs pr-9 pl-4 py-2.5 rounded-xl outline-none focus:border-[#C9A84C]"
                />
              </div>

              <button
                onClick={() => handleOpenPropEdit()}
                className="bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن ملک جدید</span>
              </button>
            </div>

            {/* Property Edit Form Modal / Inline */}
            {editingProp && (
              <form
                onSubmit={handleSavePropSubmit}
                className="bg-[#1A2234] border border-[#C9A84C]/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-fadeIn"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-base font-black text-white">
                    {isNewProp ? 'افزودن ملک جدید به پلتفرم' : `ویرایش ملک: ${editingProp.title}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingProp(null)}
                    className="text-xs text-white/60 hover:text-white bg-white/10 px-3 py-1 rounded-lg"
                  >
                    انصراف
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">عنوان ملک</label>
                    <input
                      type="text"
                      value={propForm.title}
                      onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                      required
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">محله / خیابان</label>
                    <input
                      type="text"
                      value={propForm.neighborhood}
                      onChange={(e) => setPropForm({ ...propForm, neighborhood: e.target.value })}
                      required
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">قیمت (تومان)</label>
                    <input
                      type="number"
                      value={propForm.price}
                      onChange={(e) => setPropForm({ ...propForm, price: Number(e.target.value) })}
                      required
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">متراژ (متر مربع)</label>
                    <input
                      type="number"
                      value={propForm.area}
                      onChange={(e) => setPropForm({ ...propForm, area: Number(e.target.value) })}
                      required
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">تعداد خواب</label>
                    <input
                      type="number"
                      value={propForm.bedrooms}
                      onChange={(e) => setPropForm({ ...propForm, bedrooms: Number(e.target.value) })}
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">شهر</label>
                    <select
                      value={propForm.city}
                      onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    >
                      <option value="tehran">تهران</option>
                      <option value="karaj">کرج</option>
                      <option value="isfahan">اصفهان</option>
                      <option value="shiraz">شیراز</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-white/60 mb-1 block">
                    لینک‌های تصاویر (هر خط یک آدرس اینترنتی مستقیم)
                  </label>
                  <textarea
                    rows={3}
                    value={propForm.imagesText}
                    onChange={(e) => setPropForm({ ...propForm, imagesText: e.target.value })}
                    dir="ltr"
                    className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C] font-mono text-left"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white/60 mb-1 block">امکانات (جدا شده با ویرگول)</label>
                  <input
                    type="text"
                    value={propForm.amenitiesText}
                    onChange={(e) => setPropForm({ ...propForm, amenitiesText: e.target.value })}
                    placeholder="استخر, سونا, جکوزی, روف گاردن"
                    className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingProp(null)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] text-xs font-black shadow-lg"
                  >
                    ذخیره و ثبت ملک
                  </button>
                </div>
              </form>
            )}

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#1A2234] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#C9A84C]/40 transition-all"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-black/40">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-[#E4C675] text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                      {p.cityNameFa} - {p.neighborhood}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1 line-clamp-1">{p.title}</h5>
                      <div className="text-xs font-black text-[#E4C675] mb-2">
                        {formatPrice(p.price)} تومان
                      </div>
                      <div className="text-[11px] text-white/60 flex items-center gap-3">
                        <span>{toPersianDigits(p.area)} متر مربع</span>
                        <span>•</span>
                        <span>{toPersianDigits(p.bedrooms)} خوابه</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleOpenPropEdit(p)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-[#C9A84C]/20 text-[#E4C675] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف ملک «${p.title}» اطمینان دارید؟`)) {
                            onDeleteProperty(p.id);
                            onShowToast('حذف شد', `ملک «${p.title}» حذف گردید.`);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-all cursor-pointer"
                        title="حذف ملک"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MANAGE BLOG */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  placeholder="جستجو در مقالات..."
                  className="w-full bg-[#1A2234] border border-white/15 text-white text-xs pr-9 pl-4 py-2.5 rounded-xl outline-none focus:border-[#C9A84C]"
                />
              </div>

              <button
                onClick={() => handleOpenBlogEdit()}
                className="bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>نگارش مقاله جدید</span>
              </button>
            </div>

            {editingPost && (
              <form
                onSubmit={handleSaveBlogSubmit}
                className="bg-[#1A2234] border border-[#C9A84C]/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-fadeIn"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-base font-black text-white">
                    {isNewPost ? 'نگارش مقاله تخصصی جدید' : `ویرایش مقاله: ${editingPost.title}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="text-xs text-white/60 hover:text-white bg-white/10 px-3 py-1 rounded-lg"
                  >
                    انصراف
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">عنوان مقاله</label>
                    <input
                      type="text"
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      required
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/60 mb-1 block">دسته‌بندی موضوعی</label>
                    <select
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value as any })}
                      className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                    >
                      <option value="legal">حقوقی و اسناد</option>
                      <option value="invest">سرمایه‌گذاری</option>
                      <option value="market">تحلیل بازار</option>
                      <option value="tax">مالیات و عوارض</option>
                      <option value="guide">آموزش و تحویل</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-white/60 mb-1 block">آدرس تصویر مقاله</label>
                  <input
                    type="url"
                    value={postForm.image}
                    onChange={(e) => setPostForm({ ...postForm, image: e.target.value })}
                    dir="ltr"
                    className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C] font-mono text-left"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white/60 mb-1 block">چکیده / خلاصه مقاله</label>
                  <textarea
                    rows={2}
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white/60 mb-1 block">متن کامل مقاله</label>
                  <textarea
                    rows={6}
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] text-xs font-black shadow-lg"
                  >
                    ذخیره مقاله
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBlogPosts.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#1A2234] border border-white/10 rounded-2xl p-4 flex gap-4 hover:border-[#C9A84C]/40 transition-all"
                >
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="text-[10px] text-[#E4C675] font-bold mb-1">{b.categoryFa}</div>
                      <h5 className="text-xs font-bold text-white line-clamp-2 mb-1">{b.title}</h5>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-white/40">{b.date}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenBlogEdit(b)}
                          className="p-1.5 rounded-lg bg-white/5 text-[#E4C675] hover:bg-white/10 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`آیا از حذف مقاله «${b.title}» مطمئن هستید؟`)) {
                              onDeleteBlogPost(b.id);
                              onShowToast('حذف شد', 'مقاله حذف گردید.');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MEDIA MANAGEMENT */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Add Media Form */}
            <form
              onSubmit={handleAddMedia}
              className="bg-[#1A2234] border border-[#C9A84C]/30 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-end gap-3"
            >
              <div className="flex-1 w-full">
                <label className="text-[11px] text-white/60 mb-1 block">نشانی اینترنتی تصویر (Image URL)</label>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  dir="ltr"
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-2.5 rounded-xl outline-none focus:border-[#C9A84C] font-mono text-left"
                />
              </div>

              <div className="w-full md:w-48">
                <label className="text-[11px] text-white/60 mb-1 block">عنوان / برچسب</label>
                <input
                  type="text"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  placeholder="مثال: نمای روف گاردن"
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-2.5 rounded-xl outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="w-full md:w-40">
                <label className="text-[11px] text-white/60 mb-1 block">دسته‌بندی</label>
                <select
                  value={newMediaTag}
                  onChange={(e) => setNewMediaTag(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-2.5 rounded-xl outline-none focus:border-[#C9A84C]"
                >
                  <option value="نمای اصلی">نمای اصلی</option>
                  <option value="فضای داخلی">فضای داخلی</option>
                  <option value="پلان و نقشه">پلان و نقشه</option>
                  <option value="مشاعات و امکانات">مشاعات و امکانات</option>
                  <option value="وبلاگ">وبلاگ</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] font-black text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن به گالری</span>
              </button>
            </form>

            {/* Media Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  className="group relative bg-[#1A2234] border border-white/10 rounded-2xl overflow-hidden hover:border-[#C9A84C]/50 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-black/40">
                    <img
                      src={m.url}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/70 text-[#E4C675] text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                      {m.tag}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#1A2234] flex items-center justify-between gap-1">
                    <span className="text-[11px] text-white/80 font-bold truncate">{m.title}</span>
                    <button
                      onClick={() => handleCopy(m.url)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C9A84C]/20 text-[#E4C675] transition-colors"
                      title="کپی نشانی اینترنتی"
                    >
                      {copiedUrl === m.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. SITE SETTINGS */}
        {activeTab === 'settings' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveSiteSettings(localSettings);
              onShowToast('ذخیره شد', 'تنظیمات سراسری سایت به‌روزرسانی گردید.');
            }}
            className="bg-[#1A2234] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 max-w-4xl"
          >
            <h4 className="text-base font-black text-white pb-3 border-b border-white/10">
              تنظیمات عمومی سامانه، شماره‌های تماس و آمار
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-white/60 mb-1 block">تیتر اصلی هیرو (Headline)</label>
                <input
                  type="text"
                  value={localSettings.heroHeadline}
                  onChange={(e) => setLocalSettings({ ...localSettings, heroHeadline: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 mb-1 block">زیرتیتر هیرو (Subheadline)</label>
                <input
                  type="text"
                  value={localSettings.heroSubheadline}
                  onChange={(e) => setLocalSettings({ ...localSettings, heroSubheadline: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 mb-1 block">شماره تماس پشتیبانی</label>
                <input
                  type="text"
                  value={localSettings.contactPhone}
                  onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                  dir="ltr"
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C] font-mono text-left"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 mb-1 block">ایمیل تماس سامانه</label>
                <input
                  type="email"
                  value={localSettings.contactEmail}
                  onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                  dir="ltr"
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C] font-mono text-left"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-white/60 mb-1 block">آدرس دفتر مرکزی</label>
                <input
                  type="text"
                  value={localSettings.contactAddress}
                  onChange={(e) => setLocalSettings({ ...localSettings, contactAddress: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/15 text-white text-xs p-3 rounded-xl outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  onResetSiteSettings();
                  onShowToast('بازنشانی شد', 'تنظیمات به حالت پیش‌فرض بازگشت.');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                بازنشانی به پیش‌فرض
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] text-xs font-black shadow-lg"
              >
                ذخیره تنظیمات
              </button>
            </div>
          </form>
        )}

        {/* 6. ADMIN & SECURITY TAB */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-[#1A2234] border border-[#C9A84C]/40 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">
                    پیکربندی مدیر ارشد در دیتابیس Supabase
                  </h4>
                  <p className="text-xs text-white/60">
                    جدول منبع حقیقت: <code className="text-[#E4C675] font-mono">admin_users</code> | نقش: <code className="text-[#E4C675] font-mono">superadmin</code> | وضعیت: <code className="text-[#E4C675] font-mono">active</code>
                  </p>
                </div>
              </div>

              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 font-mono text-xs text-left text-white/80 overflow-x-auto" dir="ltr">
                <span className="text-emerald-400">SELECT</span> * <span className="text-emerald-400">FROM</span> admin_users <span className="text-emerald-400">WHERE</span> email = &apos;nabikalandar0@gmail.com&apos;;
              </div>

              <AdminManagementTab
                currentUser={user}
                onShowToast={onShowToast}
                onAdminsUpdated={() => {
                  onShowToast('به‌روزرسانی', 'فهرست مدیران با موفقیت به‌روزرسانی شد.');
                }}
              />
            </div>
          </div>
        )}

        {/* 7. BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white">فهرست درخواست‌های بازدید و مشاوره حضوری</h4>
            {bookings.length === 0 ? (
              <div className="bg-[#1A2234] border border-white/10 rounded-2xl p-8 text-center text-xs text-white/50">
                تاکنون درخواست بازدیدی ثبت نشده است.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-[#1A2234] border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{b.name}</span>
                      <span className="text-[10px] text-[#E4C675] bg-[#C9A84C]/15 px-2 py-0.5 rounded">
                        {b.visitType === 'virtual-3d' ? 'تور مجازی سه‌بعدی' : 'بازدید حضوری'}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">{b.phone}</div>
                    <div className="text-xs text-[#E4C675] font-bold">{b.propertyTitle}</div>
                    <div className="text-[11px] text-white/50">کد پیگیری: {b.trackingCode}</div>
                    <div className="text-[11px] text-white/40 pt-2 border-t border-white/5">
                      تاریخ بازدید: {b.date} - {b.timeSlot}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. DYNAMIC SEO & META TAGS TAB */}
        {activeTab === 'seo' && (
          <DynamicSEOTab onShowToast={onShowToast} />
        )}
      </div>
    </div>
  );
}
