import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  Share2,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Maximize,
  Bed,
  Bath,
  Car,
  Clock,
  Layers,
  ShieldCheck,
  Award,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Property } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import brandLogo from '../assets/images/armani_luxury_logo_1788674026359.jpg';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface PropertyBrochureModalProps {
  property: Property;
  onClose: () => void;
  onShowToast: (title: string, message: string) => void;
}

export function PropertyBrochureModal({
  property,
  onClose,
  onShowToast,
}: PropertyBrochureModalProps) {
  const brochureRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(true);

  const todayJalali = '۱۴۰۳/۰۶/۱۵';
  const docSerial = `DH-${property.id.replace('prop-', '')}-A4`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTextSummary = () => {
    const summary = `================================================
خانه آرمانی | DREAM HOME REAL ESTATE
شناسه سند: ${docSerial}
تاریخ صدور: ${todayJalali}
================================================

عنوان ملک: ${property.title}
نوع معامله: ${property.status === 'sale' ? 'فروش قطعی' : property.status === 'rent' ? 'رهن و اجاره' : 'پیش‌فروش'}
قیمت کارشناسی: ${formatPrice(property.price)}
موقعیت: ${property.location} (محله ${property.neighborhood}، ${property.cityNameFa})

مشخصات فنی و معماری:
- مساحت: ${property.area} متر مربع
- اتاق خواب: ${property.bedrooms} خواب
- سرویس حمام: ${property.bathrooms} سرویس
- پارکینگ: ${property.parking > 0 ? `${property.parking} پارکینگ سندی` : 'فاقد پارکینگ'}
- طبقه: ${property.floor > 0 ? `طبقه ${property.floor} از ${property.totalFloors}` : 'ویلایی'}
- سن بنا: ${property.buildingAge === 0 ? 'نوساز کلید نخورده' : `${property.buildingAge} سال ساخت`}

توضیحات کارشناسی:
${property.description}

امکانات برجسته:
${property.amenities.map((a) => `• ${a}`).join('\n')}

اطلاعات مشاور اختصاصی:
کارشناس: ${property.agent.name} (${property.agent.role})
تلفن مستقیم: ${property.agent.phone}
ایمیل رسمی: nabikalandar0@gmail.com
آدرس دفتر مرکزی: تهران، الهیه، خیابان فرشته، پلاک ۱۸
================================================`;

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Brochure-${property.slug || 'property'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('دانلود بروشور', 'فایل خلاصه مشخصات با موفقیت ذخیره شد.');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowToast('لینک کپی شد', 'لینک اختصاصی بروشور دیجیتال این ملک ذخیره شد.');
  };

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fadeIn print:p-0 print:bg-white print:static">
      {/* Print-specific style tag injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-brochure-sheet, #printable-brochure-sheet * {
            visibility: visible;
          }
          #printable-brochure-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Wrapper */}
      <div className="w-full max-w-4xl my-auto flex flex-col gap-4">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-[#1A1A2E] text-white px-6 py-3.5 rounded-2xl flex items-center justify-between border border-white/15 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#C9A84C] text-[#1A1A2E] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <div className="text-sm font-black text-white">کاتالوگ و بروشور رسمی ملک (PDF)</div>
              <div className="text-[11px] text-white/60">آماده برای چاپ یا ذخیره با فرمت PDF</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-[#A07830] to-[#C9A84C] hover:from-[#8C6826] hover:to-[#B59640] text-[#1A1A2E] font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ / ذخیره PDF</span>
            </button>

            <button
              onClick={handleDownloadTextSummary}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="دانلود فایل متنی خلاصه"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دانلود خلاصه</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors mr-1 cursor-pointer"
              title="بستن پنجره"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable High-Resolution Brochure Sheet */}
        <div
          id="printable-brochure-sheet"
          ref={brochureRef}
          className="bg-white text-[#1A1A2E] rounded-3xl p-6 sm:p-10 shadow-2xl border border-stone-200 text-right relative overflow-hidden"
          dir="rtl"
        >
          {/* Top Decorative Gold Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-[#C9A84C] via-[#E4C675] to-[#A07830] -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-6" />

          {/* Brochure Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-stone-200 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={brandLogo}
                alt="خانه آرمانی"
                className="w-14 h-14 rounded-2xl object-cover border border-[#C9A84C]"
              />
              <div>
                <div className="text-xl font-black text-[#1A1A2E] tracking-tight">
                  خانه آرمانی | DREAM HOME
                </div>
                <div className="text-xs text-[#A07830] font-bold tracking-wider">
                  کارگزاری رسمی و بانک اطلاعات املاک لوکس
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end text-xs text-[#5A5A7A] space-y-1">
              <div className="flex items-center gap-1.5 font-mono font-bold text-[#1A1A2E]">
                <span className="text-[#A07830]">شناسه پرونده:</span>
                <span>{docSerial}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>تاریخ صدور:</span>
                <span className="font-mono">{toPersianDigits(todayJalali)}</span>
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                کارشناسی‌شده و دارای تأییدیه اصالت سند
              </div>
            </div>
          </div>

          {/* Title and Price Banner */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5 bg-[#F8F4EF] p-5 rounded-2xl border border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#1A1A2E] text-[#E4C675] text-xs font-black px-3 py-1 rounded-lg">
                  {property.status === 'sale'
                    ? 'فروش قطعی'
                    : property.status === 'rent'
                    ? 'رهن و اجاره'
                    : 'پیش‌فروش'}
                </span>
                <span className="text-xs text-[#5A5A7A] font-medium">
                  کد رهگیری: {toPersianDigits(property.id.replace('prop-', 'DH-'))}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A1A2E] leading-snug">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[#5A5A7A] mt-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                <span>{property.location}</span>
                <span className="text-[#C9A84C]">•</span>
                <span>محله {property.neighborhood}، {property.cityNameFa}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[11px] text-[#5A5A7A] mb-1">قیمت کارشناسی مصوب:</div>
              <div className="text-2xl sm:text-3xl font-black text-[#A07830] tracking-tight">
                {formatPrice(property.price)}
              </div>
              {property.area > 0 && property.price > 0 && (
                <div className="text-xs text-[#5A5A7A] font-medium mt-1">
                  هر مترمربع: {formatPrice(Math.round(property.price / property.area))}
                </div>
              )}
            </div>
          </div>

          {/* Image Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="sm:col-span-2 aspect-[16/9] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
              <img
                src={images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
              {images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="aspect-[16/10] rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {images.length < 3 && (
                <div className="aspect-[16/10] rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img src={images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Key Specifications Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                <Maximize className="w-3.5 h-3.5 text-[#C9A84C]" />
                مساحت مفید
              </div>
              <div className="text-sm font-black text-[#1A1A2E]">
                {toPersianDigits(property.area)} متر
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                <Bed className="w-3.5 h-3.5 text-[#C9A84C]" />
                تعداد خواب
              </div>
              <div className="text-sm font-black text-[#1A1A2E]">
                {toPersianDigits(property.bedrooms)} خواب
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                <Bath className="w-3.5 h-3.5 text-[#C9A84C]" />
                حمام و سرویس
              </div>
              <div className="text-sm font-black text-[#1A1A2E]">
                {toPersianDigits(property.bathrooms)} حمام
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                <Car className="w-3.5 h-3.5 text-[#C9A84C]" />
                پارکینگ سندی
              </div>
              <div className="text-sm font-black text-[#1A1A2E]">
                {property.parking > 0 ? `${toPersianDigits(property.parking)} باکس` : 'ندارد'}
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#C9A84C]" />
                طبقه و طبقات
              </div>
              <div className="text-sm font-black text-[#1A1A2E]">
                {property.floor > 0
                  ? `ط ${toPersianDigits(property.floor)} از ${toPersianDigits(property.totalFloors)}`
                  : 'ویلایی'}
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
                وضعیت سن بنا
              </div>
              <div className="text-sm font-black text-[#1A1A2E]">
                {property.buildingAge === 0 ? 'نوساز' : `${toPersianDigits(property.buildingAge)} ساله`}
              </div>
            </div>
          </div>

          {/* Description Narrative */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
              گزارش و تحلیل کارشناسی ملک:
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A7A] leading-relaxed bg-[#F8F4EF]/70 p-4 rounded-xl border border-stone-200 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              امکانات رفاهی و تأسیسات اختصاصی:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {property.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] text-[#1A1A2E] bg-stone-50 px-3 py-2 rounded-lg border border-stone-200/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer: Dedicated Consultant & Legal Seal */}
          <div className="border-t-2 border-stone-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Consultant info */}
            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <img
                src={property.agent?.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                alt={property.agent?.name || 'مشاور ارشد'}
                className="w-12 h-12 rounded-xl object-cover border border-[#C9A84C]"
              />
              <div>
                <div className="text-xs font-bold text-[#1A1A2E]">
                  کارشناس ارشد پرونده: {property.agent?.name || 'مهندس آریا شایگان'}
                </div>
                <div className="text-[11px] text-[#5A5A7A]">{property.agent?.role || 'کارشناس ارشد املاک لوکس'}</div>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[#A07830] font-bold" dir="ltr">
                  <span>{property.agent?.phone || '۰۲۱۲۲۰۰۰۰۰۰'}</span>
                  <span>•</span>
                  <span>09389951723</span>
                </div>
              </div>
            </div>

            {/* Official Agency Seal & Address */}
            <div className="text-left sm:text-left text-[11px] text-[#5A5A7A] space-y-1">
              <div className="font-bold text-[#1A1A2E] flex items-center justify-end gap-1">
                <Award className="w-4 h-4 text-[#C9A84C]" />
                <span>دبیرخانه مرکزی کارگزاری املاک لوکس خانه آرمانی</span>
              </div>
              <div>دفتر مرکزی: تهران، الهیه، خیابان فرشته، پلاک ۱۸</div>
              <div className="font-mono text-[10px]">nabikalandar0@gmail.com • www.armanihome.ir</div>
            </div>
          </div>

          {/* Bottom Stamp / Verification Note */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
            <span>این بروشور به صورت خودکار بر پایه آخرین داده‌های ثبتی سامانه خانه آرمانی تولید شده است.</span>
            <span className="font-mono">VERIFIED BY DREAM HOME SYSTEM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
