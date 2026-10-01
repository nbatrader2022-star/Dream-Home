import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Camera,
  TrendingUp,
  Paintbrush,
  FileCheck2,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  ChevronLeft,
  X,
  Send,
  HelpCircle,
  BadgeCheck,
  Building2,
  Users,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

interface ServicesPageProps {
  onBackToHome: () => void;
  onOpenConsultation?: () => void;
  onShowToast?: (title: string, message: string) => void;
}

interface ServiceItem {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  turnaroundTime: string;
  deliverables: string[];
  forWho: string;
  iconName: string;
  accentColor: string;
}

export function ServicesPage({ onBackToHome, onOpenConsultation, onShowToast }: ServicesPageProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  // Request form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'تهران',
    propertyType: 'آپارتمان / پنت‌هاوس',
    description: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const services: ServiceItem[] = [
    {
      id: 'valuation',
      title: 'کارشناسی رسمی و ارزش‌گذاری دقیق املاک',
      titleEn: 'Official Property Valuation & Market Appraisal',
      category: 'ارزیابی و مالی',
      shortDesc: 'تعیین ارزش منصفانه و لحظه‌ای ملک بر اساس متدهای علمی، معاملات ثبت‌شده کاداستر و ارزیابی میدانی.',
      fullDesc:
        'تیم مهندسین عمران و کارشناسان رسمی دادگستری با بازرسی دقیق فونداسیون، متریال، برند مشاعات، موقعیت گذر، نورگیری و سوابق معاملاتی قطعی منطقه، گزارش جامع ارزش‌گذاری را با مهر رسمی ارائه می‌نمایند.',
      turnaroundTime: '۲۴ الی ۴۸ ساعت',
      deliverables: [
        'گزارش مکتوب و مصور ارزش‌گذاری با مهر کارشناس رسمی',
        'نمودار مقایسه‌ای قیمت متری با املاک مشابه در شعاع ۵۰۰ متری',
        'برآورد پتانسیل رشد قیمت در بازه زمانی ۶ و ۱۲ ماهه',
        'ارائه فایل PDF خلاصه ویژه ارائه به بانک‌ها و مراجع قانونی',
      ],
      forWho: 'مالکان مایل به فروش سریع با بالاترین قیمت، خریداران در مرحله مذاکره، سرمایه‌گذاران',
      iconName: 'Scale',
      accentColor: '#C9A84C',
    },
    {
      id: 'legal',
      title: 'اتاق قرارداد VIP و نظارت حقوقی ۳۶۰ درجه',
      titleEn: 'VIP Contract Room & Comprehensive Legal Due Diligence',
      category: 'حقوقی و ثبتی',
      shortDesc: 'استعلام صفر تا صد اسناد ثبتی، شهرداری، اوقاف و دارایی همراه با تنظیم متون قراردادی ضد ضرر.',
      fullDesc:
        'معاملات املاک لوکس نیازمند ظرافت‌های حقوقی بی‌پایان است. دپارتمان حقوقی خانه آرمانی متشکل از وکلای پایه یک، اصالت سند تک‌برگ، عدم بازداشت، مفاصاحساب‌های شهرداری و مالیاتی را بررسی نموده و قرارداد را در سالن اختصاصی VIP منعقد می‌نمایند.',
      turnaroundTime: 'هم‌زمان با تنظیم مبایعه‌نامه',
      deliverables: [
        'استعلام آنلاین وضعیت ثبتی و بازداشتی از سامانه ثبت اسناد',
        'احراز اصالت هویتی طرفین از طریق سامانه ثنای قوه قضائیه',
        'تدوین شروط فسخ، خسارات تاخیر تادیه و مکانیزم‌های ضمانت اجرایی',
        'تسهیل صدور کد رهگیری کشوری با هولوگرام آنی',
      ],
      forWho: 'خریداران و فروشندگان املاک سنگین، مشارکت‌کنندگان در ساخت و خریداران پیش‌فروش',
      iconName: 'ShieldCheck',
      accentColor: '#10B981',
    },
    {
      id: 'luxury-marketing',
      title: 'بازاریابی انحصاری و فروش املاک خاص (VIP Marketing)',
      titleEn: 'Exclusive Luxury Real Estate Marketing & Staging',
      category: 'فروش و بازاریابی',
      shortDesc: 'کمپین‌های هدفمند برای معرفی ملک شما به خریداران طراز اول و سرمایه‌گذاران معتبر داخلی و بین‌المللی.',
      fullDesc:
        'برای املاک فاخر، آگهی‌های معمولی کافی نیست. ما با طراحی بروشورهای لوکس چندزبانه، نمایش در شبکه اختصاصی خریداران VIP، جلسات بازدید محرمانه (Private Showings) و استفاده از شبکه‌های سرمایه‌گذاران خصوصی، ملک را در سریع‌ترین زمان و با حداکثر پرستیژ به فروش می‌رسانیم.',
      turnaroundTime: 'شروع کمپین ظرف ۴۸ ساعت پس از عقد قرارداد عاملیت',
      deliverables: [
        'طراحی کاتالوگ دیجیتال و چاپی اختصاصی ملک با کیفیت فوق‌العاده',
        'ارسال به شبکه ۲۰۰+ نفره خریداران تاییدصلاحیت‌شده مالی',
        'هماهنگی بازدیدهای اختصاصی با پذیرایی تشریفاتی و کادر حرفه‌ای',
        'گزارش هفتگی از تعداد بازدیدکنندگان و پیشنهادات قیمتی دریافتی',
      ],
      forWho: 'مالکان پنت‌هاوس‌ها، برج‌باغ‌ها، ویلاهای شهرکی و عمارت‌های خاص',
      iconName: 'Sparkles',
      accentColor: '#F59E0B',
    },
    {
      id: 'media-3d',
      title: 'تور مجازی سه‌بعدی 360 و فیلم‌برداری سینمایی هلی‌شات',
      titleEn: '3D Matterport Virtual Tours & Drone Aerial Cinematography',
      category: 'فناوری و رسانه',
      shortDesc: 'اسکن لیزری کامل کالبد ملک، پلان‌های دقیق سه‌بعدی و تیزرهای سینمایی خیره‌کننده با کیفیت 4K.',
      fullDesc:
        'با بهره‌گیری از تجهیزات تخصصی تصویربرداری و دوربین‌های اسکن فضایی، تور واقعیت مجازی تعاملی از ملک شما ساخته می‌شود تا خریداران در هر نقطه از جهان بتوانند در ملک قدم زده و تمام ابعاد را با دقت میلی‌متری بررسی کنند.',
      turnaroundTime: '۳ الی ۵ روز کاری',
      deliverables: [
        'تور مجازی تعاملی 360 درجه سازگار با عینک‌های VR و تلفن همراه',
        'تیزر تبلیغاتی سینمایی با موزیک اختصاصی و نریشن تخصصی',
        'پلان معماری سه‌بعدی با ابعاد دقیق فضاهای داخلی',
        'عکس‌برداری هوایی با هلی‌شات از چشم‌انداز، دسترسی‌ها و موقعیت ملک',
      ],
      forWho: 'مالکانی که خواهان نمایش بی‌نظیر ملک بدون اتلاف وقت در بازدیدهای غیرضروری هستند',
      iconName: 'Camera',
      accentColor: '#3B82F6',
    },
    {
      id: 'roi-advisory',
      title: 'مشاوره تخصصی سرمایه‌گذاری و بهینه‌سازی سبد ملکی',
      titleEn: 'Investment Advisory & Real Estate Portfolio Optimization',
      category: 'سرمایه‌گذاری',
      shortDesc: 'تحلیل داده‌محور روندهای قیمتی، پیش‌بینی رشد مناطق شهری و چینش سبد سرمایه‌گذاری پرسود.',
      fullDesc:
        'با استفاده از الگوریتم‌های هوش مصنوعی و آرشیو تحلیلی معاملات ۲۰ سال گذشته، سودآورترین قطب‌های توسعه شهری، فرصت‌های پیش‌فروش مطمئن، و پروژه‌های با بالاترین نرخ بازده اجاره‌داری (Rental Yield) را به شما معرفی می‌نماییم.',
      turnaroundTime: 'جلسات مشاوره اختصاصی ۲ ساعته',
      deliverables: [
        'محاسبه دقیق ROI، نرخ بازگشت سرمایه و دوره بازپرداخت سرمایه',
        'معرفی ۳ سناریوی بهینه سرمایه‌گذاری متناسب با بودجه و افق زمانی',
        'تحلیل ریسک نقدشوندگی و مالیات‌های مترتب بر عایدی سرمایه',
        'جلسه اختصاصی با مدیران ارشد سرمایه‌گذاری هلدینگ',
      ],
      forWho: 'سرمایه‌گذاران خرد و کلان، هلدینگ‌های تجاری و افرادی با نقدینگی راکد',
      iconName: 'TrendingUp',
      accentColor: '#8B5CF6',
    },
    {
      id: 'renovation',
      title: 'بازسازی لوکس، طراحی دکوراسیون و هوم‌استیجینگ',
      titleEn: 'Bespoke Luxury Renovation & Home Staging',
      category: 'طراحی و ساخت',
      shortDesc: 'افزایش ۳۰ تا ۵۰ درصدی ارزش نهایی ملک با بازسازی هوشمندانه و دکوراسیون فوق‌مدرن معماری.',
      fullDesc:
        'از نوسازی آشپزخانه‌های کانسپت ایتالیایی تا تجهیز استخرهای سرپوشیده و هوشمندسازی کامل سیستم‌های BMS ساختمان. تیم معماری ما متضمن افزایش چشم‌گیر جذابیت بصری و سرعت نقدشوندگی ملک شماست.',
      turnaroundTime: 'بر اساس متراژ و جدول زمان‌بندی مهندسی (گانت‌چارت)',
      deliverables: [
        'رندرهای سه‌بعدی فوتورئالیستی قبل و بعد از بازسازی',
        'برآورد شفاف هزینه‌ها بدون تغییر در حین اجرای پروژه',
        'استفاده از متریال درجه‌یک اروپایی و برندهای شاخص بین‌المللی',
        'گارانتی کتبی ۲ ساله برای کلیه تاسیسات و اجرای پروژه‌ها',
      ],
      forWho: 'خریداران املاک کلنگی یا قدیمی، مالکان مایل به ارتقای کلاس ملک پیش از فروش',
      iconName: 'Paintbrush',
      accentColor: '#EC4899',
    },
    {
      id: 'permits',
      title: 'اخذ پروانه، پایان‌کار و استعلامات ثبتی و شهرداری',
      titleEn: 'Cadastral Verification, Municipal Permits & Zoning',
      category: 'اداری و شهرداری',
      shortDesc: 'پیگیری سریع و قانونی پرونده‌های ساختمانی، ماده ۱۰۰، کمیسیون ماده ۵ و افراز و تفکیک اسناد.',
      fullDesc:
        'بوروکراسی اداری مانع ارزش‌آفرینی شما نخواهد بود. کارشناسان امور اداری و مهندسین مشاور ما، تمامی مراحل اخذ سند تفکیکی، حل اختلافات ماده ۱۰۰ شهرداری، اخذ جواز ساخت و گواهی عدم‌خلاف را در کوتاه‌ترین زمان قانونی به انجام می‌رسانند.',
      turnaroundTime: 'بر اساس نوع پرونده با پیگیری مستمر روزانه',
      deliverables: [
        'بررسی مدارک کالبدی و اسناد زمین پیش از مراجعه به شهرداری',
        'گزارش وضعیت روز پرونده در سامانه‌های شهرسازی',
        'اخذ برگه سبز مهندسی، تاییدیه آتش‌نشانی و پایان‌کار قطعی',
        'تفکیک اسناد مشاعی و تبدیل به سند تک‌برگ ۶ دانگ',
      ],
      forWho: 'سازندگان محترم، مالکان زمین‌های بزرگ و متقاضیان تغییر کاربری مجاز',
      iconName: 'FileCheck2',
      accentColor: '#14B8A6',
    },
    {
      id: 'diplomatic-mgmt',
      title: 'مدیریت بهره‌برداری و اجاره بلندمدت املاک دیپلماتیک',
      titleEn: 'Diplomatic Long-Term Rental & Asset Management',
      category: 'اجاره و مدیریت املاک',
      shortDesc: 'تامین مستاجران تاییدصلاحیت‌شده (سفارت‌خانه‌ها، مدیران برندهای بین‌المللی) و نگهداری تخصصی ملک.',
      fullDesc:
        'برای مالکانی که به طور مداوم در سفر هستند یا املاک چندگانه دارند، خدمات صفر تا صد نظافت، سرکشی تاسیسات، وصول اجاره‌بها، تسویه شارژ و تمدید قراردادها با استانداردهای هتلینگ ۵ ستاره انجام می‌پذیرد.',
      turnaroundTime: 'قراردادهای سالانه با گزارش‌دهی ماهانه آنلاین',
      deliverables: [
        'عقد قراردادهای ارزی/ریالی استاندارد با تضامین بانکی معتبر',
        'سرکشی منظم ماهیانه به تاسیسات مکانیکی و برقی ساختمان',
        'مدیریت روابط با هیئت‌مدیره مجتمع و تسویه منظم دیون',
        'پنل آنلاین جهت مشاهده اسناد، واریزی‌ها و صورت‌حساب‌ها',
      ],
      forWho: 'مالکان مقیم خارج از کشور، صاحبان چندین واحد مسکونی یا برج‌های اجاره‌داری',
      iconName: 'Building',
      accentColor: '#6366F1',
    },
  ];

  const handleOpenRequest = (service: ServiceItem) => {
    setSelectedService(service);
    setRequestSubmitted(false);
    setTrackingCode('');
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = 'ARM-' + Math.floor(100000 + Math.random() * 900000);
    setTrackingCode(randomCode);
    setRequestSubmitted(true);
    if (onShowToast) {
      onShowToast('درخواست با موفقیت ثبت شد', `کد رهگیری شما: ${randomCode}. کارشناسان ما تا ۲ ساعت کاری دیگر با شما تماس خواهند گرفت.`);
    }
  };

  return (
    <div className="global-page-wrapper min-h-screen bg-[#0A0E17] text-white pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
            <span className="text-[#E4C675] font-semibold">خدمات تخصصی و حقوقی</span>
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
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#111A2E] to-[#0A0E17] border border-[#C9A84C]/30 p-6 sm:p-12 mb-12 shadow-2xl">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#E4C675] text-xs font-bold mb-4 shadow-sm">
              <BadgeCheck className="w-4 h-4 text-[#C9A84C]" />
              <span>خدمات جامع هلدینگ ملکی خانه آرمانی</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight font-primary">
              زنجیره کامل خدمات ملکی، <span className="text-[#C9A84C]">حقوقی و مهندسی</span>
            </h1>

            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
              از اولین گام کارشناسی قیمت و استعلامات ثبتی تا بازاریابی سینمایی، بازسازی اختصاصی و تنظیم مبایعه‌نامه رسمی در اتاق قرارداد VIP؛ ما در کنار شما هستیم تا هر معامله تجربه‌ای امن، سودآور و باشکوه باشد.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedService(services[0]);
                  setRequestModalOpen(true);
                }}
                className="bg-gradient-to-r from-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg hover:shadow-[#C9A84C]/30 hover:scale-105 transition-all cursor-pointer"
              >
                ثبت درخواست خدمت آنلاین
              </button>

              {onOpenConsultation && (
                <button
                  onClick={onOpenConsultation}
                  className="bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-white/15 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#C9A84C]" />
                  <span>مشاوره تلفنی رایگان</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Services 8-Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {services.map((service, index) => {
            return (
              <div
                key={service.id}
                className="group bg-[#162032] rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-[#C9A84C]/60 transition-all duration-300 shadow-xl flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Accent glow corner */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: service.accentColor }}
                />

                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                      style={{
                        backgroundColor: `${service.accentColor}20`,
                        borderColor: `${service.accentColor}50`,
                        color: service.accentColor,
                      }}
                    >
                      {service.id === 'valuation' && <Scale className="w-6 h-6" />}
                      {service.id === 'legal' && <ShieldCheck className="w-6 h-6" />}
                      {service.id === 'luxury-marketing' && <Sparkles className="w-6 h-6" />}
                      {service.id === 'media-3d' && <Camera className="w-6 h-6" />}
                      {service.id === 'roi-advisory' && <TrendingUp className="w-6 h-6" />}
                      {service.id === 'renovation' && <Paintbrush className="w-6 h-6" />}
                      {service.id === 'permits' && <FileCheck2 className="w-6 h-6" />}
                      {service.id === 'diplomatic-mgmt' && <Building2 className="w-6 h-6" />}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                        {service.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#E4C675] bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                        {toPersianDigits(index + 1)}
                      </span>
                    </div>
                  </div>

                  {/* Title & English Subtitle */}
                  <h3 className="text-xl font-bold text-white group-hover:text-[#E4C675] transition-colors mb-1 font-primary">
                    {service.title}
                  </h3>
                  <p className="text-xs text-white/45 font-mono tracking-wider mb-4">
                    {service.titleEn}
                  </p>

                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-5">
                    {service.fullDesc}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="bg-black/30 rounded-2xl p-4 border border-white/5 mb-5">
                    <span className="text-xs font-bold text-[#E4C675] block mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                      خروجی‌ها و تعهدات ما در این خدمت:
                    </span>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata Row: For Who & Turnaround */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-6">
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-white/45 block text-[10px] mb-0.5">زمان‌بندی انجام:</span>
                      <div className="font-semibold text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C9A84C]" />
                        <span>{service.turnaroundTime}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-white/45 block text-[10px] mb-0.5">مخاطبان هدف:</span>
                      <div className="font-semibold text-white line-clamp-1">
                        {service.forWho}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleOpenRequest(service)}
                    className="flex-1 bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>درخواست این خدمت</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <a
                    href="https://wa.me/989389951723?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D8%AF%D8%B1%D8%AE%D9%88%D8%A7%D8%B3%D8%AA%20%D9%85%D8%B4%D8%A7%D9%88%D8%B1%D9%87%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%AF%D8%A7%D8%B1%D9%85."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-white/15 text-white rounded-xl border border-white/10 transition-colors"
                    title="مشاوره سریع در واتس‌اپ"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Choose Armani Services */}
        <div className="bg-gradient-to-r from-[#1A1A2E] via-[#111A2E] to-[#1A1A2E] rounded-3xl p-8 sm:p-10 border border-[#C9A84C]/30 shadow-2xl mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white mb-2 font-primary">
              چرا خدمات ملکی خانه آرمانی متمایز است؟
            </h3>
            <p className="text-xs sm:text-sm text-white/65">
              تلفیق دانش حقوقی، تسلط میدانی بر مارکت شمیرانات و کلان‌شهرها و به‌کارگیری فناوری‌های نوآورانه.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">امنیت حقوقی تضمین‌شده</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                حضور وکلای پایه یک دادگستری در تمامی مراحل قراردادها.
              </p>
            </div>

            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">سرعت عمل فوق‌العاده</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                انجام استعلامات و شروع اقدامات ظرف حداکثر ۲۴ ساعت کاری.
              </p>
            </div>

            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center mx-auto mb-3">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">شفافیت کامل تعرفه‌ها</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                مطابق با نرخ‌نامه مصوب صنف مشاوران املاک بدون هزینه‌های پنهان.
              </p>
            </div>

            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">همراهی اختصاصی</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                اختصاص مدیر پرونده متعهد و پاسخگویی اختصاصی ۲۴ ساعته.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-right animate-fadeIn">
          <div className="bg-[#1A1A2E] text-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#C9A84C]/30 relative my-auto p-6 sm:p-8">
            <button
              onClick={() => setRequestModalOpen(false)}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!requestSubmitted ? (
              <>
                <div className="flex items-center gap-2 text-xs text-[#E4C675] font-bold mb-2">
                  <BadgeCheck className="w-4 h-4 text-[#C9A84C]" />
                  <span>فرم رسمی درخواست خدمت</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 font-primary">
                  {selectedService ? selectedService.title : 'درخواست خدمت ملکی'}
                </h3>
                <p className="text-xs text-white/60 mb-6">
                  اطلاعات خود را وارد فرمایید تا کارشناس ناظر پرونده ظرف کمتر از ۲ ساعت با شما هماهنگ شود.
                </p>

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">نام و نام خانوادگی:</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="مثال: دکتر علیرضا تهرانی"
                      className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">شماره تماس همراه:</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="۰۹۱۲XXXXXXX"
                        className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-[#C9A84C] outline-none transition-colors text-left font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 mb-1">شهر محل ملک:</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-[#C9A84C] outline-none transition-colors"
                      >
                        <option value="تهران">تهران و شمیرانات</option>
                        <option value="اصفهان">اصفهان</option>
                        <option value="شیراز">شیراز</option>
                        <option value="مازندران">مازندران و گیلان</option>
                        <option value="مشهد">مشهد</option>
                        <option value="تبریز">تبریز</option>
                        <option value="سایر">سایر شهرها</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">نوع ملک:</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-[#C9A84C] outline-none transition-colors"
                    >
                      <option value="پنت‌هاوس">پنت‌هاوس و برج‌باغ</option>
                      <option value="آپارتمان">آپارتمان لوکس</option>
                      <option value="ویلا">ویلا یا عمارت باغی</option>
                      <option value="تجاری">دفتر اداری یا تجاری</option>
                      <option value="زمین">زمین یا کلنگی جهت ساخت</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">توضیحات و نیازمندی‌های خاص (اختیاری):</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="متراژ تقریبی، آدرس محله، یا فوریت زمانی مد نظر خود را شرح دهید..."
                      className="w-full bg-[#0F172A] border border-white/15 rounded-xl p-3 text-xs sm:text-sm text-white focus:border-[#C9A84C] outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-bold py-3 rounded-xl shadow-lg hover:shadow-[#C9A84C]/30 hover:scale-[1.01] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>تایید و ارسال درخواست</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">درخواست شما با موفقیت ثبت شد</h3>
                <p className="text-xs text-white/70 mb-6 leading-relaxed">
                  درخواست شما به کارتابل مشاور ارشد دپارتمان ارجاع گردید. همکاران ما ظرف حداکثر ۲ ساعت با شماره تلفن اعلامی تماس حاصل خواهند نمود.
                </p>

                <div className="bg-black/40 border border-[#C9A84C]/40 rounded-2xl p-4 mb-6">
                  <span className="text-[11px] text-white/50 block mb-1">کد رهگیری اختصاصی پرونده:</span>
                  <span className="text-lg font-mono font-black text-[#E4C675] tracking-widest">
                    {trackingCode}
                  </span>
                </div>

                <button
                  onClick={() => setRequestModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  بستن پنجره
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
