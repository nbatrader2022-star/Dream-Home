import React, { useState } from 'react';
import {
  Compass,
  Search,
  Building,
  Compass as CompassIcon,
  Calculator,
  Scale,
  Heart,
  Calendar,
  PhoneCall,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface PropertyJourneySectionProps {
  onOpenSearch: () => void;
  onOpenMap: () => void;
  onOpenRoi: () => void;
  onOpenCompare: () => void;
  onOpenSaved: () => void;
  onOpenSchedule: () => void;
  onOpenConsultant: () => void;
}

export function PropertyJourneySection({
  onOpenSearch,
  onOpenMap,
  onOpenRoi,
  onOpenCompare,
  onOpenSaved,
  onOpenSchedule,
  onOpenConsultant,
}: PropertyJourneySectionProps) {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'search',
      num: '۰۱',
      title: 'جستجوی هوشمند',
      subtitle: 'فیلترهای دقیق خرید، رهن و اجاره',
      description: 'انتخاب ملک بر اساس شهر، محله‌های شاخص، متراژ، قیمت هر متر و استانداردهای معماری روز با فیلترهای پیشرفته.',
      icon: Search,
      actionLabel: 'شروع جستجو',
      handler: onOpenSearch,
    },
    {
      id: 'property',
      num: '۰۲',
      title: 'بررسی ملک و تور ۳D',
      subtitle: 'شبیه‌ساز ۳۶۰ درجه و اسلایدر بازسازی',
      description: 'مشاهده گالری اختصاصی، پلان‌های تفکیکی، تور مجازی سه‌بعدی و مقایسه قبل و بعد از بازسازی لوکس.',
      icon: Building,
      actionLabel: 'کاوش روی نقشه',
      handler: onOpenMap,
    },
    {
      id: 'neighborhood',
      num: '۰۳',
      title: 'هوش محله و کیفیت زندگی',
      subtitle: 'تحلیل آب‌وهوا، مترو و دسترسی‌ها',
      description: 'بررسی امتیاز زیست‌پذیری محله، دسترسی به مراکز خرید برند، شاخص آلودگی هوا و بافت فرهنگی منطقه.',
      icon: CompassIcon,
      actionLabel: 'مشاهده نقشه محلات',
      handler: onOpenMap,
    },
    {
      id: 'roi',
      num: '۰۴',
      title: 'محاسبه ارزش و بازدهی (ROI)',
      subtitle: 'پیش‌بینی سود و بازگشت سرمایه',
      description: 'محاسبه نرخ تنزیل، بازده ناخالص اجاره، رشد ارزش سالانه و پیش‌بینی سود خالص ۱۰ ساله ملک با فرمول‌های مالی.',
      icon: Calculator,
      actionLabel: 'ماشین‌حساب بازدهی',
      handler: onOpenRoi,
    },
    {
      id: 'compare',
      num: '۰۵',
      title: 'مقایسه هم‌زمان املاک',
      subtitle: 'تحلیل ماتریسی و پیشنهاد هوش مصنوعی',
      description: 'مقایسه جزء‌به‌جزء تا ۳ ملک از نظر مشاعات، قیمت بر متر و بهره‌مندی از پیشنهاد تحلیل‌گر هوشمند خانه آرمانی.',
      icon: Scale,
      actionLabel: 'میز مقایسه املاک',
      handler: onOpenCompare,
    },
    {
      id: 'save',
      num: '۰۶',
      title: 'ذخیره و مدیریت علاقه‌مندی‌ها',
      subtitle: 'پورتفولیوی شخصی خریدار',
      description: 'نشانه‌گذاری ملک‌های برتر در داشبورد محلی بدون نیاز به ثبت‌نام اجباری جهت دسترسی سریع و مشاوره خانوادگی.',
      icon: Heart,
      actionLabel: 'املاک ذخیره‌شده',
      handler: onOpenSaved,
    },
    {
      id: 'visit',
      num: '۰۷',
      title: 'رزرو نوبت بازدید اختصاصی',
      subtitle: 'هماهنگی حضوری با همراهی کارشناس ارشد',
      description: 'انتخاب تاریخ و ساعت آزاد، دریافت پیامک و کد رهگیری رسمی بازدید با هماهنگی لابی‌من و مالک.',
      icon: Calendar,
      actionLabel: 'رزرو نوبت بازدید',
      handler: onOpenSchedule,
    },
    {
      id: 'agent',
      num: '۰۸',
      title: 'مشاوره با وکیل و مشاور ارشد',
      subtitle: 'تنظیم قرارداد امن و بدرقه‌ تا سند قطعی',
      description: 'بررسی سند تک‌برگ، استعلام ثبتی و شهرداری با حضور مشاور رتبه‌بندی‌شده و مدیر حقوقی هلدینگ آرمانی.',
      icon: PhoneCall,
      actionLabel: 'پروفایل مشاورین',
      handler: onOpenConsultant,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#16213E] text-white relative overflow-hidden border-t border-b border-[#C9A84C]/20" id="journey">
      {/* Background Subtle Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,52,96,0.5)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 text-[#E4C675] text-xs font-bold px-4 py-1.5 rounded-full border border-[#C9A84C]/30 mb-3">
            <Compass className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>مسیر دیجیتال خرید و سرمایه‌گذاری (Property Journey)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            از نخستین کلیک تا دریافت سند قطعی خانه آرمانی
          </h2>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            ما تجربه سنتی و پرابهام بازار مسکن را به یک سفر هوشمند، داده‌محور و شفاف در ۸ گام استاندارد تبدیل کرده‌ایم.
          </p>
        </div>

        {/* 8 Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === idx;
            return (
              <div
                key={step.id}
                onMouseEnter={() => setActiveStep(idx)}
                className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 relative flex flex-col justify-between border cursor-pointer group ${
                  isHovered
                    ? 'bg-[#1A1A2E] border-[#C9A84C] shadow-[0_12px_32px_rgba(201,168,76,0.2)] -translate-y-1'
                    : 'bg-[#1A1A2E]/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-black text-[#C9A84C]/60 group-hover:text-[#E4C675] transition-colors">
                      {step.num}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        isHovered
                          ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-md scale-110'
                          : 'bg-white/5 text-[#E4C675]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white mb-1 group-hover:text-[#E4C675] transition-colors">
                    {step.title}
                  </h3>
                  <div className="text-[11px] text-[#C9A84C] font-bold mb-2.5">
                    {step.subtitle}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-[#E4C675]">
                  <span>{step.actionLabel}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      step.handler();
                    }}
                    className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#C9A84C] group-hover:text-[#1A1A2E] transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1A1A2E] to-[#16213E] p-6 sm:p-8 rounded-3xl border border-[#C9A84C]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#E4C675] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-white">
                آماده‌اید ملک ایده‌آل خود را با استاندارد خانه آرمانی بیابید؟
              </h4>
              <p className="text-xs text-white/60 mt-0.5">
                تیم کارشناسی ما در تمامی ۸ مرحله همراه حقوقی، مالی و اجرایی شما خواهد بود.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenSearch}
              className="flex-1 md:flex-initial bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-black px-6 py-3 rounded-2xl text-xs sm:text-sm hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all cursor-pointer text-center"
            >
              کاوش و فیلتر پیشرفته املاک
            </button>
            <button
              onClick={onOpenConsultant}
              className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all border border-white/10 cursor-pointer text-center"
            >
              گفتگو با مشاور ارشد
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
