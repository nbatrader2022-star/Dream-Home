import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  MapPin,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Building,
  Key,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { Property, PropertyType, TransactionType } from '../types';
import { CMSElement } from '../types/cms';
import { PropertyCard } from './PropertyCard';
import { toPersianDigits, formatPrice } from '../utils/formatters';
import { SUPPORTED_CITIES_LIST } from '../data/additionalCityProperties';

interface PropertyListingSectionProps {
  properties: Property[];
  savedIds: string[];
  compareIds: string[];
  selectedType: PropertyType | 'all';
  selectedCity: string;
  searchQuery: string;
  onSelectType: (type: PropertyType | 'all') => void;
  onSelectCity: (city: string) => void;
  onSearchQueryChange: (query: string) => void;
  onClearFilters: () => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onToggleCompare: (id: string, e: React.MouseEvent) => void;
  onSelectProperty: (property: Property) => void;
  onOpenMapExplorer?: () => void;
  onSaveCurrentSearch?: (criteria: {
    title: string;
    city?: string;
    neighborhood?: string;
    propertyType?: PropertyType | 'all';
    maxPrice?: number;
    minBedrooms?: number;
  }) => void;
  cmsElements?: CMSElement[];
}

export function PropertyListingSection({
  properties,
  savedIds,
  compareIds,
  selectedType,
  selectedCity,
  searchQuery,
  onSelectType,
  onSelectCity,
  onSearchQueryChange,
  onClearFilters,
  onToggleSave,
  onToggleCompare,
  onSelectProperty,
  onOpenMapExplorer,
  onSaveCurrentSearch,
  cmsElements,
}: PropertyListingSectionProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'area-desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(9);

  const cmsBadge = cmsElements?.find((e) => e.editorKey === 'properties.badge');
  const cmsTitle = cmsElements?.find((e) => e.editorKey === 'properties.title');
  const cmsSubtitle = cmsElements?.find((e) => e.editorKey === 'properties.subtitle');
  const cmsFilterBtn = cmsElements?.find((e) => e.editorKey === 'properties.filterButton');
  const cmsCard = cmsElements?.find((e) => e.editorKey === 'properties.card');

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [transactionType, setTransactionType] = useState<TransactionType | 'all'>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>(''); // '', 'under10', '10to25', '25to50', 'above50'
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<number | 'all'>('all');
  const [bathrooms, setBathrooms] = useState<number | 'all'>('all');
  const [buildingAge, setBuildingAge] = useState<string>('all'); // 'all', '0', '5', '10'
  const [floorCategory, setFloorCategory] = useState<string>('all'); // 'all', 'ground', 'middle', 'top'

  // Amenities Flags
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [hasElevator, setHasElevator] = useState<boolean>(false);
  const [hasStorage, setHasStorage] = useState<boolean>(false);
  const [hasPool, setHasPool] = useState<boolean>(false);
  const [hasTerrace, setHasTerrace] = useState<boolean>(false);
  const [isSmartHome, setIsSmartHome] = useState<boolean>(false);
  const [isFurnished, setIsFurnished] = useState<boolean>(false);

  useEffect(() => {
    setVisibleCount(9);
  }, [
    selectedType,
    selectedCity,
    searchQuery,
    transactionType,
    selectedNeighborhood,
    priceRange,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    buildingAge,
    floorCategory,
    hasParking,
    hasElevator,
    hasStorage,
    hasPool,
    hasTerrace,
    isSmartHome,
    isFurnished,
  ]);

  // Extract distinct neighborhoods for the neighborhood filter
  const allNeighborhoods = Array.from(
    new Set(properties.map((p) => p.neighborhood).filter(Boolean))
  ).sort();

  // Reset all filters including advanced ones
  const handleResetAllFilters = () => {
    onClearFilters();
    setTransactionType('all');
    setSelectedNeighborhood('all');
    setPriceRange('');
    setMinArea('');
    setMaxArea('');
    setBedrooms('all');
    setBathrooms('all');
    setBuildingAge('all');
    setFloorCategory('all');
    setHasParking(false);
    setHasElevator(false);
    setHasStorage(false);
    setHasPool(false);
    setHasTerrace(false);
    setIsSmartHome(false);
    setIsFurnished(false);
  };

  // Count how many advanced filters are active
  const activeAdvancedCount =
    (transactionType !== 'all' ? 1 : 0) +
    (selectedNeighborhood !== 'all' ? 1 : 0) +
    (priceRange !== '' ? 1 : 0) +
    (minArea !== '' ? 1 : 0) +
    (maxArea !== '' ? 1 : 0) +
    (bedrooms !== 'all' ? 1 : 0) +
    (bathrooms !== 'all' ? 1 : 0) +
    (buildingAge !== 'all' ? 1 : 0) +
    (floorCategory !== 'all' ? 1 : 0) +
    (hasParking ? 1 : 0) +
    (hasElevator ? 1 : 0) +
    (hasStorage ? 1 : 0) +
    (hasPool ? 1 : 0) +
    (hasTerrace ? 1 : 0) +
    (isSmartHome ? 1 : 0) +
    (isFurnished ? 1 : 0);

  // Filter & Sort Logic
  const filtered = properties
    .filter((p) => {
      // Transaction Type
      if (transactionType !== 'all') {
        if (transactionType === 'buy' && p.transactionType !== 'buy') return false;
        if (transactionType === 'rent' && p.transactionType !== 'rent' && p.transactionType !== 'mortgage') return false;
        if (transactionType === 'mortgage' && p.transactionType !== 'mortgage' && p.transactionType !== 'rent') return false;
        if (transactionType === 'presale' && p.transactionType !== 'presale') return false;
      }

      // Property Type
      if (selectedType !== 'all' && p.propertyType !== selectedType) return false;

      // City filter
      if (
        selectedCity &&
        p.city !== selectedCity &&
        p.cityNameFa !== selectedCity &&
        (p as any).cityKey !== selectedCity
      ) {
        return false;
      }

      // Neighborhood filter
      if (selectedNeighborhood !== 'all' && p.neighborhood !== selectedNeighborhood) return false;

      // Price Bracket
      if (priceRange === 'under10' && p.price > 10_000_000_000) return false;
      if (priceRange === '10to25' && (p.price < 10_000_000_000 || p.price > 25_000_000_000)) return false;
      if (priceRange === '25to50' && (p.price < 25_000_000_000 || p.price > 50_000_000_000)) return false;
      if (priceRange === 'above50' && p.price < 50_000_000_000) return false;

      // Area Range
      const parsedMinArea = Number(minArea);
      const parsedMaxArea = Number(maxArea);
      if (minArea && !isNaN(parsedMinArea) && p.area < parsedMinArea) return false;
      if (maxArea && !isNaN(parsedMaxArea) && p.area > parsedMaxArea) return false;

      // Bedrooms
      if (bedrooms !== 'all') {
        if (bedrooms === 4 ? p.bedrooms < 4 : p.bedrooms !== bedrooms) return false;
      }

      // Bathrooms
      if (bathrooms !== 'all') {
        if (bathrooms === 3 ? p.bathrooms < 3 : p.bathrooms !== bathrooms) return false;
      }

      // Building Age
      if (buildingAge === '0' && p.buildingAge !== 0) return false;
      if (buildingAge === '5' && p.buildingAge > 5) return false;
      if (buildingAge === '10' && p.buildingAge > 10) return false;

      // Floor
      if (floorCategory === 'ground' && p.floor > 1) return false;
      if (floorCategory === 'middle' && (p.floor <= 1 || p.floor >= (p.totalFloors || 6))) return false;
      if (floorCategory === 'top' && p.floor < (p.totalFloors || 5) && p.propertyType !== 'penthouse') return false;

      // Amenities checks
      const amenitiesText = (p.amenities || []).join(' ') + ' ' + (p.description || '');
      if (hasParking && p.parking <= 0 && !amenitiesText.includes('پارکینگ')) return false;
      if (hasElevator && !amenitiesText.includes('آسانسور') && p.floor > 1) return false;
      if (hasStorage && !amenitiesText.includes('انباری')) return false;
      if (hasPool && !amenitiesText.includes('استخر')) return false;
      if (hasTerrace && !amenitiesText.includes('تراس') && !amenitiesText.includes('روف')) return false;
      if (isSmartHome && !amenitiesText.includes('هوشمند') && !amenitiesText.includes('BMS')) return false;
      if (isFurnished && !amenitiesText.includes('فرنیش') && !amenitiesText.includes('مبله')) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchNbr = p.neighborhood.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchNbr && !matchDesc) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'area-desc') return b.area - a.area;
      return 0; // Default order
    });

  const displayed = filtered.slice(0, visibleCount);

  const filterPropertyTypes: Array<{ id: PropertyType | 'all'; label: string }> = [
    { id: 'all', label: 'همه کاربری‌ها' },
    { id: 'apartment', label: 'آپارتمان' },
    { id: 'villa', label: 'ویلا' },
    { id: 'penthouse', label: 'پنت‌هاوس' },
    { id: 'commercial', label: 'تجاری و اداری' },
    { id: 'land', label: 'زمین و کلنگی' },
  ];

  const transactionTabs: Array<{ id: TransactionType | 'all'; label: string }> = [
    { id: 'all', label: 'همه معاملات' },
    { id: 'buy', label: 'خرید ملک' },
    { id: 'rent', label: 'رهن و اجاره' },
    { id: 'presale', label: 'پیش‌فروش ویژه' },
  ];

  const hasAnyActiveFilter =
    selectedType !== 'all' ||
    selectedCity !== '' ||
    searchQuery !== '' ||
    activeAdvancedCount > 0;

  return (
    <section className="bg-[#EDE8E0] py-12 sm:py-16 px-3.5 sm:px-6 scroll-mt-24" id="properties">
      <div className="max-w-[1400px] mx-auto text-right">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block w-12 h-1 bg-gradient-to-r from-[#A07830] to-[#E4C675] rounded-full mb-3" />
          {(!cmsBadge || cmsBadge.isVisible) && (
            <div className="block">
              <span
                style={{
                  backgroundColor: cmsBadge?.styles.backgroundColor || 'rgba(201, 168, 76, 0.15)',
                  color: cmsBadge?.styles.color || '#A07830',
                  borderColor: cmsBadge?.styles.borderColor || 'rgba(201, 168, 76, 0.3)',
                  borderRadius: cmsBadge?.styles.borderRadius || '9999px',
                  fontSize: cmsBadge?.styles.fontSize || '11px',
                  paddingTop: cmsBadge?.styles.paddingTop,
                  paddingBottom: cmsBadge?.styles.paddingBottom,
                  paddingRight: cmsBadge?.styles.paddingRight,
                  paddingLeft: cmsBadge?.styles.paddingLeft,
                }}
                className="inline-block font-bold tracking-widest px-3.5 py-1 rounded-full border mb-2.5 shadow-sm font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
              >
                {cmsBadge?.content.text ? toPersianDigits(cmsBadge.content.text) : 'جستجو و فیلترهای تخصصی خانه آرمانی'}
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
              {cmsTitle?.content.text ? toPersianDigits(cmsTitle.content.text) : 'پورتفولیوی املاک منتخب و فاخر'}
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
                'جستجوی دقیق املاک بر اساس شاخص‌های اصیل معماری، بودجه، متراژ و امکانات رفاهی روز'}
            </p>
          )}
        </div>

        {/* Transaction Type Tabs (خرید | اجاره | رهن | پیش‌فروش) */}
        <div className="flex justify-center mb-5">
          <div
            style={{
              borderRadius: cmsFilterBtn?.styles.borderRadius
                ? `calc(${cmsFilterBtn.styles.borderRadius} + 4px)`
                : '16px',
            }}
            className="bg-[#1A1A2E] p-1.5 flex items-center gap-1.5 shadow-md border border-[#C9A84C]/30 overflow-x-auto max-w-full"
          >
            {transactionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTransactionType(tab.id)}
                style={{
                  borderRadius: cmsFilterBtn?.styles.borderRadius || '12px',
                  backgroundColor:
                    transactionType === tab.id
                      ? cmsFilterBtn?.styles.backgroundColor || '#C9A84C'
                      : 'transparent',
                  color:
                    transactionType === tab.id
                      ? cmsFilterBtn?.styles.color || '#1A1A2E'
                      : 'rgba(255, 255, 255, 0.7)',
                  fontSize: cmsFilterBtn?.styles.fontSize,
                  paddingTop: cmsFilterBtn?.styles.paddingTop,
                  paddingBottom: cmsFilterBtn?.styles.paddingBottom,
                  paddingRight: cmsFilterBtn?.styles.paddingRight,
                  paddingLeft: cmsFilterBtn?.styles.paddingLeft,
                }}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  transactionType === tab.id
                    ? 'shadow-sm'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          {/* Main Property Type Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {filterPropertyTypes.map((btn) => (
              <button
                key={btn.id}
                onClick={() => onSelectType(btn.id)}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  selectedType === btn.id
                    ? 'bg-[#1A1A2E] border-[#1A1A2E] text-white shadow-sm'
                    : 'bg-white border-[#C9A84C]/20 text-[#5A5A7A] hover:border-[#1A1A2E] hover:text-[#1A1A2E]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Search, City, Sort & Advanced Toggle Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200/80 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#C9A84C] absolute right-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="جستجو بر اساس نام، خیابان، محله (مثلاً: نیاوران، فرشته، جلفا...)"
                className="w-full bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] outline-none focus:border-[#C9A84C] transition-all placeholder:text-[#9A9AB0]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchQueryChange('')}
                  className="absolute left-3 top-3 text-[#9A9AB0] hover:text-[#1A1A2E] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City Dropdown Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A2E] outline-none focus:border-[#C9A84C] transition-all cursor-pointer font-medium"
              >
                <option value="">همه شهرها ({SUPPORTED_CITIES_LIST.length} کلان‌شهر)</option>
                {SUPPORTED_CITIES_LIST.map((city) => (
                  <option key={city.key} value={city.key}>
                    {city.nameFa} ({city.province})
                  </option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F8F4EF] border border-[#EDE8E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A2E] outline-none focus:border-[#C9A84C] transition-all cursor-pointer font-medium"
              >
                <option value="newest">جدیدترین</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
                <option value="area-desc">بیشترین متراژ</option>
              </select>

              {/* Advanced Filter Button Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  showAdvancedFilters || activeAdvancedCount > 0
                    ? 'bg-[#1A1A2E] text-[#E4C675] border-[#C9A84C]'
                    : 'bg-[#F8F4EF] text-[#1A1A2E] border-[#EDE8E0] hover:border-[#C9A84C]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
                <span>فیلترهای پیشرفته</span>
                {activeAdvancedCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#C9A84C] text-[#1A1A2E] text-[10px] font-black flex items-center justify-center">
                    {toPersianDigits(activeAdvancedCount)}
                  </span>
                )}
                {showAdvancedFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* View Switchers */}
              <div className="flex items-center gap-1 bg-[#F8F4EF] p-1 rounded-xl border border-[#EDE8E0]">
                <button
                  onClick={() => setViewMode('grid')}
                  title="نمای شبکه‌ای"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#1A1A2E] text-white shadow-sm'
                      : 'text-[#5A5A7A] hover:text-[#1A1A2E]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="نمای ردیفی"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#1A1A2E] text-white shadow-sm'
                      : 'text-[#5A5A7A] hover:text-[#1A1A2E]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Map Toggle Button */}
              <button
                onClick={onOpenMapExplorer}
                className="bg-[#1A1A2E] hover:bg-[#0F3460] text-[#E4C675] text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span className="hidden sm:inline">روی نقشه</span>
              </button>
            </div>
          </div>

          {/* Expandable Advanced Filters Panel (Armani Design Style) */}
          {showAdvancedFilters && (
            <div className="bg-[#1A1A2E] text-white p-6 rounded-3xl shadow-xl border border-[#C9A84C]/30 animate-fadeIn">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C9A84C]/20 text-[#E4C675] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">فیلترهای اختصاصی و هوشمند ملک</h3>
                    <p className="text-[11px] text-white/50">تنظیم دقیق مشخصات فنی، سن بنا، طبقات و امکانات لوکس</p>
                  </div>
                </div>

                <button
                  onClick={handleResetAllFilters}
                  className="text-xs text-[#E4C675] hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بازنشانی تمام فیلترها</span>
                </button>
              </div>

              {/* Advanced Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* 1. Neighborhood */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">محله مورد نظر</label>
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="w-full bg-[#16213E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C9A84C] transition-colors cursor-pointer"
                  >
                    <option value="all">همه محله‌ها</option>
                    {allNeighborhoods.map((nbr) => (
                      <option key={nbr} value={nbr}>
                        {nbr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Price Range */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">بازه قیمت کل</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-[#16213E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C9A84C] transition-colors cursor-pointer"
                  >
                    <option value="">بدون محدودیت قیمت</option>
                    <option value="under10">کمتر از ۱۰ میلیارد تومان</option>
                    <option value="10to25">۱۰ تا ۲۵ میلیارد تومان</option>
                    <option value="25to50">۲۵ تا ۵۰ میلیارد تومان</option>
                    <option value="above50">بیش از ۵۰ میلیارد تومان</option>
                  </select>
                </div>

                {/* 3. Area Range (Min / Max) */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">متراژ (متر مربع)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      placeholder="از متراژ"
                      className="w-1/2 bg-[#16213E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C9A84C] text-center placeholder:text-white/30"
                    />
                    <span className="text-xs text-white/40">تا</span>
                    <input
                      type="number"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      placeholder="تا متراژ"
                      className="w-1/2 bg-[#16213E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C9A84C] text-center placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* 4. Bedrooms */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">تعداد اتاق خواب</label>
                  <div className="flex items-center gap-1 bg-[#16213E] p-1 rounded-xl border border-white/10">
                    {[
                      { id: 'all', label: 'همه' },
                      { id: 1, label: '۱' },
                      { id: 2, label: '۲' },
                      { id: 3, label: '۳' },
                      { id: 4, label: '۴+' },
                    ].map((b) => (
                      <button
                        key={String(b.id)}
                        onClick={() => setBedrooms(b.id as any)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          bedrooms === b.id
                            ? 'bg-[#C9A84C] text-[#1A1A2E]'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Bathrooms */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">سرویس و حمام</label>
                  <div className="flex items-center gap-1 bg-[#16213E] p-1 rounded-xl border border-white/10">
                    {[
                      { id: 'all', label: 'همه' },
                      { id: 1, label: '۱' },
                      { id: 2, label: '۲' },
                      { id: 3, label: '۳+' },
                    ].map((b) => (
                      <button
                        key={String(b.id)}
                        onClick={() => setBathrooms(b.id as any)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          bathrooms === b.id
                            ? 'bg-[#C9A84C] text-[#1A1A2E]'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Building Age */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">سن بنا</label>
                  <select
                    value={buildingAge}
                    onChange={(e) => setBuildingAge(e.target.value)}
                    className="w-full bg-[#16213E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C9A84C] transition-colors cursor-pointer"
                  >
                    <option value="all">همه سنین بنا</option>
                    <option value="0">نوساز کلید نخورده</option>
                    <option value="5">تا ۵ سال ساخت</option>
                    <option value="10">تا ۱۰ سال ساخت</option>
                  </select>
                </div>

                {/* 7. Floor Category */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">موقعیت طبقه</label>
                  <select
                    value={floorCategory}
                    onChange={(e) => setFloorCategory(e.target.value)}
                    className="w-full bg-[#16213E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C9A84C] transition-colors cursor-pointer"
                  >
                    <option value="all">همه طبقات</option>
                    <option value="ground">همکف یا اول</option>
                    <option value="middle">طبقات میانی</option>
                    <option value="top">طبقات بالا / پنت‌هاوس</option>
                  </select>
                </div>
              </div>

              {/* Special Amenities Checklist (Smart Home, Pool, Parking, Terrace, etc.) */}
              <div>
                <div className="text-xs font-bold text-white/80 mb-2.5">
                  امکانات ویژه و مشاعات لوکس:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {[
                    { label: 'پارکینگ سندی', state: hasParking, setter: setHasParking },
                    { label: 'آسانسور', state: hasElevator, setter: setHasElevator },
                    { label: 'انباری اختصاصی', state: hasStorage, setter: setHasStorage },
                    { label: 'استخر / سونا', state: hasPool, setter: setHasPool },
                    { label: 'تراس / روف‌گاردن', state: hasTerrace, setter: setHasTerrace },
                    { label: 'هوشمندسازی (BMS)', state: isSmartHome, setter: setIsSmartHome },
                    { label: 'مبله (فول‌فرنیش)', state: isFurnished, setter: setIsFurnished },
                  ].map((amenity, idx) => (
                    <button
                      key={idx}
                      onClick={() => amenity.setter(!amenity.state)}
                      className={`p-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                        amenity.state
                          ? 'bg-[#C9A84C] text-[#1A1A2E] border-[#C9A84C]'
                          : 'bg-[#16213E] text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                          amenity.state ? 'bg-[#1A1A2E] text-[#C9A84C]' : 'border border-white/30'
                        }`}
                      >
                        {amenity.state && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{amenity.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Chips Bar */}
          <div className="flex items-center justify-between text-xs text-[#5A5A7A] px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                نمایش{' '}
                <strong className="text-[#1A1A2E] font-bold">
                  {toPersianDigits(displayed.length)}
                </strong>{' '}
                از{' '}
                <strong className="text-[#1A1A2E] font-bold">
                  {toPersianDigits(filtered.length)}
                </strong>{' '}
                ملک با مشخصات انتخابی
              </span>

              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#C9A84C]/15 text-[#A07830] font-bold px-2.5 py-1 rounded-full">
                  نوع: {filterPropertyTypes.find((b) => b.id === selectedType)?.label}
                  <button onClick={() => onSelectType('all')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {transactionType !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#C9A84C]/15 text-[#A07830] font-bold px-2.5 py-1 rounded-full">
                  معامله: {transactionTabs.find((b) => b.id === transactionType)?.label}
                  <button onClick={() => setTransactionType('all')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCity && (
                <span className="inline-flex items-center gap-1 bg-[#C9A84C]/15 text-[#A07830] font-bold px-2.5 py-1 rounded-full">
                  شهر: {SUPPORTED_CITIES_LIST.find((c) => c.key === selectedCity)?.nameFa || selectedCity}
                  <button onClick={() => onSelectCity('')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedNeighborhood !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#C9A84C]/15 text-[#A07830] font-bold px-2.5 py-1 rounded-full">
                  محله: {selectedNeighborhood}
                  <button onClick={() => setSelectedNeighborhood('all')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-[#C9A84C]/15 text-[#A07830] font-bold px-2.5 py-1 rounded-full">
                  «{searchQuery}»
                  <button onClick={() => onSearchQueryChange('')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  const maxP =
                    priceRange === 'under10'
                      ? 10000000000
                      : priceRange === '10to25'
                      ? 25000000000
                      : priceRange === '25to50'
                      ? 50000000000
                      : undefined;
                  const cityName = selectedCity ? (SUPPORTED_CITIES_LIST.find((c) => c.key === selectedCity)?.nameFa || selectedCity) : '';
                  const parts: string[] = [];
                  if (searchQuery.trim()) parts.push(`«${searchQuery}»`);
                  if (cityName) parts.push(cityName);
                  if (selectedNeighborhood !== 'all') parts.push(selectedNeighborhood);
                  if (selectedType !== 'all') {
                    const typeLabel = filterPropertyTypes.find((b) => b.id === selectedType)?.label;
                    if (typeLabel) parts.push(typeLabel);
                  }

                  const title = parts.length > 0 ? `جستجوی ${parts.join('، ')}` : 'جستجوی املاک لوکس منتخب';

                  onSaveCurrentSearch?.({
                    title,
                    city: selectedCity || undefined,
                    neighborhood: selectedNeighborhood !== 'all' ? selectedNeighborhood : undefined,
                    propertyType: selectedType !== 'all' ? selectedType : undefined,
                    maxPrice: maxP,
                    minBedrooms: typeof bedrooms === 'number' ? bedrooms : undefined,
                  });
                }}
                className="text-xs bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 text-[#A07830] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#C9A84C]/30"
                title="ذخیره این جستجو برای دریافت هشدار پیامکی و نوتیفیکیشن هنگام اضافه شدن ملک جدید"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>ذخیره این جستجو (هشدار ملک جدید)</span>
              </button>

              {hasAnyActiveFilter && (
                <button
                  onClick={handleResetAllFilters}
                  className="text-[#A07830] hover:text-[#1A1A2E] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  پاک کردن فیلترها
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Properties Grid or List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-200">
            <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">
              ملکی با مشخصات و فیلترهای انتخابی یافت نشد
            </h3>
            <p className="text-sm text-[#5A5A7A] max-w-md mx-auto mb-6 leading-relaxed">
              می‌توانید فیلترهای بودجه، متراژ یا محله را منعطف‌تر کرده یا فیلترها را بازنشانی کنید تا گزینه‌های موجود نمایش داده شوند.
            </p>
            <button
              onClick={handleResetAllFilters}
              className="bg-[#1A1A2E] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0F3460] transition-colors cursor-pointer"
            >
              مشاهده تمام املاک پورتفولیو
            </button>
          </div>
        ) : (
          <div>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
                  : 'flex flex-col gap-5'
              }
            >
              {displayed.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSaved={savedIds.includes(prop.id)}
                  isCompared={compareIds.includes(prop.id)}
                  onToggleSave={onToggleSave}
                  onToggleCompare={onToggleCompare}
                  onSelect={onSelectProperty}
                />
              ))}
            </div>

            {/* Pagination / Load More Button */}
            {visibleCount < filtered.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="bg-white hover:bg-[#1A1A2E] hover:text-white text-[#1A1A2E] border border-stone-300 font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
                >
                  نمایش موارد بیشتر ({toPersianDigits(filtered.length - visibleCount)} ملک دیگر)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
