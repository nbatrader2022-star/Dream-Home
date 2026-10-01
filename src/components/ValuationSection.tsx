import React, { useState } from 'react';
import { CheckCircle2, Clock, Lock, Star, Calculator, Send, AlertCircle, Building } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { SUPPORTED_CITIES_LIST } from '../data/additionalCityProperties';

export function ValuationSection() {
  const [activeTab, setActiveTab] = useState<'instant' | 'expert'>('instant');

  // Instant Estimator State
  const [city, setCity] = useState<string>('tehran');
  const [propType, setPropType] = useState<string>('apartment');
  const [area, setArea] = useState<number>(140);
  const [age, setAge] = useState<number>(2);
  const [condition, setCondition] = useState<'luxury' | 'renovated' | 'standard'>('luxury');
  const [hasParking, setHasParking] = useState<boolean>(true);
  const [hasElevator, setHasElevator] = useState<boolean>(true);

  // In-Person Expert Form State
  const [fName, setFName] = useState<string>('');
  const [fPhone, setFPhone] = useState<string>('');
  const [fType, setFType] = useState<string>('آپارتمان');
  const [fCity, setFCity] = useState<string>('تهران');
  const [fNote, setFNote] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Calculate instant valuation estimate
  const getBaseMeterPrice = () => {
    const cityData = SUPPORTED_CITIES_LIST.find((c) => c.key === city);
    let base = 60000000;
    if (city === 'tehran') {
      base = 85000000;
    } else if (cityData?.avgPricePerMeter) {
      const match = cityData.avgPricePerMeter.match(/\d+/);
      if (match) {
        base = parseInt(match[0], 10) * 1000000;
      }
    }
    if (propType === 'villa') return Math.round(base * 1.25);
    if (propType === 'penthouse') return Math.round(base * 1.45);
    return base;
  };

  const basePricePerMeter = getBaseMeterPrice();
  const conditionFactor = condition === 'luxury' ? 1.2 : condition === 'renovated' ? 1.08 : 0.95;
  const ageFactor = Math.max(1 - age * 0.015, 0.7);
  const amenitiesBonus = (hasParking ? 1.04 : 1) * (hasElevator ? 1.03 : 1);

  const estimatedMeterPrice = Math.round(basePricePerMeter * conditionFactor * ageFactor * amenitiesBonus);
  const fairMarketTotal = estimatedMeterPrice * area;
  const minMarketTotal = Math.round(fairMarketTotal * 0.92);
  const maxMarketTotal = Math.round(fairMarketTotal * 1.08);

  const handleExpertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fName.trim() || fName.trim().length < 2) {
      setFormError('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    const cleanPhone = fPhone.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/[-\s]/g, '');
    if (!cleanPhone.match(/^0?9[0-9]{9}$/)) {
      setFormError('شماره موبایل وارد شده معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).');
      return;
    }

    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
    }, 1200);
  };

  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-[#1A1A2E] to-[#0F3460] overflow-hidden text-right" id="contact">
      {/* Background Radial Glow */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column (Brand Content) */}
        <div className="text-white">
          <span className="inline-block bg-[#C9A84C]/20 text-[#E4C675] text-[11px] font-bold tracking-widest px-3.5 py-1 rounded-full border border-[#C9A84C]/35 mb-5">
            ارزیابی رایگان و کارشناسی
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-5">
            ارزش واقعی ملکت را{' '}
            <span className="bg-gradient-to-r from-[#A07830] via-[#E4C675] to-[#C9A84C] bg-clip-text text-transparent">
              رایگان
            </span>{' '}
            بدان
          </h2>

          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-lg">
            با بیش از ۲۰ سال سابقه و رصد روزانه معاملات قطعی، سامانه و کارشناسان خانه آرمانی دقیق‌ترین ارزش‌گذاری را در اختیارتان قرار می‌دهند.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs text-white/75">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>کاملاً رایگان و بدون تعهد</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>پاسخ کارشناسی در ۲۴ ساعت</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>حفظ محرمانگی کامل اطلاعات</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>۴.۹ امتیاز رضایت از ۵۰۰۰ کاربر</span>
            </div>
          </div>
        </div>

        {/* Right Column (Dual Mode Valuation Card) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#F8F4EF] p-1.5 rounded-2xl mb-6 border border-[#EDE8E0]">
            <button
              onClick={() => setActiveTab('instant')}
              style={{ fontSize: '10px' }}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'instant'
                  ? 'bg-[#1A1A2E] text-white shadow-md'
                  : 'text-[#5A5A7A] hover:text-[#1A1A2E]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-[#C9A84C]" />
              ارزیابی هوشمند آنلاین
            </button>
            <button
              onClick={() => setActiveTab('expert')}
              style={{ fontSize: '10px' }}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'expert'
                  ? 'bg-[#1A1A2E] text-white shadow-md'
                  : 'text-[#5A5A7A] hover:text-[#1A1A2E]'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-[#C9A84C]" />
              درخواست کارشناسی حضوری
            </button>
          </div>

          {activeTab === 'instant' ? (
            /* Tab 1: Instant Algorithmic Estimator */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">شهر:</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#C9A84C]"
                  >
                    {SUPPORTED_CITIES_LIST.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.nameFa} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">نوع ملک:</label>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value)}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#C9A84C]"
                  >
                    <option value="apartment">آپارتمان</option>
                    <option value="villa">ویلا</option>
                    <option value="penthouse">پنت‌هاوس</option>
                  </select>
                </div>

                {/* Area Slider */}
                <div className="col-span-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-[#1A1A2E]">متراژ:</span>
                    <span className="font-black text-[#A07830]">{toPersianDigits(area)} مترمربع</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="5"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full accent-[#C9A84C]"
                  />
                </div>

                {/* Building Age */}
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">سن بنا:</label>
                  <select
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#C9A84C]"
                  >
                    <option value="0">نوساز کلید نخورده</option>
                    <option value="2">تا ۳ سال</option>
                    <option value="6">۴ تا ۱۰ سال</option>
                    <option value="12">بالای ۱۰ سال</option>
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">وضعیت معماری:</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#C9A84C]"
                  >
                    <option value="luxury">سوپرلوکس و متریال برند</option>
                    <option value="renovated">بازسازی شده شیک</option>
                    <option value="standard">معمولی و سالم</option>
                  </select>
                </div>
              </div>

              {/* Result Showcase */}
              <div className="bg-[#1A1A2E] text-white p-5 rounded-2xl shadow-xl mt-4 text-center">
                <div className="text-xs text-[#E4C675] font-bold mb-1">
                  ارزش تخمینی منصفانه بازار
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-2">
                  {formatPrice(fairMarketTotal)}
                </div>
                <div className="flex justify-center gap-4 text-[11px] text-white/60 border-t border-white/10 pt-2.5">
                  <span>کف قیمت: <strong className="text-white">{formatPrice(minMarketTotal)}</strong></span>
                  <span>سقف قیمت: <strong className="text-white">{formatPrice(maxMarketTotal)}</strong></span>
                </div>
                <div className="text-[10px] text-[#C9A84C] mt-2">
                  متوسط هر متر مربع: {formatPrice(estimatedMeterPrice)}
                </div>
              </div>

              <p className="text-[10px] text-[#9A9AB0] text-center leading-relaxed">
                * این برآورد بر اساس مدل محاسباتی هوشمند بوده و صرفاً جهت تقریب اولیه قیمت بازار ارائه شده است.
              </p>
            </div>
          ) : formSubmitted ? (
            /* Tab 2: Expert Form Submitted State */
            <div className="text-center py-10 animate-bounceIn">
              <div className="w-16 h-16 rounded-full bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">
                درخواست کارشناسی شما ثبت شد!
              </h3>
              <p className="text-xs text-[#5A5A7A] max-w-sm mx-auto leading-relaxed mb-6">
                کارشناس رسمی مسکن منطقه ظرف ۲۴ ساعت آینده جهت بازدید ملک و بررسی مدارک ثبتی با شماره شما هماهنگی خواهد کرد.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="bg-[#1A1A2E] text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-[#0F3460] transition-colors"
              >
                ثبت درخواست دیگر
              </button>
            </div>
          ) : (
            /* Tab 2: Expert In-Person Appraisal Form (From original HTML) */
            <form onSubmit={handleExpertSubmit} className="space-y-3.5">
              <div className="text-xs font-bold text-[#1A1A2E] mb-1">
                اطلاعات متقاضی و ملک:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    placeholder="مثال: علی محمدی"
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs text-[#1A1A2E] outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">شماره موبایل</label>
                  <input
                    type="tel"
                    required
                    value={fPhone}
                    onChange={(e) => setFPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs text-[#1A1A2E] outline-none focus:border-[#C9A84C]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">نوع ملک</label>
                  <select
                    value={fType}
                    onChange={(e) => setFType(e.target.value)}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#C9A84C]"
                  >
                    <option>آپارتمان</option>
                    <option>ویلا</option>
                    <option>تجاری</option>
                    <option>زمین و کلنگی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">شهر</label>
                  <select
                    value={fCity}
                    onChange={(e) => setFCity(e.target.value)}
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#C9A84C]"
                  >
                    <option>تهران</option>
                    <option>کرج</option>
                    <option>اصفهان</option>
                    <option>شیراز</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">توضیحات تکمیلی (اختیاری)</label>
                  <input
                    type="text"
                    value={fNote}
                    onChange={(e) => setFNote(e.target.value)}
                    placeholder="مثال: آپارتمان ۱۶۰ متری در فرشته، طبقه پنجم با ویو..."
                    className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3 py-2 text-xs text-[#1A1A2E] outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              {formError && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl font-bold">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-60"
              >
                {formLoading ? 'در حال ارسال اطلاعات...' : 'ارسال درخواست ارزیابی رایگان'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
