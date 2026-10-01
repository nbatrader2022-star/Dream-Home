import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, User, Phone, MessageSquare, Sparkles, Building } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Property, VisitBooking } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { submitViewingRequest } from '../services/leadsAndBookingsService';

interface ScheduleVisitModalProps {
  property: Property | null;
  onClose: () => void;
  onSaveBooking: (booking: VisitBooking) => void;
}

export function ScheduleVisitModal({
  property,
  onClose,
  onSaveBooking,
}: ScheduleVisitModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('فردا (۱۶ خرداد)');
  const [selectedTime, setSelectedTime] = useState<string>('عصر ۱۶:۰۰ الی ۱۸:۰۰');
  const [visitType, setVisitType] = useState<'in-person' | 'virtual-3d'>('in-person');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<VisitBooking | null>(null);
  const [error, setError] = useState<string>('');

  useLockBodyScroll(Boolean(property));

  if (!property) return null;

  const dateOptions = [
    'امروز بعدازظهر',
    'فردا (۱۶ خرداد)',
    'پس‌فردا (۱۷ خرداد)',
    'آخر هفته (پنج‌شنبه)',
    'ابتدای هفته آینده (شنبه)',
  ];

  const timeOptions = [
    'صبح ۱۰:۰۰ الی ۱۲:۰۰',
    'ظهر ۱۲:۰۰ الی ۱۴:۰۰',
    'عصر ۱۶:۰۰ الی ۱۸:۰۰',
    'غروب ۱۸:۰۰ الی ۲۰:۰۰',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    const cleanPhone = phone.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/[-\s]/g, '');
    if (!cleanPhone.match(/^0?9[0-9]{9}$/)) {
      setError('شماره موبایل وارد شده معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).');
      return;
    }

    setLoading(true);

    const trackingCode = `DH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: VisitBooking = {
      id: `book-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.images[0],
      date: selectedDate,
      timeSlot: selectedTime,
      visitType,
      name: name.trim(),
      phone: cleanPhone,
      notes: notes.trim(),
      trackingCode,
      createdAt: new Date().toISOString(),
    };

    try {
      await submitViewingRequest(newBooking);
    } catch (submitErr) {
      console.warn('Viewing request Supabase sync:', submitErr);
    }

    onSaveBooking(newBooking);
    setConfirmedBooking(newBooking);
    setLoading(false);

    // Trigger Celebration Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A84C', '#E4C675', '#2D6A4F', '#1A1A2E'],
      });
    } catch (err) {
      // ignore if not supported
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 text-right animate-fadeIn">
      <div className="bg-[#F8F4EF] text-[#1A1A2E] w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative my-auto">
        {/* Header */}
        <div className="bg-[#1A1A2E] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#C9A84C]" />
            <div>
              <h3 className="font-bold text-base">هماهنگی نوبت بازدید ملک</h3>
              <p className="text-[11px] text-white/50">
                مشاور اختصاصی شما در زمان انتخابی جهت همراهی آماده خواهد بود
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

        {/* Modal Body Container with internal scroll */}
        <div className="overflow-y-auto flex-1">

        {confirmedBooking ? (
          /* Confirmation State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center mx-auto mb-4 animate-bounceIn">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-[#1A1A2E] mb-1">
              نوبت بازدید شما با موفقیت ثبت شد!
            </h3>
            <p className="text-xs text-[#5A5A7A] mb-6">
              کد رهگیری اختصاصی شما: <strong className="text-[#1A1A2E] font-black text-sm">{confirmedBooking.trackingCode}</strong>
            </p>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 text-right text-xs space-y-3 mb-6 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-[#5A5A7A]">ملک انتخابی:</span>
                <span className="font-bold text-[#1A1A2E]">{confirmedBooking.propertyTitle}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-[#5A5A7A]">تاریخ بازدید:</span>
                <span className="font-bold text-[#1A1A2E]">{confirmedBooking.date}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <span className="text-[#5A5A7A]">ساعت:</span>
                <span className="font-bold text-[#1A1A2E]">{confirmedBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5A5A7A]">نوع بازدید:</span>
                <span className="font-bold text-[#A07830]">
                  {confirmedBooking.visitType === 'in-person' ? 'حضوری در محل ملک' : 'تور سه‌بعدی آنلاین ۳D'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5A5A7A] leading-relaxed mb-6">
              مشاور محترم <strong className="text-[#1A1A2E]">{property.agent.name}</strong> حداکثر تا ۲ ساعت دیگر با شماره همراه شما تماس خواهد گرفت.
            </p>

            <button
              onClick={onClose}
              className="bg-[#1A1A2E] text-white text-xs font-bold px-8 py-3 rounded-full hover:bg-[#0F3460] transition-colors"
            >
              متشکرم، بستن پنجره
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 flex flex-col gap-5">
            {/* Property Mini Banner */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center gap-3.5 shadow-sm">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#1A1A2E] truncate mb-0.5">
                  {property.title}
                </div>
                <div className="text-[11px] text-[#A07830] font-black mb-0.5">
                  {formatPrice(property.price)}
                </div>
                <div className="text-[10px] text-[#5A5A7A] truncate">
                  {property.location}
                </div>
              </div>
            </div>

            {/* Visit Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] mb-2">
                شیوه بازدید:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitType('in-person')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    visitType === 'in-person'
                      ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#A07830]'
                      : 'border-stone-200 bg-white text-[#5A5A7A]'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  بازدید حضوری در محل
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('virtual-3d')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    visitType === 'virtual-3d'
                      ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#A07830]'
                      : 'border-stone-200 bg-white text-[#5A5A7A]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                  تور مجازی آنلاین ۳D
                </button>
              </div>
            </div>

            {/* Preferred Date Options */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] mb-2">
                انتخاب روز پیشنهادی:
              </label>
              <div className="flex flex-wrap gap-2">
                {dateOptions.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      selectedDate === date
                        ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] font-bold shadow-sm'
                        : 'bg-white text-[#5A5A7A] border-stone-200 hover:border-[#C9A84C]'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Time Slot */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] mb-2">
                بازه زمانی مورد نظر:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      selectedTime === time
                        ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] font-bold shadow-sm'
                        : 'bg-white text-[#5A5A7A] border-stone-200 hover:border-[#C9A84C]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9A9AB0] absolute right-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: آرش کیانی"
                    className="w-full bg-white border border-stone-200 rounded-xl pr-9 pl-3 py-2.5 text-xs text-[#1A1A2E] outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                  شماره موبایل جهت هماهنگی
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9A9AB0] absolute right-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full bg-white border border-stone-200 rounded-xl pr-9 pl-3 py-2.5 text-xs text-[#1A1A2E] outline-none focus:border-[#C9A84C]"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                یادداشت یا تقاضای ویژه (اختیاری)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="در صورت تمایل به همراهی کارشناس معماری یا نیاز به حضور در ساعات خاص بنویسید..."
                className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-[#1A1A2E] outline-none focus:border-[#C9A84C]"
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(201,168,76,0.35)] hover:shadow-[0_12px_36px_rgba(201,168,76,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>در حال رزرو نوبت...</span>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  تأیید و ثبت نهایی نوبت بازدید
                </>
              )}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
