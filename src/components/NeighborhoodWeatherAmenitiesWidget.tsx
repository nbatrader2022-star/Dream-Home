import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  ShieldCheck,
  ExternalLink,
  RotateCw,
  Sparkles,
  ShoppingBag,
  Hospital,
  Train,
  Trees,
  Compass,
  ThermometerSun,
  Search,
} from 'lucide-react';
import { NeighborhoodInsights } from '../types';

interface NeighborhoodWeatherAmenitiesWidgetProps {
  neighborhood: string;
  city: string;
  location?: string;
}

export function NeighborhoodWeatherAmenitiesWidget({
  neighborhood,
  city,
  location,
}: NeighborhoodWeatherAmenitiesWidgetProps) {
  const [data, setData] = useState<NeighborhoodInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/neighborhood-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhood, city, location }),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch neighborhood data');
      }
      const result: NeighborhoodInsights = await res.json();
      setData(result);
    } catch (err: any) {
      console.error('Error fetching neighborhood insights:', err);
      setError('امکان بارگذاری آنلاین فراهم نشد؛ نمایش داده‌های پیش‌فرض منطقه.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [neighborhood, city]);

  const getCategoryIcon = (category: string) => {
    if (category.includes('خرید') || category.includes('تجاری')) {
      return <ShoppingBag className="w-4 h-4 text-[#C9A84C]" />;
    }
    if (category.includes('درمان') || category.includes('بیمارستان')) {
      return <Hospital className="w-4 h-4 text-rose-500" />;
    }
    if (category.includes('حمل') || category.includes('مترو') || category.includes('دسترسی')) {
      return <Train className="w-4 h-4 text-blue-500" />;
    }
    if (category.includes('سبز') || category.includes('تفریح') || category.includes('پارک')) {
      return <Trees className="w-4 h-4 text-emerald-500" />;
    }
    return <Compass className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1A2E] to-[#252542] text-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A07830] to-[#E4C675] text-[#1A1A2E] flex items-center justify-center shadow-md">
              <CloudSun className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  نبض محله و وضعیت آب‌وهوا: {neighborhood}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  <Search className="w-2.5 h-2.5" />
                  جستجوی هوشمند گوگل
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                بررسی لحظه‌ای ترند دمایی، شاخص پاکی هوا و مراکز رفاهی و خدماتی مستقر در منطقه
              </p>
            </div>
          </div>

          <button
            onClick={fetchInsights}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 cursor-pointer"
            title="به‌روزرسانی اطلاعات از گوگل"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C9A84C]' : ''}`} />
          </button>
        </div>

        {/* Live Weather Bar */}
        {data && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-[11px] text-white/60 flex items-center gap-1 mb-1">
                <ThermometerSun className="w-3.5 h-3.5 text-[#E4C675]" />
                دمای کنونی
              </div>
              <div className="text-xl font-black text-white">{data.weather.temp}</div>
              <div className="text-[10px] text-white/70 mt-0.5 truncate">{data.weather.condition}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-[11px] text-white/60 flex items-center gap-1 mb-1">
                <Wind className="w-3.5 h-3.5 text-cyan-300" />
                شاخص کیفیت هوا (AQI)
              </div>
              <div className="text-sm font-black text-emerald-300">{data.weather.aqi}</div>
              <div className="text-[10px] text-white/70 mt-0.5">ایده‌آل جهت سکونت</div>
            </div>

            <div className="col-span-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="text-[11px] text-[#E4C675] font-bold flex items-center gap-1 mb-1">
                <Compass className="w-3.5 h-3.5" />
                روند فصلی و اقلیم منطقه
              </div>
              <div className="text-xs text-white/90 leading-snug">
                {data.weather.trend}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Amenities Grid */}
      <div className="p-5 sm:p-6 bg-[#F8F4EF]">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-stone-500">
            <RotateCw className="w-6 h-6 animate-spin text-[#C9A84C]" />
            <span className="text-xs font-bold">در حال دریافت داده‌های آب و هوا و امکانات رفاهی از گوگل...</span>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-black text-sm text-[#1A1A2E] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                امکانات رفاهی و مراکز شاخص اطراف ملک
              </h4>
              <span className="text-[11px] text-[#5A5A7A]">
                موقعیت: {neighborhood}، {city}
              </span>
            </div>

            {data && data.amenities && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {data.amenities.map((group, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A2E] mb-2.5 pb-2 border-b border-stone-100">
                      {getCategoryIcon(group.category)}
                      <span>{group.category}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#5A5A7A]">
                      {group.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Google Search Text Insights if available */}
            {data?.insightsText && (
              <div className="mt-4 bg-white p-4 rounded-2xl border border-stone-200 text-xs text-[#5A5A7A] leading-relaxed">
                <div className="font-bold text-[#1A1A2E] text-xs mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  تحلیل تخصصی کارشناس شهری:
                </div>
                <p className="whitespace-pre-line">{data.insightsText}</p>
              </div>
            )}

            {/* Google Grounding Sources */}
            {data && data.sources && data.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5A5A7A]">
                <div className="flex items-center gap-1 text-[#A07830] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>منابع مستند جستجوی گوگل:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.sources.slice(0, 3).map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-[#1A1A2E] hover:text-[#C9A84C] transition-colors"
                    >
                      <span className="truncate max-w-[200px]">{src.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#C9A84C] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
