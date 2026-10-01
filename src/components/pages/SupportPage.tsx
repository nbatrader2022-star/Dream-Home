import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { SUPPORTED_CITIES_LIST } from '../../data/additionalCityProperties';
import { toPersianDigits } from '../../utils/formatters';

interface SupportPageProps {
  onBackToHome: () => void;
}

export function SupportPage({ onBackToHome }: SupportPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'tehran',
    subject: 'visit',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const faqs = [
    {
      q: 'چگونه می‌توانم برای بازدید حضوری یک ملک هماهنگی انجام دهم؟',
      a: 'در صفحه هر ملک، دکمه «هماهنگی بازدید حضوری» تعبیه شده است. پس از انتخاب تاریخ و ساعت مورد نظر، کارشناس مقیم محله با شما تماس گرفته و هماهنگی کامل را انجام می‌دهد. همچنین می‌توانید از طریق خط اختصاصی ۲۴ ساعته ۰۲۱-۲۲۰۰۸۸۹۹ مستقیماً درخواست خود را ثبت نمایید.',
    },
    {
      q: 'پوشش خدمات ۲۱ کلان‌شهر خانه آرمانی شامل چه مواردی است؟',
      a: 'در تمامی ۲۱ کلان‌شهر تحت پوشش (از جمله تهران، مشهد، تبریز، اصفهان، شیراز، رشت، ساری، سنندج، زاهدان، کرمان و ...)، تیم‌های کارشناسی مقیم جهت عکاسی معماری، استعلامات ثبتی، کارشناسی قیمت و عقد قراردادهای رسمی با کد رهگیری کشوری حضور دارند.',
    },
    {
      q: 'ارزیابی هوشمند قیمت ملک بر چه مبنایی انجام می‌شود؟',
      a: 'سیستم تخمین ارزش خانه آرمانی با تلفیق دیتابیس معاملات قطعی ثبت‌شده در سامانه معاملات املاک، داده‌های هوش مصنوعی تحلیلی و ضریب‌های مرغوبیت محلی در هر شهر به صورت آنی و رایگان محدوده قیمتی ملک شما را مشخص می‌سازد.',
    },
    {
      q: 'آیا برای سپردن ملک خود به خانه آرمانی هزینه‌ای دریافت می‌شود؟',
      a: 'خیر. ثبت فایل و بازاریابی ملک توسط عکاسان و کارشناسان خانه آرمانی کاملاً رایگان است و کارمزد تنها پس از انجام موفقیت‌آمیز معامله و طبق تعرفه قانونی صنف مشاوران دریافت می‌گردد.',
    },
    {
      q: 'در صورت نیاز به استعلام ثبتی و صحت مدارک ملک چه باید کرد؟',
      a: 'دپارتمان حقوقی خانه آرمانی پیش از هرگونه تنظیم بیعانه، استعلام سند رسمی تک‌برگ، استعلام طرح تفصیلی شهرداری و پایان‌کار را از مراجع ذی‌صلاح اخذ نموده و به رؤیت خریدار می‌رساند.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="global-page-wrapper min-h-screen bg-[#F8F4EF] text-[#1A1A2E] pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
            <span className="text-[#1A1A2E] font-bold">مرکز پشتیبانی و ارتباط با مشتریان</span>
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
              <Headphones className="w-4 h-4" />
              مرکز پشتیبانی ۲۴ ساعته در سراسر کشور
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
              پاسخگویی و همراهی تخصصی در ۲۱ کلان‌شهر ایران
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              کارشناسان حقوقی، مهندسان معمار و مشاوران سرمایه‌گذاری خانه آرمانی هفت روز هفته به صورت شبانه‌روزی آماده پاسخگویی و ارائه مشاوره تخصصی به شما هستند.
            </p>
          </div>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#EDE8E0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A2E] mb-1">خط ویژه تلفنی</h3>
              <p className="text-xs text-[#5A5A7A] mb-2">پاسخگویی بدون صف</p>
              <a
                href="tel:02122008899"
                dir="ltr"
                className="block text-base font-black text-[#C9A84C] hover:underline"
              >
                ۰۲۱ - ۲۲۰۰ ۸۸۹۹
              </a>
            </div>
            <span className="text-[11px] text-[#5A5A7A] mt-3 pt-2 border-t border-[#EDE8E0]">
              پشتیبانی ۷ روز هفته • ۲۴ ساعته
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDE8E0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A2E] mb-1">پست الکترونیکی</h3>
              <p className="text-xs text-[#5A5A7A] mb-2">امور مشتریان و قراردادها</p>
              <a
                href="mailto:support@dreamhome.ir"
                dir="ltr"
                className="block text-xs font-bold text-[#1A1A2E] hover:text-[#C9A84C]"
              >
                support@dreamhome.ir
              </a>
            </div>
            <span className="text-[11px] text-[#5A5A7A] mt-3 pt-2 border-t border-[#EDE8E0]">
              پاسخگویی حداکثر ظرف ۱ ساعت
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDE8E0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A2E] mb-1">دفتر مرکزی</h3>
              <p className="text-xs text-[#5A5A7A] leading-relaxed">
                تهران، زعفرانیه، خیابان مقدس اردبیلی، مجتمع تجاری‌پالادیوم، طبقه ۹
              </p>
            </div>
            <span className="text-[11px] text-[#5A5A7A] mt-3 pt-2 border-t border-[#EDE8E0]">
              شعب فعال در ۲۱ کلان‌شهر کشور
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDE8E0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A2E] mb-1">ساعات کاری شعب</h3>
              <p className="text-xs text-[#5A5A7A] leading-relaxed">
                شنبه تا پنج‌شنبه: ۹ الی ۲۰<br />
                جمعه‌ها و ایام تعطیل: ۱۰ الی ۱۶
              </p>
            </div>
            <span className="text-[11px] text-[#5A5A7A] mt-3 pt-2 border-t border-[#EDE8E0]">
              هماهنگی قبلی جهت جلسات VIP
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Quick Contact Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-[#EDE8E0] shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#C9A84C]" />
              <h2 className="text-base sm:text-lg font-black text-[#1A1A2E]">
                ارسال پیام و ثبت درخواست مشاوره
              </h2>
            </div>

            {submitted ? (
              <div className="bg-[#EBFBF3] border border-[#27AE60]/30 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#27AE60] mx-auto mb-3" />
                <h3 className="font-black text-base text-[#1A1A2E] mb-2">
                  پیام شما با موفقیت دریافت شد
                </h3>
                <p className="text-xs text-[#5A5A7A] leading-relaxed mb-4">
                  شماره پیگیری: DH-{Math.floor(100000 + Math.random() * 900000)}<br />
                  کارشناس ارشد منطقه مربوطه حداکثر ظرف ۳۰ دقیقه آینده با شماره ثبت‌شده تماس خواهد گرفت.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#27AE60] underline cursor-pointer"
                >
                  ارسال پیام دیگر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1A1A2E] mb-1.5">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سهراب محمدی"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#C9A84C] text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A1A2E] mb-1.5">شماره تماس مستقیم:</label>
                    <input
                      type="tel"
                      required
                      placeholder="۰۹۱۲..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#C9A84C] text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A1A2E] mb-1.5">شهر مورد نظر:</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2.5 outline-none focus:border-[#C9A84C] text-xs font-medium"
                    >
                      {SUPPORTED_CITIES_LIST.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.nameFa} ({c.province})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A2E] mb-1.5">موضوع درخواست:</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2.5 outline-none focus:border-[#C9A84C] text-xs font-medium"
                  >
                    <option value="visit">هماهنگی بازدید حضوری ملک</option>
                    <option value="valuation">درخواست ارزیابی رسمی و کارشناسی قیمت</option>
                    <option value="contract">مشاوره حقوقی و استعلام اسناد ثبتی</option>
                    <option value="investment">فرصت‌های سرمایه‌گذاری ملکی و پیش‌خرید</option>
                    <option value="other">سایر امور پشتیبانی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A2E] mb-1.5">شرح پیام یا کد ملک:</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="توضیحات تکمیلی یا سوالات خود را بنویسید..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#C9A84C] text-xs font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A2E] hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {loading ? (
                    <span>در حال ارسال پیام...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ارسال درخواست به کارشناس ارشد</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQs Accordion */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-[#EDE8E0] shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-[#C9A84C]" />
              <h2 className="text-base sm:text-lg font-black text-[#1A1A2E]">
                پرسش‌های متداول مشتریان
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = faqOpen === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#EDE8E0] rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setFaqOpen(isOpen ? null : idx)}
                      className="w-full px-4 py-3 text-right font-bold text-xs sm:text-sm text-[#1A1A2E] flex items-center justify-between gap-2 hover:bg-[#F8F4EF]/70 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#C9A84C] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#5A5A7A] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 text-xs text-[#5A5A7A] leading-relaxed bg-[#F8F4EF]/40 border-t border-[#EDE8E0]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
