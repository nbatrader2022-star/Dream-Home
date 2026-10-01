import React, { useState } from 'react';
import { Eye, Compass, Sparkles, Check, Info, Maximize2, AlertCircle, X } from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';
import AccordionModal from './ui/gallery-modal-accordion';

export function VirtualTourSection() {
  const [activeRoom, setActiveRoom] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [showMobileRoomInfo, setShowMobileRoomInfo] = useState<boolean>(false);

  const rooms = [
    {
      id: 'living',
      title: 'سالن اصلی و نشیمن',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80',
      description: 'پلان تفکیکی با ارتفاع سقف ۳.۸۰ متر و پنجره‌های سرتاسری ترمال‌بریک',
      hotspots: [
        { id: 'bms', x: '35%', y: '45%', title: 'سیستم هوشمند خانه BMS برند اشنایدر آلمان' },
        { id: 'floor', x: '65%', y: '75%', title: 'سنگ اسلب بوک‌مچ طبیعی ایتالیایی' },
      ],
    },
    {
      id: 'kitchen',
      title: 'آشپزخانه مدرن',
      image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1400&q=80',
      description: 'کابینت‌های پلی‌اورتان انزو همراه با فول فرنیش Miele آلمان',
      hotspots: [
        { id: 'appliances', x: '50%', y: '50%', title: 'فر، هود، ماکروفر و قهوه‌ساز توکار Miele' },
        { id: 'island', x: '30%', y: '68%', title: 'کانتر سنگ کوارتز آنتی‌باکتریال ضدلک' },
      ],
    },
    {
      id: 'master',
      title: 'اتاق خواب مستر کینگ',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80',
      description: 'سوئیت مستر رویال با کلوزت‌روم وسیع و تراس اختصاصی',
      hotspots: [
        { id: 'closet', x: '75%', y: '55%', title: 'کلوزت‌روم اختصاصی با درب‌های شیشه‌ای دودی' },
      ],
    },
    {
      id: 'terrace',
      title: 'تراس گاردن با دید کوهستان',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
      description: 'چشم‌انداز پانوراما بدون مشرف به رشته کوه البرز',
      hotspots: [
        { id: 'view', x: '45%', y: '35%', title: 'ویو ابدی بدون مشرف شهر و کوهستان' },
      ],
    },
  ];

  const current = rooms[activeRoom];

  return (
    <section className="bg-[#1A1A2E] text-white py-24 px-6 text-right relative overflow-hidden" id="virtual-tour">
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block w-12 h-1 bg-gradient-to-r from-[#A07830] to-[#E4C675] rounded-full mb-4" />
          <div className="block">
            <span className="inline-block bg-[#C9A84C]/20 text-[#E4C675] text-[11px] font-bold tracking-widest px-3.5 py-1 rounded-full border border-[#C9A84C]/35 mb-3.5">
              تور مجازی ۳۶۰ درجه
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            خانه‌ات را از راه دور بگرد
          </h2>
          <p className="text-white/60 text-base max-w-lg mx-auto leading-relaxed">
            تجربه واقع‌گرایانه قدم زدن در پنت‌هاوس‌ها و ویلاهای اختصاصی بدون نیاز به خروج از منزل
          </p>
        </div>

        {/* 3D Viewer Container */}
        <div className="bg-[#16213E] rounded-3xl overflow-hidden border border-[#C9A84C]/30 shadow-2xl relative">
          {/* Room Selector Bar */}
          <div className="bg-[#0F172A] p-3 sm:p-4 flex gap-2 overflow-x-auto border-b border-white/10">
            {rooms.map((room, idx) => (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoom(idx);
                  setActiveHotspot(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                  activeRoom === idx
                    ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-md'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {room.title}
              </button>
            ))}
          </div>

          {/* Interactive Stage */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-black group overflow-hidden">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            {/* 360 Badge */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs text-[#E4C675] font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C9A84C] animate-spin" style={{ animationDuration: '8s' }} />
              نمای تعاملی ۳۶۰ درجه
            </div>

            {/* Hotspots */}
            {current.hotspots.map((hs) => (
              <div
                key={hs.id}
                style={{ left: hs.x, top: hs.y }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              >
                <button
                  onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
                  className="w-8 h-8 rounded-full bg-[#C9A84C] text-[#1A1A2E] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(201,168,76,0.8)] animate-pulse hover:scale-110 transition-transform"
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Hotspot Popup Tooltip */}
                {activeHotspot === hs.id && (
                  <div className="absolute bottom-10 right-1/2 translate-x-1/2 w-64 bg-[#1A1A2E]/95 backdrop-blur-md p-3 rounded-xl border border-[#C9A84C]/50 text-xs text-white shadow-2xl text-right animate-fadeIn">
                    <div className="font-bold text-[#E4C675] mb-1">مشخصات متریال:</div>
                    <div>{hs.title}</div>
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Exclamation Mark Trigger Button */}
            <div className="sm:hidden absolute bottom-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setShowMobileRoomInfo(!showMobileRoomInfo)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A07830] to-[#E4C675] text-[#1A1A2E] flex items-center justify-center font-black text-lg shadow-[0_4px_16px_rgba(201,168,76,0.7)] border-2 border-white/40 active:scale-95 transition-transform cursor-pointer"
                title="مشاهده اطلاعات و توضیحات فضا"
                aria-label="مشاهده اطلاعات و توضیحات فضا"
              >
                !
              </button>

              {/* Mobile Info Popover */}
              {showMobileRoomInfo && (
                <div className="absolute bottom-12 right-0 w-[270px] bg-[#1A1A2E]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#C9A84C]/60 shadow-[0_12px_36px_rgba(0,0,0,0.8)] text-right animate-fadeIn text-white z-30">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#E4C675]">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C9A84C]" />
                      <span>{current.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMobileRoomInfo(false)}
                      className="text-white/60 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-white/90 leading-relaxed mb-2">
                    {current.description}
                  </p>
                  <div className="text-[10px] text-[#E4C675] bg-[#C9A84C]/15 p-2 rounded-lg border border-[#C9A84C]/25">
                    💡 روی نقاط طلایی کلیک کنید تا متریال نمایش داده شود
                  </div>
                </div>
              )}
            </div>

            {/* Room Description Strip on Bottom (Desktop & Tablet) */}
            <div className="hidden sm:flex absolute bottom-4 right-4 left-4 z-10 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <strong className="text-[#E4C675] font-bold ml-1">{current.title}:</strong>
                <span className="text-white/80">{current.description}</span>
              </div>
              <span className="text-white/50 text-[11px]">
                روی نقاط طلایی کلیک کنید تا جزئیات متریال نمایش داده شود
              </span>
            </div>
          </div>
        </div>

        {/* Hover-On-Expand Accordion Gallery Modal */}
        <div className="mt-16 pt-12 border-t border-white/10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/35 rounded-full px-4 py-1.5 text-xs font-semibold text-[#E4C675] tracking-wider mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>گالری آکاردئونی تعاملی (Hover on Expand)</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">
            کاوش پنت‌هاوس‌ها و عمارت‌های منتخب با حرکت ماوس
          </h3>
          <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            با بردن ماوس روی هر تصویر، کارت به‌طور روان باز می‌شود؛ با کلیک می‌توانید وارد نمای تمام‌صفحه و مشخصات معماری شوید.
          </p>
          <AccordionModal />
        </div>
      </div>
    </section>
  );
}
