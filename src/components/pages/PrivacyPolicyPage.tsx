import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowRight, UserCheck, Database, Bell } from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
}

export function PrivacyPolicyPage({ onBackToHome }: PrivacyPolicyPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sections = [
    {
      icon: <Database className="w-5 h-5 text-[#C9A84C]" />,
      title: '۱. اطلاعاتی که جمع‌آوری می‌کنیم',
      content:
        'سامانه خانه آرمانی برای ارائه خدمات ملکی، ثبت درخواست‌های بازدید حضوری، مشاوره‌های تخصصی، و ارزیابی آنلاین ملک، اطلاعاتی از قبیل نام و نام خانوادگی، شماره تماس، آدرس ایمیل، و در صورت لزوم اطلاعات موقعیت تقریبی ملک را دریافت می‌نماید. ما هیچ‌گونه اطلاعات غیرضروری یا خارج از چارچوب خدمات ثبت‌شده را ذخیره نمی‌کنیم.',
    },
    {
      icon: <Lock className="w-5 h-5 text-[#C9A84C]" />,
      title: '۲. امنیت و حفاظت از داده‌ها',
      content:
        'کلیه اطلاعات دریافتی و ترافیک شبکه میان کاربران و سامانه با پروتکل رمزنگاری پیشرفته SSL (۲۵۶ بیتی) محافظت می‌شود. اطلاعات هویتی و شماره‌های تماس کاربران نزد ما به صورت امانت نگهداری شده و دسترسی به آن‌ها منحصراً در اختیار مشاوران مجاز و کارشناسان ناظر خانه آرمانی قرار دارد.',
    },
    {
      icon: <Eye className="w-5 h-5 text-[#C9A84C]" />,
      title: '۳. نحوه استفاده از اطلاعات',
      content:
        'اطلاعات تماس شما صرفاً جهت هماهنگی بازدید املاک، ارسال گزارش‌های استعلام ثبتی، اطلاع‌رسانی املاک جدید متناسب با بودجه شما و ارائه خدمات پشتیبانی مورد استفاده قرار می‌گیرد. سامانه تحت هیچ شرایطی اطلاعات کاربران را در اختیار سازمان‌ها یا اشخاص ثالث تبلیغاتی قرار نخواهد داد.',
    },
    {
      icon: <UserCheck className="w-5 h-5 text-[#C9A84C]" />,
      title: '۴. کوکی‌ها و اطلاعات فنی',
      content:
        'ما از کوکی‌های استاندارد به منظور ارتقای تجربه کاربری، به خاطرسپاری املاک ذخیره‌شده و فیلترهای جستجو، و تحلیل بهینه‌سازی بارگذاری صفحات استفاده می‌کنیم. شما در هر زمان می‌توانید تنظیمات کوکی را از طریق مرورگر خود مدیریت یا غیرفعال فرمایید.',
    },
    {
      icon: <Bell className="w-5 h-5 text-[#C9A84C]" />,
      title: '۵. حقوق کاربران بر داده‌ها',
      content:
        'شما حق دسترسی، ویرایش، و درخواست حذف اطلاعات کاربری یا سوابق جستجوی خود را در هر زمان دارا می‌باشید. جهت ثبت هرگونه درخواست مرتبط با حریم خصوصی، می‌توانید با تیم حفاظت داده‌ها از طریق ایمیل privacy@dreamhome.ir یا شماره‌های رسمی شرکت در ارتباط باشید.',
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
            <span className="text-[#1A1A2E] font-bold">حریم خصوصی کاربران</span>
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
              <ShieldCheck className="w-4 h-4" />
              سند رسمی حفظ محرمانگی داده‌ها
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
              بیانیه حریم خصوصی و امنیت اطلاعات کاربران
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              در «خانه آرمانی»، صیانت از حریم خصوصی، اطلاعات مالی و جزئیات قراردادهای ملکی شما بالاترین اولویت ماست. این بیانیه نحوه گردآوری، استفاده و حفاظت از داده‌های شما در سراسر ۲۱ کلان‌شهر تحت پوشش را تشریح می‌کند.
            </p>
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/60">
              <span>آخرین به‌روزرسانی: {toPersianDigits('1403/07/01')}</span>
              <span>•</span>
              <span>نسخه: ۳.۴</span>
              <span>•</span>
              <span>تحت نظارت اتحادیه کشوری املاک و مرکز توسعه تجارت الکترونیکی</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-5">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#EDE8E0] shadow-xs hover:border-[#C9A84C]/40 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F4EF] flex items-center justify-center border border-[#EDE8E0]">
                  {sec.icon}
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#1A1A2E]">{sec.title}</h2>
              </div>
              <p className="text-[#5A5A7A] text-sm sm:text-base leading-relaxed pr-0 sm:pr-13">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Commitment Badge */}
        <div className="mt-8 bg-[#F0EAE1] rounded-2xl p-6 border border-[#C9A84C]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#C9A84C] shrink-0" />
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#1A1A2E]">
                تعهد کامل به منشور حفظ حقوق خریداران و سرمایه‌گذاران
              </h3>
              <p className="text-xs text-[#5A5A7A] mt-0.5">
                تضمین عدم افشای هرگونه اطلاعات هویتی و شماره تماس به دلالان خارج از شبکه کارشناسان رسمی خانه آرمانی.
              </p>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1A1A2E] hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center whitespace-nowrap shadow-xs"
          >
            تأیید و بازگشت به سامانه
          </button>
        </div>
      </div>
    </div>
  );
}
