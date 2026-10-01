// ==============================================================================
// DREAM HOME (خانه آرمانی) - Full Visual Page Builder & CMS Editor Engine
// Real-time Canvas, Element Hierarchy, Dynamic Inspector, Responsive Switcher,
// Revisions Rollback, Style Presets, and Design Tokens
// ==============================================================================

import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  UploadCloud,
  History,
  Palette,
  Layers,
  Plus,
  Sliders,
  Type,
  Maximize2,
  Copy,
  ClipboardPaste,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  AlertCircle,
  Move,
} from 'lucide-react';
import { useCMS } from '../../hooks/useCMS';
import {
  CMSElement,
  CMSElementType,
  Breakpoint,
  StylePreset,
} from '../../types/cms';
import { toPersianDigits } from '../../utils/formatters';

interface VisualEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string) => void;
}

export const VisualEditorModal: React.FC<VisualEditorModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const cms = useCMS('page-home');

  // UI state
  const [leftTab, setLeftTab] = useState<'layers' | 'add'>('layers');
  const [inspectorTab, setInspectorTab] = useState<
    'content' | 'typography' | 'layout' | 'colors' | 'border' | 'shadow' | 'responsive' | 'presets'
  >('content');
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isTokensModalOpen, setIsTokensModalOpen] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  // Direct Inline Editing state
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBreakpoint = cms.activeBreakpoint;
  const selectedElem = cms.selectedElement;

  // Active styles based on breakpoint
  const getActiveStyles = (elem: CMSElement) => {
    if (currentBreakpoint === 'desktop') return elem.styles;
    if (currentBreakpoint === 'tablet') {
      return { ...elem.styles, ...(elem.responsiveStyles.tablet || {}) };
    }
    return { ...elem.styles, ...(elem.responsiveStyles.mobile || {}) };
  };

  const handleSaveDraftClick = async () => {
    const ok = await cms.saveDraft('Super Admin');
    if (ok) {
      onShowToast('پیش‌نویس ذخیره شد', 'تغییرات شما در پایگاه‌داده پیش‌نویس ذخیره گردید.');
    } else {
      onShowToast('خطا در ذخیره', 'ذخیره پیش‌نویس با خطا مواجه شد.');
    }
  };

  const handleConfirmPublish = async () => {
    setIsPublishConfirmOpen(false);
    const res = await cms.publishPage(publishSummary || 'انتشار تغییرات طراحی از طریق ویرایشگر بصری', 'Super Admin');
    if (res.success) {
      onShowToast('انتشار موفقیت‌آمیز', res.message || `نسخه شماره ${res.version} در وب‌سایت اصلی منتشر شد.`);
      setPublishSummary('');
    } else {
      onShowToast('خطا در انتشار', res.message || 'خطایی در انتشار رخ داد.');
    }
  };

  const handleRestoreVersionClick = async (versionId: string, verNumber: number) => {
    const ok = await cms.restoreVersion(versionId, 'Super Admin');
    if (ok) {
      setIsVersionsModalOpen(false);
      onShowToast('بازگردانی انجام شد', `صفحه با موفقیت به نگارش شماره ${verNumber} بازگردانی شد.`);
    } else {
      onShowToast('خطا در بازگردانی', 'عملیات بازگردانی انجام نشد.');
    }
  };

  // Add Element Helper
  const handleAddNewElement = (type: CMSElementType, name: string) => {
    const newId = `elem-${type}-${Date.now()}`;
    const newElem: CMSElement = {
      id: newId,
      pageId: 'page-home',
      parentId: selectedElem ? selectedElem.id : null,
      componentType: type,
      editorKey: `custom.${type}.${Date.now().toString().slice(-4)}`,
      name: `${name} جدید`,
      content: {
        text: type === 'button' ? 'دکمه جدید' : type === 'badge' ? '✨ بج جدید' : 'متن جدید قابل ویرایش',
      },
      styles: {
        fontSize: type === 'heading' ? '28px' : '15px',
        color: '#FFFFFF',
        backgroundColor: type === 'button' ? '#C9A84C' : 'transparent',
        padding: '12px',
        margin: '8px 0',
      },
      responsiveStyles: { desktop: {} },
      sortOrder: cms.elements.length + 1,
      isVisible: true,
    };
    cms.addElement(newElem);
    onShowToast('المان اضافه شد', `${name} به ساختار درخت صفحه افزوده شد.`);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#070A11] text-white flex flex-col font-secondary select-none overflow-hidden animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR                                                            */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#0D131F] border-b border-[#1E293B] px-4 flex items-center justify-between flex-shrink-0 z-20">
        {/* Left: Brand & Page Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2 border-l border-[#1E293B]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#92722A] p-0.5 shadow-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#0A0E17]" />
            </div>
            <div>
              <div className="text-xs font-black text-[#E4C675] tracking-wide">CMS VISUAL BUILDER</div>
              <div className="text-[10px] text-slate-400">ویرایشگر بصری و درختی خانه آرمانی</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#141C2B] px-3 py-1.5 rounded-lg border border-[#1E293B] text-xs">
            <span className="text-slate-400">صفحه:</span>
            <span className="font-bold text-[#E4C675]">صفحه اصلی (Home Page)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
              v{cms.page?.currentVersion || 1}
            </span>
          </div>

          {/* Autosave / Draft status */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${cms.hasUnsavedDraft ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span>{cms.hasUnsavedDraft ? 'دارای پیش‌نویس ذخیره‌نشده' : 'تمامی تغییرات ذخیره هستند'}</span>
            {cms.lastSavedTime && <span className="text-slate-500">({cms.lastSavedTime})</span>}
          </div>
        </div>

        {/* Center: Responsive Breakpoints & Undo/Redo */}
        <div className="flex items-center gap-4">
          {/* Breakpoint Switcher */}
          <div className="flex items-center bg-[#141C2B] p-1 rounded-lg border border-[#1E293B]">
            <button
              onClick={() => cms.setActiveBreakpoint('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                currentBreakpoint === 'desktop'
                  ? 'bg-[#C9A84C] text-[#0A0E17] font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="نمای دسکتاپ (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دسکتاپ</span>
            </button>
            <button
              onClick={() => cms.setActiveBreakpoint('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                currentBreakpoint === 'tablet'
                  ? 'bg-[#C9A84C] text-[#0A0E17] font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="نمای تبلت (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تبلت</span>
            </button>
            <button
              onClick={() => cms.setActiveBreakpoint('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                currentBreakpoint === 'mobile'
                  ? 'bg-[#C9A84C] text-[#0A0E17] font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="نمای موبایل (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">موبایل</span>
            </button>
          </div>

          {/* History: Undo / Redo */}
          <div className="flex items-center gap-1 bg-[#141C2B] p-1 rounded-lg border border-[#1E293B]">
            <button
              onClick={cms.undo}
              disabled={!cms.canUndo}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="واگردانی (Undo - Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={cms.redo}
              disabled={!cms.canRedo}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="انجام مجدد (Redo - Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => cms.setIsPreviewMode(!cms.isPreviewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              cms.isPreviewMode
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                : 'bg-[#141C2B] border-[#1E293B] text-slate-300 hover:text-white'
            }`}
          >
            {cms.isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{cms.isPreviewMode ? 'خروج از پیش‌نمایش' : 'پیش‌نمایش زنده'}</span>
          </button>
        </div>

        {/* Right: Actions (Tokens, History, Save Draft, Publish, Close) */}
        <div className="flex items-center gap-2">
          {/* Design Tokens Button */}
          <button
            onClick={() => setIsTokensModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs text-slate-300 hover:text-[#E4C675] transition-colors"
            title="توکن‌های جهانی طراحی (CSS Variables)"
          >
            <Palette className="w-3.5 h-3.5 text-[#E4C675]" />
            <span className="hidden lg:inline">توکن‌ها</span>
          </button>

          {/* Revisions History Button */}
          <button
            onClick={() => setIsVersionsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs text-slate-300 hover:text-white transition-colors"
            title="تاریخچه نسخه‌ها و بازگردانی"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">نسخه‌ها</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraftClick}
            disabled={cms.isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#283548] border border-slate-600 text-xs font-semibold text-white transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>ذخیره پیش‌نویس</span>
          </button>

          {/* Publish Live */}
          <button
            onClick={() => setIsPublishConfirmOpen(true)}
            disabled={cms.isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#A07830] hover:from-[#E4C675] hover:to-[#B68E3A] text-[#0A0E17] text-xs font-black shadow-lg shadow-[#C9A84C]/20 transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>انتشار در سایت اصلی</span>
          </button>

          {/* Close Editor */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors mr-1"
            title="خروج از ویرایشگر"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE: LEFT TREE + CENTER CANVAS + RIGHT INSPECTOR                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANEL: LAYERS TREE & ADD ELEMENT                                   */}
        {/* ----------------------------------------------------------------------- */}
        {!cms.isPreviewMode && (
          <aside className="w-72 bg-[#0D131F] border-l border-[#1E293B] flex flex-col flex-shrink-0 z-10">
            {/* Tabs Header */}
            <div className="flex border-b border-[#1E293B]">
              <button
                onClick={() => setLeftTab('layers')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors ${
                  leftTab === 'layers'
                    ? 'border-b-2 border-[#C9A84C] text-[#E4C675] bg-white/[0.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>درخت لایه‌ها ({cms.elements.length})</span>
              </button>
              <button
                onClick={() => setLeftTab('add')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors ${
                  leftTab === 'add'
                    ? 'border-b-2 border-[#C9A84C] text-[#E4C675] bg-white/[0.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن المان</span>
              </button>
            </div>

            {/* Tab 1: Layers Tree */}
            {leftTab === 'layers' && (
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {cms.elements.map((elem, idx) => {
                  const isSelected = cms.selectedElementId === elem.id;
                  const isChild = Boolean(elem.parentId);
                  return (
                    <div
                      key={elem.id}
                      onClick={() => cms.setSelectedElementId(elem.id)}
                      className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        isChild ? 'mr-3 border-r-2 border-[#1E293B]' : ''
                      } ${
                        isSelected
                          ? 'bg-[#C9A84C]/15 border border-[#C9A84C] text-white shadow-sm'
                          : 'hover:bg-[#141C2B] text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                            elem.componentType === 'section'
                              ? 'bg-purple-500/20 text-purple-300'
                              : elem.componentType === 'heading'
                              ? 'bg-blue-500/20 text-blue-300'
                              : elem.componentType === 'button'
                              ? 'bg-amber-500/20 text-amber-300'
                              : elem.componentType === 'dot' || elem.componentType === 'line'
                              ? 'bg-pink-500/20 text-pink-300'
                              : 'bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          {elem.componentType}
                        </span>
                        <div className="truncate">
                          <div className="text-xs font-medium truncate">{elem.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{elem.editorKey}</div>
                        </div>
                      </div>

                      {/* Quick Actions (Order / Visibility / Delete) */}
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cms.moveElementOrder(elem.id, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:text-[#E4C675] disabled:opacity-20"
                          title="انتقال به بالا"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cms.moveElementOrder(elem.id, 'down');
                          }}
                          disabled={idx === cms.elements.length - 1}
                          className="p-1 hover:text-[#E4C675] disabled:opacity-20"
                          title="انتقال به پایین"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cms.toggleElementVisibility(elem.id);
                          }}
                          className={`p-1 ${elem.isVisible ? 'text-slate-400 hover:text-white' : 'text-rose-400'}`}
                          title={elem.isVisible ? 'مخفی‌سازی المان' : 'نمایش المان'}
                        >
                          {elem.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Add Element Palette */}
            {leftTab === 'add' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="text-xs font-bold text-slate-400 mb-2">تایپوگرافی و متون</div>
                <button
                  onClick={() => handleAddNewElement('heading', 'عنوان جدید (Heading)')}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 hover:text-[#E4C675] transition-colors"
                >
                  <Type className="w-4 h-4 text-blue-400" />
                  <span>تیتر و عنوان بزرگ (Heading)</span>
                </button>
                <button
                  onClick={() => handleAddNewElement('paragraph', 'پاراگراف توضیحات (Paragraph)')}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 hover:text-[#E4C675] transition-colors"
                >
                  <Type className="w-4 h-4 text-slate-400" />
                  <span>پاراگراف متنی (Paragraph)</span>
                </button>

                <div className="text-xs font-bold text-slate-400 mt-4 mb-2">دکمه و نشان‌ها</div>
                <button
                  onClick={() => handleAddNewElement('button', 'دکمه اقدام لوکس (CTA Button)')}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 hover:text-[#E4C675] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#E4C675]" />
                  <span>دکمه اکشن طلایی (Action Button)</span>
                </button>
                <button
                  onClick={() => handleAddNewElement('badge', 'بج نئونی (Badge)')}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 hover:text-[#E4C675] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>برچسب یا بج درخشان (Badge)</span>
                </button>

                <div className="text-xs font-bold text-slate-400 mt-4 mb-2">عناصر دکوراتیو و گرافیکی</div>
                <button
                  onClick={() => handleAddNewElement('dot', 'نقطه تزئینی طلایی (Decorative Dot)')}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 hover:text-[#E4C675] transition-colors"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[#C9A84C] shadow-sm shadow-[#C9A84C]" />
                  <span>نقطه تزئینی درخشان (Decorative Dot)</span>
                </button>
                <button
                  onClick={() => handleAddNewElement('line', 'خط گرادیان نئونی (Decorative Line)')}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 hover:text-[#E4C675] transition-colors"
                >
                  <span className="w-5 h-0.5 bg-gradient-to-r from-[#C9A84C] to-transparent" />
                  <span>خط گرادیان دکوراتیو (Decorative Line)</span>
                </button>
                <button
                  onClick={() => handleAddNewElement('card', 'باکس کارت شیشه‌ای (Glass Card)')}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 hover:text-[#E4C675] transition-colors"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>باکس محتوا (Container Card)</span>
                </button>
              </div>
            )}
          </aside>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER PANEL: LIVE EDITABLE CANVAS                                      */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 bg-[#06080E] flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-8 relative">
          {/* Canvas Viewport Frame */}
          <div
            className={`transition-all duration-300 relative shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-[#1E293B] rounded-2xl overflow-hidden bg-[#0A0E17] ${
              currentBreakpoint === 'desktop'
                ? 'w-full max-w-6xl'
                : currentBreakpoint === 'tablet'
                ? 'w-[768px]'
                : 'w-[375px]'
            }`}
          >
            {/* Viewport Frame Header */}
            <div className="bg-[#0F1420] px-4 py-2 border-b border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="mr-2 font-mono text-[11px] text-slate-500">https://dreamhome.ir/</span>
              </div>
              <div className="font-mono text-[11px] text-[#C9A84C]">
                {currentBreakpoint === 'desktop'
                  ? 'Responsive Desktop (100%)'
                  : currentBreakpoint === 'tablet'
                  ? 'Tablet View (768px)'
                  : 'Mobile View (375px)'}
              </div>
            </div>

            {/* Canvas Body rendering CMS Elements */}
            <div className="relative min-h-[700px] w-full p-4 sm:p-8 overflow-hidden">
              {cms.elements
                .filter((elem) => elem.isVisible)
                .map((elem) => {
                  const isSelected = cms.selectedElementId === elem.id;
                  const styles = getActiveStyles(elem);

                  // Convert CMSStyleProperties to React CSS Properties
                  const inlineStyles: React.CSSProperties = {
                    position: styles.position as any,
                    top: styles.top,
                    right: styles.right,
                    bottom: styles.bottom,
                    left: styles.left,
                    width: styles.width,
                    height: styles.height,
                    minHeight: styles.minHeight,
                    margin: styles.margin,
                    marginTop: styles.marginTop,
                    marginBottom: styles.marginBottom,
                    marginRight: styles.marginRight,
                    marginLeft: styles.marginLeft,
                    padding: styles.padding,
                    paddingTop: styles.paddingTop,
                    paddingBottom: styles.paddingBottom,
                    paddingRight: styles.paddingRight,
                    paddingLeft: styles.paddingLeft,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight as any,
                    fontFamily: styles.fontFamily || "'Vazirmatn FD', 'Vazirmatn', sans-serif",
                    fontFeatureSettings: '"ss01" 1',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: styles.lineHeight,
                    color: styles.color,
                    textAlign: styles.textAlign,
                    backgroundColor: styles.backgroundColor,
                    backgroundImage: styles.backgroundImage,
                    borderWidth: styles.borderWidth,
                    borderStyle: styles.borderStyle as any,
                    borderColor: styles.borderColor,
                    borderRadius: styles.borderRadius,
                    boxShadow: styles.boxShadow,
                    opacity: styles.opacity,
                    zIndex: styles.zIndex,
                    maxWidth: styles.maxWidth,
                    display: styles.display as any,
                    alignItems: styles.alignItems as any,
                    justifyContent: styles.justifyContent as any,
                    gap: styles.gap,
                  };

                  return (
                    <div
                      key={elem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        cms.setSelectedElementId(elem.id);
                      }}
                      style={inlineStyles}
                      className={`relative transition-all group font-['Vazirmatn_FD','Vazirmatn',sans-serif] ${
                        !cms.isPreviewMode
                          ? isSelected
                            ? 'ring-2 ring-[#C9A84C] ring-offset-2 ring-offset-[#0A0E17] cursor-pointer'
                            : 'hover:ring-1 hover:ring-blue-400/60 cursor-pointer'
                          : ''
                      }`}
                    >
                      {/* Active Selector Overlay Tag */}
                      {!cms.isPreviewMode && isSelected && (
                        <div className="absolute -top-7 right-0 z-50 flex items-center gap-1.5 bg-[#C9A84C] text-[#0A0E17] text-[10px] font-black px-2 py-0.5 rounded shadow-lg">
                          <span>{elem.name}</span>
                          <span className="font-mono opacity-75">({elem.editorKey})</span>
                        </div>
                      )}

                      {/* Element Content Render */}
                      {elem.componentType === 'heading' && (
                        <div
                          contentEditable={!cms.isPreviewMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            cms.updateElementContent(elem.id, {
                              text: toPersianDigits(e.currentTarget.textContent || ''),
                            });
                          }}
                          className="outline-none"
                        >
                          {toPersianDigits(elem.content.text || '')}
                        </div>
                      )}

                      {elem.componentType === 'paragraph' && (
                        <div
                          contentEditable={!cms.isPreviewMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            cms.updateElementContent(elem.id, {
                              text: toPersianDigits(e.currentTarget.textContent || ''),
                            });
                          }}
                          className="outline-none"
                        >
                          {toPersianDigits(elem.content.text || '')}
                        </div>
                      )}

                      {elem.componentType === 'badge' && (
                        <div className="inline-flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#E4C675]" />
                          <span
                            contentEditable={!cms.isPreviewMode}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              cms.updateElementContent(elem.id, {
                                text: toPersianDigits(e.currentTarget.textContent || ''),
                              });
                            }}
                            className="outline-none"
                          >
                            {toPersianDigits(elem.content.text || '')}
                          </span>
                        </div>
                      )}

                      {elem.componentType === 'button' && (
                        <button className="w-full h-full flex items-center justify-center pointer-events-none">
                          <span>{toPersianDigits(elem.content.text || '')}</span>
                        </button>
                      )}

                      {elem.componentType === 'stat' && (
                        <div
                          contentEditable={!cms.isPreviewMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            cms.updateElementContent(elem.id, {
                              text: toPersianDigits(e.currentTarget.textContent || ''),
                            });
                          }}
                          className="outline-none"
                        >
                          {toPersianDigits(elem.content.text || '')}
                        </div>
                      )}

                      {elem.componentType === 'dot' && <div className="w-full h-full" />}
                      {elem.componentType === 'line' && <div className="w-full h-full" />}

                      {elem.componentType === 'section' && (
                        <div className="w-full flex flex-col items-center">
                          {/* Inner Section Container */}
                        </div>
                      )}

                      {!['heading', 'paragraph', 'badge', 'button', 'stat', 'dot', 'line', 'section'].includes(elem.componentType) && elem.content.text && (
                        <div
                          contentEditable={!cms.isPreviewMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            cms.updateElementContent(elem.id, {
                              text: toPersianDigits(e.currentTarget.textContent || ''),
                            });
                          }}
                          className="outline-none"
                        >
                          {toPersianDigits(elem.content.text || '')}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL: DYNAMIC PROPERTIES INSPECTOR                               */}
        {/* ----------------------------------------------------------------------- */}
        {!cms.isPreviewMode && (
          <aside className="w-80 bg-[#0D131F] border-r border-[#1E293B] flex flex-col flex-shrink-0 z-10">
            {selectedElem ? (
              <>
                {/* Inspector Header */}
                <div className="p-3 border-b border-[#1E293B] bg-[#0F1420]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#E4C675] truncate">{selectedElem.name}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                      {selectedElem.componentType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{selectedElem.editorKey}</div>
                </div>

                {/* Sub-tabs for Inspector categories */}
                <div className="flex border-b border-[#1E293B] overflow-x-auto text-[11px] bg-[#141C2B]">
                  <button
                    onClick={() => setInspectorTab('content')}
                    className={`px-3 py-2 whitespace-nowrap font-bold transition-colors ${
                      inspectorTab === 'content'
                        ? 'text-[#E4C675] border-b-2 border-[#C9A84C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    محتوا
                  </button>
                  <button
                    onClick={() => setInspectorTab('typography')}
                    className={`px-3 py-2 whitespace-nowrap font-bold transition-colors ${
                      inspectorTab === 'typography'
                        ? 'text-[#E4C675] border-b-2 border-[#C9A84C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    تایپوگرافی
                  </button>
                  <button
                    onClick={() => setInspectorTab('layout')}
                    className={`px-3 py-2 whitespace-nowrap font-bold transition-colors ${
                      inspectorTab === 'layout'
                        ? 'text-[#E4C675] border-b-2 border-[#C9A84C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    چیدمان
                  </button>
                  <button
                    onClick={() => setInspectorTab('colors')}
                    className={`px-3 py-2 whitespace-nowrap font-bold transition-colors ${
                      inspectorTab === 'colors'
                        ? 'text-[#E4C675] border-b-2 border-[#C9A84C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    رنگ‌ها
                  </button>
                  <button
                    onClick={() => setInspectorTab('border')}
                    className={`px-3 py-2 whitespace-nowrap font-bold transition-colors ${
                      inspectorTab === 'border'
                        ? 'text-[#E4C675] border-b-2 border-[#C9A84C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    حاشیه
                  </button>
                  <button
                    onClick={() => setInspectorTab('shadow')}
                    className={`px-3 py-2 whitespace-nowrap font-bold transition-colors ${
                      inspectorTab === 'shadow'
                        ? 'text-[#E4C675] border-b-2 border-[#C9A84C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    سایه و جلوه
                  </button>
                  <button
                    onClick={() => setInspectorTab('presets')}
                    className={`px-3 py-2 whitespace-nowrap font-bold transition-colors ${
                      inspectorTab === 'presets'
                        ? 'text-[#E4C675] border-b-2 border-[#C9A84C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    پریست‌ها
                  </button>
                </div>

                {/* Inspector Body Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {/* TAB 1: CONTENT */}
                  {inspectorTab === 'content' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-400 font-semibold">متن المان (Text Content)</label>
                          <button
                            type="button"
                            onClick={() =>
                              cms.updateElementContent(selectedElem.id, {
                                text: toPersianDigits(selectedElem.content.text || ''),
                              })
                            }
                            className="text-[10px] text-[#E4C675] bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 border border-[#C9A84C]/30 px-2 py-0.5 rounded cursor-pointer"
                            title="تبدیل تمام اعداد به فارسی"
                          >
                            تبدیل به ارقام فارسی (مثال: ۲۱)
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={selectedElem.content.text || ''}
                          onChange={(e) =>
                            cms.updateElementContent(selectedElem.id, {
                              text: toPersianDigits(e.target.value),
                            })
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2.5 text-white text-xs focus:border-[#C9A84C] outline-none font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
                          placeholder="متن المان را وارد کنید..."
                        />
                      </div>

                      {selectedElem.componentType === 'button' && (
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">لینک مقصد (URL / Target)</label>
                          <input
                            type="text"
                            value={selectedElem.content.href || ''}
                            onChange={(e) =>
                              cms.updateElementContent(selectedElem.id, { href: e.target.value })
                            }
                            className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                            placeholder="#properties یا https://..."
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: TYPOGRAPHY */}
                  {inspectorTab === 'typography' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">فونت و ارقام فارسی (Font Family)</label>
                        <select
                          value={getActiveStyles(selectedElem).fontFamily || "'Vazirmatn FD', 'Vazirmatn', sans-serif"}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { fontFamily: e.target.value },
                              currentBreakpoint
                            )
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                        >
                          <option value="'Vazirmatn FD', 'Vazirmatn', sans-serif">وزیرمتن با اعداد فارسی (Vazirmatn FD - استاندارد)</option>
                          <option value="'Shabnam', 'Vazirmatn FD', sans-serif">فونت شبنم با اعداد فارسی (Shabnam)</option>
                          <option value="'Vazirmatn', sans-serif">وزیرمتن عمومی (Vazirmatn)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>اندازه فونت ({currentBreakpoint})</span>
                          <span className="font-mono text-[#E4C675]">
                            {getActiveStyles(selectedElem).fontSize || '16px'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          value={parseInt(getActiveStyles(selectedElem).fontSize || '16', 10)}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { fontSize: `${e.target.value}px` },
                              currentBreakpoint
                            )
                          }
                          className="w-full accent-[#C9A84C]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">ضخامت فونت (Font Weight)</label>
                        <select
                          value={getActiveStyles(selectedElem).fontWeight || '400'}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { fontWeight: e.target.value },
                              currentBreakpoint
                            )
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                        >
                          <option value="400">عادی (400 - Regular)</option>
                          <option value="600">نیمه ضخیم (600 - SemiBold)</option>
                          <option value="700">ضخیم (700 - Bold)</option>
                          <option value="900">فوق ضخیم (900 - Black)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">تراز افقی متن (Text Align)</label>
                        <div className="grid grid-cols-3 gap-1 bg-[#141C2B] p-1 rounded-lg border border-[#1E293B]">
                          {(['right', 'center', 'left'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() =>
                                cms.updateElementStyles(selectedElem.id, { textAlign: align }, currentBreakpoint)
                              }
                              className={`py-1 rounded text-center font-medium capitalize ${
                                getActiveStyles(selectedElem).textAlign === align
                                  ? 'bg-[#C9A84C] text-[#0A0E17] font-bold'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">ارتفاع خط (Line Height)</label>
                        <input
                          type="text"
                          value={getActiveStyles(selectedElem).lineHeight || '1.5'}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { lineHeight: e.target.value },
                              currentBreakpoint
                            )
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LAYOUT & POSITION */}
                  {inspectorTab === 'layout' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">عرض (Width)</label>
                          <input
                            type="text"
                            value={getActiveStyles(selectedElem).width || 'auto'}
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { width: e.target.value },
                                currentBreakpoint
                              )
                            }
                            className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                            placeholder="100px یا 50%"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">ارتفاع (Height)</label>
                          <input
                            type="text"
                            value={getActiveStyles(selectedElem).height || 'auto'}
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { height: e.target.value },
                                currentBreakpoint
                              )
                            }
                            className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                            placeholder="16px یا auto"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">نوع موقعیت (Position)</label>
                        <select
                          value={getActiveStyles(selectedElem).position || 'static'}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { position: e.target.value as any },
                              currentBreakpoint
                            )
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                        >
                          <option value="static">استاتیک (Static - جریان عادی)</option>
                          <option value="relative">نسبی (Relative)</option>
                          <option value="absolute">مطلق شناور (Absolute)</option>
                        </select>
                      </div>

                      {getActiveStyles(selectedElem).position === 'absolute' && (
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#141C2B] rounded-lg border border-[#1E293B]">
                          <div>
                            <label className="text-[10px] text-slate-400">فاصله از بالا (Top)</label>
                            <input
                              type="text"
                              value={getActiveStyles(selectedElem).top || ''}
                              onChange={(e) =>
                                cms.updateElementStyles(
                                  selectedElem.id,
                                  { top: e.target.value },
                                  currentBreakpoint
                                )
                              }
                              className="w-full bg-[#0D131F] border border-[#1E293B] rounded p-1 text-xs text-white"
                              placeholder="18% یا 50px"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">فاصله از راست (Right)</label>
                            <input
                              type="text"
                              value={getActiveStyles(selectedElem).right || ''}
                              onChange={(e) =>
                                cms.updateElementStyles(
                                  selectedElem.id,
                                  { right: e.target.value },
                                  currentBreakpoint
                                )
                              }
                              className="w-full bg-[#0D131F] border border-[#1E293B] rounded p-1 text-xs text-white"
                              placeholder="12% یا 20px"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">مارجین عمودی (Margin Y)</label>
                          <input
                            type="text"
                            value={getActiveStyles(selectedElem).marginBottom || '0px'}
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { marginBottom: e.target.value },
                                currentBreakpoint
                              )
                            }
                            className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                            placeholder="20px"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">پدینگ (Padding)</label>
                          <input
                            type="text"
                            value={getActiveStyles(selectedElem).padding || '0px'}
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { padding: e.target.value },
                                currentBreakpoint
                              )
                            }
                            className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                            placeholder="12px 24px"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: COLORS & BACKGROUNDS */}
                  {inspectorTab === 'colors' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">رنگ متن (Text Color)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={getActiveStyles(selectedElem).color || '#FFFFFF'}
                            onChange={(e) =>
                              cms.updateElementStyles(selectedElem.id, { color: e.target.value }, currentBreakpoint)
                            }
                            className="w-9 h-9 rounded cursor-pointer bg-transparent border-none"
                          />
                          <input
                            type="text"
                            value={getActiveStyles(selectedElem).color || '#FFFFFF'}
                            onChange={(e) =>
                              cms.updateElementStyles(selectedElem.id, { color: e.target.value }, currentBreakpoint)
                            }
                            className="flex-1 bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white font-mono text-xs focus:border-[#C9A84C] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">رنگ پس‌زمینه (Background Color)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={
                              getActiveStyles(selectedElem).backgroundColor?.startsWith('#')
                                ? getActiveStyles(selectedElem).backgroundColor
                                : '#C9A84C'
                            }
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { backgroundColor: e.target.value },
                                currentBreakpoint
                              )
                            }
                            className="w-9 h-9 rounded cursor-pointer bg-transparent border-none"
                          />
                          <input
                            type="text"
                            value={getActiveStyles(selectedElem).backgroundColor || 'transparent'}
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { backgroundColor: e.target.value },
                                currentBreakpoint
                              )
                            }
                            className="flex-1 bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white font-mono text-xs focus:border-[#C9A84C] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>میزان شفافیت (Opacity)</span>
                          <span className="font-mono text-[#E4C675]">
                            {Math.round((getActiveStyles(selectedElem).opacity ?? 1) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={getActiveStyles(selectedElem).opacity ?? 1}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { opacity: parseFloat(e.target.value) },
                              currentBreakpoint
                            )
                          }
                          className="w-full accent-[#C9A84C]"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 5: BORDER & RADIUS */}
                  {inspectorTab === 'border' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">گردی گوشه‌ها (Border Radius)</label>
                        <input
                          type="text"
                          value={getActiveStyles(selectedElem).borderRadius || '0px'}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { borderRadius: e.target.value },
                              currentBreakpoint
                            )
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                          placeholder="16px یا 50% یا 9999px"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">ضخامت کادر (Border Width)</label>
                          <input
                            type="text"
                            value={getActiveStyles(selectedElem).borderWidth || '0px'}
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { borderWidth: e.target.value },
                                currentBreakpoint
                              )
                            }
                            className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                            placeholder="1px"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">نوع خط (Border Style)</label>
                          <select
                            value={getActiveStyles(selectedElem).borderStyle || 'solid'}
                            onChange={(e) =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { borderStyle: e.target.value as any },
                                currentBreakpoint
                              )
                            }
                            className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white text-xs focus:border-[#C9A84C] outline-none"
                          >
                            <option value="solid">یکپارچه (Solid)</option>
                            <option value="dashed">خط‌چین (Dashed)</option>
                            <option value="dotted">نقطه‌چین (Dotted)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">رنگ کادر (Border Color)</label>
                        <input
                          type="text"
                          value={getActiveStyles(selectedElem).borderColor || '#C9A84C'}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { borderColor: e.target.value },
                              currentBreakpoint
                            )
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white font-mono text-xs focus:border-[#C9A84C] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 6: SHADOW & EFFECTS */}
                  {inspectorTab === 'shadow' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1">سایه یا هاله نور (Box Shadow)</label>
                        <textarea
                          rows={2}
                          value={getActiveStyles(selectedElem).boxShadow || ''}
                          onChange={(e) =>
                            cms.updateElementStyles(
                              selectedElem.id,
                              { boxShadow: e.target.value },
                              currentBreakpoint
                            )
                          }
                          className="w-full bg-[#141C2B] border border-[#1E293B] rounded-lg p-2 text-white font-mono text-xs focus:border-[#C9A84C] outline-none"
                          placeholder="0 10px 25px rgba(201,168,76,0.4)"
                        />
                      </div>

                      <div className="p-2.5 bg-[#141C2B] rounded-lg border border-[#1E293B] space-y-2">
                        <div className="text-[11px] font-bold text-[#E4C675]">سایه‌های سریع آماده:</div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { boxShadow: '0 10px 25px rgba(201, 168, 76, 0.4)' },
                                currentBreakpoint
                              )
                            }
                            className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded hover:bg-amber-500/30"
                          >
                            هاله طلایی
                          </button>
                          <button
                            onClick={() =>
                              cms.updateElementStyles(
                                selectedElem.id,
                                { boxShadow: '0 20px 40px rgba(0,0,0,0.7)' },
                                currentBreakpoint
                              )
                            }
                            className="text-[10px] bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded hover:bg-slate-700"
                          >
                            سایه عمیق
                          </button>
                          <button
                            onClick={() =>
                              cms.updateElementStyles(selectedElem.id, { boxShadow: 'none' }, currentBreakpoint)
                            }
                            className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-1 rounded hover:bg-rose-500/30"
                          >
                            حذف سایه
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: PRESETS & ACTIONS */}
                  {inspectorTab === 'presets' && (
                    <div className="space-y-4">
                      {/* Copy / Paste style buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            cms.copyStyles(selectedElem);
                            onShowToast('استایل کپی شد', 'استایل المان در حافظه موقت کپی گردید.');
                          }}
                          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 font-semibold"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-400" />
                          <span>کپی استایل</span>
                        </button>
                        <button
                          onClick={() => {
                            cms.pasteStyles(selectedElem.id);
                            onShowToast('استایل اعمال شد', 'استایل کپی‌شده بر روی المان اعمال شد.');
                          }}
                          disabled={!cms.copiedStyles}
                          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 font-semibold disabled:opacity-30"
                        >
                          <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
                          <span>چسباندن استایل</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-[#E4C675]">پریست‌های آماده آرمانی:</div>
                        {cms.presets.map((preset) => (
                          <div
                            key={preset.id}
                            onClick={() => {
                              cms.applyPreset(selectedElem.id, preset);
                              onShowToast('پریست اعمال شد', `پریست «${preset.name}» اعمال گردید.`);
                            }}
                            className="p-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] cursor-pointer transition-colors"
                          >
                            <div className="font-bold text-slate-200 text-xs">{preset.name}</div>
                            <div className="text-[10px] text-slate-400">{preset.description}</div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          cms.resetStyles(selectedElem.id);
                          onShowToast('بازنشانی شد', 'استایل المان به حالت پیش‌فرض بازگشت.');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold transition-colors mt-4"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>بازنشانی به استایل اولیه</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Element footer */}
                <div className="p-3 border-t border-[#1E293B] bg-[#0F1420]">
                  <button
                    onClick={() => cms.deleteElement(selectedElem.id)}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-rose-900/20 hover:bg-rose-900/40 border border-rose-700/40 text-rose-300 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف این المان از صفحه</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Sliders className="w-8 h-8 text-slate-600 mb-2" />
                <div className="text-xs font-bold">هیچ المانی انتخاب نشده است</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  روی هر المان در صفحه یا لایه‌ها کلیک کنید تا تنظیمات استایل آن باز شود.
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. REVISIONS HISTORY MODAL                                                */}
      {/* ========================================================================= */}
      {isVersionsModalOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <span className="font-black text-sm text-white">تاریخچه نسخه‌ها و کنترل نگارش (Revisions)</span>
              </div>
              <button
                onClick={() => setIsVersionsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {cms.versions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">هیچ نسخه ثبتی یافت نشد.</div>
              ) : (
                cms.versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 rounded-xl bg-[#141C2B] border border-[#1E293B] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#E4C675]">نگارش شماره {ver.versionNumber}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                          {ver.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{ver.changeSummary}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        توسط {ver.createdBy} • {new Date(ver.createdAt).toLocaleString('fa-IR')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreVersionClick(ver.id, ver.versionNumber)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>بازگردانی این نسخه</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DESIGN TOKENS MODAL                                                    */}
      {/* ========================================================================= */}
      {isTokensModalOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#E4C675]" />
                <span className="font-black text-sm text-white">توکن‌های طراحی و متغیرهای جهانی CSS</span>
              </div>
              <button
                onClick={() => setIsTokensModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="text-xs text-slate-400 mb-2">
                تغییر هر کدام از این توکن‌ها، بلافاصله روی تمام وب‌سایت و کامپوننت‌های مشتق‌شده از آن اثر می‌گذارد:
              </div>
              {cms.tokens.map((token) => (
                <div
                  key={token.id}
                  className="p-3 rounded-xl bg-[#141C2B] border border-[#1E293B] flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">{token.name}</div>
                    <div className="text-[11px] font-mono text-[#C9A84C]">{token.variableName}</div>
                    <div className="text-[10px] text-slate-400">{token.description}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {token.category === 'color' && (
                      <input
                        type="color"
                        value={token.value.startsWith('#') ? token.value : '#C9A84C'}
                        onChange={(e) => {
                          const updated = cms.tokens.map((t) =>
                            t.id === token.id ? { ...t, value: e.target.value } : t
                          );
                          cms.updateTokens(updated);
                        }}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                      />
                    )}
                    <input
                      type="text"
                      value={token.value}
                      onChange={(e) => {
                        const updated = cms.tokens.map((t) =>
                          t.id === token.id ? { ...t, value: e.target.value } : t
                        );
                        cms.updateTokens(updated);
                      }}
                      className="w-32 bg-[#0D131F] border border-[#1E293B] rounded-lg p-1.5 text-xs text-white font-mono text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PUBLISH CONFIRMATION DIALOG                                            */}
      {/* ========================================================================= */}
      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#C9A84C]/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#E4C675]">
              <div className="p-2.5 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/30">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">انتشار سراسری در سایت اصلی</h3>
                <p className="text-xs text-slate-400">تغییرات شما برای تمامی کاربران زنده خواهد شد.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                توضیح مختصر تغییرات نسخه جدید (Change Summary):
              </label>
              <textarea
                rows={3}
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                className="w-full bg-[#141C2B] border border-[#1E293B] rounded-xl p-3 text-white text-xs focus:border-[#C9A84C] outline-none"
                placeholder="مثلاً: تغییر عنوان اصلی هیرو، تغییر اندازه نقطه دکوراتیو و رنگ دکمه اقدام..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPublishConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmPublish}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#92722A] text-[#0A0E17] text-xs font-black shadow-lg shadow-[#C9A84C]/20 transition-all hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>تایید و انتشار نهایی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
