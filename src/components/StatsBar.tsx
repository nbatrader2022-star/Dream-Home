import React, { useEffect, useState, useRef } from 'react';
import { Handshake, Users, Building, Award } from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';
import { CMSElement } from '../types/cms';

interface StatsBarProps {
  cmsElements?: CMSElement[];
}

export function StatsBar({ cmsElements }: StatsBarProps) {
  const [counts, setCounts] = useState({ deals: 0, families: 0, cities: 0, years: 0 });
  const [animated, setAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cmsSection = cmsElements?.find((e) => e.editorKey === 'stats.section');
  const cmsDeals = cmsElements?.find((e) => e.editorKey === 'stats.deals');
  const cmsFamilies = cmsElements?.find((e) => e.editorKey === 'stats.families');
  const cmsCities = cmsElements?.find((e) => e.editorKey === 'stats.cities');
  const cmsYears = cmsElements?.find((e) => e.editorKey === 'stats.years');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);
          const duration = 1800;
          const start = performance.now();

          const animate = (time: number) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            setCounts({
              deals: Math.floor(ease * 3200),
              families: Math.floor(ease * 5000),
              cities: Math.floor(ease * 21),
              years: Math.floor(ease * 20),
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts({ deals: 3200, families: 5000, cities: 21, years: 20 });
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [animated]);

  if (cmsSection && !cmsSection.isVisible) return null;

  return (
    <section
      ref={containerRef}
      style={{
        backgroundColor: cmsSection?.styles.backgroundColor || '#1A1A2E',
        borderRadius: cmsSection?.styles.borderRadius,
        paddingTop: cmsSection?.styles.paddingTop,
        paddingBottom: cmsSection?.styles.paddingBottom,
        borderColor: cmsSection?.styles.borderColor,
      }}
      className="border-t border-white/[0.06] py-10 px-6 transition-all duration-300"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/[0.08]">
        {/* Stat 1 */}
        {(!cmsDeals || cmsDeals.isVisible) && (
          <div className="text-center p-6 flex flex-col items-center">
            <Handshake
              style={{ color: cmsDeals?.styles.color || '#C9A84C' }}
              className="w-7 h-7 mb-3"
            />
            <div
              style={{
                fontSize: cmsDeals?.styles.fontSize,
                fontWeight: cmsDeals?.styles.fontWeight as any,
              }}
              className="text-[33px] leading-[37px] md:text-[33px] md:leading-[37px] lg:text-5xl lg:leading-none font-black text-white mb-2 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsDeals?.content.text ? toPersianDigits(cmsDeals.content.text) : toPersianDigits(counts.deals.toLocaleString())}
              {!cmsDeals?.content.text && <span className="text-[#C9A84C] text-2xl md:text-3xl font-bold">+</span>}
            </div>
            <div className="text-xs md:text-sm text-white/60 font-medium">
              {cmsDeals?.content.badgeText ? toPersianDigits(cmsDeals.content.badgeText) : 'معامله موفق ملکی'}
            </div>
          </div>
        )}

        {/* Stat 2 */}
        {(!cmsFamilies || cmsFamilies.isVisible) && (
          <div className="text-center p-6 flex flex-col items-center">
            <Users
              style={{ color: cmsFamilies?.styles.color || '#C9A84C' }}
              className="w-7 h-7 mb-3"
            />
            <div
              style={{
                fontSize: cmsFamilies?.styles.fontSize,
                fontWeight: cmsFamilies?.styles.fontWeight as any,
              }}
              className="text-[33px] leading-[37px] md:text-[33px] md:leading-[37px] lg:text-5xl lg:leading-none font-black text-white mb-2 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsFamilies?.content.text ? toPersianDigits(cmsFamilies.content.text) : toPersianDigits(counts.families.toLocaleString())}
              {!cmsFamilies?.content.text && <span className="text-[#C9A84C] text-2xl md:text-3xl font-bold">+</span>}
            </div>
            <div className="text-xs md:text-sm text-white/60 font-medium">
              {cmsFamilies?.content.badgeText ? toPersianDigits(cmsFamilies.content.badgeText) : 'خانواده راضی و همراه'}
            </div>
          </div>
        )}

        {/* Stat 3 */}
        {(!cmsCities || cmsCities.isVisible) && (
          <div className="text-center p-6 flex flex-col items-center">
            <Building
              style={{ color: cmsCities?.styles.color || '#C9A84C' }}
              className="w-7 h-7 mb-3"
            />
            <div
              style={{
                fontSize: cmsCities?.styles.fontSize,
                fontWeight: cmsCities?.styles.fontWeight as any,
              }}
              className="text-[33px] leading-[37px] md:text-[33px] md:leading-[37px] lg:text-5xl lg:leading-none font-black text-white mb-2 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsCities?.content.text ? toPersianDigits(cmsCities.content.text) : toPersianDigits(counts.cities)}
            </div>
            <div className="text-xs md:text-sm text-white/60 font-medium">
              {cmsCities?.content.badgeText ? toPersianDigits(cmsCities.content.badgeText) : 'شهر فعال و پایگاه اختصاصی'}
            </div>
          </div>
        )}

        {/* Stat 4 */}
        {(!cmsYears || cmsYears.isVisible) && (
          <div className="text-center p-6 flex flex-col items-center">
            <Award
              style={{ color: cmsYears?.styles.color || '#C9A84C' }}
              className="w-7 h-7 mb-3"
            />
            <div
              style={{
                fontSize: cmsYears?.styles.fontSize,
                fontWeight: cmsYears?.styles.fontWeight as any,
              }}
              className="text-[33px] leading-[37px] md:text-[33px] md:leading-[37px] lg:text-5xl lg:leading-none font-black text-white mb-2 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
            >
              {cmsYears?.content.text ? toPersianDigits(cmsYears.content.text) : toPersianDigits(counts.years)}
              {!cmsYears?.content.text && <span className="text-[#C9A84C] text-xl font-bold"> سال</span>}
            </div>
            <div className="text-xs md:text-sm text-white/60 font-medium">
              {cmsYears?.content.badgeText ? toPersianDigits(cmsYears.content.badgeText) : 'سابقه فعالیت خوشنام'}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
