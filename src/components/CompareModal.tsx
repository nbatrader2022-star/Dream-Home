import React, { useMemo } from 'react';
import { X, Scale, Trash2, CheckCircle2, Eye, Sparkles, Award, TrendingUp, Calendar } from 'lucide-react';
import { Property } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface CompareModalProps {
  properties: Property[];
  onClose: () => void;
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectProperty: (property: Property) => void;
}

export function CompareModal({
  properties,
  onClose,
  onRemoveFromCompare,
  onClearCompare,
  onSelectProperty,
}: CompareModalProps) {
  useLockBodyScroll(true);

  if (properties.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#F8F4EF] text-[#1A1A2E] w-full max-w-md p-8 rounded-3xl text-center shadow-2xl border border-white/20">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/20 text-[#A07830] flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">لیست مقایسه خالی است</h3>
          <p className="text-xs text-[#5A5A7A] leading-relaxed mb-6">
            شما می‌توانید با کلیک روی آیکون ترازو در هر کارت ملک، تا ۴ ملک را هم‌زمان با یکدیگر از نظر متراژ، قیمت هر متر و مشاعات مقایسه نمایید.
          </p>
          <button
            onClick={onClose}
            className="bg-[#1A1A2E] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#0F3460] transition-colors cursor-pointer"
          >
            بستن و انتخاب ملک‌ها
          </button>
        </div>
      </div>
    );
  }

  // All unique amenities across compared properties
  const allAmenities = Array.from(
    new Set(properties.flatMap((p) => p.amenities || []))
  ).slice(0, 10);

  // AI Recommendation Engine
  const aiRecommendation = useMemo(() => {
    if (properties.length < 2) return null;

    // Calculate score for each property
    const scored = properties.map((prop) => {
      const pricePerMeter = prop.price / (prop.area || 1);
      const amenitiesCount = (prop.amenities || []).length;
      const agePenalty = (prop.buildingAge || 0) * 1.5;
      const parkingBonus = (prop.parking || 0) * 2;
      
      // Calculate normalized value score
      // lower pricePerMeter is better, more amenities better, lower age better
      const baseScore = 80;
      const amenityScore = Math.min(amenitiesCount * 3, 20);
      const score = Math.round(baseScore + amenityScore + parkingBonus - agePenalty);

      return {
        property: prop,
        pricePerMeter,
        score: Math.max(75, Math.min(98, score)),
      };
    });

    // Sort by calculated score
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const secondBest = scored[1];

    let reason = '';
    if (best.pricePerMeter < secondBest.pricePerMeter) {
      reason = `این ملک به ازای هر متر مربع قیمت مناسب‌تری ارائه می‌دهد و در کنار ${(best.property.amenities || []).length} آیتم رفاهی، بالاترین ارزش افزوده و توجیه اقتصادی را دارد.`;
    } else if ((best.property.amenities || []).length > (secondBest.property.amenities || []).length) {
      reason = `این ملک بالاترین سطح امکانات رفاهی (${(best.property.amenities || []).length} آپشن لوکس) و مشاعات ممتاز را در اختیار شما قرار می‌دهد.`;
    } else {
      reason = `ترکیب متراژ، سن بنای کم و پارکینگ سندی، این گزینه را به انتخاب اول خریداران هوشمند تبدیل کرده است.`;
    }

    return {
      bestProperty: best.property,
      score: best.score,
      reason,
      scoredMap: new Map(scored.map((s) => [s.property.id, s.score])),
    };
  }, [properties]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#F8F4EF] text-[#1A1A2E] w-full max-w-6xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/20 text-right">
        {/* Header */}
        <div className="bg-[#1A1A2E] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9A84C] text-[#1A1A2E] flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                مقایسه تحلیلی املاک منتخب ({toPersianDigits(properties.length)} مورد)
              </h2>
              <p className="text-[11px] text-white/60">
                بررسی موشکافانه قیمت هر متر، استانداردهای معماری و پیشنهاد مشاور هوشمند
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClearCompare}
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف همه
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        {aiRecommendation && (
          <div className="bg-gradient-to-r from-[#1A1A2E] via-[#242442] to-[#1A1A2E] border-b border-[#C9A84C]/30 px-6 py-3.5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#C9A84C] text-[#1A1A2E] flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#E4C675]">پیشنهاد تحلیلی مشاور هوشمند:</span>
                  <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
                    {aiRecommendation.bestProperty.title}
                  </span>
                  <span className="text-[10px] bg-[#C9A84C]/20 text-[#E4C675] border border-[#C9A84C]/40 px-2 py-0.5 rounded-full font-bold">
                    امتیاز ارزش خرید: {toPersianDigits(aiRecommendation.score)} از ۱۰۰
                  </span>
                </div>
                <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                  {aiRecommendation.reason}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onSelectProperty(aiRecommendation.bestProperty);
              }}
              className="bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E] text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              بررسی ملک منتخب
            </button>
          </div>
        )}

        {/* Comparison Table / Matrix (Scrollable) */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="min-w-[700px]">
            {/* Properties Top Row */}
            <div className="grid grid-cols-5 gap-4 pb-6 border-b border-stone-200">
              <div className="flex flex-col justify-end p-2">
                <span className="text-xs font-bold text-[#5A5A7A] uppercase">
                  معیار مقایسه
                </span>
                <span className="text-[11px] text-[#9A9AB0]">
                  مشخصات سازه‌ای و اسناد
                </span>
              </div>

              {properties.map((prop) => {
                const isBest = aiRecommendation?.bestProperty.id === prop.id;
                const propScore = aiRecommendation?.scoredMap.get(prop.id);

                return (
                  <div
                    key={prop.id}
                    className={`bg-white p-3.5 rounded-2xl border transition-all relative ${
                      isBest
                        ? 'border-[#C9A84C] shadow-md ring-2 ring-[#C9A84C]/30 bg-amber-50/20'
                        : 'border-stone-200 shadow-sm'
                    }`}
                  >
                    {isBest && (
                      <div className="absolute -top-2.5 right-3 bg-[#C9A84C] text-[#1A1A2E] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                        گزینه برتر AI
                      </div>
                    )}

                    <button
                      onClick={() => onRemoveFromCompare(prop.id)}
                      title="حذف این ملک"
                      className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors text-xs cursor-pointer z-10"
                    >
                      ✕
                    </button>
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-full h-28 object-cover rounded-xl mb-2.5"
                    />
                    <h4 className="font-bold text-xs text-[#1A1A2E] line-clamp-1 mb-1">
                      {prop.title}
                    </h4>
                    <div className="text-xs font-black text-[#A07830] mb-2">
                      {formatPrice(prop.price)}
                    </div>
                    {propScore && (
                      <div className="flex items-center justify-between text-[11px] bg-stone-100 px-2 py-1 rounded-lg mb-2 text-[#5A5A7A]">
                        <span>شاخص ارزش:</span>
                        <span className="font-black text-[#1A1A2E]">{toPersianDigits(propScore)}%</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProperty(prop);
                      }}
                      className={`w-full text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        isBest
                          ? 'bg-[#C9A84C] hover:bg-[#E4C675] text-[#1A1A2E]'
                          : 'bg-[#1A1A2E] hover:bg-[#0F3460] text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      مشاهده جزییات
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Metrics Rows */}
            <div className="divide-y divide-stone-200 text-xs">
              {/* Metric: Location */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center">
                <div className="text-[#5A5A7A] font-bold">موقعیت و منطقه</div>
                {properties.map((p) => (
                  <div key={p.id} className="text-[#1A1A2E] font-bold">
                    {p.location}
                  </div>
                ))}
              </div>

              {/* Metric: Area */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center">
                <div className="text-[#5A5A7A] font-bold">متراژ مسکونی</div>
                {properties.map((p) => (
                  <div key={p.id} className="text-[#1A1A2E] font-black">
                    {toPersianDigits(p.area)} متر مربع
                  </div>
                ))}
              </div>

              {/* Metric: Price Per Meter */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center bg-[#C9A84C]/5">
                <div className="text-[#A07830] font-bold">قیمت هر متر مربع</div>
                {properties.map((p) => {
                  const perMeter = Math.round(p.price / (p.area || 1));
                  return (
                    <div key={p.id} className="text-[#A07830] font-black">
                      {formatPrice(perMeter)}
                    </div>
                  );
                })}
              </div>

              {/* Metric: Bedrooms */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center">
                <div className="text-[#5A5A7A] font-bold">تعداد اتاق خواب</div>
                {properties.map((p) => (
                  <div key={p.id} className="text-[#1A1A2E]">
                    {p.bedrooms > 0 ? `${toPersianDigits(p.bedrooms)} خوابه` : '—'}
                  </div>
                ))}
              </div>

              {/* Metric: Bathrooms */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center">
                <div className="text-[#5A5A7A] font-bold">سرویس بهداشتی و حمام</div>
                {properties.map((p) => (
                  <div key={p.id} className="text-[#1A1A2E]">
                    {p.bathrooms > 0 ? `${toPersianDigits(p.bathrooms)} سرویس` : '—'}
                  </div>
                ))}
              </div>

              {/* Metric: Parking */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center">
                <div className="text-[#5A5A7A] font-bold">ظرفیت پارکینگ سندی</div>
                {properties.map((p) => (
                  <div key={p.id} className="text-[#1A1A2E]">
                    {p.parking > 0 ? `${toPersianDigits(p.parking)} جای پارک` : 'فاقد پارکینگ'}
                  </div>
                ))}
              </div>

              {/* Metric: Floor */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center">
                <div className="text-[#5A5A7A] font-bold">طبقه / کل طبقات</div>
                {properties.map((p) => (
                  <div key={p.id} className="text-[#1A1A2E]">
                    {p.floor > 0
                      ? `طبقه ${toPersianDigits(p.floor)} از ${toPersianDigits(p.totalFloors)}`
                      : 'ویلایی'}
                  </div>
                ))}
              </div>

              {/* Metric: Age */}
              <div className="grid grid-cols-5 py-3.5 font-medium items-center">
                <div className="text-[#5A5A7A] font-bold">سن بنا</div>
                {properties.map((p) => (
                  <div key={p.id} className="text-[#1A1A2E]">
                    {p.buildingAge === 0 ? 'نوساز کلید نخورده' : `${toPersianDigits(p.buildingAge)} سال`}
                  </div>
                ))}
              </div>

              {/* Amenities Check Matrix */}
              {allAmenities.map((amenity, idx) => (
                <div key={idx} className="grid grid-cols-5 py-2.5 items-center">
                  <div className="text-[#5A5A7A]">{amenity}</div>
                  {properties.map((p) => {
                    const hasIt = p.amenities?.includes(amenity);
                    return (
                      <div key={p.id}>
                        {hasIt ? (
                          <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> دارد
                          </span>
                        ) : (
                          <span className="text-[#9A9AB0]">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
