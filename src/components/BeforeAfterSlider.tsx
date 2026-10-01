import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  Coins,
  CheckCircle2,
  Maximize2,
  Sliders,
  Layers,
} from 'lucide-react';
import { RenovationProject } from '../types';
import { DEFAULT_RENOVATION_PROJECTS } from '../data/renovations';
import { toPersianDigits, formatPrice } from '../utils/formatters';

interface BeforeAfterSliderProps {
  customProjects?: RenovationProject[];
  propertyTitle?: string;
  onOpenRoiCalculator?: (renovationCost?: number) => void;
}

export function BeforeAfterSlider({
  customProjects,
  propertyTitle,
  onOpenRoiCalculator,
}: BeforeAfterSliderProps) {
  const projects = customProjects && customProjects.length > 0 ? customProjects : DEFAULT_RENOVATION_PROJECTS;
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentProject = projects[selectedIdx] || projects[0];

  // Update slider position based on mouse/touch event
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    // Calculate percentage from left (0 to 100)
    let percent = (x / rect.width) * 100;
    if (percent < 2) percent = 2;
    if (percent > 98) percent = 98;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onStopDrag = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onStopDrag);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onStopDrag);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onStopDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onStopDrag);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Header & Tabs */}
      <div className="bg-[#1A1A2E] text-white p-5 sm:p-6 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A07830] to-[#E4C675] flex items-center justify-center text-[#1A1A2E] shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                مقایسه هوشمند «قبل و بعد» بازسازی
                <span className="text-[10px] bg-[#C9A84C]/20 text-[#E4C675] border border-[#C9A84C]/30 px-2 py-0.5 rounded-full font-bold">
                  تعاملی (Drag Slider)
                </span>
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                اسلایدر طلایی وسط را به طرفین بکشید تا تغییرات معماری و ارتقای ارزش افزوده را مشاهده کنید
              </p>
            </div>
          </div>

          {/* Quick presets for slider */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSliderPosition(10)}
              className="px-2.5 py-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              نمای کامل بعد
            </button>
            <button
              onClick={() => setSliderPosition(50)}
              className="px-2.5 py-1 rounded-lg bg-[#C9A84C] text-[#1A1A2E] font-bold transition-colors"
            >
              مقایسه ۵۰/۵۰
            </button>
            <button
              onClick={() => setSliderPosition(90)}
              className="px-2.5 py-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              نمای کامل قبل
            </button>
          </div>
        </div>

        {/* Room selection tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {projects.map((proj, idx) => (
            <button
              key={proj.id}
              onClick={() => {
                setSelectedIdx(idx);
                setSliderPosition(50);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] shadow-md scale-105'
                  : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{proj.roomName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Slider Stage */}
      <div className="p-4 sm:p-6 bg-[#F8F4EF]">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative aspect-[16/9] sm:aspect-[21/10] w-full rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-lg border border-black/10 bg-stone-900 group"
        >
          {/* AFTER Image (Base Layer - Left side in LTR, Right side depending on position) */}
          <img
            src={currentProject.afterImage}
            alt="پس از بازسازی"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Luxury After Badge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <span className="bg-[#1A1A2E]/85 text-[#E4C675] border border-[#C9A84C]/40 backdrop-blur-md text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
              پس از بازسازی آرمانی (Renovated)
            </span>
          </div>

          {/* BEFORE Image (Overlay with dynamic clip-path from right) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            }}
          >
            <img
              src={currentProject.beforeImage}
              alt="قبل از بازسازی"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark tint subtle layer for vintage feel */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Before Badge */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="bg-black/75 text-white/90 border border-white/20 backdrop-blur-md text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                قبل از بازسازی (Original State)
              </span>
            </div>
          </div>

          {/* Vertical Divider Bar */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Gold Line */}
            <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-[#C9A84C] via-[#FFFFFF] to-[#C9A84C] shadow-[0_0_12px_rgba(201,168,76,0.8)]" />

            {/* Circular Handle Button */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#1A1A2E] border-2 border-[#E4C675] shadow-2xl flex items-center justify-center text-[#E4C675] transition-transform hover:scale-110 active:scale-95 group-hover:shadow-[0_0_20px_rgba(201,168,76,0.6)]">
              <ArrowLeftRight className="w-4 h-4 text-[#C9A84C]" />
            </div>

            {/* Percentage pill below handle */}
            <div className="absolute top-[calc(50%+28px)] -translate-x-1/2 bg-black/80 text-white/90 backdrop-blur-sm text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/10 shadow whitespace-nowrap">
              {toPersianDigits(Math.round(sliderPosition))}٪
            </div>
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white/80 text-[10px] px-3 py-1 rounded-full pointer-events-none border border-white/10 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#C9A84C]" />
            <span>اسلایدر را بکشید یا هر نقطه را لمس نمایید</span>
          </div>
        </div>

        {/* Project Metrics & Architecture Breakdown */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estimated Value Add */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#5A5A7A]">افزایش ارزش سرمایه‌ای ملک</div>
              <div className="text-base font-black text-emerald-800">
                +{toPersianDigits(currentProject.valueAddedPercent || 35)}٪ رشد ارزش روز
              </div>
            </div>
          </div>

          {/* Total Renovation Cost */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#5A5A7A]">هزینه کل بازسازی این فضا</div>
              <div className="text-base font-black text-[#1A1A2E]">
                {currentProject.costTomans ? formatPrice(currentProject.costTomans) : '۱.۴۵ میلیارد تومان'}
              </div>
            </div>
          </div>

          {/* Project Duration */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#5A5A7A]">مدت زمان طراحی و اجرا</div>
              <div className="text-base font-black text-[#1A1A2E]">
                {toPersianDigits(currentProject.durationWeeks || 6)} هفته کاری فشرده
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Materials List */}
        <div className="mt-4 bg-white p-5 rounded-2xl border border-stone-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <h4 className="font-bold text-sm text-[#1A1A2E]">
              شرح عملیات بازسازی: {currentProject.roomName}
            </h4>
            {onOpenRoiCalculator && (
              <button
                onClick={() => onOpenRoiCalculator(currentProject.costTomans)}
                className="text-xs font-bold text-[#A07830] hover:text-[#C9A84C] flex items-center gap-1 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 px-3 py-1.5 rounded-xl border border-[#C9A84C]/30 transition-colors"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>محاسبه نرخ بازگشت سرمایه (ROI) با این بازسازی</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#5A5A7A] leading-relaxed mb-3.5">
            {currentProject.description}
          </p>

          {currentProject.materials && currentProject.materials.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#1A1A2E] mb-2">
                مصالح و متریال‌های شاخص استفاده‌شده:
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProject.materials.map((mat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] text-[#1A1A2E] bg-[#F8F4EF] px-2.5 py-1 rounded-lg border border-stone-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
