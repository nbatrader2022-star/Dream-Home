import React, { useState, useRef } from 'react';
import { MapPin, TrendingUp, ArrowLeft, Building2, ChevronRight, ChevronLeft, Eye, BedDouble, Bath, Maximize2, Sparkles } from 'lucide-react';
import { NEIGHBORHOODS_DATA } from '../data/neighborhoods';
import { SUPPORTED_CITIES_LIST, CityMeta } from '../data/additionalCityProperties';
import { PROPERTIES_DATA } from '../data/properties';
import { Property } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';

interface NeighborhoodsSectionProps {
  onSelectNeighborhood: (neighborhoodName: string) => void;
  onSelectProperty?: (property: Property) => void;
  onSelectCity?: (cityKey: string) => void;
}

export function NeighborhoodsSection({
  onSelectNeighborhood,
  onSelectProperty,
  onSelectCity,
}: NeighborhoodsSectionProps) {
  const [activeCityKey, setActiveCityKey] = useState<string>('all');
  const cityTabsRef = useRef<HTMLDivElement>(null);

  const scrollCityTabs = (direction: 'right' | 'left') => {
    if (cityTabsRef.current) {
      const offset = direction === 'left' ? -250 : 250;
      cityTabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const activeCityMeta: CityMeta | undefined = SUPPORTED_CITIES_LIST.find(
    (c) => c.key === activeCityKey
  );

  // Filter neighborhoods by active city or show all
  const filteredNeighborhoods = activeCityKey === 'all'
    ? NEIGHBORHOODS_DATA.slice(0, 9)
    : NEIGHBORHOODS_DATA.filter((n) => n.cityKey === activeCityKey);

  // Get properties for the selected city (3 properties per city)
  const cityProperties = activeCityKey === 'all'
    ? PROPERTIES_DATA.filter((p) => p.featured || p.virtualTourAvailable).slice(0, 6)
    : PROPERTIES_DATA.filter((p) => (p as any).cityKey === activeCityKey).slice(0, 3);

  const handleCitySelect = (key: string) => {
    setActiveCityKey(key);
  };

  const handleViewAllCityProperties = (key: string) => {
    if (onSelectCity) {
      onSelectCity(key);
      const el = document.getElementById('properties');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF8F5] py-20 px-4 sm:px-6 text-right border-t border-b border-[#C9A84C]/15 scroll-mt-24" id="cities">
      <div id="neighborhoods" className="max-w-[1400px] mx-auto scroll-mt-24">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-block w-12 h-1 bg-gradient-to-r from-[#A07830] to-[#E4C675] rounded-full mb-4" />
          <div className="block">
            <span className="inline-flex items-center gap-1.5 bg-[#C9A84C]/10 text-[#A07830] text-xs font-black tracking-wider px-4 py-1 rounded-full border border-[#C9A84C]/30 mb-3.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-[#C9A84C]" />
              پروژه‌ها و کلان‌شهرهای برتر کشور
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1A1A2E] mb-3">
            شهرها، پروژه‌های شاخص و محله‌های لوکس
          </h2>
          <p className="text-[#5A5A7A] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            دسترسی به املاک منتخب، باغ‌ها، ویلاهای اختصاصی و محله‌های شاخص در ۲۱ کلان‌شهر و پایتخت ایران
          </p>
        </div>

        {/* City Filter Tabs Bar with Scroller */}
        <div className="relative mb-10">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            {/* Scroll Right Button */}
            <button
              onClick={() => scrollCityTabs('right')}
              className="p-2 rounded-full bg-white hover:bg-[#C9A84C]/15 text-[#1A1A2E] border border-stone-200 shadow-sm transition-all shrink-0 hover:scale-105 cursor-pointer"
              title="مشاهده شهرهای دیگر"
              aria-label="مشاهده شهرهای دیگر"
            >
              <ChevronRight className="w-4 h-4 text-[#A07830]" />
            </button>

            {/* Scrollable City Pills */}
            <div
              ref={cityTabsRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 w-full whitespace-nowrap"
            >
              <button
                onClick={() => handleCitySelect('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                  activeCityKey === 'all'
                    ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-md'
                    : 'bg-white text-[#5A5A7A] border-stone-200 hover:border-[#C9A84C] hover:text-[#1A1A2E]'
                }`}
              >
                همه شهرها ({toPersianDigits(SUPPORTED_CITIES_LIST.length)} شهر)
              </button>

              {SUPPORTED_CITIES_LIST.map((city) => (
                <button
                  key={city.key}
                  onClick={() => handleCitySelect(city.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5 ${
                    activeCityKey === city.key
                      ? 'bg-[#A07830] text-white border-[#A07830] shadow-md'
                      : 'bg-white text-[#5A5A7A] border-stone-200 hover:border-[#C9A84C] hover:text-[#1A1A2E]'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-[#C9A84C]" />
                  <span>{city.nameFa}</span>
                </button>
              ))}
            </div>

            {/* Scroll Left Button */}
            <button
              onClick={() => scrollCityTabs('left')}
              className="p-2 rounded-full bg-white hover:bg-[#C9A84C]/15 text-[#1A1A2E] border border-stone-200 shadow-sm transition-all shrink-0 hover:scale-105 cursor-pointer"
              title="مشاهده شهرهای قبلی"
              aria-label="مشاهده شهرهای قبلی"
            >
              <ChevronLeft className="w-4 h-4 text-[#A07830]" />
            </button>
          </div>
        </div>

        {/* Selected City Spotlight Card (if a city is picked) */}
        {activeCityMeta && (
          <div className="bg-gradient-to-r from-[#1A1A2E] to-[#16213E] rounded-3xl p-6 md:p-8 text-white mb-12 shadow-xl border border-[#C9A84C]/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2 text-[#E4C675] text-xs font-bold">
                  <MapPin className="w-4 h-4 text-[#C9A84C]" />
                  <span>استان {activeCityMeta.province}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  <span className="text-white/80">پروژه شاخص: {activeCityMeta.featuredProject}</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-white mb-2">
                  املاک، باغ و ویلاهای اختصاصی {activeCityMeta.nameFa}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {activeCityMeta.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                    <span className="text-white/60 ml-1">میانگین متری:</span>
                    <span className="text-[#E4C675] font-black">{activeCityMeta.avgPricePerMeter}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                    <span className="text-white/60 ml-1">پروژه‌های فعال:</span>
                    <span className="text-white font-bold">{toPersianDigits(activeCityMeta.projectCount)} پروژه و ملک</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleViewAllCityProperties(activeCityMeta.key)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-black text-sm hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>مشاهده همه املاک {activeCityMeta.nameFa}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3 Featured Properties per City Showcase */}
        {cityProperties.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C9A84C]" />
                  {activeCityMeta
                    ? `۳ ملک، باغ و ویلای منتخب در ${activeCityMeta.nameFa}`
                    : 'املاک و ویلاهای منتخب کلان‌شهرها'}
                </h4>
                <p className="text-xs sm:text-sm text-[#5A5A7A] mt-1">
                  املاک تاییدشده کارشناسان با سند تک‌برگ و امکان بازدید حضوری و آنلاین
                </p>
              </div>

              {activeCityMeta && (
                <button
                  onClick={() => handleViewAllCityProperties(activeCityMeta.key)}
                  className="text-xs font-bold text-[#A07830] hover:text-[#1A1A2E] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>مشاهده همه</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cityProperties.map((prop) => {
                const typeLabels: Record<string, string> = {
                  villa: 'ویلا',
                  apartment: 'آپارتمان',
                  penthouse: 'پنت‌هاوس',
                  commercial: 'تجاری',
                  land: 'باغ و زمین',
                };
                return (
                  <div
                    key={prop.id}
                    onClick={() => onSelectProperty && onSelectProperty(prop)}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                        <span className="bg-[#1A1A2E]/85 backdrop-blur-md text-[#E4C675] text-[11px] font-black px-3 py-1 rounded-full border border-[#C9A84C]/40">
                          {typeLabels[prop.propertyType] || 'ملک'}
                        </span>
                        {prop.status === 'presale' && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            پیش‌فروش
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <div className="text-xs text-[#E4C675] font-bold flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{prop.cityNameFa}، {prop.neighborhood}</span>
                        </div>
                        <h5 className="text-base font-black text-white truncate group-hover:text-[#E4C675] transition-colors">
                          {prop.title}
                        </h5>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-[#5A5A7A] line-clamp-2 leading-relaxed mb-4">
                        {prop.description}
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-center text-xs text-[#1A1A2E] mb-4">
                        <div className="flex items-center justify-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                          <span>{toPersianDigits(prop.area)} م²</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <BedDouble className="w-3.5 h-3.5 text-[#C9A84C]" />
                          <span>{toPersianDigits(prop.bedrooms)} خواب</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-[#C9A84C]" />
                          <span>{toPersianDigits(prop.bathrooms)} حمام</span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-[#9A9AB0]">قیمت کل:</div>
                          <div className="text-sm font-black text-[#A07830]">
                            {formatPrice(prop.price)}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl bg-[#1A1A2E] hover:bg-[#C9A84C] text-white hover:text-[#1A1A2E] text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Neighborhoods Showcase */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-[#1A1A2E]">
                {activeCityMeta
                  ? `محله‌های شاخص ${activeCityMeta.nameFa}`
                  : 'محبوب‌ترین محله‌های مسکونی و ویلایی'}
              </h4>
              <p className="text-xs sm:text-sm text-[#5A5A7A] mt-1">
                بررسی بافت شهری، میانگین قیمت متری و پتانسیل رشد ارزش افزوده
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeighborhoods.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectNeighborhood(item.name)}
                className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border border-stone-200/60"
              >
                {/* Background Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/95 via-[#1A1A2E]/50 to-transparent" />

                {/* Badges on Top */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <span className="bg-[#1A1A2E]/80 backdrop-blur-md text-[#E4C675] text-xs font-black px-3 py-1 rounded-full border border-[#C9A84C]/40">
                    {toPersianDigits(item.propertyCount)} ملک فعال
                  </span>
                </div>

                {/* Content on Bottom */}
                <div className="absolute bottom-0 inset-x-0 p-5 z-10 text-white flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.city}، {item.name}</span>
                  </div>

                  <h4 className="text-xl font-black text-white mb-1.5 group-hover:text-[#E4C675] transition-colors">
                    {item.name}
                  </h4>

                  <p className="text-xs text-white/70 line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/15 text-xs">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" />
                      <span>متری {item.avgPricePerMeter}</span>
                    </div>

                    <span className="text-[#C9A84C] font-bold flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                      مشاهده املاک
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
