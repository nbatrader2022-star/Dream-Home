import React, { useState } from 'react';
import { X, Calculator, DollarSign, Calendar, Percent, PieChart, ShieldCheck } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface MortgageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrice?: number;
}

export function MortgageCalculatorModal({
  isOpen,
  onClose,
  defaultPrice = 18000000000,
}: MortgageCalculatorModalProps) {
  const [price, setPrice] = useState<number>(defaultPrice);
  const [downPercent, setDownPercent] = useState<number>(30); // 30%
  const [interestRate, setInterestRate] = useState<number>(23); // 23%
  const [durationYears, setDurationYears] = useState<number>(10); // 10 years

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const downPayment = (price * downPercent) / 100;
  const loanAmount = Math.max(price - downPayment, 0);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = durationYears * 12;

  const monthlyInstallment =
    loanAmount > 0 && monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  const totalRepayment = monthlyInstallment * totalMonths;
  const totalInterest = Math.max(totalRepayment - loanAmount, 0);
  const minRequiredIncome = monthlyInstallment * 2.2; // Bank guideline: max 45% DTI

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 text-right animate-fadeIn">
      <div className="bg-[#F8F4EF] text-[#1A1A2E] w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative my-auto">
        {/* Header */}
        <div className="bg-[#1A1A2E] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9A84C] text-[#1A1A2E] flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">محاسبه‌گر حرفه‌ای وام و تسهیلات مسکن</h3>
              <p className="text-[11px] text-white/50">
                برآورد فوری اقساط ماهانه، سود بانکی و توان بازپرداخت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content - Scrollable container */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto flex-1">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Property Price Input */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label className="font-bold text-[#1A1A2E]">ارزش کل ملک:</label>
                <span className="font-black text-[#A07830] text-sm">
                  {formatPrice(price)}
                </span>
              </div>
              <input
                type="range"
                min="1000000000"
                max="80000000000"
                step="500000000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-[#C9A84C]"
              />
              <div className="flex justify-between text-[10px] text-[#9A9AB0] mt-1">
                <span>۱ میلیارد تومان</span>
                <span>۴۰ میلیارد</span>
                <span>۸۰ میلیارد تومان</span>
              </div>
            </div>

            {/* Down Payment Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label className="font-bold text-[#1A1A2E]">
                  پیش‌پرداخت نقد: ({toPersianDigits(downPercent)}٪)
                </label>
                <span className="font-bold text-[#1A1A2E]">
                  {formatPrice(downPayment)}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={downPercent}
                onChange={(e) => setDownPercent(Number(e.target.value))}
                className="w-full accent-[#C9A84C]"
              />
            </div>

            {/* Loan Duration */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label className="font-bold text-[#1A1A2E]">
                  مدت بازپرداخت: ({toPersianDigits(durationYears)} سال)
                </label>
                <span className="font-bold text-[#1A1A2E]">
                  {toPersianDigits(totalMonths)} قسط ماهانه
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className="w-full accent-[#C9A84C]"
              />
            </div>

            {/* Interest Rate Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#1A1A2E] mb-2">
                نرخ سود سالانه تسهیلات بانکی:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[18, 21, 23, 25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setInterestRate(rate)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      interestRate === rate
                        ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#A07830]'
                        : 'border-stone-200 bg-white text-[#5A5A7A]'
                    }`}
                  >
                    {toPersianDigits(rate)}٪ سالانه
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-[#1A1A2E] text-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="text-center pb-4 border-b border-white/10">
              <div className="text-xs text-white/60 mb-1">مبلغ قسط ماهیانه</div>
              <div className="text-3xl font-black text-[#E4C675] tracking-tight">
                {formatPrice(Math.round(monthlyInstallment))}
              </div>
              <div className="text-[11px] text-white/40 mt-1">
                حداقل درآمد ماهانه پیشنهادی خانوار: {formatPrice(Math.round(minRequiredIncome))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-white/50 text-[10px] mb-1">اصل مبلغ وام</div>
                <div className="font-bold text-white text-sm">
                  {formatPrice(loanAmount)}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-white/50 text-[10px] mb-1">کل سود بانکی</div>
                <div className="font-bold text-[#E4C675] text-sm">
                  {formatPrice(Math.round(totalInterest))}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-white/50 text-[10px] mb-1">مجموع کل بازپرداخت</div>
                <div className="font-bold text-white text-sm">
                  {formatPrice(Math.round(totalRepayment))}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Guidance Footer */}
          <div className="flex items-center gap-2 text-xs text-[#5A5A7A] bg-white p-3.5 rounded-xl border border-stone-200">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span>
              محاسبات بر اساس فرمول رسمی بانک مرکزی ایران است. شرایط دقیق متناسب با مصوبات شعب هر بانک متفاوت خواهد بود.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#1A1A2E] text-white text-xs font-bold py-3.5 rounded-xl hover:bg-[#0F3460] transition-colors"
          >
            بستن پنجره محاسبه‌گر
          </button>
        </div>
      </div>
    </div>
  );
}
