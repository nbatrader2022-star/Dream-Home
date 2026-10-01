import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Type,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Box,
} from 'lucide-react';
import { CMSElement, CMSStyleProperties } from '../../types/cms';
import { toPersianDigits } from '../../utils/formatters';

// Preset font families with Persian digits emphasis
const FONT_PRESETS = [
  { label: 'وزیرمتن با اعداد فارسی (Vazirmatn FD - پیش‌فرض)', value: "'Vazirmatn FD', 'Vazirmatn', sans-serif" },
  { label: 'فونت شبنم با اعداد فارسی (Shabnam)', value: "'Shabnam', 'Vazirmatn FD', sans-serif" },
  { label: 'وزیرمتن عمومی (Vazirmatn)', value: "'Vazirmatn', sans-serif" },
];

interface CMSStylerTabProps {
  cmsElements: CMSElement[];
  onUpdateElement: (id: string, updates: Partial<CMSElement>) => void;
  onSaveToLive: () => Promise<void>;
  onResetElement: (id: string) => void;
  onOpenVisualEditor?: () => void;
  onShowToast: (title: string, message: string) => void;
}

// Preset color options for luxury real estate
const COLOR_PRESETS = [
  { label: 'طلایی آرمانی', value: '#C9A84C' },
  { label: 'طلایی روشن', value: '#E4C675' },
  { label: 'سرمه‌ای تیره', value: '#1A1A2E' },
  { label: 'سرمه‌ای عمیق', value: '#0A0E17' },
  { label: 'سفید خالص', value: '#FFFFFF' },
  { label: 'خاکستری روشن', value: '#F8F4EF' },
  { label: 'کرم لاکچری', value: '#EDE8E0' },
  { label: 'متن تیره', value: '#5A5A7A' },
  { label: 'شفاف', value: 'transparent' },
  { label: 'طلایی نیمه‌شفاف', value: 'rgba(201, 168, 76, 0.15)' },
  { label: 'دارک نیمه‌شفاف', value: 'rgba(26, 26, 46, 0.85)' },
];

// Preset border radius options (گردی گوشه‌ها)
const RADIUS_PRESETS = [
  { label: 'تیز (۰px)', value: '0px' },
  { label: 'ملایم (۸px)', value: '8px' },
  { label: 'متوسط (۱۲px)', value: '12px' },
  { label: 'کارت (۱۶px)', value: '16px' },
  { label: 'بزرگ (۲۴px)', value: '24px' },
  { label: 'کپسولی / پیل کامل (۹۹۹۹px)', value: '9999px' },
];

// Preset font sizes
const FONT_SIZE_PRESETS = [
  { label: 'کوچک (12px)', value: '12px' },
  { label: 'استاندارد (15px)', value: '15px' },
  { label: 'متوسط (18px)', value: '18px' },
  { label: 'بزرگ (24px)', value: '24px' },
  { label: 'تیتر (32px)', value: '32px' },
  { label: 'خیلی بزرگ (44px)', value: '44px' },
];

