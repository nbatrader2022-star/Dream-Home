import React from 'react';
import { ShieldAlert, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '../../data/admins';

interface AccessDeniedPageProps {
  userEmail?: string | null;
  onBackToHome: () => void;
  onOpenLogin?: () => void;
  onOpenSignIn?: () => void;
}

export function AccessDeniedPage({
  userEmail,
  onBackToHome,
  onOpenLogin,
  onOpenSignIn,
}: AccessDeniedPageProps) {
  const handleLogin = onOpenSignIn || onOpenLogin || (() => {});

  return (
    <div className="global-page-wrapper min-h-[80vh] flex flex-col items-center justify-center p-6 text-center font-['Vazirmatn',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-red-100 shadow-xl text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          خطای ۴۰۳ - عدم دسترسی مجاز
        </span>

        <h2 className="text-2xl font-black text-[#1A1A2E] mt-4 mb-2">
          دسترسی به پنل مدیریت مسدود است
        </h2>

        {userEmail && (
          <div className="text-[11px] text-stone-600 bg-stone-100 py-1.5 px-3 rounded-xl font-mono mb-3 inline-block">
            حساب فعلی: {userEmail}
          </div>
        )}

        <p className="text-xs text-[#5A5A7A] leading-relaxed mb-6">
          این بخش صرفاً در اختیار <strong className="text-[#A07830]">مدیر ارشد سیستم (Super Admin)</strong> دارای مجوز معتبر در پایگاه داده Supabase قرار دارد. حساب کاربری فعلی شما مجوز دسترسی به این بخش را ندارد.
        </p>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-[#5A5A7A] mb-6 text-right space-y-1.5">
          <div className="flex items-center gap-2 text-[#1A1A2E] font-bold mb-1">
            <Lock className="w-3.5 h-3.5 text-[#A07830]" />
            <span>شرایط دسترسی:</span>
          </div>
          <div>• ثبت ایمیل در جدول مدیران ارشد Supabase</div>
          <div>• تایید وضعیت فعال (active status)</div>
          <div>• احراز هویت دوعاملی یا سروری معتبر</div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            ورود با حساب مدیر ارشد
          </button>

          <button
            onClick={onBackToHome}
            className="w-full bg-[#1A1A2E] hover:bg-[#0F3460] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-[#C9A84C]" />
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    </div>
  );
}
