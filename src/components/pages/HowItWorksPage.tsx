import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Eye,
  FileText,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Scale,
  DollarSign,
  KeyRound,
  FileSignature,
  Camera,
  Layers,
  ChevronLeft,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

interface HowItWorksPageProps {
  onBackToHome: () => void;
  onNavigateToProperties?: () => void;
  onOpenConsultation?: () => void;
}

export function HowItWorksPage({
  onBackToHome,
  onNavigateToProperties,
  onOpenConsultation,
}: HowItWorksPageProps) {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const buyerSteps = [
    {
      step: 1,
      title: 'نیازسنجی هوشمند و تنظیم پروفایل سرمایه‌گذاری',
      titleEn: 'Discovery & Investor Profiling',
      duration: 'جلسه اول (۱ ساعت)',
      desc: 'در یک جلسه حضوری تشریفاتی یا آنلاین، بودجه، ترجیحات کالبدی، سبک زندگی، چشم‌انداز بازدهی و الزامات حقوقی شما به طور دقیق در سامانه ثبت می‌شود.',
      deliverables: 'پروفایل متقاضی VIP و اتصال به سیستم هوشمند تطبیق فایل',
      icon: Search,
    },
    {
      step: 2,
      title: 'غربال‌گری و دسترسی به فایل‌های آف‌مارکت (Off-Market)',
      titleEn: 'Off-Market Curation & Deep Scan',
      duration: '۲۴ الی ۴۸ ساعت',
      desc: 'مشاور اختصاصی شما علاوه بر فایل‌های عمومی، گزیده‌ای از املاک محرمانه و اختصاصی که هنوز وارد بازار عمومی نشده‌اند را برای شما ارزیابی و دسته‌بندی می‌کند.',
      deliverables: 'ارائه کارتابل ۳ الی ۵ ملک برتر با گزارش ویدیویی و پلان‌ها',
      icon: Layers,
    },
    {
      step: 3,
      title: 'تورهای اختصاصی بازدید حضوری و بررسی سه‌بعدی',
      titleEn: 'Private On-Site & 3D Virtual Tours',
      duration: 'با هماهنگی قبلی',
      desc: 'تورهای اختصاصی بازدید با همراهی مشاور ارشد و مهندس ناظر برای بررسی متریال، تاسیسات، نورگیری، مشاعات و اصالت ساخت انجام می‌پذیرد.',
      deliverables: 'بررسی عینی جزئیات کالبدی ملک بدون حضور افراد متفرقه',
      icon: Eye,
    },
    {
      step: 4,
      title: 'اعتبارسنجی حقوقی ۳۶۰ درجه و استعلامات ثبتی',
      titleEn: '360° Legal & Cadastral Verification',
      duration: '۲۴ ساعت',
      desc: 'وکلای پایه یک دپارتمان حقوقی، سند تک‌برگ، عدم بازداشت، مفاصاحساب نوسازی، بدهی‌های بانکی و گواهی عدم‌خلاف شهرداری را دقیقاً استعلام می‌نمایند.',
      deliverables: 'صدور «شناسنامه اعتبارسنجی حقوقی ملک» با مهر تایید وکلا',
      icon: ShieldCheck,
    },
    {
      step: 5,
      title: 'مذاکرات استراتژیک قیمت و شرایط پرداخت',
      titleEn: 'Strategic Price & Terms Negotiation',
      duration: '۱ الی ۲ روز',
      desc: 'مشاور ارشد با تکیه بر آمار تحلیلی معاملات قطعی منطقه، بهترین شرایط تخفیف، نحوه تقسیط ثمن معامله و شروط پرداخت را به نفع خریدار تثبیت می‌نماید.',
      deliverables: 'توافق اولیه بر سر ثمن قطعی و جدول مراحل پرداخت مطمئن',
      icon: DollarSign,
    },
    {
      step: 6,
      title: 'انعقاد مبایعه‌نامه رسمی در اتاق قرارداد VIP',
      titleEn: 'VIP Contract Execution & Legal Escrow',
      duration: 'جلسه قرارداد (۲ ساعت)',
      desc: 'تنظیم متن حقوقی مبایعه‌نامه با درج کلیه شروط ضمانتی، تحویل چک‌های تضمینی و اخذ فوری کد رهگیری کشوری با هولوگرام رسمی صنف.',
      deliverables: 'نسخه رسمی مبایعه‌نامه معتبر با کد رهگیری و هولوگرام',
      icon: FileSignature,
    },
    {
      step: 7,
      title: 'انتقال قطعی سند در دفتر اسناد رسمی',
      titleEn: 'Official Notarial Deed Transfer',
      duration: 'در موعد مقرر در مبایعه‌نامه',
      desc: 'همراهی مشاور و نماینده حقوقی در دفترخانه، کنترل استعلام ثبت در لحظه امضا، تسویه نهایی حساب از طریق چک رمزدار بانکی و امضای سند قطعی انتقال.',
      deliverables: 'انتقال رسمی سند تک‌برگ بنام خریدار محترم',
      icon: BadgeCheck,
    },
    {
      step: 8,
      title: 'تحویل رسمی کلید و خدمات پشتیبانی پس از معامله',
      titleEn: 'Key Handover & Post-Sale Concierge',
      duration: 'روز تحویل ملک',
      desc: 'تنظیم صورت‌جلسه کالبدی تحویل ملک با بررسی کلیه تجهیزات، کنتورها و کلیدها. ارائه خدمات معرفی طراح دکوراسیون، هوشمندسازی و نگهداری.',
      deliverables: 'صورت‌جلسه ممهور تحویل، کلیدهای اختصاصی و کارت باشگاه مشتریان VIP',
      icon: KeyRound,
    },
  ];

  const sellerSteps = [
    {
      step: 1,
      title: 'بازدید میدانی و ارزیابی مهندسی و ارزش‌گذاری روز',
      titleEn: 'Inspection & Scientific Appraisal',
      duration: 'ظرف ۲۴ ساعت از ثبت درخواست',
      desc: 'کارشناس رسمی دادگستری و مشاور منطقه‌ای از ملک بازدید نموده و بر مبنای آخرین معاملات ثبتی محله، ارزش واقعی و قیمت پیشنهادی فروش را تعیین می‌کنند.',
      deliverables: 'گزارش ارزش‌گذاری مکتوب و استراتژی قیمت‌گذاری جذاب',
      icon: Scale,
    },
    {
      step: 2,
      title: 'تهیه مدیاهای تبلیغاتی و تصویربرداری سینمایی',
      titleEn: 'Cinematic Media & 3D Scanning',
      duration: '۲ الی ۳ روز کاری',
      desc: 'تصویربرداری هلی‌شات هوایی، اسکن سه‌بعدی برای تور مجازی، عکاسی با نورپردازی معماری و تهیه پلان سه‌بعدی متراژبندی‌شده.',
      deliverables: 'پکیج کامل رسانه‌ای لوکس آماده پروموشن اختصاصی',
      icon: Camera,
    },
    {
      step: 3,
      title: 'معرفی هدفمند در شبکه خریداران سرمایه‌گذار VIP',
      titleEn: 'Targeted VIP Network Marketing',
      duration: 'بلافاصله پس از آماده‌سازی مدیا',
      desc: 'ارائه ملک در بانک اختصاصی خریداران تاییدصلاحیت‌شده مالی و کمپین‌های دیجیتال متمرکز بدون آگهی‌های عمومی نامناسب.',
      deliverables: 'رسیدن به بالاترین جامعه مخاطب خریدار واقعی ملک لوکس',
      icon: Sparkles,
    },
    {
      step: 4,
      title: 'مدیریت و غربال‌گری بازدیدکنندگان حضوری',
      titleEn: 'Screened VIP Viewings & Showings',
      duration: 'برنامه‌ریزی منظم با هماهنگی مالک',
      desc: 'تنها مشتریانی که احراز هویت شده و تمکن مالی خرید را دارا باشند به بازدید دعوت می‌شوند تا آرامش و امنیت خانواده مالک محفوظ بماند.',
      deliverables: 'حفظ کامل حریم خصوصی و عدم اتلاف وقت با افراد نامرتبط',
      icon: Eye,
    },
    {
      step: 5,
      title: 'اخذ بهترین پیشنهاد قیمتی و مذاکره حرفه‌ای',
      titleEn: 'Best Offer Acquisition & Negotiations',
      duration: 'متناسب با شرایط بازار',
      desc: 'مشاور ارشد با مدیریت پیشنهادهای موازی، قیمت را به سقف ارزش واقعی رسانده و شرایط پرداخت نقدی یا کم‌ریسک را تثبیت می‌کند.',
      deliverables: 'پیشنهاد مکتوب خرید با تاییدیه حساب بانکی خریدار',
      icon: TrendingUp,
    },
    {
      step: 6,
      title: 'تنظیم قرارداد رسمی و تسویه مالی امن',
      titleEn: 'Contract Closing & Safe Financial Clearance',
      duration: 'اتاق قرارداد VIP',
      desc: 'تنظیم مبایعه‌نامه، دریافت تضمین‌های معتبر بانکی و پیگیری کامل تا روز محضر و تسویه آخرین ریال از ثمن معامله.',
      deliverables: 'فروش امن با بالاترین ارزش نقدی بازار بدون ریسک حقوقی',
      icon: CheckCircle2,
    },
  ];

  const faqs = [
    {
      q: 'آیا برای بازدید از املاک هزینه‌ای از متقاضیان دریافت می‌شود؟',
      a: 'خیر، کلیه مراحل مشاوره اولیه، غربال‌گری فایل‌ها و هماهنگی تورهای بازدید حضوری برای خریداران محترم کاملاً رایگان می‌باشد و هیچ‌گونه هزینه‌ای پیش از عقد قرارداد دریافت نمی‌گردد.',
    },
    {
      q: 'چگونه از سلامت حقوقی و عدم بازداشت بودن سند اطمینان حاصل می‌شود؟',
      a: 'پیش از هرگونه تبادل مالی یا تنظیم مبایعه‌نامه، وکلای مقیم هلدینگ از طریق سامانه برخط سازمان ثبت اسناد و املاک کشور، استعلام ثبتی لحظه‌ای را اخذ نموده و گواهی سلامت سند را ضمیمه قرارداد می‌نمایند.',
    },
    {
      q: 'کد رهگیری چقدر پس از امضای قرارداد صادر می‌شود؟',
      a: 'کد رهگیری رسمی کشوری به همراه بارکد دوبعدی و هولوگرام امنیتی، دقیقاً در جلسه امضای مبایعه‌نامه در اتاق قرارداد VIP صادر شده و پیامک تاییدیه از سامانه معاملات املاک برای طرفین ارسال می‌شود.',
    },
    {
      q: 'فرایند فروش ملک معمولاً چه مدت زمان می‌برد؟',
      a: 'برای املاکی که قیمت‌گذاری کارشناسی استاندارد داشته باشند، با بهره‌گیری از شبکه خریداران سرمایه‌گذار خانه آرمانی، میانگین زمان جذب خریدار و انعقاد قرارداد بین ۱۰ الی ۳۰ روز کاری است.',
    },
    {
      q: 'نحوه پرداخت ثمن معامله در خرید املاک چگونه تقسیط می‌شود؟',
      a: 'به طور متداول ۴۰ تا ۵۰ درصد هم‌زمان با امضای مبایعه‌نامه، ۳۰ تا ۴۰ درصد در تاریخ تحویل کالبدی ملک، و ۱۰ تا ۲۰ درصد نهایی در روز انتقال سند رسمی در دفترخانه تسویه می‌گردد (قابل تنظیم مطابق توافق طرفین).',
    },
  ];

  const currentSteps = activeTab === 'buyer' ? buyerSteps : sellerSteps;

  return (
    <div className="global-page-wrapper min-h-screen bg-[#0A0E17] text-white pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Breadcrumb */}
        <div className="global-breadcrumb-container flex items-center justify-between gap-3 mb-8">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
            <button
              onClick={onBackToHome}
              className="hover:text-[#C9A84C] transition-colors cursor-pointer flex items-center gap-1"
            >
              صفحه اصلی
            </button>
            <span>/</span>
            <span className="text-[#E4C675] font-semibold">روش کار و فرایند معاملات</span>
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
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#111A2E] to-[#0A0E17] border border-[#C9A84C]/30 p-6 sm:p-12 mb-10 shadow-2xl">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#E4C675] text-xs font-bold mb-4 shadow-sm">
              <Award className="w-4 h-4 text-[#C9A84C]" />
              <span>استاندارد بین‌المللی معاملات املاک لوکس</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight font-primary">
              روش کار شفاف، مهندسی‌شده و <span className="text-[#C9A84C]">صددرصد امن</span>
            </h1>

            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-8">
              معامله ملک، سرنوشت‌سازترین تصمیم مالی هر خانواده است. ما با طراحی یک فرایند ۸ مرحله‌ای منضبط تحت نظارت پیوسته وکلای دادگستری و مهندسین عمران، تمامی ریسک‌ها، ابهامات و دغدغه‌های ذهنی شما را به صفر رسانده‌ایم.
            </p>

            {/* Tab Switcher: Buyer vs. Seller */}
            <div className="inline-flex p-1.5 rounded-2xl bg-black/50 border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'buyer'
                    ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-lg shadow-[#C9A84C]/25'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>مراحل خرید و سرمایه‌گذاری (۸ گام)</span>
              </button>

              <button
                onClick={() => setActiveTab('seller')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'seller'
                    ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-lg shadow-[#C9A84C]/25'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>مراحل فروش و سپردن ملک (۶ گام)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline / Step Cards */}
        <div className="relative mb-16">
          {/* Vertical Connecting Line (hidden on very small screens) */}
          <div className="hidden md:block absolute right-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#C9A84C] via-[#C9A84C]/40 to-transparent" />

          <div className="space-y-6">
            {currentSteps.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="group relative bg-[#162032] rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-[#C9A84C]/60 transition-all duration-300 shadow-xl flex flex-col md:flex-row gap-6 items-start hover:-translate-y-0.5"
                >
                  {/* Step Number & Icon */}
                  <div className="flex items-center gap-4 md:flex-col md:items-center md:justify-center shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A1A2E] to-[#0A0E17] border-2 border-[#C9A84C] text-[#E4C675] font-black text-xl flex items-center justify-center shadow-lg shadow-[#C9A84C]/20 group-hover:scale-105 transition-transform">
                      {toPersianDigits(item.step)}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/15 text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]/30">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-right">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#E4C675] transition-colors font-primary">
                        گام {toPersianDigits(item.step)}: {item.title}
                      </h3>
                      <span className="text-[11px] font-mono text-[#E4C675] bg-black/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#C9A84C]" />
                        <span>{item.duration}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-white/40 font-mono tracking-wider mb-3">
                      {item.titleEn}
                    </div>

                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                      {item.desc}
                    </p>

                    {/* Deliverable Box */}
                    <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 flex items-center gap-2.5 text-xs text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[#E4C675] font-bold ml-1">تعهد و خروجی این گام:</span>
                        <span>{item.deliverables}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Trust Pillars */}
        <div className="bg-gradient-to-br from-[#1A1A2E] via-[#0F172A] to-[#1A1A2E] rounded-3xl p-8 sm:p-10 border border-[#C9A84C]/30 shadow-2xl mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white mb-2 font-primary">
              چهارچوب امنیت مالی و حقوقی خانه آرمانی
            </h3>
            <p className="text-xs sm:text-sm text-white/65">
              سه لایه پایش ایمنی اختصاصی در تمامی معاملات جاری سامانه به صورت خودکار اعمال می‌گردد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white mb-2">استعلام برخط کاداستر</h4>
              <p className="text-xs text-white/65 leading-relaxed">
                استعلام اصالت تک‌برگ، عدم بازداشت، حدود ثبتی و عدم وجود معارض قبل از انتقال هرگونه وجه یا امضای سند.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center mx-auto mb-3">
                <Scale className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white mb-2">نظارت ۲ وکیل پایه یک</h4>
              <p className="text-xs text-white/65 leading-relaxed">
                حضور مستقیم وکلای پایه یک دادگستری در نگارش مبایعه‌نامه، درج شروط عدم مسئولیت و نظارت بر تسویه بانکی.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white mb-2">پوشش بیمه مسئولیت مدنی</h4>
              <p className="text-xs text-white/65 leading-relaxed">
                بیمه رسمی تعهدات حقوقی مبایعه‌نامه‌ها تا سقف ۲۰۰ میلیارد ریال برای حفاظت حداکثری از منافع طرفین.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#E4C675] font-bold px-3 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>پاسخ به ابهامات رایج</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-primary">
              پرسش‌های متداول درباره فرآیند معاملات
            </h3>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#162032] rounded-2xl border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#C9A84C] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[#C9A84C] via-[#E4C675] to-[#C9A84C] text-[#1A1A2E] text-center shadow-2xl">
          <h3 className="text-xl sm:text-3xl font-black mb-3 font-primary">
            آماده تجربه یک معامله ملکی متمایز و باشکوه هستید؟
          </h3>
          <p className="text-xs sm:text-sm text-[#1A1A2E]/80 max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
            همین امروز با مشاوران ارشد خانه آرمانی گفتگو کنید یا فهرست گزیده‌ای از املاک ویژه ۲۱ کلان‌شهر کشور را مرور نمایید.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onNavigateToProperties && (
              <button
                onClick={onNavigateToProperties}
                className="bg-[#1A1A2E] hover:bg-[#0A0E17] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <span>مشاهده املاک منتخب</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {onOpenConsultation && (
              <button
                onClick={onOpenConsultation}
                className="bg-white/80 hover:bg-white text-[#1A1A2E] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>درخواست مشاوره رایگان</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
