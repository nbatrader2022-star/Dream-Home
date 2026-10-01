import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  MapPin,
  Heart,
  Scale,
  Share2,
  Calendar,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  Building2,
  Compass,
  Layers,
  Clock,
  Car,
  Bath,
  Bed,
  Maximize,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  Printer,
  Sparkles,
  Home,
  Check,
  Copy,
} from 'lucide-react';
import { Property, Agent, PropertyAgent } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/formatters';
import { fetchPropertyBySlugOrId, fetchAllProperties } from '../../services/propertiesService';
import { updatePropertySEO } from '../../utils/seo';
import { PropertyCard } from '../PropertyCard';

interface PropertyDetailPageProps {
  propertySlugOrId?: string;
  slug?: string;
  onNavigateHome?: () => void;
  onBackToHome?: () => void;
  onNavigateToProperty?: (slugOrId: string) => void;
  onSelectProperty?: (property: Property) => void;
  onScheduleVisit: (property: Property) => void;
  onSelectAgent?: (agent: Agent | PropertyAgent) => void;
  savedIds: string[];
  compareIds: string[];
  allProperties?: Property[];
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onToggleCompare: (id: string, e: React.MouseEvent) => void;
  onShowToast: (title: string, message: string) => void;
}

export function PropertyDetailPage({
  propertySlugOrId,
  slug,
  onNavigateHome,
  onBackToHome,
  onNavigateToProperty,
  onSelectProperty,
  onScheduleVisit,
  onSelectAgent,
  savedIds,
  compareIds,
  allProperties,
  onToggleSave,
  onToggleCompare,
  onShowToast,
}: PropertyDetailPageProps) {
  const targetSlug = slug || propertySlugOrId || '';
  const handleHome = onBackToHome || onNavigateHome || (() => window.location.assign('/'));

  const handlePropertyClick = (p: Property) => {
    if (onSelectProperty) {
      onSelectProperty(p);
    } else if (onNavigateToProperty) {
      onNavigateToProperty(p.slug || p.id);
    }
  };

  // Find immediate in-memory match if passed to prevent layout flash
  const initialMatch = allProperties?.find(
    (p) => p.slug === targetSlug || p.id === targetSlug
  ) || null;

  const [property, setProperty] = useState<Property | null>(initialMatch);
  const [loading, setLoading] = useState<boolean>(!initialMatch);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Mortgage Calculator in-page state
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [loanYears, setLoanYears] = useState<number>(10);

  useEffect(() => {
    let isMounted = true;
    if (!initialMatch) {
      setLoading(true);
    }
    setError(null);
    setActiveImageIndex(0);

    // Scroll to top when loading new property
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadProperty() {
      try {
        const found = await fetchPropertyBySlugOrId(targetSlug);
        if (!isMounted) return;

        if (found) {
          setProperty(found);
          updatePropertySEO(found);

          // Fetch similar properties from allProperties or Supabase
          if (allProperties && allProperties.length > 0) {
            const similar = allProperties
              .filter(
                (p) => p.id !== found.id && (p.city === found.city || p.propertyType === found.propertyType)
              )
              .slice(0, 3);
            setSimilarProperties(similar);
          } else {
            try {
              const all = await fetchAllProperties();
              if (isMounted && all && all.length > 0) {
                const similar = all
                  .filter(
                    (p) => p.id !== found.id && (p.city === found.city || p.propertyType === found.propertyType)
                  )
                  .slice(0, 3);
                setSimilarProperties(similar);
              }
            } catch (e) {
              console.warn('Could not load similar properties:', e);
            }
          }
        } else {
          setError('ملک مورد نظر یافت نشد یا ممکن است از لیست فعال خارج شده باشد.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'خطا در بارگذاری اطلاعات ملک.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [targetSlug]);

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      onShowToast('لینک کپی شد', 'نشانی اینترنتی ملک در حافظه موقت شما ذخیره شد.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onShowToast('اشتراک‌گذاری', window.location.href);
    }
  };

  // Safe fallback agent to prevent any undefined error
  const safeAgent = property?.agent || {
    id: 'agent-default',
    name: 'مهندس آریا شایگان',
    role: 'کارشناس ارشد املاک و مستغلات لوکس',
    phone: '۰۲۱۲۲۰۰۰۰۰۰',
    whatsapp: '989121111111',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    rating: 4.95,
    dealsCount: 185,
    experienceYears: 14,
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin" />
          <Building2 className="w-6 h-6 text-[#A07830] absolute inset-0 m-auto" />
        </div>
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">در حال بارگذاری اطلاعات ملک...</h3>
        <p className="text-sm text-[#5A5A7A]">دریافت مشخصات کامل از پایگاه داده و بررسی داده‌های سرور</p>
      </div>
    );
  }

  // Error / 404 Not Found State
  if (error || !property) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-[#A07830] mb-2">
          کد ۴۰۴ - صفحه یافت نشد
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] mb-4">
          ملک مورد نظر یافت نشد
        </h2>
        <p className="text-sm text-[#5A5A7A] leading-relaxed mb-8">
          {error || 'ممکن است شناسه ملک تغییر کرده باشد یا این ملک توسط مالک واگذار شده باشد.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleHome}
            className="bg-[#1A1A2E] hover:bg-[#0F3460] text-white font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 text-xs transition-all shadow-lg cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-[#C9A84C]" />
            بازگشت به صفحه اصلی و لیست املاک
          </button>
        </div>
      </div>
    );
  }

  const isSaved = savedIds.includes(property.id);
  const isCompared = compareIds.includes(property.id);
  const pricePerMeter = property.area > 0 ? Math.round(property.price / property.area) : 0;

  // Mortgage calculations
  const propertyPrice = property.price || 10000000000;
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = Math.max(0, propertyPrice - downPaymentAmount);
  const monthlyRate = 0.23 / 12; // 23%
  const totalMonths = loanYears * 12;
  const monthlyPayment =
    loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  return (
    <div className="global-page-wrapper min-h-screen bg-[#F8F4EF] pb-12 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="global-breadcrumb-container flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2 text-xs text-[#5A5A7A]">
            <button
              onClick={handleHome}
              className="hover:text-[#A07830] transition-colors flex items-center gap-1 font-bold cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>خانه</span>
            </button>
            <span>/</span>
            <button
              onClick={handleHome}
              className="hover:text-[#A07830] transition-colors cursor-pointer"
            >
              املاک {property.cityNameFa}
            </button>
            <span>/</span>
            <span className="text-[#1A1A2E] font-bold line-clamp-1 max-w-[200px] sm:max-w-md">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-[#1A1A2E] hover:border-[#C9A84C] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="اشتراک‌گذاری ملک"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#A07830]" />}
              <span>{copiedLink ? 'کپی شد!' : 'اشتراک‌گذاری'}</span>
            </button>

            <button
              onClick={(e) => onToggleSave(property.id, e)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-stone-200 text-[#1A1A2E] hover:border-rose-300'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
              <span>{isSaved ? 'نشان‌شده' : 'ذخیره'}</span>
            </button>

            <button
              onClick={(e) => onToggleCompare(property.id, e)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isCompared
                  ? 'bg-amber-50 border-[#C9A84C] text-[#A07830]'
                  : 'bg-white border-stone-200 text-[#1A1A2E] hover:border-[#C9A84C]'
              }`}
            >
              <Scale className={`w-3.5 h-3.5 ${isCompared ? 'text-[#A07830]' : 'text-stone-400'}`} />
              <span>{isCompared ? 'در مقایسه' : 'مقایسه'}</span>
            </button>
          </div>
        </div>

        {/* Top Header Information */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
              <span className={`text-xs font-black px-3 py-1 rounded-full shadow-sm ${
                property.status === 'sale'
                  ? 'bg-emerald-600 text-white'
                  : property.status === 'rent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#C9A84C] text-[#1A1A2E]'
              }`}>
                {property.status === 'sale' ? 'فروش ویژه' : property.status === 'rent' ? 'رهن و اجاره' : 'پیش‌فروش اعیان'}
              </span>

              <span className="text-xs font-bold bg-[#1A1A2E] text-[#E4C675] px-3 py-1 rounded-full border border-white/10">
                کد فایل: {property.id}
              </span>

              {property.virtualTourAvailable && (
                <span className="text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  تور مجازی سه‌بعدی
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1A2E] tracking-tight leading-tight mb-3">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-[#5A5A7A]">
              <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>{property.location}</span>
              {property.neighborhood && (
                <>
                  <span>•</span>
                  <span>محله {property.neighborhood}</span>
                </>
              )}
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-start md:items-end">
            <span className="text-xs text-[#5A5A7A] mb-1 font-bold">
              {property.transactionType === 'rent' ? 'ودیعه و اجاره ماهیانه' : 'قیمت کل اعلامی'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1A1A2E] tracking-tight">
              {property.transactionType === 'rent' ? (
                <span>
                  {toPersianDigits(Math.round((property.rentPrice || 25000000) / 1000000))} میلیون تومان
                </span>
              ) : (
                formatPrice(property.price)
              )}
            </div>
            {property.transactionType !== 'rent' && pricePerMeter > 0 && (
              <span className="text-xs text-[#A07830] font-bold mt-1">
                هر متر مربع: {toPersianDigits(Math.round(pricePerMeter / 1000000))} میلیون تومان
              </span>
            )}
          </div>
        </div>

        {/* Gallery Showcase */}
        <div className="mb-10">
          <div className="bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-xl border border-stone-200/50 relative aspect-[16/9] sm:aspect-[21/9] max-h-[550px]">
            <img
              src={property.images[activeImageIndex] || property.images[0]}
              alt={`${property.title} - تصویر ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Gallery Image Navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === 0 ? property.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="تصویر قبلی"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === property.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="تصویر بعدی"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Badge Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-xl border border-white/20">
              تصویر {toPersianDigits(activeImageIndex + 1)} از {toPersianDigits(property.images.length)}
            </div>
          </div>

          {/* Thumbnails Row */}
          {property.images.length > 1 && (
            <div className="flex items-center gap-3 mt-3 overflow-x-auto pb-2 scrollbar-none">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#C9A84C] scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`بندانگشتی ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Key Property Specs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <Maximize className="w-5 h-5 text-[#C9A84C] mb-1.5" />
            <span className="text-[11px] text-[#5A5A7A] font-bold">متراژ زمین/بنا</span>
            <span className="text-base font-black text-[#1A1A2E] mt-0.5">
              {toPersianDigits(property.area)} مترمربع
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <Bed className="w-5 h-5 text-[#C9A84C] mb-1.5" />
            <span className="text-[11px] text-[#5A5A7A] font-bold">تعداد خواب</span>
            <span className="text-base font-black text-[#1A1A2E] mt-0.5">
              {toPersianDigits(property.bedrooms)} خواب
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <Bath className="w-5 h-5 text-[#C9A84C] mb-1.5" />
            <span className="text-[11px] text-[#5A5A7A] font-bold">سرویس بهداشتی</span>
            <span className="text-base font-black text-[#1A1A2E] mt-0.5">
              {toPersianDigits(property.bathrooms)} حمام
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <Layers className="w-5 h-5 text-[#C9A84C] mb-1.5" />
            <span className="text-[11px] text-[#5A5A7A] font-bold">موقعیت طبقه</span>
            <span className="text-base font-black text-[#1A1A2E] mt-0.5">
              طبقه {toPersianDigits(property.floor || 1)} از {toPersianDigits(property.totalFloors || 5)}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <Clock className="w-5 h-5 text-[#C9A84C] mb-1.5" />
            <span className="text-[11px] text-[#5A5A7A] font-bold">سن بنا</span>
            <span className="text-base font-black text-[#1A1A2E] mt-0.5">
              {property.buildingAge === 0 ? 'نوساز کلید نخورده' : `${toPersianDigits(property.buildingAge)} سال ساخت`}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <Car className="w-5 h-5 text-[#C9A84C] mb-1.5" />
            <span className="text-[11px] text-[#5A5A7A] font-bold">پارکینگ سندی</span>
            <span className="text-base font-black text-[#1A1A2E] mt-0.5">
              {toPersianDigits(property.parking || 1)} خودرو
            </span>
          </div>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
              <h3 className="text-lg font-black text-[#1A1A2E] mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#A07830]" />
                شرح و مشخصات معماری ملک
              </h3>
              <div className="text-sm leading-8 text-[#5A5A7A] whitespace-pre-line font-medium">
                {property.description || 'توضیحات تکمیلی برای این ملک ثبت نشده است.'}
              </div>
            </div>

            {/* Amenities & Features */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
              <h3 className="text-lg font-black text-[#1A1A2E] mb-5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#A07830]" />
                امکانات رفاهی و تجهیزات اختصاصی
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs font-bold text-[#1A1A2E]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-400 col-span-full">امکانات اختصاصی ذکر نشده است.</div>
                )}
              </div>
            </div>

            {/* In-Page Financial & Mortgage Estimator */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
              <h3 className="text-lg font-black text-[#1A1A2E] mb-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#A07830]" />
                محاسبه‌گر هوشمند اقساط و پیش‌پرداخت
              </h3>
              <p className="text-xs text-[#5A5A7A] mb-6">
                برآورد اولیه تسهیلات بانکی و اقساط ماهانه بر اساس قیمت کارشناسی ملک
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[#5A5A7A]">درصد پیش‌پرداخت:</span>
                    <span className="text-[#A07830] font-mono">{toPersianDigits(downPaymentPercent)}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-[#C9A84C]"
                  />
                  <div className="text-[11px] text-stone-500 mt-1">
                    معادل: {toPersianDigits(Math.round(downPaymentAmount / 1000000))} م.تومان
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[#5A5A7A]">مدت بازپرداخت وام:</span>
                    <span className="text-[#A07830] font-mono">{toPersianDigits(loanYears)} سال</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={loanYears}
                    onChange={(e) => setLoanYears(Number(e.target.value))}
                    className="w-full accent-[#C9A84C]"
                  />
                  <div className="text-[11px] text-stone-500 mt-1">
                    مبلغ وام: {toPersianDigits(Math.round(loanAmount / 1000000))} م.تومان
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E] text-white p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/70">قسط ماهیانه تخمینی:</div>
                  <div className="text-lg font-black text-[#E4C675] mt-0.5">
                    {toPersianDigits(Math.round(monthlyPayment / 1000000))} میلیون تومان/ماه
                  </div>
                </div>
                <button
                  onClick={() => onScheduleVisit(property)}
                  className="bg-[#C9A84C] hover:bg-[#b5933a] text-[#1A1A2E] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  مشاوره تامین مالی
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Column (1 Col) */}
          <div className="space-y-6">
            {/* Dedicated Agent Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-md">
              <div className="text-xs font-bold text-[#A07830] uppercase tracking-wider mb-4">
                مشاور ارشد پرونده
              </div>

              <div
                onClick={() => onSelectAgent && onSelectAgent(safeAgent)}
                className={`flex items-center gap-3.5 mb-5 p-2 rounded-2xl transition-all ${
                  onSelectAgent ? 'hover:bg-stone-50 cursor-pointer group' : ''
                }`}
              >
                <img
                  src={safeAgent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                  alt={safeAgent.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C9A84C] group-hover:scale-105 transition-transform shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-[#1A1A2E] group-hover:text-[#A07830] transition-colors">
                      {safeAgent.name}
                    </h4>
                    {onSelectAgent && (
                      <span className="text-[10px] bg-[#C9A84C]/15 text-[#A07830] font-bold px-2 py-0.5 rounded-full">
                        پروفایل ↗
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#5A5A7A] mt-0.5">{safeAgent.role}</div>
                  <div className="text-xs text-[#C9A84C] font-black mt-1">
                    ★ {toPersianDigits(safeAgent.rating || 4.9)} از ۵ ({toPersianDigits(safeAgent.dealsCount || 100)} معامله موفق)
                  </div>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={`tel:${safeAgent.phone}`}
                  className="w-full bg-[#1A1A2E] hover:bg-[#0F3460] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4 text-[#C9A84C]" />
                  تماس مستقیم ({safeAgent.phone})
                </a>

                <a
                  href={`https://wa.me/${safeAgent.whatsapp}?text=${encodeURIComponent(
                    `سلام، در رابطه با ملک «${property.title}» تماس می‌گیرم.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20b859] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  ارسال پیام در واتساپ
                </a>

                <button
                  onClick={() => onScheduleVisit(property)}
                  className="w-full bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all hover:shadow-lg cursor-pointer mt-1"
                >
                  <Calendar className="w-4 h-4" />
                  رزرو وقت بازدید حضوری / ۳D
                </button>
              </div>
            </div>

            {/* Quick Property Summary Checklist */}
            <div className="bg-stone-100/70 p-6 rounded-3xl border border-stone-200/60">
              <h4 className="text-sm font-black text-[#1A1A2E] mb-3">گارانتی‌های هلدینگ خانه آرمانی</h4>
              <div className="space-y-2.5 text-xs text-[#5A5A7A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>استعلام ثبتی و صحت مدارک قبل از بازدید</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>انجام قرارداد تحت نظارت مستقیم وکلای پایه یک</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تضمین عدم وجود معارض و بدهی شهرداری/دارایی</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-[#A07830] uppercase tracking-wider">
                  پیشنهادات مشابه
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1A1A2E] mt-1">
                  املاک مشابه در منطقه {property.cityNameFa}
                </h3>
              </div>
              <button
                onClick={handleHome}
                className="text-xs font-bold text-[#A07830] hover:text-[#1A1A2E] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>مشاهده همه املاک</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => (
                <PropertyCard
                  key={simProp.id}
                  property={simProp}
                  isSaved={savedIds.includes(simProp.id)}
                  isCompared={compareIds.includes(simProp.id)}
                  onToggleSave={onToggleSave}
                  onToggleCompare={onToggleCompare}
                  onSelect={() => handlePropertyClick(simProp)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
