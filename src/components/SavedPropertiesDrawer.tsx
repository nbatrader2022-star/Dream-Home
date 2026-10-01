import React from 'react';
import { X, Heart, Trash2, Eye, ArrowLeft, MapPin, ShieldCheck, Cloud, LogIn } from 'lucide-react';
import { Property, UserProfile } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';

interface SavedPropertiesDrawerProps {
  isOpen: boolean;
  savedProperties: Property[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onSelectProperty: (property: Property) => void;
  user?: UserProfile | null;
  onGoogleSignIn?: () => void;
}

export function SavedPropertiesDrawer({
  isOpen,
  savedProperties,
  onClose,
  onRemove,
  onClearAll,
  onSelectProperty,
  user,
  onGoogleSignIn,
}: SavedPropertiesDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-start animate-fadeIn">
      {/* Drawer Container (RTL: Slide in from right/start) */}
      <div className="bg-[#F8F4EF] text-[#1A1A2E] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-white/20 text-right animate-slideRight">
        {/* Drawer Header */}
        <div className="bg-[#1A1A2E] text-white px-6 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#E84393] fill-[#E84393]" />
            <div>
              <h2 className="font-bold text-base">ملک‌های نشان‌شده</h2>
              <span className="text-xs text-white/50">
                {toPersianDigits(savedProperties.length)} مورد ذخیره شده {user ? 'و همگام با ابری' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedProperties.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 transition-colors"
              >
                پاک کردن همه
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cloud Sync Status Bar */}
        <div className="bg-[#16213E] border-b border-[#C9A84C]/20 px-4 py-2.5 flex items-center justify-between text-xs text-white/80 shrink-0 font-secondary">
          {user ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>همگام‌سازی ابری با اکانت گوگل ({user.displayName}) فعال است</span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-white/70">
                <Cloud className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>ذخیره دائمی با حساب گوگل</span>
              </div>
              {onGoogleSignIn && (
                <button
                  onClick={onGoogleSignIn}
                  className="text-[11px] bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#E4C675] font-semibold px-2.5 py-1 rounded-md border border-[#C9A84C]/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>ورود با گوگل</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5">
          {savedProperties.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-[#E84393]/15 text-[#E84393] flex items-center justify-center mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A2E] mb-2">
                هنوز ملکی را نشان نکرده‌اید
              </h3>
              <p className="text-xs text-[#5A5A7A] leading-relaxed mb-6 max-w-xs">
                با کلیک بر روی آیکون قلب روی هر ملک، می‌توانید گزینه‌های دلخواهتان را ذخیره کنید و در جلسات خانوادگی مجدداً بررسی نمایید.
              </p>
              <button
                onClick={onClose}
                className="bg-[#1A1A2E] text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-[#0F3460] transition-colors"
              >
                مرور و مشاهده ملک‌ها
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow p-3.5 flex gap-3.5 relative group"
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#1A1A2E] line-clamp-1 mb-1">
                        {property.title}
                      </h4>
                      <div className="text-[11px] text-[#5A5A7A] flex items-center gap-1 mb-1.5 truncate">
                        <MapPin className="w-3 h-3 text-[#C9A84C] shrink-0" />
                        <span>{property.location}</span>
                      </div>
                      <div className="text-xs font-black text-[#A07830]">
                        {formatPrice(property.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-[10px] text-[#9A9AB0]">
                        {toPersianDigits(property.area)} متر • {toPersianDigits(property.bedrooms)} خواب
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectProperty(property);
                          }}
                          className="text-[11px] font-bold text-[#C9A84C] hover:text-[#A07830] flex items-center gap-1"
                        >
                          مشاهده <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRemove(property.id)}
                          title="حذف از نشان‌شده‌ها"
                          className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
