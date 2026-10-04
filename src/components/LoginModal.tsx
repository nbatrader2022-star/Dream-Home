import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import brandLogo from '../assets/images/armani_luxury_logo_1788674026359.jpg';
import { signInAdminWithSupabase, AdminAuthState } from '../services/supabaseAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAdminLogin: (state: AdminAuthState) => void;
  onGoogleSignIn?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessAdminLogin,
  onGoogleSignIn,
}) => {
  const [view, setView] = useState<'select' | 'credentials'>('select');
  const [username, setUsername] = useState('nabikalandar0@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setView('select');
      setPassword('');
      setError(null);
      setSuccess(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('لطفاً نام کاربری و رمز عبور را وارد فرمایید.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const authState = await signInAdminWithSupabase(cleanUser, cleanPass);
      if (authState.isAuthenticated && authState.isSuperAdmin) {
        setSuccess('ورود با موفقیت انجام شد. در حال انتقال به پنل مدیریت...');
        setTimeout(() => {
          onSuccessAdminLogin(authState);
          onClose();
        }, 600);
      } else {
        setError('حساب کاربری شما دارای سطح دسترسی مدیر ارشد نمی‌باشد.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.message ||
          'اطلاعات ورود نادرست است یا رمز عبور اشتباه می‌باشد. لطفاً مجدداً بررسی فرمایید.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    onClose();
    if (onGoogleSignIn) {
      onGoogleSignIn();
    }
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="login-modal-container"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#181829] to-[#0F0F1A] border border-[#C9A84C]/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#C9A84C]/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          id="login-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
          title="بستن پنجره"
        >
          <X className="w-5 h-5" />
        </button>

        {/* View 1: Method Selection */}
        {view === 'select' && (
          <div className="space-y-6">
            {/* Header / Brand */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 shadow-inner mb-4 overflow-hidden">
                <img
                  src={brandLogo}
                  alt="خانه آرمانی"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ورود به سامانه
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
                لطفاً روش ورود مورد نظر خود را برای دسترسی انتخاب نمایید:
              </p>
            </div>

            {/* Selection Buttons */}
            <div className="space-y-3.5 pt-2">
              {/* Option 1: Username and Password */}
              <button
                id="login-choose-credentials-btn"
                type="button"
                onClick={() => {
                  setError(null);
                  setView('credentials');
                }}
                className="w-full group p-4 rounded-2xl bg-gradient-to-r from-white/[0.07] to-white/[0.03] hover:from-[#C9A84C]/20 hover:to-white/[0.08] border border-white/10 hover:border-[#C9A84C]/60 transition-all duration-200 flex items-center justify-between text-right cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(201,168,76,0.15)]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#E4C675] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm sm:text-base group-hover:text-[#E4C675] transition-colors">
                      ورود با نام کاربری و رمز عبور
                    </span>
                    <span className="block text-[11px] sm:text-xs text-white/50 mt-0.5">
                      ورود مستقیم به پنل مدیریت سایت (Supabase)
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#C9A84C]/20 text-white/40 group-hover:text-[#E4C675] flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
              </button>

              {/* Option 2: Google Sign In */}
              <button
                id="login-choose-google-btn"
                type="button"
                onClick={handleGoogleClick}
                className="w-full group p-4 rounded-2xl bg-gradient-to-r from-white/[0.07] to-white/[0.03] hover:from-white/[0.12] hover:to-white/[0.06] border border-white/10 hover:border-white/25 transition-all duration-200 flex items-center justify-between text-right cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white text-[#1A1A2E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm sm:text-base group-hover:text-white transition-colors">
                      ورود با گوگل
                    </span>
                    <span className="block text-[11px] sm:text-xs text-white/50 mt-0.5">
                      ورود سریع از طریق احراز هویت امن Google OAuth
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/15 text-white/40 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
              </button>
            </div>

            {/* Footer security badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-white/40">
              <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
              <span>محیط امن با رمزنگاری پیشرفته و Supabase Auth</span>
            </div>
          </div>
        )}

        {/* View 2: Username and Password Form */}
        {view === 'credentials' && (
          <div className="space-y-5">
            {/* Top Back Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button
                id="login-back-to-select-btn"
                type="button"
                onClick={() => {
                  setError(null);
                  setView('select');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#E4C675] hover:text-white transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به گزینه‌های ورود</span>
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>احراز هویت مدیر</span>
              </div>
            </div>

            <div className="text-center pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                ورود با نام کاربری و رمز عبور
              </h2>
              <p className="text-xs text-white/60 mt-1">
                اطلاعات کاربری خود را جهت ورود مستقیم به پنل مدیریت وارد نمایید.
              </p>
            </div>

            {/* Status Alert */}
            {error && (
              <div
                id="login-error-alert"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {success && (
              <div
                id="login-success-alert"
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5 text-right">
                <label
                  htmlFor="login-username-input"
                  className="block text-xs font-semibold text-white/80"
                >
                  نام کاربری (ایمیل مدیر)
                </label>
                <div className="relative">
                  <input
                    id="login-username-input"
                    type="text"
                    dir="ltr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nabikalandar0@gmail.com"
                    required
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/15 focus:border-[#C9A84C] focus:bg-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-white font-mono text-sm placeholder-white/25 outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-right">
                <label
                  htmlFor="login-password-input"
                  className="block text-xs font-semibold text-white/80"
                >
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/15 focus:border-[#C9A84C] focus:bg-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-white font-mono text-sm placeholder-white/25 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-credentials-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] hover:from-[#C9A84C] hover:to-[#E4C675] text-[#1A1A2E] font-black py-3 px-5 rounded-xl shadow-lg hover:shadow-[0_4px_25px_rgba(201,168,76,0.35)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1A1A2E]" />
                    <span>در حال بررسی مشخصات...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#1A1A2E]" />
                    <span>تأیید و ورود مستقیم به پنل مدیریت</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick credentials helper notice */}
            <div className="pt-2 text-center text-[11px] text-white/40 border-t border-white/10">
              <span>مدیر ارشد سامانه: </span>
              <span dir="ltr" className="font-mono text-[#E4C675]">
                nabikalandar0@gmail.com
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
