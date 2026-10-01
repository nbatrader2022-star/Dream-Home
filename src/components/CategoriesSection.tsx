import React from 'react';
import { Building2, Home, Store, Map, Crown, Trees } from 'lucide-react';
import { PropertyType } from '../types';
import { CMSElement } from '../types/cms';
import { toPersianDigits } from '../utils/formatters';

interface CategoriesSectionProps {
  activeCategory?: PropertyType | 'all';
  selectedType?: PropertyType | 'all';
  onSelectCategory?: (category: PropertyType | 'all') => void;
  onSelectType?: (type: PropertyType) => void;
  cmsElements?: CMSElement[];
}

export function CategoriesSection({
  activeCategory = 'all',
  selectedType,
  onSelectCategory,
  onSelectType,
  cmsElements,
}: CategoriesSectionProps) {
  const currentCategory = selectedType !== undefined ? selectedType : activeCategory;

  const cmsBadge = cmsElements?.find((e) => e.editorKey === 'categories.badge');
  const cmsTitle = cmsElements?.find((e) => e.editorKey === 'categories.title');
  const cmsSubtitle = cmsElements?.find((e) => e.editorKey === 'categories.subtitle');
  const cmsCard = cmsElements?.find((e) => e.editorKey === 'categories.card');

  const handleSelect = (type: PropertyType) => {
    if (onSelectType) onSelectType(type);
    else if (onSelectCategory) onSelectCategory(type);
  };

  const categories: Array<{
    type: PropertyType;
    name: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { type: 'apartment', name: 'آپارتمان', count: 320, icon: Building2 },
    { type: 'villa', name: 'ویلا', count: 145, icon: Home },
    { type: 'commercial', name: 'تجاری', count: 88, icon: Store },
    { type: 'land', name: 'زمین', count: 62, icon: Map },
    { type: 'penthouse', name: 'پنت‌هاوس', count: 24, icon: Crown },
    { type: 'garden', name: 'باغ ویلا', count: 51, icon: Trees },
  ];

  return (
    <section className="bg-[#F8F4EF] py-12 sm:py-16 px-4 sm:px-6 scroll-mt-24" id="categories">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block w-12 h-1 bg-gradient-to-r from-[#A07830] to-[#E4C675] rounded-full mb-3" />
          {(!cmsBadge || cmsBadge.isVisible) && (
            <div className="block">
              <span
                style={{
                  backgroundColor: cmsBadge?.styles.backgroundColor || 'rgba(201, 168, 76, 0.1)',
                  color: cmsBadge?.styles.color || '#A07830',
                  borderColor: cmsBadge?.styles.borderColor || 'rgba(201, 168, 76, 0.25)',
                  borderRadius: cmsBadge?.styles.borderRadius || '9999px',
                  fontSize: cmsBadge?.styles.fontSize || '11px',
                  paddingTop: cmsBadge?.styles.paddingTop,
                  paddingBottom: cmsBadge?.styles.paddingBottom,
                  paddingRight: cmsBadge?.styles.paddingRight,
                  paddingLeft: cmsBadge?.styles.paddingLeft,
                }}
                className="inline-block font-bold tracking-widest px-3.5 py-1 rounded-full border mb-2.5 shadow-sm font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
              >
                {cmsBadge?.content.text ? toPersianDigits(cmsBadge.content.text) : 'دسته‌بندی‌های اختصاصی'}
              </span>
            </div>
          )}
          {(!cmsTitle || cmsTitle.isVisible) && (
            <h2
              style={{
                fontSize: cmsTitle?.styles.fontSize,
                fontWeight: cmsTitle?.styles.fontWeight as any,
                color: cmsTitle?.styles.color,
                textAlign: cmsTitle?.styles.textAlign,
              }}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A2E] mb-2.5 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsTitle?.content.text ? toPersianDigits(cmsTitle.content.text) : 'دنبال چه نوع ملکی هستید؟'}
            </h2>
          )}
          {(!cmsSubtitle || cmsSubtitle.isVisible) && (
            <p
              style={{
                fontSize: cmsSubtitle?.styles.fontSize,
                color: cmsSubtitle?.styles.color,
              }}
              className="text-[#5A5A7A] text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsSubtitle?.content.text ? toPersianDigits(cmsSubtitle.content.text) :
                'از آپارتمان‌های مدرن شهری تا ویلاهای باشکوه و پنت‌هاوس‌های لوکس'}
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentCategory === cat.type;
            return (
              <button
                key={cat.type}
                onClick={() => {
                  handleSelect(cat.type);
                  const el = document.getElementById('properties');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  borderRadius: cmsCard?.styles.borderRadius || '16px',
                  paddingTop: cmsCard?.styles.paddingTop,
                  paddingBottom: cmsCard?.styles.paddingBottom,
                  paddingRight: cmsCard?.styles.paddingRight,
                  paddingLeft: cmsCard?.styles.paddingLeft,
                }}
                className={`relative group p-4 sm:p-5 text-center transition-all duration-300 overflow-hidden border-2 cursor-pointer ${
                  isActive
                    ? 'border-[#C9A84C] bg-gradient-to-br from-[#A07830] to-[#C9A84C] text-[#1A1A2E] shadow-[0_8px_24px_rgba(201,168,76,0.3)] -translate-y-0.5'
                    : 'bg-white border-transparent hover:border-[#C9A84C]/60 hover:-translate-y-0.5 hover:shadow-lg text-[#1A1A2E]'
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                    isActive
                      ? 'bg-[#1A1A2E] text-[#C9A84C]'
                      : 'bg-[#C9A84C]/10 text-[#C9A84C] group-hover:bg-[#1A1A2E] group-hover:text-[#C9A84C]'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3
                  className={`text-xs sm:text-sm font-bold mb-1 transition-colors ${
                    isActive ? 'text-[#1A1A2E]' : 'text-[#1A1A2E]'
                  }`}
                >
                  {cat.name}
                </h3>
                <div
                  className={`text-[11px] font-medium ${
                    isActive ? 'text-[#1A1A2E]/80' : 'text-[#9A9AB0]'
                  }`}
                >
                  {toPersianDigits(cat.count)} ملک
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
