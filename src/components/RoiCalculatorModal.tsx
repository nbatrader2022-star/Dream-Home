import React, { useState, useMemo } from 'react';
import {
  Calculator,
  X,
  TrendingUp,
  DollarSign,
  Coins,
  Percent,
  Clock,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  Building,
  Hammer,
  HelpCircle,
} from 'lucide-react';
import { Property, RoiInputs, RoiResults } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface RoiCalculatorModalProps {
  initialProperty?: Property | null;
  initialRenovationCost?: number;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string) => void;
}

export function RoiCalculatorModal({
  initialProperty,
  initialRenovationCost,
  isOpen,
  onClose,
  onShowToast,
}: RoiCalculatorModalProps) {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  // Defaults based on property or standard luxury market
  const defaultPurchasePrice = initialProperty?.price || 15000000000;
  const defaultRenovation = initialRenovationCost || (initialProperty ? Math.round(initialProperty.price * 0.08) : 1200000000);
  // Rental estimate: roughly 0.35% to 0.45% of purchase price monthly
  const defaultMonthlyRent = initialProperty?.rentPrice || Math.round(defaultPurchasePrice * 0.0035);

  const [purchasePrice, setPurchasePrice] = useState<number>(defaultPurchasePrice);
  const [renovationCost, setRenovationCost] = useState<number>(defaultRenovation);
  const [monthlyRent, setMonthlyRent] = useState<number>(defaultMonthlyRent);
  const [operatingCostPercent, setOperatingCostPercent] = useState<number>(5); // 5% for maintenance/vacancy
  const [appreciationPercent, setAppreciationPercent] = useState<number>(30); // 30% typical real estate inflation
  const [holdingYears, setHoldingYears] = useState<number>(3); // 1, 3, 5
  const [copied, setCopied] = useState<boolean>(false);

  // Strategy Presets
  const applyPreset = (type: 'flip' | 'hold' | 'luxury_upgrade') => {
    if (type === 'flip') {
      // 1 year flip with heavy renovation
      setHoldingYears(1);
      setRenovationCost(Math.round(purchasePrice * 0.12));
      setAppreciationPercent(38); // high value add
    } else if (type === 'hold') {
      // 5 year long term buy and hold
      setHoldingYears(5);
      setRenovationCost(Math.round(purchasePrice * 0.05));
      setAppreciationPercent(28);
    } else if (type === 'luxury_upgrade') {
      // 3 year balanced
      setHoldingYears(3);
      setRenovationCost(Math.round(purchasePrice * 0.08));
      setMonthlyRent(Math.round(purchasePrice * 0.0042));
      setAppreciationPercent(32);
    }
  };

  // Perform Calculations
  const results: RoiResults = useMemo(() => {
    const acquisitionFees = purchasePrice * 0.015; // 1.5% commission & deed transfer
    const totalInitialInvestment = purchasePrice + renovationCost + acquisitionFees;

    const grossAnnualRentalIncome = monthlyRent * 12;
    const annualOperatingExpenses = grossAnnualRentalIncome * (operatingCostPercent / 100);
    const netAnnualOperatingIncome = Math.max(0, grossAnnualRentalIncome - annualOperatingExpenses);

    const netRentalYieldPercent = totalInitialInvestment > 0
      ? (netAnnualOperatingIncome / totalInitialInvestment) * 100
      : 0;

    // Appreciation compounded over holding years
    // Renovation also gives an immediate boost of +25% of the renovation cost to property value
    const postRenovationBaseValue = purchasePrice + renovationCost * 1.35;
    const growthMultiplier = Math.pow(1 + appreciationPercent / 100, holdingYears);
    const futurePropertyValue = Math.round(postRenovationBaseValue * growthMultiplier);

    const capitalGain = Math.max(0, futurePropertyValue - totalInitialInvestment);
    const totalRentalIncomeOverPeriod = netAnnualOperatingIncome * holdingYears;
    const totalProfit = capitalGain + totalRentalIncomeOverPeriod;

    const annualizedRoiPercent = totalInitialInvestment > 0
      ? (Math.pow(1 + totalProfit / totalInitialInvestment, 1 / holdingYears) - 1) * 100
      : 0;

    const paybackPeriodYears = netAnnualOperatingIncome > 0
      ? Math.round((totalInitialInvestment / netAnnualOperatingIncome) * 10) / 10
      : 0;

    return {
      totalInitialInvestment,
      grossAnnualRentalIncome,
      netAnnualOperatingIncome,
      netRentalYieldPercent,
      futurePropertyValue,
      capitalGain,
      totalProfit,
      annualizedRoiPercent,
      paybackPeriodYears,
    };
  }, [purchasePrice, renovationCost, monthlyRent, operatingCostPercent, appreciationPercent, holdingYears]);

  const handleCopySummary = () => {
    const text = `تحلیل بازده سرمایه‌گذاری (ROI) - خانه آرمانی
قیمت خرید ملک: ${formatPrice(purchasePrice)}
هزینه بازسازی: ${formatPrice(renovationCost)}
کل سرمایه اولیه: ${formatPrice(results.totalInitialInvestment)}
اجاره ماهانه: ${formatPrice(monthlyRent)}
بازده نقدی سالانه اجاره: ${toPersianDigits(results.netRentalYieldPercent.toFixed(1))}٪
ارزش پیش‌بینی‌شده ملک پس از ${toPersianDigits(holdingYears)} سال: ${formatPrice(results.futurePropertyValue)}
سود کل دوره: ${formatPrice(results.totalProfit)}
نرخ بازگشت سرمایه سالانه (ROI): ${toPersianDigits(results.annualizedRoiPercent.toFixed(1))}٪`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('کپی شد', 'گزارش ارزیابی سرمایه‌گذاری در کلیپ‌بورد کپی شد.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[75] overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl my-auto max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col text-right">
        {/* Header */}
        <div className="bg-[#1A1A2E] text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A07830] to-[#E4C675] text-[#1A1A2E] flex items-center justify-center font-black shadow-md">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  محاسبه‌گر حرفه‌ای بازده سرمایه‌گذاری ملکی (ROI Calculator)
                </h2>
                {initialProperty && (
                  <span className="text-[11px] bg-[#C9A84C]/20 text-[#E4C675] border border-[#C9A84C]/30 px-2.5 py-0.5 rounded-full font-bold">
                    اختصاصی برای: {initialProperty.title.slice(0, 24)}...
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                شبیه‌سازی بازده کل، درآمد اجاره، رشد ارزش افزوده ناشی از بازسازی و بازگشت سرمایه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد' : 'کپی خلاصه'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              title="چاپ گزارش"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Strategy Presets Bar */}
        <div className="bg-[#F8F4EF] px-5 sm:px-6 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <span className="font-bold text-[#1A1A2E] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            الگوهای سرمایه‌گذاری سریع:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset('flip')}
              className="bg-white hover:bg-stone-100 text-[#1A1A2E] px-3 py-1.5 rounded-xl border border-stone-200 font-bold transition-colors"
            >
              استراتژی فلیپ (خرید، بازسازی و فروش ۱ ساله)
            </button>
            <button
              onClick={() => applyPreset('luxury_upgrade')}
              className="bg-white hover:bg-stone-100 text-[#1A1A2E] px-3 py-1.5 rounded-xl border border-stone-200 font-bold transition-colors"
            >
              ارتقای لوکس و رهن ۳ ساله
            </button>
            <button
              onClick={() => applyPreset('hold')}
              className="bg-white hover:bg-stone-100 text-[#1A1A2E] px-3 py-1.5 rounded-xl border border-stone-200 font-bold transition-colors"
            >
              نگهداری بلندمدت ۵ ساله (Buy & Hold)
            </button>
          </div>
        </div>

        {/* Main Content: 2-Column Responsive Layout */}
        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7 overflow-y-auto flex-1">
          {/* Left / Input Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Input: Purchase Price */}
            <div className="bg-[#F8F4EF] p-4 sm:p-5 rounded-2xl border border-stone-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#C9A84C]" />
                  قیمت خرید ملک (Purchase Price)
                </label>
                <span className="text-sm font-black text-[#A07830]">
                  {formatPrice(purchasePrice)}
                </span>
              </div>
              <input
                type="range"
                min="3000000000"
                max="60000000000"
                step="500000000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full accent-[#C9A84C]"
              />
              <div className="flex justify-between text-[11px] text-[#5A5A7A] mt-1 font-mono">
                <span>۳ میلیارد</span>
                <span>۳۰ میلیارد</span>
                <span>۶۰ میلیارد تومان</span>
              </div>
            </div>

            {/* Input: Renovation Cost */}
            <div className="bg-[#F8F4EF] p-4 sm:p-5 rounded-2xl border border-stone-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
                  <Hammer className="w-4 h-4 text-[#A07830]" />
                  هزینه‌های بازسازی و نوسازی لوکس (Renovation)
                </label>
                <span className="text-sm font-black text-amber-700">
                  {renovationCost === 0 ? 'بدون بازسازی' : formatPrice(renovationCost)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="6000000000"
                step="100000000"
                value={renovationCost}
                onChange={(e) => setRenovationCost(Number(e.target.value))}
                className="w-full accent-[#A07830]"
              />
              <div className="flex justify-between text-[11px] text-[#5A5A7A] mt-1 font-mono">
                <span>۰</span>
                <span>۳ میلیارد</span>
                <span>۶ میلیارد تومان</span>
              </div>
            </div>

            {/* Input: Expected Monthly Rent */}
            <div className="bg-[#F8F4EF] p-4 sm:p-5 rounded-2xl border border-stone-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  اجاره ماهانه پیش‌بینی‌شده (Monthly Rental Yield)
                </label>
                <span className="text-sm font-black text-emerald-800">
                  {formatPrice(monthlyRent)} / ماه
                </span>
              </div>
              <input
                type="range"
                min="10000000"
                max="300000000"
                step="5000000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-[#5A5A7A] mt-1 font-mono">
                <span>۱۰ میلیون</span>
                <span>۱۵۰ میلیون</span>
                <span>۳۰۰ میلیون تومان</span>
              </div>
            </div>

            {/* Two Column Sliders: Appreciation & Holding Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Annual Appreciation Rate */}
              <div className="bg-[#F8F4EF] p-4 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-[#1A1A2E]">
                  <span>نرخ رشد سالانه ملک:</span>
                  <span className="text-[#A07830] font-black">{toPersianDigits(appreciationPercent)}٪ سالانه</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={appreciationPercent}
                  onChange={(e) => setAppreciationPercent(Number(e.target.value))}
                  className="w-full accent-[#C9A84C]"
                />
                <div className="text-[10px] text-[#5A5A7A] mt-1">
                  میانگین تورم ملکی مناطق ۱ و ۲ تهران: ۳۰٪ تا ۳۵٪
                </div>
              </div>

              {/* Holding Years */}
              <div className="bg-[#F8F4EF] p-4 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-[#1A1A2E]">
                  <span>افق زمانی سرمایه‌گذاری:</span>
                  <span className="text-[#1A1A2E] font-black">{toPersianDigits(holdingYears)} سال</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[1, 3, 5].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setHoldingYears(yr)}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        holdingYears === yr
                          ? 'bg-[#1A1A2E] text-[#E4C675] shadow-sm'
                          : 'bg-white hover:bg-stone-100 text-[#1A1A2E] border border-stone-200'
                      }`}
                    >
                      {toPersianDigits(yr)} ساله
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right / Results Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Primary Highlight Card */}
            <div className="bg-gradient-to-br from-[#1A1A2E] to-[#252542] text-white p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-[#C9A84C]/10 blur-2xl pointer-events-none" />

              <div className="text-xs font-bold text-[#E4C675] flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4" />
                نرخ کل بازگشت سرمایه سالانه (Annualized ROI)
              </div>

              <div className="text-4xl font-black text-white my-2 tracking-tight flex items-baseline gap-2">
                <span>{toPersianDigits(results.annualizedRoiPercent.toFixed(1))}٪</span>
                <span className="text-xs text-emerald-400 font-normal">در سال</span>
              </div>

              <div className="text-xs text-white/70 mt-1">
                سود خالص پیش‌بینی‌شده کل دوره ({toPersianDigits(holdingYears)} سال):
                <span className="text-[#E4C675] font-bold mr-1">
                  +{formatPrice(results.totalProfit)}
                </span>
              </div>

              {/* Progress Bar Representation */}
              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-white/60 text-[11px] mb-0.5">کل سرمایه‌گذاری اولیه</div>
                  <div className="font-bold text-white text-sm">
                    {formatPrice(results.totalInitialInvestment)}
                  </div>
                </div>
                <div>
                  <div className="text-white/60 text-[11px] mb-0.5">ارزش آتی تخمینی ملک</div>
                  <div className="font-bold text-[#E4C675] text-sm">
                    {formatPrice(results.futurePropertyValue)}
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Rental Yield */}
              <div className="bg-[#F8F4EF] p-4 rounded-2xl border border-stone-200">
                <div className="text-[11px] text-[#5A5A7A] mb-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#C9A84C]" />
                  بازده نقدی اجاره (Yield)
                </div>
                <div className="text-lg font-black text-[#1A1A2E]">
                  {toPersianDigits(results.netRentalYieldPercent.toFixed(1))}٪ سالانه
                </div>
                <div className="text-[10px] text-[#5A5A7A] mt-0.5">
                  خالص: {formatPrice(results.netAnnualOperatingIncome)} / سال
                </div>
              </div>

              {/* Payback Period */}
              <div className="bg-[#F8F4EF] p-4 rounded-2xl border border-stone-200">
                <div className="text-[11px] text-[#5A5A7A] mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#A07830]" />
                  دوره بازگشت سرمایه
                </div>
                <div className="text-lg font-black text-[#1A1A2E]">
                  {toPersianDigits(results.paybackPeriodYears)} سال
                </div>
                <div className="text-[10px] text-[#5A5A7A] mt-0.5">
                  صرفاً از محل سود اجاره
                </div>
              </div>
            </div>

            {/* Benchmark Comparison with other markets */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-xs">
              <div className="font-bold text-[#1A1A2E] mb-2.5 flex items-center justify-between">
                <span>مقایسه بازده با بازارهای موازی:</span>
                <span className="text-[11px] text-[#A07830]">برآورد ۳ ساله</span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-bold text-[#1A1A2E]">املاک لوکس (با بازسازی آرمانی):</span>
                    <span className="font-black text-emerald-700">
                      {toPersianDigits(results.annualizedRoiPercent.toFixed(1))}٪
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, results.annualizedRoiPercent * 1.5)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#5A5A7A]">سپرده بلندمدت بانکی:</span>
                    <span className="font-bold text-stone-600">۲۲.۵٪</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-400 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#5A5A7A]">صندوق‌های درآمد ثابت و طلا:</span>
                    <span className="font-bold text-stone-600">۲۸.۰٪</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Advisory Note */}
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">مزیت بازسازی با خانه آرمانی:</span> بازسازی اصولی و نوسازی آشپزخانه و مشاعات می‌تواند تا ۳۵٪ به قیمت فروش مجدد افزوده و نرخ پر شدن مستأجر را ۳ برابر سریع‌تر کند.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
