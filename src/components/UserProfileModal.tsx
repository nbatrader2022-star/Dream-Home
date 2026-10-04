import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Heart,
  Calendar,
  ShieldCheck,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';
import { toPersianDigits } from '../utils/formatters';
import { updateUserProfile } from '../services/supabaseUserAuth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  savedCount: number;
  onOpenSavedDrawer: () => void;
  onSignOut: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  savedCount,
  onOpenSavedDrawer,
  onSignOut,
  onUpdateUser,
}) => {
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await updateUserProfile(user.uid, {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });

      if (updated) {
        onUpdateUser(updated);
        setSuccessMessage('اطلاعات حساب کاربری شما با موفقیت در پایگاه داده ذخیره شد.');
      } else {
        // Optimistic update
        onUpdateUser({
          ...user,
          displayName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
        });
        setSuccessMessage('تغییرات پروفایل با موفقیت ثبت شد.');
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ثبت تغییرات پروفایل.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="user-profile-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="user-profile-modal-container"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#181829] to-[#0F0F1A] border border-[#C9A84C]/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#C9A84C]/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          id="user-profile-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
          title="بستن پنجره"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Avatar */}
        <div className="text-center pt-2 pb-5 border-b border-white/10">
          <div className="relative inline-block mb-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C9A84C] shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#99792B] text-[#0A0E17] font-black text-2xl flex items-center justify-center shadow-lg">
                {user.displayName ? user.displayName.charAt(0) : 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0F0F1A] flex items-center justify-center text-[10px] text-white">
              ✓
            </div>
          </div>

          <h2 className="text-xl font-black text-white">{user.displayName}</h2>
          <p className="text-xs text-white/60 mt-0.5 font-mono dir-ltr">{user.email}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#E4C675] text-[11px] font-medium">
            <Sparkles className="w-3 h-3" />
            <span>کاربر حقیقی (Supabase Google Auth)</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 py-4 border-b border-white/10">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSavedDrawer();
            }}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-3 text-right cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#E84393]/15 text-[#E84393] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-[#E84393]" />
            </div>
            <div>
              <span className="block text-[11px] text-white/50">املاک نشان‌شده</span>
              <span className="block text-sm font-bold text-white">
                {toPersianDigits(savedCount)} ملک
              </span>
            </div>
          </button>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/15 text-[#E4C675] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-white/50">وضعیت دسترسی</span>
              <span className="block text-xs font-bold text-emerald-400">احراز شده</span>
            </div>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-semibold text-white/80">نام و نام خانوادگی</label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="نام کامل خود را وارد فرمایید"
                className="w-full bg-white/5 border border-white/15 focus:border-[#C9A84C] focus:bg-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-white text-sm outline-none transition-all"
              />
              <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-semibold text-white/80">شماره تماس جهت هماهنگی بازدید</label>
            <div className="relative">
              <input
                type="tel"
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09123456789"
                className="w-full bg-white/5 border border-white/15 focus:border-[#C9A84C] focus:bg-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-white font-mono text-sm outline-none transition-all"
              />
              <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              id="user-profile-save-btn"
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] hover:opacity-95 text-[#1A1A2E] font-black py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ذخیره تغییرات پروفایل</span>
                </>
              )}
            </button>

            <button
              id="user-profile-signout-btn"
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors text-xs cursor-pointer"
              title="خروج از حساب کاربری"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </form>

        {/* Footer Security Guarantee */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center text-[10px] text-white/40 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>پروفایل و اطلاعات نشان‌شده‌های شما منحصراً متعلق به حساب گوگل شماست.</span>
        </div>
      </div>
    </div>
  );
};
