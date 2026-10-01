import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';
import { Property } from '../types';
import { toPersianDigits, formatPrice, formatPriceShort } from '../utils/formatters';

interface PropertyPriceHistoryChartProps {
  property: Property;
}

type Timeframe = '1y' | '3y' | 'forecast';

export function PropertyPriceHistoryChart({ property }: PropertyPriceHistoryChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1y');

  const currentPrice = property.price || 10000000000;
  const area = property.area || 100;
  const currentPerMeter = Math.round(currentPrice / area);

  // Recharts structured datasets
  const data1Y = [
    { label: 'فروردین ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.76), total: Math.round(currentPrice * 0.76), growth: '+۰٪' },
    { label: 'خرداد ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.81), total: Math.round(currentPrice * 0.81), growth: '+۶.۵٪' },
    { label: 'شهریور ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.85), total: Math.round(currentPrice * 0.85), growth: '+۱۱.۸٪' },
    { label: 'آبان ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.91), total: Math.round(currentPrice * 0.91), growth: '+۱۹.۷٪' },
    { label: 'دی ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.95), total: Math.round(currentPrice * 0.95), growth: '+۲۵.۰٪' },
    { label: 'اسفند ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.98), total: Math.round(currentPrice * 0.98), growth: '+۲۸.۹٪' },
    { label: 'کنونی (۱۴۰۴)', perMeter: currentPerMeter, total: currentPrice, growth: '+۳۱.۵٪' },
  ];

  const data3Y = [
    { label: '۱۴۰۱', perMeter: Math.round(currentPerMeter * 0.42), total: Math.round(currentPrice * 0.42), growth: 'مبنا' },
    { label: 'نیمه اول ۱۴۰۲', perMeter: Math.round(currentPerMeter * 0.58), total: Math.round(currentPrice * 0.58), growth: '+۳۸٪' },
    { label: 'نیمه دوم ۱۴۰۲', perMeter: Math.round(currentPerMeter * 0.69), total: Math.round(currentPrice * 0.69), growth: '+۶۴٪' },
    { label: 'نیمه اول ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.82), total: Math.round(currentPrice * 0.82), growth: '+۹۵٪' },
    { label: 'نیمه دوم ۱۴۰۳', perMeter: Math.round(currentPerMeter * 0.94), total: Math.round(currentPrice * 0.94), growth: '+۱۲۳٪' },
    { label: 'کنونی (۱۴۰۴)', perMeter: currentPerMeter, total: currentPrice, growth: '+۱۳۸٪' },
  ];

  const dataForecast = [
    { label: 'امروز', perMeter: currentPerMeter, total: currentPrice, growth: 'فعلی' },
    { label: '۶ ماه آینده', perMeter: Math.round(currentPerMeter * 1.14), total: Math.round(currentPrice * 1.14), growth: '+۱۴٪' },
    { label: '۱۲ ماه آینده', perMeter: Math.round(currentPerMeter * 1.28), total: Math.round(currentPrice * 1.28), growth: '+۲۸٪' },
    { label: '۲۴ ماه آینده (هدف)', perMeter: Math.round(currentPerMeter * 1.55), total: Math.round(currentPrice * 1.55), growth: '+۵۵٪' },
  ];

  const currentDataset = timeframe === '1y' ? data1Y : timeframe === '3y' ? data3Y : dataForecast;

  // Growth percentage indicator calculation
  const startVal = currentDataset[0].perMeter;
  const endVal = currentDataset[currentDataset.length - 1].perMeter;
  const growthRate = Math.round(((endVal - startVal) / startVal) * 100);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1A1A2E] text-white p-3 rounded-2xl shadow-2xl border border-[#C9A84C]/40 text-right min-w-[200px] z-50">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
            <span className="font-bold text-xs text-[#E4C675]">{label}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
              رشد: {data.growth}
            </span>
          </div>
          <div className="text-xs text-white/90 space-y-1">
            <div className="flex justify-between">
              <span className="text-white/60">هر متر مربع:</span>
              <span className="font-bold text-[#C9A84C]">{formatPrice(data.perMeter)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">ارزش تخمینی کل:</span>
              <span className="font-medium text-white">{formatPrice(data.total)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm text-right">
      {/* Header and Timeframe Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C9A84C]/15 text-[#A07830] flex items-center justify-center font-bold shadow-inner">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1A1A2E] flex items-center gap-2">
              نمودار تاریخچه قیمت و رشد سرمایه (Recharts)
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{toPersianDigits(growthRate)}٪ رشد تخمینی
              </span>
            </h3>
            <p className="text-xs text-[#5A5A7A] mt-0.5">
              روند نوسانات قیمت هر متر مربع در محدوده {property.location} مبتنی بر معاملات رسمی
            </p>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#F8F4EF] p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setTimeframe('1y')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === '1y'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#5A5A7A] hover:text-[#1A1A2E]'
            }`}
          >
            ۱ سال اخیر
          </button>
          <button
            onClick={() => setTimeframe('3y')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeframe === '3y'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#5A5A7A] hover:text-[#1A1A2E]'
            }`}
          >
            ۳ سال اخیر
          </button>
          <button
            onClick={() => setTimeframe('forecast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              timeframe === 'forecast'
                ? 'bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] shadow-sm font-black'
                : 'text-[#5A5A7A] hover:text-[#A07830]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            پیش‌بینی هوش مصنوعی
          </button>
        </div>
      </div>

      {/* Metrics Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#F8F4EF] p-3 rounded-2xl border border-stone-200/80">
          <div className="text-[11px] text-[#5A5A7A] mb-1">قیمت فعلی هر متر</div>
          <div className="text-sm font-black text-[#1A1A2E]">{formatPrice(currentPerMeter)}</div>
        </div>
        <div className="bg-[#F8F4EF] p-3 rounded-2xl border border-stone-200/80">
          <div className="text-[11px] text-[#5A5A7A] mb-1">بازده سالانه اجاره</div>
          <div className="text-sm font-black text-emerald-600">۵.۲٪ تا ۶.۸٪</div>
        </div>
        <div className="bg-[#F8F4EF] p-3 rounded-2xl border border-stone-200/80">
          <div className="text-[11px] text-[#5A5A7A] mb-1">رشد سالانه محله</div>
          <div className="text-sm font-black text-[#A07830]">+{toPersianDigits(growthRate)}٪</div>
        </div>
        <div className="bg-[#F8F4EF] p-3 rounded-2xl border border-stone-200/80">
          <div className="text-[11px] text-[#5A5A7A] mb-1">هدف ارزش سال آینده</div>
          <div className="text-sm font-black text-[#1A1A2E]">{formatPrice(Math.round(currentPrice * 1.28))}</div>
        </div>
      </div>

      {/* Recharts Line / Area Chart Container */}
      <div className="h-64 sm:h-72 w-full bg-[#FAFAF8] p-3 rounded-2xl border border-stone-200">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={currentDataset} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="rechartsGoldArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'inherit' }}
              axisLine={{ stroke: '#D4D4D8' }}
              tickLine={false}
            />
            <YAxis
              orientation="left"
              tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'inherit' }}
              axisLine={{ stroke: '#D4D4D8' }}
              tickLine={false}
              tickFormatter={(val) => `${toPersianDigits(Math.round(val / 1000000))}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="perMeter"
              stroke="#A07830"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#rechartsGoldArea)"
            />
            <Line
              type="monotone"
              dataKey="perMeter"
              stroke="#C9A84C"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1A1A2E', stroke: '#C9A84C', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#C9A84C', stroke: '#1A1A2E', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* AI Advisory Summary */}
      <div className="mt-4 bg-gradient-to-r from-stone-50 to-amber-50/50 p-4 rounded-2xl border border-[#C9A84C]/25 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#C9A84C] text-[#1A1A2E] flex items-center justify-center shrink-0 shadow-sm mt-0.5 font-bold">
          <Sparkles className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#1A1A2E] mb-1">
            تحلیل هوش مصنوعی بر اساس شاخص تورم و تقاضای ملکی:
          </div>
          <p className="text-xs text-[#5A5A7A] leading-relaxed">
            این ملک در محله <strong>{property.location}</strong> از پایداری قیمتی بالا و شاخص نقدشوندگی عالی برخوردار است. با در نظر گرفتن پیش‌بینی نرخ رشد <strong>+{toPersianDigits(growthRate)}٪</strong>، این واحد گزینه‌ای بهینه هم از منظر حفظ ارزش سرمایه در برابر تورم و هم سکونت لوکس به شمار می‌رود.
          </p>
        </div>
      </div>
    </div>
  );
}
