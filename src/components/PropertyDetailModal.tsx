import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Heart,
  Scale,
  Share2,
  Phone,
  MessageCircle,
  Send,
  Calendar,
  Bed,
  Bath,
  Maximize,
  Car,
  Layers,
  Clock,
  CheckCircle2,
  MapPin,
  Maximize2,
  Calculator,
  Eye,
  FileText,
  TrendingUp,
  Printer,
  Sparkles,
  Box,
} from 'lucide-react';
import { Property, PropertyAgent } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { NeighborhoodWeatherAmenitiesWidget } from './NeighborhoodWeatherAmenitiesWidget';
import { PropertyBrochureModal } from './PropertyBrochureModal';
import { RoiCalculatorModal } from './RoiCalculatorModal';
import { Property3DViewer } from './Property3DViewer';
import { PropertyPriceHistoryChart } from './PropertyPriceHistoryChart';

interface PropertyDetailModalProps {
  property: Property | null;
  isSaved: boolean;
  isCompared: boolean;
  similarProperties: Property[];
  onClose: () => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onToggleCompare: (id: string, e: React.MouseEvent) => void;
  onSelectSimilar: (property: Property) => void;
  onScheduleVisit: (property: Property) => void;
  onShowToast: (title: string, message: string) => void;
  onSelectAgent?: (agent: PropertyAgent) => void;
}

