import React, { useState } from 'react';
import { Home, Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import brandLogo from '../assets/images/armani_luxury_logo_1788674026359.jpg';
import unionBadge from '../assets/images/real_estate_union_badge.png';
import enamadBadge from '../assets/images/enamad_badge.png';

import { SiteSettings } from '../types';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onShowToast: (title: string, message: string) => void;
  settings?: SiteSettings;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export function Footer({ onNavigate, onShowToast, settings, onOpenAdmin, isAdmin = false }: FooterProps) {
  const [newsletterInput, setNewsletterInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const phone = settings?.contactPhone || '09389951723';
  const email = settings?.contactEmail || 'nabikalandar0@gmail.com';
  const address = settings?.contactAddress || 'تهران، الهیه، خیابان فرشته، پلاک ۱۸';
  const siteTitle = settings?.siteTitle || 'خانه آرمانی';
  const siteSubtitle = settings?.siteSubtitle || 'DREAM HOME REAL ESTATE';

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterInput.trim()) return;
    setIsSubscribed(true);
    onShowToast('عضویت در خبرنامه انجام شد', 'جدیدترین فرصت‌های سرمایه‌گذاری ملکی برای شما ارسال خواهد شد.');
    setNewsletterInput('');
  };

  return (
    <footer className="bg-[#16213E] text-white pt-20 pb-12 border-t border-white/10 text-right">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#C9A84C]/40 flex items-center justify-center bg-[#0A0E17] shadow-lg shrink-0">
                <img
                  src={brandLogo}
                  alt="لوگوی خانه آرمانی"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white block">
                  {siteTitle}
                </span>
                <span className="text-[10px] text-[#C9A84C] font-semibold tracking-widest block">
                  {siteSubtitle}
                </span>
              </div>
            </div>

            <p className="text-white/65 text-xs leading-relaxed mb-6">
              مرجع تخصصی معاملات املاک لوکس و پروژه‌های سرمایه‌گذاری در ۲۱ کلان‌شهر کشور. تضمین صحت مدارک، کد رهگیری کشوری و کارشناسی رسمی تمامی فایل‌های عرضه شده.
            </p>

            <div className="flex flex-col gap-2.5 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <a href={`tel:${phone}`} dir="ltr" className="hover:text-[#C9A84C] transition-colors font-mono">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-[#C9A84C] transition-colors font-mono" dir="ltr">
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-[#E4C675] mb-5 border-r-2 border-[#C9A84C] pr-3">
              دسترسی سریع
            </h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  روش کار و فرآیند معاملات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('consultants')}
                  className="hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  مشاوران و کارشناسان ارشد
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  خدمات تخصصی، حقوقی و ارزیابی
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  جستجوی هوشمند ملک‌ها
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  ارزیابی و قیمت‌گذاری رایگان
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('virtual-tour')}
                  className="hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  تورهای مجازی ۳۶۰ درجه
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Property Categories */}
          <div>
            <h4 className="font-bold text-sm text-[#E4C675] mb-5 border-r-2 border-[#C9A84C] pr-3">
              دسته‌بندی‌های برگزیده
            </h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  پنت‌هاوس‌های تریپلکس شمیرانات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  ویلاهای مدرن لواسان و مهرشهر
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  برج‌باغ‌های الهیه و فرشته
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  واحدهای اداری تجاری جردن
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#C9A84C] transition-colors"
                >
                  فرصت‌های طلایی پیش‌فروش معتبر
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Trust Badges */}
          <div>
            <h4 className="font-bold text-sm text-[#E4C675] mb-5 border-r-2 border-[#C9A84C] pr-3">
              خبرنامه تخصصی مسکن
            </h4>
            <p className="text-white/65 text-xs mb-4 leading-relaxed">
              هفتگی گزیده‌ای از بهترین فرصت‌های سرمایه‌گذاری و قیمت‌های اکازیون را دریافت کنید.
            </p>

            {isSubscribed ? (
              <div className="bg-[#2D6A4F]/20 border border-[#2D6A4F] text-[#2D6A4F] p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                <span className="text-white font-medium">ایمیل شما با موفقیت در خبرنامه ثبت شد.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="relative mb-6">
                <input
                  type="email"
                  required
                  value={newsletterInput}
                  onChange={(e) => setNewsletterInput(e.target.value)}
                  placeholder="ایمیل خود را وارد کنید..."
                  className="w-full bg-[#1A1A2E] border border-white/15 rounded-xl pr-4 pl-11 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#C9A84C] transition-colors"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="absolute left-1.5 top-1.5 bottom-1.5 w-8 bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Certifications & Official Trust Badges */}
            <div className="pt-3">
              <span className="text-[11px] text-[#E4C675] font-bold block mb-2.5">
                مجوزها و نمادهای رسمی اعتماد:
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Real Estate Union Official Badge */}
                <div
                  className="bg-white rounded-xl p-2 flex items-center gap-2 border border-[#C9A84C]/40 shadow-md hover:scale-105 transition-all cursor-pointer"
                  title="عضو رسمی اتحادیه صنف مشاوران املاک کشور"
                >
                  <img
                    src={unionBadge}
                    alt="نماد رسمی اتحادیه صنف مشاوران املاک"
                    className="w-10 h-10 object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-right">
                    <span className="text-[10px] font-black text-[#1A1A2E] block leading-tight">
                      اتحادیه املاک
                    </span>
                    <span className="text-[9px] text-[#5A5A7A] block">
                      عضو رسمی و ممتاز
                    </span>
                  </div>
                </div>

                {/* Official eNAMAD Badge */}
                <div
                  className="bg-white rounded-xl p-2 flex items-center gap-2 border border-[#C9A84C]/40 shadow-md hover:scale-105 transition-all cursor-pointer"
                  title="نماد اعتماد الکترونیکی کسب‌وکارهای اینترنتی (اینماد)"
                >
                  <img
                    src={enamadBadge}
                    alt="نماد اعتماد الکترونیکی اینماد (eNAMAD)"
                    className="w-10 h-10 object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-right">
                    <span className="text-[10px] font-black text-[#1A1A2E] block leading-tight">
                      ای‌نماد ۵ ستاره
                    </span>
                    <span className="text-[9px] text-[#5A5A7A] block">
                      تجارت الکترونیکی
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Positioned with legal & support buttons on the right away from bottom-left floating AI consultant */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          {/* Right side in RTL: Legal & Support Buttons (Aligned in a single row on mobile: هم‌راستای هم در یک ردیف) */}
          <div className="w-full md:w-auto flex flex-nowrap items-center gap-2 sm:gap-4 justify-center md:justify-start text-right order-1 md:order-1 text-[11px] sm:text-xs whitespace-nowrap overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              قوانین و مقررات
            </button>
            <span className="shrink-0 text-white/30">•</span>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              حریم خصوصی کاربران
            </button>
            <span className="shrink-0 text-white/30">•</span>
            <button
              onClick={() => onNavigate('support')}
              className="text-[11px] md:text-xs hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              style={{ fontSize: '11px' }}
            >
              پشتیبانی ۲۴/۷
            </button>
            {isAdmin && onOpenAdmin && (
              <span className="hidden lg:inline-flex items-center gap-1.5">
                <span className="shrink-0 text-white/30">•</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#E4C675] text-[#C9A84C] cursor-pointer font-bold flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>پنل مدیریت (Admin)</span>
                </button>
              </span>
            )}
          </div>

          {/* Left side in RTL: Copyright (pl-28 provides generous clearance for bottom-left floating AI button) */}
          <div className="flex items-center gap-1.5 pl-0 md:pl-28 text-center md:text-left order-2 md:order-2">
            <span>تمام حقوق مادی و معنوی این سامانه متعلق به آژانس املاک لوکس «خانه آرمانی» می‌باشد.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
