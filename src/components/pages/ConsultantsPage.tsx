import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Mail,
  Award,
  Star,
  Building2,
  CheckCircle2,
  MapPin,
  Calendar,
  Languages,
  ShieldCheck,
  Search,
  Sparkles,
  Briefcase,
  Users,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { Agent, Property } from '../../types';
import { AGENTS_DATA } from '../../data/agents';
import { toPersianDigits } from '../../utils/formatters';

interface ConsultantsPageProps {
  onBackToHome: () => void;
  onSelectAgent: (agent: Agent) => void;
  onScheduleVisit?: (property?: Property) => void;
  onSelectProperty?: (property: Property) => void;
  properties?: Property[];
}

export function ConsultantsPage({
  onBackToHome,
  onSelectAgent,
  onScheduleVisit,
  properties = [],
}: ConsultantsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const regions = [
    { id: 'all', label: 'همه مناطق' },
    { id: 'tehran', label: 'تهران و شمیرانات' },
    { id: 'north', label: 'مازندران و گیلان' },
    { id: 'isfahan_shiraz', label: 'اصفهان و شیراز' },
    { id: 'east_northwest', label: 'مشهد و تبریز' },
    { id: 'legal', label: 'حقوقی و قراردادها' },
  ];

  const filteredAgents = useMemo(() => {
    return AGENTS_DATA.filter((agent) => {
      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        agent.name.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.specialty.toLowerCase().includes(q) ||
        agent.areasServed.some((area) => area.toLowerCase().includes(q));

      // Region filter
      let matchRegion = true;
      if (selectedRegion === 'tehran') {
        matchRegion = agent.areasServed.some((a) =>
          ['الهیه', 'فرشته', 'زعفرانیه', 'نیاوران', 'ولنجک', 'سعادت‌آباد', 'شهرک غرب', 'ونک', 'جردن', 'تهران'].some(
            (k) => a.includes(k)
          )
        );
      } else if (selectedRegion === 'north') {
        matchRegion = agent.areasServed.some((a) =>
          ['خزرشهر', 'دریاکنار', 'متل‌قو', 'کلارآباد', 'رامسر', 'نوشهر'].some((k) => a.includes(k))
        );
      } else if (selectedRegion === 'isfahan_shiraz') {
        matchRegion = agent.areasServed.some((a) =>
          ['جلفا', 'چهارباغ', 'اصفهان', 'زرگری', 'قصردشت', 'شیراز'].some((k) => a.includes(k))
        );
      } else if (selectedRegion === 'east_northwest') {
        matchRegion = agent.areasServed.some((a) =>
          ['مشهد', 'سجاد', 'احمدآباد', 'تبریز', 'ولیعصر', 'ایل‌گلی'].some((k) => a.includes(k))
        );
      } else if (selectedRegion === 'legal') {
        matchRegion = agent.role.includes('حقوقی') || agent.specialty.includes('ثبتی') || agent.specialty.includes('سند');
      }

      return matchSearch && matchRegion;
    });
  }, [searchQuery, selectedRegion]);

  return (
    <div className="global-page-wrapper min-h-screen bg-[#0A0E17] text-white pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Breadcrumb & Back to Home */}
        <div className="global-breadcrumb-container flex items-center justify-between gap-3 mb-8">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
            <button
              onClick={onBackToHome}
              className="hover:text-[#C9A84C] transition-colors cursor-pointer flex items-center gap-1"
            >
              صفحه اصلی
            </button>
            <span>/</span>
            <span className="text-[#E4C675] font-semibold">مشاوران و کارشناسان ارشد</span>
          </nav>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#C9A84C] hover:text-[#E4C675] font-semibold transition-colors cursor-pointer"
          >
            <span>بازگشت به خانه</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Hero Header Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F172A] border border-[#C9A84C]/30 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#E4C675] text-xs font-bold mb-4 shadow-sm">
              <Users className="w-4 h-4 text-[#C9A84C]" />
              <span>تیم مشاوران و دپارتمان تخصصی خانه آرمانی</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight font-primary">
              مشاوران ارشد و امین‌ترین کارشناسان <span className="text-[#C9A84C]">ملک و سرمایه‌گذاری</span>
            </h1>

            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
              تیمی متشکل از کارشناسان ارشد معماری، مدیران ارشد املاک تجاری، کارشناسان مناطق ساحلی و وکلای پایه یک دادگستری. هر ملک، یک فرصت تاریخی سرمایه‌گذاری است و همراهی مشاور متخصص ضامن آسودگی خاطر و حفظ سرمایه شماست.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/5 text-center">
                <div className="text-xl sm:text-2xl font-black text-[#E4C675]">
                  +{toPersianDigits(AGENTS_DATA.length)}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">کارشناس ارشد و متخصص</div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/5 text-center">
                <div className="text-xl sm:text-2xl font-black text-[#E4C675]">
                  +{toPersianDigits(1800)}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">معامله موفق انجام‌شده</div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/5 text-center">
                <div className="text-xl sm:text-2xl font-black text-[#E4C675]">
                  {toPersianDigits('99.4%')}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">شاخص رضایت مشتریان</div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/5 text-center">
                <div className="text-xl sm:text-2xl font-black text-[#E4C675]">
                  ۱۰۰٪
                </div>
                <div className="text-[11px] text-white/60 mt-0.5">دارای پروانه رسمی و تاییدیه</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#1A1A2E]/80 backdrop-blur-md rounded-2xl border border-[#C9A84C]/25 p-4 sm:p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#C9A84C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، منطقه، یا تخصص مشاور..."
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-[#C9A84C] focus:outline-none transition-all"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === reg.id
                    ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-md shadow-[#C9A84C]/20 font-bold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Consultants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredAgents.map((agent) => {
            return (
              <div
                key={agent.id}
                className="group bg-[#162032] rounded-3xl overflow-hidden border border-white/10 hover:border-[#C9A84C]/60 transition-all duration-300 shadow-xl flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Photo with Overlay and Badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0E17]">
                    <img
                      src={agent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                      alt={agent.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#162032] via-transparent to-black/20" />

                    {/* License Badge */}
                    {agent.licenseNumber && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-[#C9A84C]/40 text-[#E4C675] text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#C9A84C]" />
                        <span>{agent.licenseNumber}</span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-400/30">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{toPersianDigits(agent.rating)}</span>
                    </div>

                    {/* Experience Badge */}
                    <div className="absolute bottom-3 right-3 bg-[#C9A84C] text-[#1A1A2E] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Award className="w-3 h-3" />
                      <span>{toPersianDigits(agent.experienceYears)} سال تجربه</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#E4C675] transition-colors mb-1 font-primary">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-[#C9A84C] font-medium mb-1 line-clamp-1">
                      {agent.role}
                    </p>
                    {agent.titleEn && (
                      <p className="text-[10px] text-white/40 font-mono tracking-wider uppercase mb-3">
                        {agent.titleEn}
                      </p>
                    )}

                    {/* Specialty */}
                    <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 mb-3 text-xs text-white/75 leading-relaxed">
                      <span className="text-[#E4C675] font-bold block text-[11px] mb-0.5">تخصص ویژه:</span>
                      <p className="line-clamp-2">{agent.specialty}</p>
                    </div>

                    {/* Areas Served */}
                    <div className="mb-4">
                      <span className="text-[11px] text-white/50 block mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C9A84C]" />
                        مناطق تحت پوشش:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {agent.areasServed.slice(0, 3).map((area, idx) => (
                          <span
                            key={idx}
                            className="bg-white/5 text-white/70 text-[10px] px-2 py-0.5 rounded-md border border-white/5"
                          >
                            {area}
                          </span>
                        ))}
                        {agent.areasServed.length > 3 && (
                          <span className="bg-[#C9A84C]/15 text-[#E4C675] text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                            +{toPersianDigits(agent.areasServed.length - 3)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-center mb-4 text-[11px]">
                      <div className="bg-white/5 rounded-lg py-1.5">
                        <span className="text-[#E4C675] font-bold block">{toPersianDigits(agent.dealsCount)}</span>
                        <span className="text-white/50 text-[10px]">قرارداد موفق</span>
                      </div>
                      <div className="bg-white/5 rounded-lg py-1.5">
                        <span className="text-[#E4C675] font-bold block">{toPersianDigits(agent.responseRatePercent || 99)}٪</span>
                        <span className="text-white/50 text-[10px]">پاسخگویی سریع</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-0 bg-transparent flex flex-col gap-2">
                  <button
                    onClick={() => onSelectAgent(agent)}
                    className="w-full bg-[#C9A84C]/15 hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-[#E4C675] font-bold py-2 px-3 rounded-xl border border-[#C9A84C]/40 hover:border-[#C9A84C] transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>مشاهده پروفایل و املاک فعال</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${agent.phone}`}
                      className="bg-white/5 hover:bg-white/15 text-white text-[11px] py-1.5 px-2 rounded-lg border border-white/10 flex items-center justify-center gap-1 transition-colors"
                      title="تماس مستقیم"
                    >
                      <Phone className="w-3 h-3 text-[#C9A84C]" />
                      <span>تماس</span>
                    </a>
                    <a
                      href={`https://wa.me/${agent.whatsapp}?text=${encodeURIComponent(
                        `با سلام، مایل به دریافت مشاوره ملکی با ${agent.name} هستم.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-[11px] py-1.5 px-2 rounded-lg border border-[#25D366]/30 flex items-center justify-center gap-1 transition-colors"
                      title="پیام در واتس‌اپ"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>واتس‌اپ</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if search has no match */}
        {filteredAgents.length === 0 && (
          <div className="bg-[#1A1A2E] rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto mb-16">
            <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">مشاوری با این مشخصات یافت نشد</h3>
            <p className="text-xs text-white/60 mb-6">
              لطفاً عبارت جستجو را تغییر دهید یا فیلتر دسته‌بندی را روی «همه مناطق» قرار دهید.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('all');
              }}
              className="bg-[#C9A84C] text-[#1A1A2E] font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#E4C675] transition-colors cursor-pointer"
            >
              پاک کردن فیلترها
            </button>
          </div>
        )}

        {/* Guaranteed Standards Banner */}
        <div className="bg-gradient-to-r from-[#1A1A2E] via-[#0F172A] to-[#1A1A2E] border border-[#C9A84C]/30 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-primary">
              استانداردهای اخلاقی و الزامات مشاوران خانه آرمانی
            </h3>
            <p className="text-xs sm:text-sm text-white/65">
              تمامی کارشناسان پیش از احراز نمایندگی، پروتکل‌های سخت‌گیرانه اخلاق حرفه‌ای و آموزش‌های عالی املاک را پشت سر می‌گذارند.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">رازداری و امنیت اطلاعات</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  تعهد قطعی به عدم افشای هویت و جزئیات دارایی‌های مالکان و خریداران VIP.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">صداقت در ارزش‌گذاری</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  ارائه گزارش واقع‌بینانه بدون بزرگ‌نمایی قیمت برای حفظ منافع طرفین.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">همراهی تا انتقال سند</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  حضور مشاور و وکیل حقوقی در تمام مراحل استعلامات، محضر و تحویل کلید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
