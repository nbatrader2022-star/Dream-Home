import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  MapPin,
  Search,
  Eye,
  Layers,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  List,
  ExternalLink,
  ChevronLeft,
  Share2,
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Property, PropertyType } from '../types';
import { toPersianDigits, formatPriceShort, formatPrice } from '../utils/formatters';
import { SUPPORTED_CITIES_LIST } from '../data/additionalCityProperties';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface MapExplorerModalProps {
  properties: Property[];
  onClose: () => void;
  onSelectProperty: (property: Property) => void;
}

export function MapExplorerModal({
  properties,
  onClose,
  onSelectProperty,
}: MapExplorerModalProps) {
  const [activeCity, setActiveCity] = useState<string>('all');
  const [transactionType, setTransactionType] = useState<'all' | 'sale' | 'rent' | 'presale'>('all');
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = Roadmap, 'k' = Satellite
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [userLocationActive, setUserLocationActive] = useState<boolean>(false);

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (activeCity !== 'all' && p.city !== activeCity) return false;
      if (transactionType !== 'all' && p.status !== transactionType) return false;
      if (propertyType !== 'all' && p.propertyType !== propertyType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.title.toLowerCase().includes(q);
        const matchesLoc = p.location.toLowerCase().includes(q);
        const matchesNeigh = p.neighborhood.toLowerCase().includes(q);
        if (!matchesName && !matchesLoc && !matchesNeigh) return false;
      }
      return true;
    });
  }, [properties, activeCity, transactionType, propertyType, searchQuery]);

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) || filteredProperties[0] || properties[0];

  // Current center coordinates for map view
  const currentCenter = useMemo(() => {
    if (selectedProperty && selectedProperty.coordinates) {
      return {
        lat: selectedProperty.coordinates.lat,
        lng: selectedProperty.coordinates.lng,
      };
    }
    const cityInfo = SUPPORTED_CITIES_LIST.find((c) => c.key === activeCity);
    if (cityInfo && typeof cityInfo.lat === 'number') {
      return {
        lat: cityInfo.lat,
        lng: cityInfo.lng,
      };
    }
    return { lat: 35.805, lng: 51.425 }; // Tehran Shemiran default
  }, [selectedProperty, activeCity]);

  const handleCityChange = (cityKey: string) => {
    setActiveCity(cityKey);
    if (cityKey === 'all') {
      if (filteredProperties[0]) {
        setSelectedPropertyId(filteredProperties[0].id);
      }
      setZoomLevel(12);
    } else {
      const matchInCity = properties.find((p) => p.city === cityKey);
      if (matchInCity) {
        setSelectedPropertyId(matchInCity.id);
      }
      setZoomLevel(13);
    }
  };

  const handleToggleUserLocation = () => {
    if (!userLocationActive && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocationActive(true);
          setZoomLevel(15);
        },
        () => {
          // fallback to Tehran Shemiran center
          setUserLocationActive(true);
          setActiveCity('tehran');
          setZoomLevel(14);
        }
      );
    } else {
      setUserLocationActive(!userLocationActive);
    }
  };

  // Direct route in Google Maps external URL
  const googleMapsDirectionsUrl = useMemo(() => {
    if (!selectedProperty) return 'https://www.google.com/maps';
    return `https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.coordinates.lat},${selectedProperty.coordinates.lng}`;
  }, [selectedProperty]);

  // Google Maps Universal Interactive Embed URL
  const googleMapsEmbedUrl = useMemo(() => {
    return `https://maps.google.com/maps?q=${currentCenter.lat},${currentCenter.lng}&hl=fa&z=${zoomLevel}&t=${mapType}&output=embed`;
  }, [currentCenter, zoomLevel, mapType]);

  // Prevent background/body scrolling while card/modal is open
  useLockBodyScroll(true);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-fadeIn overflow-y-auto overscroll-contain">
      <div className="bg-[#1A1A2E] text-white w-full max-w-7xl h-[92vh] max-h-[92vh] rounded-3xl overflow-y-auto lg:overflow-hidden shadow-2xl flex flex-col border border-[#C9A84C]/30 relative overscroll-contain">
        {/* Top Header Bar */}
        <div className="bg-[#16213E] px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A07830] to-[#E4C675] text-[#1A1A2E] flex items-center justify-center font-bold shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                کاوشگر املاک روی نقشه گوگل (Google Maps)
                <span className="text-[10px] bg-[#C9A84C]/20 text-[#E4C675] border border-[#C9A84C]/40 px-2 py-0.5 rounded-full font-bold">
                  {toPersianDigits(filteredProperties.length)} ملک موجود
                </span>
              </h2>
              <p className="text-[11px] text-white/50">
                مشاهده واقعی معابر، دسترسی‌ها و تصویر ماهواره‌ای اختصاصی با موقعیت جغرافیایی دقیق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Map Layer Switcher */}
            <div className="flex items-center bg-[#1A1A2E] rounded-xl p-0.5 border border-white/10 text-xs">
              <button
                onClick={() => setMapType('m')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mapType === 'm' ? 'bg-[#C9A84C] text-[#1A1A2E]' : 'text-white/70 hover:text-white'
                }`}
                title="نمایش خیابان‌ها و معابر نقشه گوگل"
              >
                معابر
              </button>
              <button
                onClick={() => setMapType('k')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mapType === 'k' ? 'bg-[#C9A84C] text-[#1A1A2E]' : 'text-white/70 hover:text-white'
                }`}
                title="نمایش ماهواره‌ای واقعی گوگل ارت"
              >
                ماهواره
              </button>
            </div>

            {/* My Location Button */}
            <button
              onClick={handleToggleUserLocation}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                userLocationActive
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/15'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>موقعیت من</span>
            </button>

            {/* Sidebar toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                showSidebar
                  ? 'bg-[#C9A84C] text-[#1A1A2E] border-[#C9A84C]'
                  : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/15'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">لیست کارت‌ها</span>
            </button>

            {/* Google Maps External Directions */}
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 text-[#E4C675] border border-[#C9A84C]/40 hover:bg-[#C9A84C]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="مسیریابی مستقیم در اپلیکیشن گوگل مپ"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مسیریابی در Google Maps</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Strip inside Map Modal */}
        <div className="bg-[#111625] px-4 sm:px-5 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs z-20 shrink-0">
          {/* City Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[55%] no-scrollbar py-0.5">
            <span className="text-white/50 text-[11px] whitespace-nowrap">شهر:</span>
            <button
              onClick={() => handleCityChange('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCity === 'all'
                  ? 'bg-[#C9A84C] text-[#1A1A2E]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              همه ({toPersianDigits(SUPPORTED_CITIES_LIST.length)})
            </button>
            {SUPPORTED_CITIES_LIST.map((c) => (
              <button
                key={c.key}
                onClick={() => handleCityChange(c.key)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCity === c.key
                    ? 'bg-[#C9A84C] text-[#1A1A2E]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {c.nameFa}
              </button>
            ))}
          </div>

          {/* Transaction Type Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-white/50 text-[11px] whitespace-nowrap">معامله:</span>
            {[
              { id: 'all', label: 'همه' },
              { id: 'sale', label: 'خرید' },
              { id: 'rent', label: 'رهن و اجاره' },
              { id: 'presale', label: 'پیش‌فروش' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTransactionType(t.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  transactionType === t.id
                    ? 'bg-[#C9A84C] text-[#1A1A2E]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[170px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#C9A84C] absolute right-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی محله یا پروژه..."
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pr-8 pl-2.5 py-1.5 text-xs text-white outline-none focus:border-[#C9A84C] transition-colors placeholder:text-white/40"
            >
            </input>
          </div>
        </div>

        {/* Main Map Body + Side Panel */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Real Google Maps Stage */}
          <div className="relative flex-1 bg-[#0B0F19] overflow-hidden flex flex-col">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  mapId="bf51a910020fa25a"
                  center={currentCenter}
                  zoom={zoomLevel}
                  onZoomChanged={(e) => setZoomLevel(e.detail.zoom)}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  className="w-full h-full"
                >
                  {filteredProperties.map((prop) => {
                    const isSelected = prop.id === selectedProperty?.id;
                    return (
                      <AdvancedMarker
                        key={prop.id}
                        position={{ lat: prop.coordinates.lat, lng: prop.coordinates.lng }}
                        onClick={() => setSelectedPropertyId(prop.id)}
                        title={prop.title}
                      >
                        <Pin
                          background={isSelected ? '#C9A84C' : '#1A1A2E'}
                          borderColor={isSelected ? '#FFFFFF' : '#C9A84C'}
                          glyphColor={isSelected ? '#1A1A2E' : '#E4C675'}
                          scale={isSelected ? 1.25 : 1.0}
                        />
                      </AdvancedMarker>
                    );
                  })}
                </Map>
              </APIProvider>
            ) : (
              /* Real Google Maps Interactive View */
              <div className="relative w-full h-full">
                <iframe
                  title="نقشه زنده گوگل مپ املاک آرمانی"
                  src={googleMapsEmbedUrl}
                  className="w-full h-full border-0 filter contrast-[1.05]"
                  loading="lazy"
                  allowFullScreen
                />

                {/* Floating Map Info Overlay Pill */}
                <div className="absolute top-4 left-4 z-20 bg-[#1A1A2E]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#C9A84C]/40 shadow-xl flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-white/90 font-bold">
                    {selectedProperty ? `${selectedProperty.title} (${selectedProperty.location})` : 'نقشه سراسری ایران'}
                  </span>
                  <span className="text-white/40 text-[10px] font-mono" dir="ltr">
                    {currentCenter.lat.toFixed(4)}, {currentCenter.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {/* Map Zoom Controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-[#1A1A2E]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-xl">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
                title="بزرگ‌نمایی نقشه گوگل"
                className="p-2 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 1, 8))}
                title="کوچک‌نمایی نقشه گوگل"
                className="p-2 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(14)}
                title="بازنشانی بزرگ‌نمایی استاندارد"
                className="p-2 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Preview Floating Card (Visible when sidebar is closed or on mobile) */}
            {selectedProperty && (!showSidebar || typeof window !== 'undefined' && window.innerWidth < 768) && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-30 bg-[#1A1A2E]/95 backdrop-blur-xl border border-[#C9A84C]/40 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-right animate-fadeIn">
                <div className="flex gap-4 items-center">
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-white/15"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-[#C9A84C] font-bold mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{selectedProperty.location}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white truncate mb-1">
                      {selectedProperty.title}
                    </h4>
                    <div className="text-sm font-black text-[#E4C675] mb-2">
                      {formatPrice(selectedProperty.price)}
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectProperty(selectedProperty);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    مشاهده صفحه کامل ملک
                  </button>
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-[#E4C675] border border-white/10 transition-colors"
                    title="مسیریابی در Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Side Panel: Properties List Alongside Google Map */}
          {showSidebar && (
            <div className="hidden md:flex flex-col w-80 lg:w-96 bg-[#16213E] border-r border-white/10 z-20">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">املاک روی نقشه</h3>
                  <span className="text-[11px] text-white/50">
                    {toPersianDigits(filteredProperties.length)} مورد ثبت‌شده در این مختصات
                  </span>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-xs text-white/60 hover:text-white cursor-pointer"
                >
                  بستن پنل ✕
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-12 px-4 text-white/50 text-xs">
                    ملکی در این فیلتر جغرافیایی یافت نشد. فیلترها را تغییر دهید.
                  </div>
                ) : (
                  filteredProperties.map((prop) => {
                    const isSelected = prop.id === selectedProperty?.id;

                    return (
                      <div
                        key={prop.id}
                        onClick={() => setSelectedPropertyId(prop.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                          isSelected
                            ? 'bg-[#1A1A2E] border-[#C9A84C] shadow-lg ring-1 ring-[#C9A84C]'
                            : 'bg-[#1A1A2E]/60 border-white/10 hover:border-[#C9A84C]/50 hover:bg-[#1A1A2E]'
                        }`}
                      >
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-[#C9A84C] mb-0.5">
                              <span>{prop.location}</span>
                              <span className="bg-white/10 px-1.5 py-0.2 rounded text-[9px] text-white">
                                {prop.status === 'sale' ? 'خرید' : 'اجاره'}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-white truncate mb-1">
                              {prop.title}
                            </h4>
                            <div className="text-xs font-black text-[#E4C675]">
                              {formatPrice(prop.price)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-white/50 mt-2 pt-1 border-t border-white/10">
                            <span>{toPersianDigits(prop.area)} متر • {toPersianDigits(prop.bedrooms)} خواب</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                onSelectProperty(prop);
                              }}
                              className="text-[#C9A84C] hover:text-[#E4C675] font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              جزئیات <ChevronLeft className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
