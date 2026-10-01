import React, { useState, useEffect } from 'react';
import { Search, Phone, MapPin, Building2, ChevronDown, Sparkles, BedDouble, Maximize, ArrowUpLeft, Eye } from 'lucide-react';
import { TransactionType, PropertyType, Property } from '../types';
import { CMSElement } from '../types/cms';
import { toPersianDigits } from '../utils/formatters';
import { SUPPORTED_CITIES_LIST } from '../data/additionalCityProperties';

interface HeroSectionProps {
  onSearch: (params: {
    transactionType?: TransactionType | 'all';
    propertyType?: PropertyType | 'all';
    city?: string;
    priceRange?: string;
    query?: string;
    type?: PropertyType | 'all';
  }) => void;
  onOpenConsultation?: () => void;
  onSelectPropertyId?: (id: string) => void;
  onSelectProperty?: (property: Property) => void;
  onOpenMap?: () => void;
  headline?: string;
  subheadline?: string;
  cmsElements?: CMSElement[];
}

export function HeroSection({
  onSearch,
  onOpenConsultation,
  onSelectPropertyId,
  onSelectProperty,
  onOpenMap,
  headline,
  subheadline,
  cmsElements,
}: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('buy');
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [particles, setParticles] = useState<Array<{ id: number; left: number; size: number; delay: number; duration: number }>>([]);

  // Find CMS elements if available
  const cmsBadge = cmsElements?.find((e) => e.editorKey === 'hero.badge');
  const cmsTitle = cmsElements?.find((e) => e.editorKey === 'hero.title');
  const cmsSubtitle = cmsElements?.find((e) => e.editorKey === 'hero.subtitle');
  const cmsButton = cmsElements?.find((e) => e.editorKey === 'hero.primaryButton');
  const cmsDot01 = cmsElements?.find((e) => e.editorKey === 'hero.decorativeDot01');
  const cmsLine01 = cmsElements?.find((e) => e.editorKey === 'hero.decorativeLine01');

  useEffect(() => {
    // Generate particles
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      delay: -Math.random() * 20,
      duration: Math.random() * 15 + 15,
    }));
    setParticles(items);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      transactionType: activeTab,
      propertyType: selectedType,
      city: selectedCity,
      priceRange: selectedPrice,
    });
    const el = document.getElementById('properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectFeaturedElahieh = () => {
    if (onSelectPropertyId) {
      onSelectPropertyId('prop-1');
    }
  };

  return (
    <section 
      style={{ paddingTop: 'calc(var(--header-height) + 1.5rem)' }}
      className="relative min-h-screen bg-[#1A1A2E] overflow-hidden flex items-center pb-16"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A1A] via-[#1A1A2E] to-[#0F3460]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,168,76,0.12)_0%,transparent_70%)]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#C9A84C]/40 animate-[particleFloat_linear_infinite]"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Skyline Vector Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] opacity-15 pointer-events-none">
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="w-full h-full text-[#C9A84C] fill-current animate-[skylinePulse_8s_ease-in-out_infinite]"
        >
          <path
            d="
            M0 400 L0 280 L40 280 L40 220 L60 220 L60 200 L80 200 L80 220 L100 220 L100 240 L120 240
            L120 180 L130 180 L130 160 L140 160 L140 140 L150 140 L150 160 L160 160 L160 180 L170 180 L170 240
            L200 240 L200 200 L220 200 L220 180 L240 180 L240 200 L260 200 L260 240
            L280 240 L280 160 L295 160 L295 120 L305 120 L305 100 L315 100 L315 80 L325 80 L325 100 L335 100 L335 120 L345 120 L345 160 L360 160 L360 240
            L380 240 L380 200 L420 200 L420 220 L460 220 L460 240
            L480 240 L480 160 L490 160 L490 130 L500 130 L500 110 L510 110 L510 90 L515 90 L515 70 L520 70 L520 90 L525 90 L525 110 L530 110 L530 130 L540 130 L540 160 L550 160 L550 240
            L580 240 L580 210 L620 210 L620 230 L660 230 L660 240
            L680 240 L680 170 L700 170 L700 150 L720 150 L720 170 L740 170 L740 240
            L760 240 L760 200 L800 200 L800 220 L840 220 L840 240
            L860 240 L860 155 L875 155 L875 135 L885 135 L885 115 L895 115 L895 95 L905 95 L905 75 L915 75 L915 95 L925 95 L925 115 L935 115 L935 135 L945 135 L945 155 L960 155 L960 240
            L980 240 L980 205 L1020 205 L1020 225 L1060 225 L1060 240
            L1080 240 L1080 175 L1100 175 L1100 155 L1120 155 L1120 175 L1140 175 L1140 240
            L1160 240 L1160 210 L1200 210 L1200 230 L1240 230 L1240 240
            L1260 240 L1260 180 L1275 180 L1275 155 L1285 155 L1285 130 L1295 130 L1295 110 L1305 110 L1305 130 L1315 130 L1315 155 L1325 155 L1325 180 L1340 180 L1340 240
            L1360 240 L1360 220 L1400 220 L1400 240 L1440 240 L1440 400 Z"
          />
        </svg>
      </div>

      {/* Dynamic Floating CMS Decorative Dot */}
      {cmsDot01 && cmsDot01.isVisible && (
        <div
          style={{
            position: (cmsDot01.styles.position as any) || 'absolute',
            top: cmsDot01.styles.top || '18%',
            right: cmsDot01.styles.right || '12%',
            width: cmsDot01.styles.width || '16px',
            height: cmsDot01.styles.height || '16px',
            borderRadius: cmsDot01.styles.borderRadius || '50%',
            backgroundColor: cmsDot01.styles.backgroundColor || '#C9A84C',
            boxShadow: cmsDot01.styles.boxShadow || '0 0 20px #C9A84C, 0 0 40px rgba(201,168,76,0.6)',
            opacity: cmsDot01.styles.opacity ?? 0.85,
            zIndex: cmsDot01.styles.zIndex ?? 10,
          }}
          className="pointer-events-none transition-all duration-300 animate-pulse"
        />
      )}

      {/* Dynamic Floating CMS Decorative Gradient Line */}
      {cmsLine01 && cmsLine01.isVisible && (
        <div
          style={{
            position: (cmsLine01.styles.position as any) || 'absolute',
            top: cmsLine01.styles.top || '20%',
            right: cmsLine01.styles.right || '14%',
            width: cmsLine01.styles.width || '120px',
            height: cmsLine01.styles.height || '2px',
            backgroundImage: cmsLine01.styles.backgroundImage || 'linear-gradient(to left, #C9A84C, transparent)',
            opacity: cmsLine01.styles.opacity ?? 0.6,
            zIndex: cmsLine01.styles.zIndex ?? 9,
          }}
          className="pointer-events-none transition-all duration-300"
        />
      )}

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 w-full text-right">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Column (Right in RTL): Title, Subtitle, Search */}
          <div className="lg:col-span-7 flex flex-col items-start text-right">
            {/* Deal Count Badge */}
            {cmsBadge && cmsBadge.isVisible ? (
              <div
                style={{
                  backgroundColor: cmsBadge.styles.backgroundColor || 'rgba(201, 168, 76, 0.15)',
                  color: cmsBadge.styles.color || '#E4C675',
                  borderColor: cmsBadge.styles.borderColor || 'rgba(201, 168, 76, 0.35)',
                  borderRadius: cmsBadge.styles.borderRadius || '9999px',
                  padding: cmsBadge.styles.padding || '6px 16px',
                  fontSize: cmsBadge.styles.fontSize || '12px',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
                className="inline-flex items-center gap-2 font-semibold tracking-wider mb-5 shadow-sm text-[12px]"
              >
                <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                {cmsBadge.content.text ? toPersianDigits(cmsBadge.content.text) : 'بیش از ۳۲۰۰ معامله موفق در سراسر کشور'}
              </div>
            ) : (
              <div 
                style={{ fontSize: '12px' }}
                className="inline-flex items-center gap-2.5 bg-[#C9A84C]/15 border border-[#C9A84C]/35 rounded-full px-3.5 sm:px-4 py-1.5 text-[12px] font-semibold text-[#E4C675] tracking-wider mb-5 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
              >
                <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                بیش از ۳۲۰۰ معامله موفق در سراسر کشور
              </div>
            )}

            {/* Hero Title */}
            <h1
              style={{
                fontSize: cmsTitle?.styles.fontSize,
                fontWeight: cmsTitle?.styles.fontWeight as any,
                color: cmsTitle?.styles.color,
                textAlign: cmsTitle?.styles.textAlign,
              }}
              className="text-3xl sm:text-5xl lg:text-[68px] font-black leading-[1.18] text-white mb-4 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsTitle?.content.text ? (
                <span className="bg-gradient-to-r from-white via-white to-[#E4C675] bg-clip-text text-transparent">
                  {toPersianDigits(cmsTitle.content.text)}
                </span>
              ) : headline ? (
                <span className="bg-gradient-to-r from-white via-white to-[#E4C675] bg-clip-text text-transparent">
                  {toPersianDigits(headline)}
                </span>
              ) : (
                <>
                  خانه{' '}
                  <span className="bg-gradient-to-r from-[#A07830] via-[#E4C675] to-[#C9A84C] bg-clip-text text-transparent">
                    رویاهایت
                  </span>
                  <br />
                  را پیدا کن
                </>
              )}
            </h1>

            {/* Hero Subtitle */}
            <p
              style={{
                fontSize: cmsSubtitle?.styles.fontSize,
                color: cmsSubtitle?.styles.color,
                lineHeight: cmsSubtitle?.styles.lineHeight,
              }}
              className="text-sm sm:text-base lg:text-lg text-white/70 max-w-xl leading-relaxed mb-6 sm:mb-8 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsSubtitle?.content.text ? toPersianDigits(cmsSubtitle.content.text) :
                subheadline ? toPersianDigits(subheadline) :
                'بزرگترین پلتفرم مسکن لوکس با ۲۰ سال تجربه در سراسر ۲۱ کلان‌شهر کشور. مشاوره تخصصی — ارزیابی دقیق هوشمند — تضمین امنیت حقوقی قراردادها'}
            </p>

            {/* Quick CTA Actions */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto">
              <a
                href={cmsButton?.content.href || '#properties'}
                style={{
                  backgroundColor: cmsButton?.styles.backgroundColor,
                  color: cmsButton?.styles.color,
                  borderRadius: cmsButton?.styles.borderRadius,
                  boxShadow: cmsButton?.styles.boxShadow,
                }}
                className="flex-1 sm:flex-none justify-center bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-[0_8px_32px_rgba(201,168,76,0.4)] hover:shadow-[0_12px_44px_rgba(201,168,76,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {cmsButton?.content.text || 'مشاهده ملک‌ها'}
              </a>
              <button
                onClick={onOpenConsultation}
                className="flex-1 sm:flex-none justify-center bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-white/20 hover:border-white/40 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#C9A84C]" />
                درخواست مشاوره رایگان
              </button>
            </div>

            {/* Interactive Search Box */}
            <div className="w-full bg-white/[0.08] backdrop-blur-2xl border border-white/15 rounded-3xl p-5 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
              {/* Tabs */}
              <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'buy'
                      ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  خرید
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rent')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'rent'
                      ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  اجاره
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presale')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'presale'
                      ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  پیش‌فروش
                </button>
              </div>

              {/* Search Form Fields */}
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3.5 items-end">
                {/* Property Type */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-white/60">
                    نوع ملک
                  </label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as PropertyType | 'all')}
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-[#C9A84C] focus:bg-white/15 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all" className="bg-[#1A1A2E] text-white">همه انواع ملک</option>
                      <option value="apartment" className="bg-[#1A1A2E] text-white">آپارتمان مسکونی</option>
                      <option value="villa" className="bg-[#1A1A2E] text-white">ویلای اختصاصی</option>
                      <option value="penthouse" className="bg-[#1A1A2E] text-white">پنت‌هاوس</option>
                      <option value="commercial" className="bg-[#1A1A2E] text-white">تجاری و اداری</option>
                      <option value="land" className="bg-[#1A1A2E] text-white">زمین و کلنگی</option>
                      <option value="garden" className="bg-[#1A1A2E] text-white">باغ ویلا</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/50 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* City / Area */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-white/60">
                    شهر / منطقه
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-[#C9A84C] focus:bg-white/15 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#1A1A2E] text-white">همه شهرها (۲۱ کلان‌شهر کشور)</option>
                      {SUPPORTED_CITIES_LIST.map((city) => (
                        <option key={city.key} value={city.key} className="bg-[#1A1A2E] text-white">
                          {city.nameFa} ({city.province})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/50 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-white/60">
                    بازه قیمت
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-[#C9A84C] focus:bg-white/15 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#1A1A2E] text-white">همه قیمت‌ها</option>
                      <option value="1" className="bg-[#1A1A2E] text-white">تا ۸ میلیارد تومان</option>
                      <option value="2" className="bg-[#1A1A2E] text-white">۸ تا ۲۰ میلیارد تومان</option>
                      <option value="3" className="bg-[#1A1A2E] text-white">۲۰ تا ۴۵ میلیارد تومان</option>
                      <option value="4" className="bg-[#1A1A2E] text-white">بالای ۴۵ میلیارد تومان</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/50 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-[0_8px_24px_rgba(201,168,76,0.35)] hover:shadow-[0_12px_36px_rgba(201,168,76,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap h-[42px] cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  جستجو
                </button>
              </form>
            </div>
          </div>

          {/* Left Column: The Featured Spotlight Card (فروش ۱۸ میلیارد تومان تهران، الهیه فرشته) */}
          <div className="lg:col-span-5 w-full flex flex-col items-center">
            <div className="w-full max-w-md bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-2xl border-2 border-[#C9A84C]/50 hover:border-[#C9A84C] rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 group">
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="inline-flex items-center gap-1.5 bg-[#2D6A4F] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-200" />
                  فروش ویژه
                </div>
                <div className="text-[11px] text-[#E4C675] font-bold flex items-center gap-1">
                  <span>سند تک‌برگ شش‌دانگ</span>
                </div>
              </div>

              {/* Property Image Thumbnail */}
              <div 
                onClick={handleSelectFeaturedElahieh}
                className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 cursor-pointer group-hover:shadow-lg transition-all"
              >
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  alt="آپارتمان لوکس الهیه فرشته"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 right-3 text-white">
                  <div className="text-xl sm:text-2xl font-black text-[#E4C675]">
                    ۱۸ میلیارد تومان
                  </div>
                  <div className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>تهران، الهیه، خیابان فرشته</span>
                  </div>
                </div>
              </div>

              {/* Card Title & Specs */}
              <h3 
                onClick={handleSelectFeaturedElahieh}
                className="text-base sm:text-lg font-bold text-white mb-2 cursor-pointer hover:text-[#E4C675] transition-colors line-clamp-1"
              >
                آپارتمان لوکس ۳ خوابه با چشم‌انداز توچال
              </h3>
              <p className="text-xs text-white/70 leading-relaxed line-clamp-2 mb-4">
                واحدی بی‌نظیر در برج‌باغ اصیل خیابان فرشته الهیه. آشپزخانه فول‌فرنیش بوش، مسترروم بزرگ، مشاعات استخر و لابی مجلل.
              </p>

              {/* Specs Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/80 py-2.5 px-3 bg-black/30 rounded-xl mb-4">
                <div>
                  <span className="text-[10px] text-white/50 block">متراژ</span>
                  <strong className="text-[#E4C675]">۱۸۰ متر</strong>
                </div>
                <div className="border-r border-l border-white/10">
                  <span className="text-[10px] text-white/50 block">خواب</span>
                  <strong className="text-white">۳ خواب مستر</strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">طبقه</span>
                  <strong className="text-white">طبقه ۷ (دید ابدی)</strong>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSelectFeaturedElahieh}
                className="w-full bg-gradient-to-r from-[#A07830] to-[#C9A84C] hover:from-[#B88A38] hover:to-[#E4C675] text-[#1A1A2E] font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                مشاهده مشخصات کامل این ملک
                <ArrowUpLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
