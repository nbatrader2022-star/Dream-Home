import React, { useEffect } from 'react';
import { Scale, FileCheck, AlertTriangle, ArrowRight, CheckCircle2, Shield, HelpCircle, Landmark } from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

interface TermsPageProps {
  onBackToHome: () => void;
}

export function TermsPage({ onBackToHome }: TermsPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const articles = [
    {
      num: 'ماده ۱',
      title: 'تعاریف و دامنه شمول',
      text: '«خانه آرمانی» پلتفرم تخصصی معرفی، کارشناسی و بازاریابی املاک لوکس در ۲۱ کلان‌شهر ایران است. این شرایط و ضوابط، رابطه حقوقی میان سامانه، مالکین، خریداران، مستأجرین و کارگزاران رسمی طرف قرارداد را تبیین می‌نماید.',
    },
    {
      num: 'ماده ۲',
      title: 'صحت اطلاعات و اصالت اسناد',
      text: 'تمامی فایل‌های ثبت‌شده در خانه آرمانی پیش از انتشار عمومی توسط تیم حقوقی و کارشناسان فنی از حیث اصالت سند تک‌برگ، عدم توقیف یا معارض ثبتی، و مطابقت تصاویر ۳۶۰ درجه و عکس‌ها با ملک واقعی بررسی و تأیید می‌شوند. با این حال، انجام استعلامات نهایی در روز تنظیم مبایعه‌نامه یا اجاره‌نامه در دفتر اسناد رسمی الزامی است.',
    },
    {
      num: 'ماده ۳',
      title: 'شفافیت مالی و تعرفه کمیسیون مصوب',
      text: 'کلیه هزینه‌های کارشناسی، کمیسیون معاملات و مشاوره‌های سرمایه‌گذاری دقیقاً منطبق بر نرخ‌نامه مصوب اتحادیه صنف مشاوران املاک هر شهر محاسبه می‌گردد. دریافت هرگونه وجه نقد خارج از رسید رسمی، پورسانت غیرشفاف یا مبالغ نامتعارف در این پلتفرم مطلقاً ممنوع است.',
    },
    {
      num: 'ماده ۴',
      title: 'رزرو بازدید و تعهدات متقاضیان',
      text: 'ثبت درخواست بازدید حضوری از طریق درگاه پلتفرم مستلزم احراز هویت اولیه است. در صورت تمایل به لغو بازدید، متقاضی موظف است حداقل ۳ ساعت قبل کارشناس مربوطه را مطلع سازد تا زمان‌بندی مالک و سایر مراجعین مختل نگردد.',
    },
    {
      num: 'ماده ۵',
      title: 'مالکیت فکری و کپی‌برداری از محتوا',
      text: 'کلیه داده‌ها، نقشه‌ها، تورهای واقعیت مجازی (Matterport/360)، گزارش‌های تحلیلی هوشمند و تصاویر اختصاصی متعلق به خانه آرمانی بوده و هرگونه بازنشر تجاری یا استفاده بدون درج لینک مستقیم پیگرد قانونی دارد.',
    },
    {
      num: 'ماده ۶',
      title: 'حل اختلاف و داوری حقوقی',
      text: 'در صورت بروز هرگونه ابهام یا اختلاف میان طرفین در مراحل مذاکره، اداره امور مشتریان و کمیسیون حل اختلاف تخصصی خانه آرمانی به عنوان داور مرضی‌الطرفین پیش از مراجعه به مراجع قضایی اقدام به سازش خواهد نمود.',
    },
  ];

  return (
    <div className="global-page-wrapper min-h-screen bg-[#F8F4EF] text-[#1A1A2E] pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb & Back */}
        <div className="global-breadcrumb-container flex items-center justify-between gap-3 mb-6">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#5A5A7A]">
            <button
              onClick={onBackToHome}
              className="hover:text-[#C9A84C] transition-colors cursor-pointer"
            >
              صفحه اصلی
            </button>
            <span>/</span>
            <span className="text-[#1A1A2E] font-bold">قوانین و مقررات پلتفرم</span>
          </nav>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1A1A2E] bg-white border border-[#EDE8E0] px-3.5 py-1.5 rounded-xl hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all cursor-pointer shadow-xs"
          >
            <span>بازگشت به خانه</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F172A] rounded-2xl p-6 sm:p-10 text-white mb-8 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-black mb-4">
              <Scale className="w-4 h-4" />
              ضوابط حقوقی و توافق‌نامه کاربری
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
              قوانین، مقررات و چارچوب حقوقی معاملات
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              استفاده از خدمات، سامانه جستجو، سیستم کارشناسی آنلاین و انعقاد قرارداد از طریق کارشناسان «خانه آرمانی» در ۲۱ کلان‌شهر کشور به منزله پذیرش مفاد این توافق‌نامه است.
            </p>
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/60">
              <span>تأییدیه دفتر حقوقی خانه آرمانی</span>
              <span>•</span>
              <span>مطابق با قوانین ثبتی و مدنی جمهوری اسلامی ایران</span>
              <span>•</span>
              <span>به‌روزرسانی: تابستان {toPersianDigits('1403')}</span>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#EDE8E0] shadow-xs hover:border-[#C9A84C]/40 transition-all"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#C9A84C]/15 text-[#9E7A2A]">
                  {item.num}
                </span>
                <h2 className="text-base font-black text-[#1A1A2E]">{item.title}</h2>
              </div>
              <p className="text-[#5A5A7A] text-sm leading-relaxed pr-0 sm:pr-2">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-[#EDE8E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Landmark className="w-6 h-6 text-[#C9A84C] shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-[#1A1A2E]">
                پایبندی به استانداردهای نظام صنفی معاملات ملکی کشور
              </h3>
              <p className="text-xs text-[#5A5A7A] mt-0.5">
                تنظیم کلیه قراردادها منحصراً در بسترهای رسمی ثبت معاملات و اخذ کد رهگیری کشوری معتبر انجام می‌پذیرد.
              </p>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1A1A2E] hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center whitespace-nowrap shadow-xs"
          >
            بازگشت به سایت
          </button>
        </div>
      </div>
    </div>
  );
}
