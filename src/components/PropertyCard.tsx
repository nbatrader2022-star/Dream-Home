import React, { useRef } from 'react';
import { MapPin, Heart, Scale, Eye, Bed, Bath, Maximize } from 'lucide-react';
import { Property } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';

interface PropertyCardProps {
  key?: React.Key;
  property: Property;
  isSaved: boolean;
  isCompared: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onToggleCompare: (id: string, e: React.MouseEvent) => void;
  onSelect: (property: Property) => void;
}

export function PropertyCard({
  property,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onSelect,
}: PropertyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !window.matchMedia('(hover: hover)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = '';
  };

  const getStatusBadge = () => {
    switch (property.status) {
      case 'sale':
        return (
          <span className="bg-[#2D6A4F] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
            فروش
          </span>
        );
      case 'rent':
        return (
          <span className="bg-[#0F3460] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
            اجاره
          </span>
        );
      case 'presale':
        return (
          <span className="bg-[#C9A84C] text-[#1A1A2E] text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
            پیش‌فروش
          </span>
        );
      case 'sold':
        return (
          <span className="bg-white/30 backdrop-blur-md text-white/90 text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
            فروخته شد
          </span>
        );
    }
  };

  const displayPrice =
    property.transactionType === 'rent'
      ? `${toPersianDigits(Math.round((property.rentPrice || 25000000) / 1000000))}م/ماه`
      : formatPrice(property.price);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(property)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(26,26,46,0.08)] hover:shadow-[0_20px_50px_rgba(26,26,46,0.18)] transition-all duration-300 cursor-pointer flex flex-col group border border-stone-200/60"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1A1A2E]">
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Hover Overlay with Quick View button */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/85 via-[#1A1A2E]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <span className="bg-[#C9A84C] text-[#1A1A2E] font-bold text-xs px-6 py-2.5 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            مشاهده جزئیات ملک
          </span>
        </div>

        {/* Status Badge (Top Right) */}
        <div className="absolute top-3.5 right-3.5 z-10">{getStatusBadge()}</div>

        {/* Top Left Action Buttons (Save & Compare) */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property.id, e);
            }}
            title={isCompared ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
              isCompared
                ? 'bg-[#C9A84C] text-[#1A1A2E] shadow-md scale-105'
                : 'bg-white/90 text-[#5A5A7A] hover:text-[#C9A84C]'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          {/* Save/Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id, e);
            }}
            title={isSaved ? 'حذف از نشان‌شده‌ها' : 'نشان کردن این ملک'}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
              isSaved
                ? 'bg-[#E84393]/15 text-[#E84393] scale-105'
                : 'bg-white/90 text-[#9A9AB0] hover:text-[#E84393]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#E84393]' : ''}`} />
          </button>
        </div>

        {/* Price Badge (Bottom Right) */}
        <div className="absolute bottom-3.5 right-3.5 z-10 bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-[0_4px_16px_rgba(201,168,76,0.4)]">
          {displayPrice}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-[#1A1A2E] mb-2 line-clamp-1 group-hover:text-[#A07830] transition-colors">
            {property.title}
          </h3>

          <div className="text-xs text-[#5A5A7A] flex items-center gap-1.5 mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Specifications Bar */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[#EDE8E0] border-t border-[#EDE8E0] pt-3 text-center">
          <div className="px-1">
            <div className="text-sm font-extrabold text-[#1A1A2E]">
              {property.bedrooms > 0 ? toPersianDigits(property.bedrooms) : '—'}
            </div>
            <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mt-0.5">
              <Bed className="w-3 h-3 text-[#9A9AB0]" />
              اتاق
            </div>
          </div>

          <div className="px-1">
            <div className="text-sm font-extrabold text-[#1A1A2E]">
              {property.bathrooms > 0 ? toPersianDigits(property.bathrooms) : '—'}
            </div>
            <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mt-0.5">
              <Bath className="w-3 h-3 text-[#9A9AB0]" />
              حمام
            </div>
          </div>

          <div className="px-1">
            <div className="text-sm font-extrabold text-[#1A1A2E]">
              {toPersianDigits(property.area)}
            </div>
            <div className="text-[11px] text-[#5A5A7A] flex items-center justify-center gap-1 mt-0.5">
              <Maximize className="w-3 h-3 text-[#9A9AB0]" />
              متر
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
