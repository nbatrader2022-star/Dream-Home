import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  Award,
  Star,
  Building2,
  CheckCircle2,
  MapPin,
  Calendar,
  Languages,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Agent, PropertyAgent, Property } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface ConsultantProfileModalProps {
  agent: Agent | PropertyAgent | null;
  properties: Property[];
  onClose: () => void;
  onSelectProperty: (property: Property) => void;
  onScheduleVisit: (property?: Property) => void;
}

export function ConsultantProfileModal({
  agent,
  properties,
  onClose,
  onSelectProperty,
  onScheduleVisit,
}: ConsultantProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'bio' | 'contact'>('active');

  useLockBodyScroll(Boolean(agent));

  if (!agent) return null;

  // Filter properties belonging to this agent
  const agentProperties = properties.filter((p) => p.agent?.id === agent.id || p.agent?.name === agent.name);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 text-right animate-fadeIn">
      <div className="bg-[#1A1A2E] text-white w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[#C9A84C]/30 relative my-auto">
        {/* Top Decorative Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A0F1D] relative overflow-hidden border-b border-[#C9A84C]/20 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.25)_0%,transparent_65%)]" />
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-3 right-6 flex items-center gap-2 text-xs text-[#E4C675] font-mono tracking-widest bg-black/40 px-3 py-1 rounded-full border border-[#C9A84C]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>مشاور تایید‌شده دپارتمان املاک لوکس خانه آرمانی</span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          {/* Profile Header Bar */}
        <div className="px-6 sm:px-8 -mt-16 pb-6 border-b border-white/10 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
            <div className="flex items-end gap-5">
              <div className="relative">
                <img
                  src={agent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                  alt={agent.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#1A1A2E] shadow-2xl ring-2 ring-[#C9A84C]"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-[#1A1A2E] rounded-full" title="آنلاین و آماده پاسخگویی" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{agent.name}</h2>
                  <span className="bg-[#C9A84C]/15 text-[#E4C675] text-[11px] font-bold px-3 py-0.5 rounded-full border border-[#C9A84C]/30">
                    {agent.titleEn || 'Senior Property Consultant'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">{agent.role}</div>
                <div className="flex items-center gap-3 text-xs text-white/50 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[#E4C675]">
                    <Star className="w-3.5 h-3.5 fill-[#E4C675] text-[#E4C675]" />
                    {toPersianDigits(agent.rating)} از ۵
                  </span>
                  <span>•</span>
                  <span>کد نظام ملکی: <strong className="text-white/80 font-mono">{agent.licenseNumber || 'REG-9821-TEH'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Call & WhatsApp) */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href={`tel:${agent.phone}`}
                className="flex-1 sm:flex-initial bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>تماس ({agent.phone})</span>
              </a>
              <a
                href={`https://wa.me/${agent.whatsapp}?text=${encodeURIComponent(`درود بر شما جناب/سرکار ${agent.name}، جهت مشاوره ملکی در خانه آرمانی با شما تماس می‌گیرم.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساپ</span>
              </a>
            </div>
          </div>
        </div>

        {/* 6 Key Performance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4 sm:p-6 bg-[#16213E]/60 border-b border-white/10 text-center">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-white/60 mb-0.5">سابقه تخصصی</div>
            <div className="text-sm sm:text-base font-black text-[#E4C675]">
              {toPersianDigits(agent.experienceYears)} سال
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-white/60 mb-0.5">تعداد کل معاملات</div>
            <div className="text-sm sm:text-base font-black text-white">
              {toPersianDigits(agent.dealsCount)}+
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-white/60 mb-0.5">املاک واگذارشده</div>
            <div className="text-sm sm:text-base font-black text-emerald-400">
              {toPersianDigits(agent.soldCount || 140)} مورد
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-white/60 mb-0.5">املاک فعال در پورتفولیو</div>
            <div className="text-sm sm:text-base font-black text-[#E4C675]">
              {toPersianDigits(agentProperties.length || agent.activeListingsCount || 8)} ملک
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-white/60 mb-0.5">شاخص رضایت و پاسخ</div>
            <div className="text-sm sm:text-base font-black text-white">
              {toPersianDigits(agent.responseRatePercent || 99)}٪
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] text-white/60 mb-0.5">زبان‌های مسلط</div>
            <div className="text-xs font-bold text-white/90">
              {agent.languages?.join('، ') || 'فارسی، انگلیسی'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 sm:px-8 pt-4 border-b border-white/10 bg-[#1A1A2E]">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-[#C9A84C] text-[#E4C675]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            املاک فعال و در دسترس این مشاور ({toPersianDigits(agentProperties.length)})
          </button>
          <button
            onClick={() => setActiveTab('bio')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'bio'
                ? 'border-[#C9A84C] text-[#E4C675]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            تخصص‌ها، بیوگرافی و مناطق تحت پوشش
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 max-h-[50vh] overflow-y-auto">
          {activeTab === 'active' ? (
            <div>
              {agentProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {agentProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => {
                        onSelectProperty(prop);
                        onClose();
                      }}
                      className="bg-[#16213E] p-3.5 rounded-2xl border border-white/10 hover:border-[#C9A84C] transition-all cursor-pointer flex gap-3.5 group shadow-sm hover:shadow-lg"
                    >
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                        <div>
                          <div className="text-[11px] text-[#E4C675] font-bold mb-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {prop.neighborhood}، {prop.cityNameFa}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-[#E4C675] transition-colors">
                            {prop.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <div className="text-xs font-black text-[#E4C675]">
                            {formatPrice(prop.price)}
                          </div>
                          <div className="text-[11px] text-white/50">
                            {toPersianDigits(prop.area)} م² • {toPersianDigits(prop.bedrooms)} خ
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-white/60 text-xs">
                  در حال حاضر ملکی در این دسته‌بندی ثبت نشده است.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6 text-xs sm:text-sm leading-relaxed text-white/80">
              <div className="bg-[#16213E] p-5 rounded-2xl border border-white/5">
                <h4 className="text-sm font-black text-[#E4C675] mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  درباره کارشناس و سوابق اجرایی
                </h4>
                <p className="text-white/70 leading-relaxed">{agent.bio}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#16213E] p-4 rounded-2xl border border-white/5">
                  <div className="text-xs font-bold text-white/60 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" />
                    حوزه تخصصی و نوع املاک
                  </div>
                  <div className="text-white font-bold">{agent.specialty}</div>
                </div>

                <div className="bg-[#16213E] p-4 rounded-2xl border border-white/5">
                  <div className="text-xs font-bold text-white/60 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                    مناطق تحت پوشش و فعالیت
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.areasServed?.map((area, idx) => (
                      <span
                        key={idx}
                        className="bg-[#C9A84C]/10 text-[#E4C675] text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-[#C9A84C]/20"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-5 bg-[#0F172A] border-t border-white/10 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="text-xs text-white/60">
            برای هماهنگی جلسه مشاوره حضوری یا ارزیابی قیمت ملک خود، مستقیماً نوبت ثبت کنید.
          </div>
          <button
            onClick={() => {
              onScheduleVisit();
              onClose();
            }}
            className="bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>رزرو نوبت مشاوره اختصاصی</span>
          </button>
        </div>
      </div>
    </div>
  );
}
