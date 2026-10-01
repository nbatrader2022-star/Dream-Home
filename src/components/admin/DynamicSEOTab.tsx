import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Share2,
  FileCode,
  Sparkles,
  ExternalLink,
  Code2,
  ShieldCheck,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { SiteSEOConfig, PageSEOConfig, DEFAULT_SEO_CONFIG } from '../../types/seo';
import { getStoredSEOConfig, saveSEOConfigToServer, applyPageSEO, fetchServerSEOConfig } from '../../utils/seo';

interface DynamicSEOTabProps {
  onShowToast: (title: string, message: string) => void;
}

export function DynamicSEOTab({ onShowToast }: DynamicSEOTabProps) {
  const [seoConfig, setSeoConfig] = useState<SiteSEOConfig>(getStoredSEOConfig());
  const [selectedPageKey, setSelectedPageKey] = useState<keyof SiteSEOConfig['pages']>('home');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewTab, setActivePreviewTab] = useState<'google' | 'social'>('google');

  // Load latest server config on mount
  useEffect(() => {
    fetchServerSEOConfig().then((serverConfig) => {
      setSeoConfig(serverConfig);
    });
  }, []);

  const currentPage = seoConfig.pages[selectedPageKey];

  const handleUpdateCurrentPage = (updates: Partial<PageSEOConfig>) => {
    setSeoConfig((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [selectedPageKey]: {
          ...prev.pages[selectedPageKey],
          ...updates,
        },
      },
    }));
  };

  const handleSaveToHtmlAndServer = async () => {
    setIsSaving(true);
    try {
      const result = await saveSEOConfigToServer(seoConfig);
      if (result.success) {
        setLastSavedTime(new Date().toLocaleTimeString('fa-IR'));
        // Immediately apply to current page DOM
        applyPageSEO(selectedPageKey === 'home' ? 'home' : (selectedPageKey as string));
        onShowToast(
          'ذخیره موفقیت‌آمیز در index.html',
          'متا-تگ‌ها با موفقیت ذخیره شدند و فایل index.html روی سرور به‌روزرسانی گردید.'
        );
      } else {
        onShowToast('خطا در ذخیره‌سازی', result.error || 'خطایی رخ داد.');
      }
    } catch (err: any) {
      onShowToast('خطا در ذخیره‌سازی', err.message || 'ارتباط با سرور برقرار نشد.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetCurrentPage = () => {
    const defaultPage = DEFAULT_SEO_CONFIG.pages[selectedPageKey];
    handleUpdateCurrentPage(defaultPage);
    onShowToast('بازنشانی صفحه', `تنظیمات سئوی صفحه "${currentPage.nameFa}" به مقادیر پیش‌فرض بازگشت.`);
  };

  const handleResetAll = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید کلیه تنظیمات سئو و متاتگ‌های تمامی صفحات به مقادیر اولیه بازگردد؟')) {
      setSeoConfig(DEFAULT_SEO_CONFIG);
      onShowToast('بازنشانی کامل', 'تمامی صفحات به تنظیمات اولیه بازنشانی شدند. برای تثبیت دکمه ذخیره را بزنید.');
    }
  };

  // SEO Score calculation helper
  const titleLen = currentPage.title.length;
  const descLen = currentPage.description.length;
  const isTitleOptimal = titleLen >= 40 && titleLen <= 70;
  const isDescOptimal = descLen >= 100 && descLen <= 170;
  const hasKeywords = (currentPage.keywords || '').trim().length > 0;
  const hasOgImage = !!currentPage.ogImage;

  let seoScore = 40;
  if (isTitleOptimal) seoScore += 25;
  else if (titleLen > 15) seoScore += 15;
  if (isDescOptimal) seoScore += 25;
  else if (descLen > 40) seoScore += 15;
  if (hasKeywords) seoScore += 5;
  if (hasOgImage) seoScore += 5;

  const pageEntries = Object.entries(seoConfig.pages) as [keyof SiteSEOConfig['pages'], PageSEOConfig][];

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Header Banner with Direct HTML Impact Notice */}
      <div className="bg-gradient-to-r from-[#1A2234] via-[#161F30] to-[#0F172A] border border-[#C9A84C]/30 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#8C6D23] flex items-center justify-center text-[#0A0F1D] shadow-lg shadow-[#C9A84C]/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    مدیریت متا-تگ‌های داینامیک و سئو (SEO & Meta Tags)
                  </h2>
                  <span className="bg-[#C9A84C]/20 text-[#E4C675] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C9A84C]/30 flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-[#C9A84C]" />
                    اتصال مستقیم به index.html
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  تنظیم اختصاصی Title و Description برای هر صفحه؛ بازنویسی خودکار در فایل <code className="text-[#E4C675] font-mono">index.html</code> برای دریافت مستقیم توسط Googlebot و شبکه‌های اجتماعی
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleResetAll}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی کل سئو</span>
            </button>
            <button
              onClick={handleSaveToHtmlAndServer}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A37E2C] text-[#0A0F1D] hover:shadow-lg hover:shadow-[#C9A84C]/25 text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'در حال نگارش روی index.html...' : 'ذخیره و اعمال روی index.html'}</span>
            </button>
          </div>
        </div>

        {/* Live sync banner */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>تغییرات صفحه اصلی مستقیماً بر متاتگ‌های پیش‌فرض، عنوان تب و شبکه‌های اجتماعی فایل اصلی اعمال می‌شود.</span>
          </div>
          {lastSavedTime && (
            <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              ✓ آخرین به‌روزرسانی موفق سرور: {lastSavedTime}
            </span>
          )}
        </div>
      </div>

      {/* Pages Selector Pill Tabs */}
      <div className="bg-[#121A2A] border border-white/10 rounded-2xl p-2 sm:p-3 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        {pageEntries.map(([key, page]) => {
          const isSelected = selectedPageKey === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedPageKey(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#B08E35] text-[#0A0F1D] shadow-md shadow-[#C9A84C]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{page.nameFa}</span>
              {key === 'home' && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                  isSelected ? 'bg-black/20 text-[#0A0F1D]' : 'bg-[#C9A84C]/20 text-[#E4C675]'
                }`}>
                  اصلی
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column: SEO Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#121A2A] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6">
            {/* Page Header and Quick Reset */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>تنظیمات سئوی:</span>
                  <span className="text-[#E4C675]">{currentPage.nameFa}</span>
                </h3>
                <span className="text-xs text-white/50 block mt-0.5">
                  کلید سیستمی: <code className="text-[#C9A84C] font-mono">{selectedPageKey}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetCurrentPage}
                className="text-xs text-white/50 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="بازنشانی این صفحه به حالت پیش‌فرض"
              >
                <RotateCcw className="w-3 h-3" />
                <span>بازنشانی پیش‌فرض</span>
              </button>
            </div>

            {/* Dynamic Template Helper Notice for propertyDetailTemplate */}
            {selectedPageKey === 'propertyDetailTemplate' && (
              <div className="bg-[#1A2234] border border-[#C9A84C]/20 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#E4C675]">
                  <Sparkles className="w-4 h-4" />
                  <span>متغیرهای داینامیک قابل استفاده در عنوان و توضیحات:</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  می‌توانید از متغیرهای زیر در کادرهای زیر استفاده کنید؛ این تگ‌ها در صفحه هر ملک با اطلاعات واقعی آن جایگزین می‌شوند:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['{title}', '{location}', '{city}', '{price}', '{area}', '{bedrooms}'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        handleUpdateCurrentPage({
                          title: `${currentPage.title} ${v}`,
                        });
                      }}
                      className="px-2 py-1 bg-black/40 hover:bg-[#C9A84C]/20 text-[#E4C675] border border-white/10 rounded font-mono text-[11px] transition-colors cursor-pointer"
                    >
                      {v} +
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Page Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>عنوان صفحه (HTML Title / &lt;title&gt;)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    isTitleOptimal
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : titleLen > 70
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {titleLen} / ۶۰ کاراکتر {isTitleOptimal ? '(عالی)' : titleLen > 70 ? '(طولانی)' : '(کوتاه)'}
                  </span>
                </div>
              </div>
              <input
                type="text"
                value={currentPage.title}
                onChange={(e) => handleUpdateCurrentPage({ title: e.target.value })}
                placeholder="عنوان سئوشده صفحه را بنویسید..."
                className="w-full bg-[#0A0F1D] border border-white/10 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                dir="rtl"
              />
              <p className="text-[11px] text-white/40">
                این عنوان در تب مرورگر و به عنوان تیتر اصلی در نتایج جستجوی گوگل (Google SERP) نمایش داده می‌شود.
              </p>
            </div>

            {/* 2. Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>توضیحات متا (Meta Description)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    isDescOptimal
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : descLen > 170
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {descLen} / ۱۶۰ کاراکتر {isDescOptimal ? '(استاندارد گوگل)' : descLen > 170 ? '(طولانی)' : '(کوتاه)'}
                  </span>
                </div>
              </div>
              <textarea
                rows={3}
                value={currentPage.description}
                onChange={(e) => handleUpdateCurrentPage({ description: e.target.value })}
                placeholder="خلاصه جذاب و بهینه‌سازی‌شده برای موتورهای جستجو..."
                className="w-full bg-[#0A0F1D] border border-white/10 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none leading-relaxed"
                dir="rtl"
              />
              <p className="text-[11px] text-white/40">
                متن خلاصه‌ای که زیر عنوان در گوگل نمایش می‌یابد و عامل تعیین‌کننده نرخ کلیک (CTR) کاربران است.
              </p>
            </div>

            {/* 3. Keywords & Canonical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">
                  کلمات کلیدی (Meta Keywords)
                </label>
                <input
                  type="text"
                  value={currentPage.keywords}
                  onChange={(e) => handleUpdateCurrentPage({ keywords: e.target.value })}
                  placeholder="با کاما جدا کنید..."
                  className="w-full bg-[#0A0F1D] border border-white/10 focus:border-[#C9A84C] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white">
                  آدرس کانونی (Canonical URL)
                </label>
                <input
                  type="text"
                  value={currentPage.canonicalUrl || ''}
                  onChange={(e) => handleUpdateCurrentPage({ canonicalUrl: e.target.value })}
                  placeholder="https://dreamhome.ir/..."
                  className="w-full bg-[#0A0F1D] border border-white/10 focus:border-[#C9A84C] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 4. Open Graph Image (Social Sharing) */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                <span>تصویر اشتراک‌گذاری در شبکه‌های اجتماعی (og:image)</span>
                <span className="text-[10px] text-white/40 font-normal">اندازه پیشنهادی: ۱۲۰۰x۶۳۰ پیکسل</span>
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={currentPage.ogImage || ''}
                  onChange={(e) => handleUpdateCurrentPage({ ogImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-[#0A0F1D] border border-white/10 focus:border-[#C9A84C] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none"
                  dir="ltr"
                />
                {currentPage.ogImage && (
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-white/20 flex-shrink-0 bg-black/40">
                    <img
                      src={currentPage.ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Robots Indexing Directive */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-bold text-white block">
                دستورالعمل خزنده‌های گوگل (Robots Directives)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  currentPage.robots === 'index, follow'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-[#0A0F1D] border-white/10 text-white/60 hover:text-white'
                }`}>
                  <input
                    type="radio"
                    name={`robots-${selectedPageKey}`}
                    checked={currentPage.robots === 'index, follow'}
                    onChange={() => handleUpdateCurrentPage({ robots: 'index, follow' })}
                    className="accent-[#C9A84C]"
                  />
                  <div>
                    <span className="text-xs font-bold block text-emerald-400">index, follow (استاندارد)</span>
                    <span className="text-[10px] text-white/50">صفحه در گوگل ثبت و ایندکس می‌شود</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  currentPage.robots === 'noindex, nofollow'
                    ? 'bg-rose-500/10 border-rose-500/40 text-white'
                    : 'bg-[#0A0F1D] border-white/10 text-white/60 hover:text-white'
                }`}>
                  <input
                    type="radio"
                    name={`robots-${selectedPageKey}`}
                    checked={currentPage.robots === 'noindex, nofollow'}
                    onChange={() => handleUpdateCurrentPage({ robots: 'noindex, nofollow' })}
                    className="accent-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold block text-rose-400">noindex, nofollow (مخفی)</span>
                    <span className="text-[10px] text-white/50">ربات‌ها این صفحه را ثبت نمی‌کنند</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Direct HTML Action Trigger */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-[11px] text-white/50 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>با ذخیره، فایل index.html فوراً بازنویسی می‌شود.</span>
              </div>
              <button
                onClick={handleSaveToHtmlAndServer}
                disabled={isSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#A37E2C] text-[#0A0F1D] rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#C9A84C]/20 hover:scale-[1.02]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'در حال نگارش...' : 'ذخیره و نوشتن در index.html'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Previews & SEO Health (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* SEO Health Card */}
          <div className="bg-[#121A2A] border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                <span>نمره سلامت سئوی صفحه</span>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full font-mono ${
                seoScore >= 85
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : seoScore >= 60
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {seoScore} / ۱۰۰
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  seoScore >= 85 ? 'bg-emerald-500' : seoScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${seoScore}%` }}
              />
            </div>

            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {isTitleOptimal ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  طول عنوان ({titleLen} کاراکتر)
                </span>
                <span className="text-[11px] text-white/40">ایده‌آل: ۴۰ تا ۶۵</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {isDescOptimal ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  طول توضیحات ({descLen} کاراکتر)
                </span>
                <span className="text-[11px] text-white/40">ایده‌آل: ۱۲۰ تا ۱۶۰</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {hasOgImage ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  تصویر Open Graph
                </span>
                <span className="text-[11px] text-white/40">{hasOgImage ? 'تنظیم شده' : 'ندارد'}</span>
              </div>
            </div>
          </div>

          {/* Live Previews Simulator Card */}
          <div className="bg-[#121A2A] border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-xs sm:text-sm font-bold text-white">پیش‌نمایش زنده در گوگل و سوشال</span>
              </div>

              {/* Toggle Google vs Social */}
              <div className="flex items-center bg-[#0A0F1D] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('google')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'google'
                      ? 'bg-[#C9A84C] text-[#0A0F1D]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  گوگل (Google SERP)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('social')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activePreviewTab === 'social'
                      ? 'bg-[#C9A84C] text-[#0A0F1D]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  شبکه‌های اجتماعی
                </button>
              </div>
            </div>

            {/* Google SERP Preview */}
            {activePreviewTab === 'google' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-white/50">
                  <span>نحوه نمایش در نتایج جستجوی گوگل:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded cursor-pointer ${
                        previewDevice === 'desktop' ? 'text-[#E4C675] bg-white/10' : 'text-white/40'
                      }`}
                      title="نمای دسکتاپ"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded cursor-pointer ${
                        previewDevice === 'mobile' ? 'text-[#E4C675] bg-white/10' : 'text-white/40'
                      }`}
                      title="نمای موبایل"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Google Snippet Container */}
                <div className="bg-[#202124] border border-white/10 rounded-2xl p-4 text-right space-y-1.5 font-sans shadow-inner">
                  {/* URL and Breadcrumb */}
                  <div className="flex items-center gap-2 text-xs text-[#bdc1c6] truncate" dir="ltr">
                    <div className="w-4 h-4 rounded-full bg-[#C9A84C] flex items-center justify-center text-[9px] font-black text-black flex-shrink-0">
                      H
                    </div>
                    <div className="truncate">
                      <span className="text-white font-medium">خانه آرمانی</span>
                      <span className="text-[#9aa0a6] text-[11px] ml-1">
                        https://dreamhome.ir › {selectedPageKey === 'home' ? '' : selectedPageKey}
                      </span>
                    </div>
                  </div>

                  {/* Google Blue Link Title */}
                  <h4
                    className="text-[#8ab4f8] hover:underline text-sm sm:text-base font-medium line-clamp-2 cursor-pointer leading-snug"
                    dir="rtl"
                  >
                    {currentPage.title || 'عنوان صفحه در اینجا نمایش می‌یابد'}
                  </h4>

                  {/* Google Snippet Description */}
                  <p className="text-[#bdc1c6] text-xs line-clamp-3 leading-relaxed" dir="rtl">
                    {currentPage.description || 'توضیحات متا در اینجا به نمایش درمی‌آید تا کاربران در گوگل مشاهده کنند.'}
                  </p>
                </div>
              </div>
            )}

            {/* Social Share Preview (WhatsApp, Telegram, Twitter) */}
            {activePreviewTab === 'social' && (
              <div className="space-y-3">
                <span className="text-[11px] text-white/50 block">
                  پیش‌نمایش اشتراک‌گذاری در تلگرام، واتس‌اپ و لینکدین:
                </span>

                <div className="bg-[#1E293B] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                  {currentPage.ogImage ? (
                    <div className="w-full h-36 sm:h-44 relative bg-black/40 overflow-hidden">
                      <img
                        src={currentPage.ogImage}
                        alt="Social Card Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-[#1A2234] to-[#0F172A] flex items-center justify-center text-white/40 text-xs">
                      بدون تصویر شاخص
                    </div>
                  )}

                  <div className="p-3.5 space-y-1 bg-[#0F172A]">
                    <span className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-mono block">
                      DREAMHOME.IR
                    </span>
                    <h5 className="text-xs font-bold text-white line-clamp-1">
                      {currentPage.title}
                    </h5>
                    <p className="text-[11px] text-white/60 line-clamp-2 leading-normal">
                      {currentPage.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Raw HTML Head Meta Tags Preview */}
            <div className="pt-2 border-t border-white/10">
              <details className="group">
                <summary className="text-xs text-[#E4C675] hover:text-[#C9A84C] cursor-pointer flex items-center justify-between font-mono">
                  <span>مشاهده تگ‌های HTML تزریق‌شده (&lt;head&gt;)</span>
                  <Code2 className="w-3.5 h-3.5" />
                </summary>
                <div className="mt-2.5 p-3 rounded-xl bg-[#0A0F1D] border border-white/10 font-mono text-[10px] text-emerald-400 overflow-x-auto text-left leading-relaxed select-all" dir="ltr">
                  &lt;title&gt;{currentPage.title}&lt;/title&gt;<br />
                  &lt;meta name=&quot;description&quot; content=&quot;{currentPage.description}&quot; /&gt;<br />
                  &lt;meta property=&quot;og:title&quot; content=&quot;{currentPage.title}&quot; /&gt;<br />
                  &lt;meta property=&quot;og:description&quot; content=&quot;{currentPage.description}&quot; /&gt;<br />
                  {currentPage.ogImage && (
                    <>&lt;meta property=&quot;og:image&quot; content=&quot;{currentPage.ogImage}&quot; /&gt;<br /></>
                  )}
                  &lt;meta name=&quot;robots&quot; content=&quot;{currentPage.robots}&quot; /&gt;<br />
                  {currentPage.keywords && (
                    <>&lt;meta name=&quot;keywords&quot; content=&quot;{currentPage.keywords}&quot; /&gt;<br /></>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