export function PropertyDetailModal({
  property,
  isSaved,
  isCompared,
  similarProperties,
  onClose,
  onToggleSave,
  onToggleCompare,
  onSelectSimilar,
  onScheduleVisit,
  onShowToast,
  onSelectAgent,
}: PropertyDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [isBrochureOpen, setIsBrochureOpen] = useState<boolean>(false);
  const [isRoiOpen, setIsRoiOpen] = useState<boolean>(false);
  const [selectedRenovationCost, setSelectedRenovationCost] = useState<number | undefined>(undefined);
  const [mediaMode, setMediaMode] = useState<'gallery' | '3d'>('gallery');

  // In-context mortgage state
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30); // 30%
  const [loanYears, setLoanYears] = useState<number>(10); // 10 years

  useLockBodyScroll(Boolean(property));

  useEffect(() => {
    setActiveImageIdx(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          setLightboxOpen(false);
        } else {
          onClose();
        }
      }
      if (lightboxOpen && property) {
        if (e.key === 'ArrowRight') {
          setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : property.images.length - 1));
        }
        if (e.key === 'ArrowLeft') {
          setActiveImageIdx((prev) => (prev < property.images.length - 1 ? prev + 1 : 0));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [property, lightboxOpen, onClose]);

  if (!property) return null;

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowToast('لینک ملک کپی شد', 'لینک اختصاصی این ملک در کلیپ‌بورد شما ذخیره شد.');
  };

  // Safe fallback agent to guarantee no undefined error occurs
  const safeAgent = property.agent || {
    id: 'agent-default',
    name: 'مهندس آریا شایگان',
    role: 'کارشناس ارشد املاک و مستغلات لوکس',
    phone: '۰۹۱۲۱۱۱۱۱۱۱',
    whatsapp: '989121111111',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    rating: 4.95,
    dealsCount: 185,
    experienceYears: 14,
  };

  // In-context mortgage calculations
  const propertyPrice = property.price || 10000000000;
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;
  const monthlyRate = 0.23 / 12; // 23% annual bank rate
  const totalMonths = loanYears * 12;
  const monthlyPayment =
    loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;
  const totalRepayment = monthlyPayment * totalMonths;
  const totalInterest = totalRepayment - loanAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-3 sm:p-6 md:p-8 animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-[#F8F4EF] text-[#1A1A2E] w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative my-auto border border-white/20">
        {/* Sticky Header Bar */}
        <div className="bg-[#1A1A2E] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-[#C9A84C] text-[#1A1A2E] text-xs font-black px-2.5 py-1 rounded-md">
              {property.status === 'sale'
                ? 'فروش'
                : property.status === 'rent'
                ? 'اجاره'
                : 'پیش‌فروش'}
            </span>
            <span className="text-xs text-white/60 font-medium hidden sm:inline">
              کد ملک: {toPersianDigits(property.id.replace('prop-', 'DH-'))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dynamic PDF Brochure Button */}
            {/* 3D Scene Viewer Button */}
            <button
              onClick={() => setMediaMode(mediaMode === '3d' ? 'gallery' : '3d')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                mediaMode === '3d'
                  ? 'bg-[#C9A84C] text-[#1A1A2E]'
                  : 'bg-white/10 hover:bg-white/20 text-[#E4C675] border border-[#C9A84C]/50'
              }`}
              title="مشاهده مدل سه‌بعدی و پلان ۳D تعاملی"
            >
              <Box className="w-3.5 h-3.5" />
              <span>{mediaMode === '3d' ? 'گالری عکس' : 'مدل سه‌بعدی ۳D'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </button>

            {/* Brochure Button */}
            <button
              onClick={() => setIsBrochureOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#A07830] to-[#C9A84C] hover:from-[#8C6826] hover:to-[#B59640] text-[#1A1A2E] text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
              title="تولید و دانلود بروشور اختصاصی PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>بروشور رسمی PDF</span>
            </button>

            {/* ROI Calculator Button */}
            <button
              onClick={() => {
                setSelectedRenovationCost(undefined);
                setIsRoiOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-[#E4C675] border border-[#C9A84C]/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="محاسبه بازده سرمایه‌گذاری ملکی"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>محاسبه ROI</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              title="اشتراک‌گذاری"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Compare */}
            <button
              onClick={(e) => onToggleCompare(property.id, e)}
              title={isCompared ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
              className={`p-2 rounded-full transition-colors ${
                isCompared
                  ? 'bg-[#C9A84C] text-[#1A1A2E]'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>

            {/* Save */}
            <button
              onClick={(e) => onToggleSave(property.id, e)}
              title={isSaved ? 'حذف از نشان‌شده‌ها' : 'نشان کردن'}
              className={`p-2 rounded-full transition-colors ${
                isSaved
                  ? 'bg-[#E84393] text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center mr-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          {/* Gallery / 3D Media Section */}
          <div className="bg-[#1A1A2E] p-4 sm:p-6">
          {/* Media Mode Tabs */}
          <div className="flex items-center justify-between gap-3 mb-3.5 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMediaMode('gallery')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mediaMode === 'gallery'
                    ? 'bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] shadow-md'
                    : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                <span>تصاویر و گالری</span>
                <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                  {toPersianDigits(images.length)}
                </span>
              </button>

              <button
                onClick={() => setMediaMode('3d')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mediaMode === '3d'
                    ? 'bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] shadow-md'
                    : 'text-[#E4C675] hover:text-white bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 border border-[#C9A84C]/40'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>مدل سه‌بعدی و پلان ۳D</span>
                <span className="bg-emerald-400 text-emerald-950 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                  تعاملی ۳۶۰°
                </span>
              </button>
            </div>

            <div className="text-xs text-white/50 hidden sm:block">
              {mediaMode === '3d'
                ? 'مدل معماری و چیدمان سه‌بعدی با قابلیت جابجایی زاویه دید'
                : 'برای مشاهده تمام‌صفحه روی تصویر کلیک کنید'}
            </div>
          </div>

          {/* Conditional Media Rendering: 3D Scene vs Photo Carousel */}
          {mediaMode === '3d' ? (
            <Property3DViewer property={property} />
          ) : (
            <>
              <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black group">
                <img
                  src={images[activeImageIdx]}
                  alt={property.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />

                {/* Image Navigation Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev > 0 ? prev - 1 : images.length - 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev < images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Lightbox / Fullscreen trigger */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 left-4 bg-black/70 hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  نمایش تمام صفحه ({toPersianDigits(activeImageIdx + 1)}/
                  {toPersianDigits(images.length)})
                </button>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIdx === idx
                          ? 'border-[#C9A84C] scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-right">
          {/* Main Info Column (Left 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Title & Price Header */}
            <div className="border-b border-stone-200 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] leading-snug">
                  {property.title}
                </h1>
                <div className="text-xl sm:text-2xl font-black text-[#A07830] bg-[#C9A84C]/10 px-4 py-1.5 rounded-xl border border-[#C9A84C]/25 whitespace-nowrap">
                  {formatPrice(property.price)}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5A5A7A]">
                <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <span>{property.location}</span>
                <span className="text-[#C9A84C]">•</span>
                <span>محله: {property.neighborhood}</span>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
                <div className="text-xs text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                  <Maximize className="w-3.5 h-3.5 text-[#C9A84C]" />
                  مساحت
                </div>
                <div className="text-base font-black text-[#1A1A2E]">
                  {toPersianDigits(property.area)} مترمربع
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
                <div className="text-xs text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                  <Bed className="w-3.5 h-3.5 text-[#C9A84C]" />
                  اتاق خواب
                </div>
                <div className="text-base font-black text-[#1A1A2E]">
                  {property.bedrooms > 0 ? toPersianDigits(property.bedrooms) : '—'}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
                <div className="text-xs text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                  <Bath className="w-3.5 h-3.5 text-[#C9A84C]" />
                  سرویس حمام
                </div>
                <div className="text-base font-black text-[#1A1A2E]">
                  {property.bathrooms > 0 ? toPersianDigits(property.bathrooms) : '—'}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
                <div className="text-xs text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                  <Car className="w-3.5 h-3.5 text-[#C9A84C]" />
                  پارکینگ سندی
                </div>
                <div className="text-base font-black text-[#1A1A2E]">
                  {property.parking > 0 ? `${toPersianDigits(property.parking)} جای پارک` : 'فاقد پارکینگ'}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
                <div className="text-xs text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#C9A84C]" />
                  طبقه
                </div>
                <div className="text-base font-black text-[#1A1A2E]">
                  {property.floor > 0
                    ? `طبقه ${toPersianDigits(property.floor)} از ${toPersianDigits(property.totalFloors)}`
                    : 'ویلایی'}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
                <div className="text-xs text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
                  سن بنا
                </div>
                <div className="text-base font-black text-[#1A1A2E]">
                  {property.buildingAge === 0 ? 'نوساز کلید نخورده' : `${toPersianDigits(property.buildingAge)} سال ساخت`}
                </div>
              </div>
            </div>

            {/* Description Narrative */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200">
              <h3 className="text-base font-black text-[#1A1A2E] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                توضیحات و مشخصات معماری
              </h3>
              <p className="text-sm text-[#5A5A7A] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities List */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200">
              <h3 className="text-base font-black text-[#1A1A2E] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                امکانات و ویژگی‌های برجسته
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-[#1A1A2E] bg-[#F8F4EF] px-3.5 py-2.5 rounded-xl font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Built-in Mortgage Calculator */}
            <div className="bg-[#1A1A2E] text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 font-black text-base text-[#E4C675]">
                  <Calculator className="w-5 h-5 text-[#C9A84C]" />
                  محاسبه‌گر هوشمند اقساط وام این ملک
                </div>
                <span className="text-[11px] text-white/50">نرخ پایه ۲۳٪ سالیانه</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Down Payment Slider */}
                <div>
                  <div className="flex justify-between text-xs text-white/70 mb-1.5">
                    <span>پیش‌پرداخت: {toPersianDigits(downPaymentPercent)}٪</span>
                    <span className="text-[#E4C675] font-bold">
                      {formatPrice(downPaymentAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-[#C9A84C]"
                  />
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between text-xs text-white/70 mb-1.5">
                    <span>مدت بازپرداخت:</span>
                    <span className="text-[#E4C675] font-bold">
                      {toPersianDigits(loanYears)} سال ({toPersianDigits(totalMonths)} ماه)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={loanYears}
                    onChange={(e) => setLoanYears(Number(e.target.value))}
                    className="w-full accent-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 p-3.5 rounded-xl text-center">
                <div>
                  <div className="text-[11px] text-white/60 mb-0.5">مبلغ وام درخواستی</div>
                  <div className="text-sm font-bold text-white">
                    {formatPrice(loanAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#E4C675] mb-0.5 font-bold">قسط تخمینی ماهانه</div>
                  <div className="text-sm font-black text-[#E4C675]">
                    {formatPrice(Math.round(monthlyPayment))}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-white/60 mb-0.5">کل بازپرداخت اقساط</div>
                  <div className="text-sm font-bold text-white">
                    {formatPrice(Math.round(totalRepayment))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Before / After Renovation Slider */}
            <BeforeAfterSlider
              customProjects={property.renovations}
              propertyTitle={property.title}
              onOpenRoiCalculator={(cost) => {
                setSelectedRenovationCost(cost);
                setIsRoiOpen(true);
              }}
            />

            {/* Live Google Search Weather & Amenities Widget */}
            <NeighborhoodWeatherAmenitiesWidget
              neighborhood={property.neighborhood}
              city={property.cityNameFa || 'تهران'}
              location={property.location}
            />

            {/* Price Trend and Historical Growth Chart */}
            <PropertyPriceHistoryChart property={property} />

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div>
                <h3 className="text-base font-black text-[#1A1A2E] mb-3">
                  ملک‌های مشابه در این منطقه
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarProperties.slice(0, 2).map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onSelectSimilar(sim)}
                      className="bg-white p-3 rounded-xl border border-stone-200 flex gap-3 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <img
                        src={sim.images[0]}
                        alt={sim.title}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex flex-col justify-between py-0.5">
                        <div className="text-xs font-bold text-[#1A1A2E] line-clamp-1">
                          {sim.title}
                        </div>
                        <div className="text-[11px] text-[#A07830] font-black">
                          {formatPrice(sim.price)}
                        </div>
                        <div className="text-[10px] text-[#5A5A7A]">
                          {toPersianDigits(sim.area)} متر • {toPersianDigits(sim.bedrooms)} خواب
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Action Column (Right 1 col) */}
          <div className="flex flex-col gap-6">
            {/* Agent Profile Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md">
              <div className="text-xs font-bold text-[#A07830] uppercase tracking-wider mb-4">
                مشاور اختصاصی این ملک
              </div>

              <div
                onClick={() => onSelectAgent && onSelectAgent(safeAgent)}
                className={`flex items-center gap-3.5 mb-4 p-2.5 rounded-2xl transition-all ${
                  onSelectAgent ? 'hover:bg-stone-100 cursor-pointer group' : ''
                }`}
              >
                <img
                  src={safeAgent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                  alt={safeAgent.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#C9A84C] group-hover:scale-105 transition-transform"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-[#1A1A2E] group-hover:text-[#A07830] transition-colors">
                      {safeAgent.name}
                    </h4>
                    {onSelectAgent && (
                      <span className="text-[10px] bg-[#C9A84C]/15 text-[#A07830] font-bold px-2 py-0.5 rounded-full">
                        پروفایل ↗
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#5A5A7A] mt-0.5">
                    {safeAgent.role}
                  </div>
                  <div className="text-xs text-[#C9A84C] font-black mt-1">
                    ★ {toPersianDigits(safeAgent.rating || 5.0)} از ۵ ({toPersianDigits(safeAgent.dealsCount || 100)} معامله موفق)
                  </div>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={`tel:${safeAgent.phone}`}
                  className="w-full bg-[#1A1A2E] hover:bg-[#0F3460] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C9A84C]" />
                  تماس مستقیم ({safeAgent.phone})
                </a>

                <a
                  href={`https://wa.me/${safeAgent.whatsapp}?text=${encodeURIComponent(
                    `سلام، در رابطه با ملک «${property.title}» تماس می‌گیرم.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20b859] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  ارسال پیام در واتساپ
                </a>

                <button
                  onClick={() => onScheduleVisit(property)}
                  className="w-full bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-transform hover:-translate-y-0.5 shadow-md mt-1 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  رزرو نوبت بازدید حضوری / ۳D
                </button>

                {/* PDF Brochure Action */}
                <button
                  onClick={() => setIsBrochureOpen(true)}
                  className="w-full bg-[#F8F4EF] hover:bg-[#EDE8E0] text-[#1A1A2E] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors border border-stone-300 shadow-sm mt-1 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#C9A84C]" />
                  دانلود کاتالوگ و بروشور رسمی (PDF)
                </button>

                {/* ROI Calculator Action */}
                <button
                  onClick={() => {
                    setSelectedRenovationCost(undefined);
                    setIsRoiOpen(true);
                  }}
                  className="w-full bg-[#F8F4EF] hover:bg-[#EDE8E0] text-[#1A1A2E] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors border border-stone-300 shadow-sm cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  محاسبه‌گر بازده سرمایه‌گذاری (ROI)
                </button>
              </div>
            </div>

            {/* Quick Guarantees Badge */}
            <div className="bg-[#EDE8E0]/70 p-5 rounded-2xl border border-stone-300/60 text-xs text-[#5A5A7A] space-y-3">
              <div className="font-bold text-[#1A1A2E] text-sm">
                تضمین‌های خانه آرمانی:
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>استعلام دقیق ثبتی و احراز هویت مالک</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>کارشناسی قیمت مطابق نرخ روز منطقه</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>نگارش قرارداد تحت نظارت وکلای پایه یک</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col justify-between p-4 animate-fadeIn">
          <div className="flex justify-between items-center text-white px-4 py-2">
            <span className="text-sm font-bold text-[#C9A84C]">
              {property.title} ({toPersianDigits(activeImageIdx + 1)} /{' '}
              {toPersianDigits(images.length)})
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center p-4">
            <img
              src={images[activeImageIdx]}
              alt=""
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) =>
                      prev > 0 ? prev - 1 : images.length - 1
                    )
                  }
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) =>
                      prev < images.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-[#C9A84C] hover:text-[#1A1A2E] text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center gap-2 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                  activeImageIdx === idx ? 'border-[#C9A84C]' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic PDF Brochure Modal */}
      {isBrochureOpen && (
        <PropertyBrochureModal
          property={property}
          onClose={() => setIsBrochureOpen(false)}
          onShowToast={onShowToast}
        />
      )}

      {/* ROI Calculator Modal */}
      {isRoiOpen && (
        <RoiCalculatorModal
          isOpen={isRoiOpen}
          initialProperty={property}
          initialRenovationCost={selectedRenovationCost}
          onClose={() => setIsRoiOpen(false)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
}