export function CMSStylerTab({
  cmsElements,
  onUpdateElement,
  onSaveToLive,
  onResetElement,
  onOpenVisualEditor,
  onShowToast,
}: CMSStylerTabProps) {
  const [selectedId, setSelectedId] = useState<string>(
    cmsElements[0]?.id || 'elem-hero-title'
  );
  const [isSaving, setIsSaving] = useState(false);

  const selectedElement =
    cmsElements.find((e) => e.id === selectedId) || cmsElements[0];

  // Group elements by category
  const groups: { [key: string]: CMSElement[] } = {
    'بخش هیرو (Hero Banner)': cmsElements.filter((e) =>
      e.editorKey.startsWith('hero.')
    ),
    'نوار آمار و ارقام (Stats Bar)': cmsElements.filter((e) =>
      e.editorKey.startsWith('stats.')
    ),
    'دسته‌بندی‌های اختصاصی (Categories)': cmsElements.filter((e) =>
      e.editorKey.startsWith('categories.')
    ),
    'پورتفولیو و فیلتر املاک (Properties)': cmsElements.filter((e) =>
      e.editorKey.startsWith('properties.')
    ),
  };

  const handleStyleChange = (prop: keyof CMSStyleProperties, value: any) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        [prop]: value,
      },
    });
  };

  const handleTextChange = (text: string) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      content: {
        ...selectedElement.content,
        text,
      },
    });
  };

  const handleToggleVisibility = () => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      isVisible: !selectedElement.isVisible,
    });
    onShowToast(
      selectedElement.isVisible ? 'المان پنهان شد' : 'المان فعال شد',
      `وضعیت نمایش «${selectedElement.name}» تغییر یافت.`
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveToLive();
      onShowToast(
        'ذخیره موفقیت‌آمیز در وب‌سایت',
        'تمام تغییرات استایل، رنگ، سایز، فونت و گردی در سایت اعمال و منتشر گردید.'
      );
    } catch (err) {
      onShowToast('خطا در ذخیره', 'ذخیره تغییرات با مشکل مواجه شد.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentStyles = selectedElement?.styles || {};

  // Extract numeric radius for slider
  const radiusNum = parseInt(currentStyles.borderRadius || '16', 10) || 0;
  const fontSizeNum = parseInt(currentStyles.fontSize || '16', 10) || 16;

  return (
    <div className="p-4 sm:p-6 text-right">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-white/10 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#C9A84C]" />
            <span>ویرایشگر ظاهر و استایل المان‌ها (سایز، رنگ، فونت، گردی)</span>
          </h3>
          <p className="text-xs text-white/60 mt-1">
            هر بخش از سایت را انتخاب کرده و ویژگی‌های ظاهری آن را به صورت زنده
            تغییر دهید.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenVisualEditor && (
            <button
              type="button"
              onClick={onOpenVisualEditor}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>استودیوی زنده Visual Builder</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره و اعمال در کل سایت'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Sidebar Column: Elements Tree */}
        <div className="lg:col-span-4 bg-[#0F172A] border border-white/10 rounded-2xl p-4 flex flex-col gap-4 max-h-[720px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-[#E4C675] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#C9A84C]" />
              انتخاب المان جهت ویرایش
            </span>
            <span className="text-[10px] text-white/40">
              {cmsElements.length} المان
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(groups).map(([groupTitle, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-white/50 px-2 py-1 bg-white/5 rounded-lg flex items-center justify-between">
                    <span>{groupTitle}</span>
                    <span className="text-[10px] text-white/30">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-1 pr-1">
                    {items.map((elem) => {
                      const isSelected = elem.id === selectedId;
                      return (
                        <button
                          key={elem.id}
                          type="button"
                          onClick={() => setSelectedId(elem.id)}
                          className={`w-full text-right p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? 'bg-[#C9A84C]/20 text-[#E4C675] border-[#C9A84C] font-bold shadow-sm'
                              : 'bg-white/5 text-white/80 border-transparent hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                elem.isVisible
                                  ? 'bg-emerald-400'
                                  : 'bg-rose-400'
                              }`}
                            />
                            <span className="truncate">{elem.name}</span>
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isSelected
                                ? 'text-[#C9A84C] -rotate-180'
                                : 'text-white/30'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Element Inspector & Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {selectedElement ? (
            <>
              {/* Element Header Card & Live Preview */}
              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>{selectedElement.name}</span>
                      <span className="text-[10px] font-mono text-[#C9A84C] bg-[#C9A84C]/15 px-2 py-0.5 rounded-full border border-[#C9A84C]/30" dir="ltr">
                        {selectedElement.editorKey}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      نوع مؤلفه: {selectedElement.componentType}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleVisibility}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        selectedElement.isVisible
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                      }`}
                    >
                      {selectedElement.isVisible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>فعال (نمایش در سایت)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>پنهان در سایت</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onResetElement(selectedElement.id)}
                      title="بازنشانی استایل به حالت اولیه"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div>
                  <div className="text-[11px] font-bold text-white/50 mb-2 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-[#C9A84C]" />
                    پیش‌نمایش زنده در همین لحظه:
                  </div>
                  <div className="p-6 rounded-xl bg-[#0A0E17] border border-white/10 flex items-center justify-center min-h-[110px] overflow-hidden relative">
                    <div
                      style={{
                        backgroundColor: currentStyles.backgroundColor,
                        color: currentStyles.color,
                        fontFamily: currentStyles.fontFamily || "'Vazirmatn FD', 'Vazirmatn', sans-serif",
                        fontFeatureSettings: '"ss01" 1',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: currentStyles.fontSize,
                        fontWeight: currentStyles.fontWeight as any,
                        borderRadius: currentStyles.borderRadius,
                        borderWidth: currentStyles.borderWidth,
                        borderColor: currentStyles.borderColor,
                        borderStyle: currentStyles.borderStyle || 'solid',
                        paddingTop: currentStyles.paddingTop || '12px',
                        paddingBottom: currentStyles.paddingBottom || '12px',
                        paddingRight: currentStyles.paddingRight || '20px',
                        paddingLeft: currentStyles.paddingLeft || '20px',
                        boxShadow: currentStyles.boxShadow,
                        textAlign: (currentStyles.textAlign as any) || 'center',
                        maxWidth: '100%',
                        transition: 'all 0.2s ease',
                      }}
                      className="shadow-sm inline-block font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
                    >
                      {toPersianDigits(
                        selectedElement.content.text ||
                        selectedElement.name ||
                        'متن نمونه پیش‌نمایش'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editing Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Content Text (if applicable) */}
                {selectedElement.content.text !== undefined && (
                  <div className="md:col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-[#C9A84C]" />
                        متن یا عنوان المان (Content Text)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTextChange(toPersianDigits(selectedElement.content.text || ''))}
                        className="text-[10px] font-bold text-[#E4C675] bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 border border-[#C9A84C]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        title="تبدیل تمام اعداد انگلیسی به اعداد فارسی"
                      >
                        تبدیل به ارقام فارسی (مثال: ۲۱)
                      </button>
                    </div>
                    <input
                      type="text"
                      value={selectedElement.content.text || ''}
                      onChange={(e) => handleTextChange(toPersianDigits(e.target.value))}
                      placeholder="متن المان را وارد کنید..."
                      className="w-full bg-[#1A2234] border border-white/10 focus:border-[#C9A84C] text-white text-xs px-3.5 py-2.5 rounded-xl outline-none font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
                    />
                  </div>
                )}

                {/* 1.5. Font Family Selector */}
                <div className="md:col-span-2 bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-[#C9A84C]" />
                      خانواده فونت و پشتیبانی اعداد فارسی (Font Family)
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {FONT_PRESETS.map((fp) => (
                      <button
                        key={fp.value}
                        type="button"
                        onClick={() => handleStyleChange('fontFamily', fp.value)}
                        className={`text-xs p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          (currentStyles.fontFamily || "'Vazirmatn FD', 'Vazirmatn', sans-serif") === fp.value
                            ? 'bg-[#C9A84C]/20 text-[#E4C675] font-bold border-[#C9A84C]'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {fp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Border Radius (گردی گوشه‌ها) - Primary User Request */}
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#C9A84C]" />
                      گردی گوشه‌ها (Border Radius)
                    </label>
                    <span className="text-xs font-mono text-[#E4C675] bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                      {currentStyles.borderRadius || '0px'}
                    </span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="2"
                    value={radiusNum > 60 ? 60 : radiusNum}
                    onChange={(e) =>
                      handleStyleChange('borderRadius', `${e.target.value}px`)
                    }
                    className="w-full accent-[#C9A84C] cursor-pointer"
                  />

                  {/* Quick Radius Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {RADIUS_PRESETS.map((rp) => (
                      <button
                        key={rp.value}
                        type="button"
                        onClick={() =>
                          handleStyleChange('borderRadius', rp.value)
                        }
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          currentStyles.borderRadius === rp.value
                            ? 'bg-[#C9A84C] text-[#1A1A2E] font-bold border-[#C9A84C]'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {rp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Font Size (سایز فونت) - Primary User Request */}
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-[#C9A84C]" />
                      سایز فونت و اندازه (Font Size)
                    </label>
                    <span className="text-xs font-mono text-[#E4C675] bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                      {currentStyles.fontSize || '16px'}
                    </span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="10"
                    max="64"
                    step="1"
                    value={fontSizeNum}
                    onChange={(e) =>
                      handleStyleChange('fontSize', `${e.target.value}px`)
                    }
                    className="w-full accent-[#C9A84C] cursor-pointer"
                  />

                  {/* Quick Font Size Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {FONT_SIZE_PRESETS.map((fp) => (
                      <button
                        key={fp.value}
                        type="button"
                        onClick={() =>
                          handleStyleChange('fontSize', fp.value)
                        }
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          currentStyles.fontSize === fp.value
                            ? 'bg-[#C9A84C] text-[#1A1A2E] font-bold border-[#C9A84C]'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {fp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Text Color (رنگ متن) - Primary User Request */}
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#C9A84C]" />
                      رنگ متن (Text Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          currentStyles.color &&
                          currentStyles.color.startsWith('#')
                            ? currentStyles.color
                            : '#FFFFFF'
                        }
                        onChange={(e) =>
                          handleStyleChange('color', e.target.value)
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-white/80" dir="ltr">
                        {currentStyles.color || '#FFFFFF'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.slice(0, 8).map((cp) => (
                      <button
                        key={cp.value}
                        type="button"
                        onClick={() => handleStyleChange('color', cp.value)}
                        title={cp.label}
                        className="w-7 h-7 rounded-lg border border-white/20 hover:scale-110 transition-all cursor-pointer shadow-sm relative flex items-center justify-center"
                        style={{ backgroundColor: cp.value }}
                      >
                        {currentStyles.color === cp.value && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Background Color (رنگ پس‌زمینه) - Primary User Request */}
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#C9A84C]" />
                      رنگ پس‌زمینه (Background Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          currentStyles.backgroundColor &&
                          currentStyles.backgroundColor.startsWith('#')
                            ? currentStyles.backgroundColor
                            : '#1A1A2E'
                        }
                        onChange={(e) =>
                          handleStyleChange('backgroundColor', e.target.value)
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-white/80" dir="ltr">
                        {currentStyles.backgroundColor || 'transparent'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((cp) => (
                      <button
                        key={cp.value}
                        type="button"
                        onClick={() =>
                          handleStyleChange('backgroundColor', cp.value)
                        }
                        title={cp.label}
                        className="w-7 h-7 rounded-lg border border-white/20 hover:scale-110 transition-all cursor-pointer shadow-sm relative flex items-center justify-center"
                        style={{ backgroundColor: cp.value }}
                      >
                        {currentStyles.backgroundColor === cp.value && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Font Weight (وزن قلم) */}
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-[#C9A84C]" />
                    ضخامت و وزن قلم (Font Weight)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: 'عادی (۴۰۰)', val: '400' },
                      { label: 'متوسط (۵۰۰)', val: '500' },
                      { label: 'پررنگ (۷۰۰)', val: '700' },
                      { label: 'فوق‌پررنگ (۹۰۰)', val: '900' },
                    ].map((fw) => (
                      <button
                        key={fw.val}
                        type="button"
                        onClick={() => handleStyleChange('fontWeight', fw.val)}
                        className={`text-xs py-2 rounded-xl border transition-all cursor-pointer ${
                          currentStyles.fontWeight === fw.val
                            ? 'bg-[#C9A84C] text-[#1A1A2E] font-black border-[#C9A84C]'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {fw.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Border Color & Width (حاشیه و کادر دور) */}
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-[#C9A84C]" />
                      کادر و حاشیه دور (Border Width & Color)
                    </label>
                    <span className="text-xs font-mono text-white/60">
                      {currentStyles.borderWidth || '0px'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={currentStyles.borderWidth || '0px'}
                      onChange={(e) =>
                        handleStyleChange('borderWidth', e.target.value)
                      }
                      className="flex-1 bg-[#1A2234] border border-white/10 text-white text-xs p-2 rounded-xl outline-none"
                    >
                      <option value="0px">بدون کادر (0px)</option>
                      <option value="1px">کادر باریک (1px)</option>
                      <option value="2px">کادر متوسط (2px)</option>
                      <option value="3px">کادر ضخیم (3px)</option>
                    </select>

                    <input
                      type="color"
                      value={
                        currentStyles.borderColor &&
                        currentStyles.borderColor.startsWith('#')
                          ? currentStyles.borderColor
                          : '#C9A84C'
                      }
                      onChange={(e) =>
                        handleStyleChange('borderColor', e.target.value)
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      title="رنگ کادر دور"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-white/50 bg-[#0F172A] rounded-2xl border border-white/10">
              لطفاً یک المان را از ستون سمت راست انتخاب نمایید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
