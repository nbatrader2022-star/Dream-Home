import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Calculator,
  Calendar,
  MapPin,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronLeft,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Property, ChatMessage } from '../types';
import { toPersianDigits, formatPrice } from '../utils/formatters';

interface GeminiChatbotProps {
  allProperties?: Property[];
  currentProperty?: Property | null;
  onOpenMortgage?: (property?: Property) => void;
  onOpenScheduleVisit?: (property?: Property) => void;
  onOpenMap?: () => void;
  onSelectProperty?: (property: Property) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: 'درود بر شما! من «آرمانیار»، دستیار هوشمند و مشاور ملکی شما بر پایه هوش مصنوعی Gemini هستم.\n\nمی‌توانید به زبان ساده نیازهای ملکی خود را برای من بنویسید (مثلاً: «یک آپارتمان ۳ خوابه در نیاوران زیر ۲۰ میلیارد تومان به من پیشنهاد بده» یا «ویلای استخردار در لواسان می‌خواهم»)، یا درباره شرایط خرید، اقساط وام و رزرو بازدید از من بپرسید.',
    timestamp: 'هم‌اکنون',
    quickActions: [
      { label: 'آپارتمان ۳ خوابه نیاوران زیر ۲۰ میلیارد', action: 'suggest_niavaran_3bed' },
      { label: 'ویلای استخردار در لواسان', action: 'suggest_villa' },
      { label: 'پنت‌هاوس دوبلکس زعفرانیه با روف‌گاردن', action: 'suggest_penthouse' },
      { label: 'محاسبه اقساط وام مسکن', action: 'open_mortgage' },
    ],
  },
];

const PRESET_PROMPTS = [
  'یک آپارتمان ۳ خوابه در نیاوران یا الهیه زیر ۲۰ میلیارد تومان به من معرفی کن',
  'ویلای مدرن استخردار با متراژ بالا در شمیرانات یا لواسان',
  'پنت‌هاوس دوبلکس در زعفرانیه با ویوی ۳۶۰ درجه',
  'محاسبه اقساط وام مسکن برای ۳۰ میلیارد تومان',
];

// Natural Language Parser for Property Assistant queries
function findMatchingProperties(queryText: string, pool: Property[]): Property[] {
  if (!pool || pool.length === 0) return [];
  const q = queryText.toLowerCase();

  const scored = pool.map((prop) => {
    let score = 0;
    const propText = `${prop.title} ${prop.location} ${prop.neighborhood} ${prop.cityNameFa} ${prop.description} ${prop.amenities?.join(' ')}`.toLowerCase();

    // 1. Neighborhood / City match across 21 cities
    const citiesAndNeighborhoods = [
      'تهران', 'نیاوران', 'الهیه', 'فرشته', 'زعفرانیه', 'جردن', 'سعادت‌آباد', 'لواسان', 'فرمانیه', 'کامرانیه',
      'مشهد', 'سجاد', 'احمدآباد', 'تبریز', 'ولیعصر', 'ائل‌گلی', 'اصفهان', 'جلفا', 'مشتاق', 'ناژوان',
      'شیراز', 'قصردشت', 'معالی‌آباد', 'زرگری', 'کرج', 'عظیمیه', 'مهرشهر', 'کردان',
      'رشت', 'گلسار', 'ساری', 'بابل', 'آمل', 'گرگان', 'ناه his خور', 'سنندج', 'آبیدر', 'قروه',
      'کرمانشاه', 'نوبهار', 'همدان', 'استادان', 'سعیدیه', 'اراک', 'عباس‌آباد', 'اردبیل', 'سرعین',
      'کرمان', 'زاهدان', 'زیباشهر', 'بیرجند', 'یاسوج'
    ];
    for (const n of citiesAndNeighborhoods) {
      if (q.includes(n)) {
        if (propText.includes(n)) score += 15;
      }
    }

    // 2. Bedrooms match
    if (q.includes('۳ خواب') || q.includes('3 خواب') || q.includes('سه خواب')) {
      if (prop.bedrooms === 3) score += 14;
    } else if (q.includes('۲ خواب') || q.includes('2 خواب') || q.includes('دو خواب')) {
      if (prop.bedrooms === 2) score += 14;
    } else if (q.includes('۴ خواب') || q.includes('4 خواب') || q.includes('چهار خواب')) {
      if (prop.bedrooms >= 4) score += 14;
    } else if (q.includes('۵ خواب') || q.includes('5 خواب') || q.includes('پنج خواب')) {
      if (prop.bedrooms >= 5) score += 14;
    }

    // 3. Budget limit match (e.g., زیر ۱۵ میلیارد, زیر 15, تا ۲۰ میلیارد)
    const budgetMatch = q.match(/(?:زیر|تا|حداکثر|کمتر از)\s*(\d+|[۰-۹]+)\s*(?:میلیارد|م)/);
    if (budgetMatch) {
      const rawNum = budgetMatch[1].replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
      const maxBillion = parseFloat(rawNum);
      if (!isNaN(maxBillion) && maxBillion > 0) {
        const maxTomans = maxBillion * 1_000_000_000;
        if (prop.price <= maxTomans) {
          score += 16;
        } else {
          score -= 12;
        }
      }
    }

    // 4. Property type match
    if (q.includes('ویلا') && (prop.propertyType === 'villa' || prop.propertyType === 'garden')) score += 12;
    if (q.includes('پنت') && prop.propertyType === 'penthouse') score += 12;
    if (q.includes('آپارتمان') && prop.propertyType === 'apartment') score += 8;

    // 5. Key amenities
    if (q.includes('استخر') && propText.includes('استخر')) score += 8;
    if (q.includes('روف') && propText.includes('روف')) score += 8;
    if (q.includes('هوشمند') && propText.includes('هوشمند')) score += 8;
    if (q.includes('پارکینگ') && prop.parking >= 2) score += 6;

    return { prop, score };
  });

  return scored
    .filter((item) => item.score >= 12)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.prop)
    .slice(0, 3);
}

export function GeminiChatbot({
  allProperties = [],
  currentProperty,
  onOpenMortgage,
  onOpenScheduleVisit,
  onOpenMap,
  onSelectProperty,
}: GeminiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAiBtnHovered, setIsAiBtnHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('dream_home_chat_history');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  // Persist chat history
  useEffect(() => {
    try {
      localStorage.setItem('dream_home_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat:', e);
    }
  }, [messages]);

  // Global listener for opening chat from anywhere in the app (e.g. Navbar or Mobile drawer)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-gemini-chat', handleOpen);
    return () => window.removeEventListener('open-gemini-chat', handleOpen);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // Natural Language Requirement Analysis for Property Assistant
    const matchingProps = findMatchingProperties(text, allProperties);

    try {
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        allPropertiesCatalogue: allProperties.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          location: p.location,
          neighborhood: p.neighborhood,
          city: p.city,
          cityNameFa: p.cityNameFa,
          area: p.area,
          bedrooms: p.bedrooms,
          propertyType: p.propertyType,
          amenities: p.amenities,
        })),
        currentPropertyContext: currentProperty
          ? {
              title: currentProperty.title,
              price: currentProperty.price,
              location: currentProperty.location,
              area: currentProperty.area,
              bedrooms: currentProperty.bedrooms,
            }
          : undefined,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      let replyContent = data.reply || 'پاسخی از مشاور هوشمند دریافت نشد.';

      // Determine contextual quick actions
      const actions: Array<{ label: string; action: string }> = [];
      const lower = text.toLowerCase() + ' ' + replyContent.toLowerCase();
      if (lower.includes('وام') || lower.includes('اقساط') || lower.includes('تسهیلات')) {
        actions.push({ label: 'ماشین‌حساب اقساط وام', action: 'open_mortgage' });
      }
      if (lower.includes('بازدید') || lower.includes('رزرو') || lower.includes('هماهنگی')) {
        actions.push({ label: 'هماهنگی نوبت بازدید', action: 'open_visit' });
      }
      if (lower.includes('نقشه') || lower.includes('لوکیشن') || lower.includes('منطقه')) {
        actions.push({ label: 'مشاهده روی نقشه تعاملی', action: 'open_map' });
      }

      // If matching properties were detected, enrich message with recommendations
      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        suggestedProperties: matchingProps.length > 0 ? matchingProps : undefined,
        quickActions: actions.length > 0 ? actions : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);

      let fallbackContent = 'متاسفانه در برقراری ارتباط با هسته هوش مصنوعی مشکلی رخ داد.';
      if (matchingProps.length > 0) {
        fallbackContent = `بر اساس جستجو در پورتفولیوی خانه آرمانی، ${toPersianDigits(matchingProps.length)} ملک منطبق با نیازهای شما (از نظر محدوده، تعداد خواب و بودجه) پیدا کردم. می‌توانید جزئیات آنها را در زیر بررسی نمایید:`;
      }

      const errorMessage: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        suggestedProperties: matchingProps.length > 0 ? matchingProps : undefined,
        quickActions: [
          { label: 'محاسبه وام مسکن', action: 'open_mortgage' },
          { label: 'مشاهده نقشه املاک', action: 'open_map' },
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === 'open_mortgage' && onOpenMortgage) {
      onOpenMortgage(currentProperty || undefined);
    } else if (action === 'open_visit' && onOpenScheduleVisit) {
      onOpenScheduleVisit(currentProperty || undefined);
    } else if (action === 'open_map' && onOpenMap) {
      onOpenMap();
    } else if (action === 'suggest_niavaran_3bed') {
      handleSendMessage('یک آپارتمان ۳ خوابه لوکس در نیاوران یا الهیه زیر ۲۰ میلیارد تومان به من پیشنهاد بده.');
    } else if (action === 'suggest_penthouse') {
      handleSendMessage('مشخصات و قیمت پنت‌هاوس‌های الهیه و زعفرانیه را توضیح دهید.');
    } else if (action === 'how_to_visit') {
      handleSendMessage('فرآیند هماهنگی بازدید حضوری یا تور مجازی چگونه انجام می‌شود؟');
    } else if (action === 'suggest_villa') {
      handleSendMessage('ویلای لوکس مدرن در نیاوران یا لواسان چه گزینه‌هایی دارید؟');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('آیا از پاک کردن تاریخچه گفتگو اطمینان دارید؟')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('dream_home_chat_history');
    }
  };

  return (
    <>
      {/* Floating Launcher Button - Premium Hover-on-Expand (Desktop hover ONLY, compact circular default) */}
      {!isOpen && (
        <div
          dir="ltr"
          className="fixed bottom-4 left-4 sm:bottom-5 sm:left-5 z-40 flex items-center pointer-events-auto"
        >
          <motion.button
            type="button"
            id="gemini-floating-trigger"
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsAiBtnHovered(true)}
            onMouseLeave={() => setIsAiBtnHovered(false)}
            onFocus={() => setIsAiBtnHovered(true)}
            onBlur={() => setIsAiBtnHovered(false)}
            aria-label="مشاور هوشمند هوش مصنوعی"
            className="group relative flex items-center h-11 min-w-[44px] rounded-full bg-gradient-to-tr from-[#0F172A] via-[#1A1A2E] to-[#16213E] text-[#E4C675] shadow-[0_6px_22px_rgba(201,168,76,0.38)] hover:shadow-[0_8px_30px_rgba(201,168,76,0.6)] border border-[#C9A84C]/80 cursor-pointer overflow-hidden px-3 transition-colors duration-200"
            animate={{
              width: isAiBtnHovered ? 'auto' : 44,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* AI Bot Icon - Always visible, stable anchor */}
            <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
              <Bot className="w-5 h-5 text-[#E4C675] group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
            </div>

            {/* Hover-reveal text - Only visible on mouse hover (Desktop), expands to the right in LTR container */}
            <AnimatePresence>
              {isAiBtnHovered && (
                <motion.span
                  initial={{ opacity: 0, width: 0, x: -6 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -6 }}
                  transition={{
                    duration: 0.28,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="whitespace-nowrap overflow-hidden text-xs font-bold text-white tracking-wide pr-1 pl-2.5 font-['Vazirmatn_FD','Vazirmatn',sans-serif]"
                  dir="rtl"
                >
                  مشاور هوشمند هوش مصنوعی
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-[9999] transition-all duration-300 flex flex-col bg-[#1A1A2E]/95 backdrop-blur-2xl border border-[#C9A84C]/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden font-secondary ${
            isExpanded
              ? 'inset-2 sm:inset-10'
              : 'bottom-2 left-2 right-2 sm:bottom-4 sm:left-6 sm:right-auto sm:w-[420px] h-[550px] sm:h-[600px] max-h-[92vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F3460] via-[#16213E] to-[#1A1A2E] px-4 py-3.5 border-b border-[#C9A84C]/25 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#A07830] p-0.5 shadow-md">
                <div className="w-full h-full rounded-[10px] bg-[#1A1A2E] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#E4C675]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#1A1A2E] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-primary font-bold text-sm">آرمانیار | مشاور هوشمند</h3>
                  <span className="bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#E4C675] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Gemini AI
                  </span>
                </div>
                <p className="text-white/60 text-[11px] mt-0.5">پاسخگویی آنی به سوالات ملکی و وام</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/70">
              <button
                onClick={handleClearHistory}
                title="پاک کردن تاریخچه گفتگو"
                className="p-1.5 hover:text-[#E4C675] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'کوچک کردن' : 'بزرگ کردن پنجره'}
                className="p-1.5 hover:text-[#E4C675] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="بستن"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context Property Alert Bar */}
          {currentProperty && (
            <div className="bg-[#C9A84C]/10 border-b border-[#C9A84C]/20 px-3.5 py-2 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-[#E4C675] flex-shrink-0" />
                <span className="truncate">ملک فعلی: <strong className="text-white">{currentProperty.title}</strong></span>
              </div>
              <button
                onClick={() => handleSendMessage(`درباره امکانات و شرایط ملک «${currentProperty.title}» توضیح بده.`)}
                className="text-[11px] bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#E4C675] px-2 py-0.5 rounded border border-[#C9A84C]/40 flex-shrink-0 cursor-pointer"
              >
                تحلیل این ملک
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs mt-1 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#C9A84C] to-[#A07830] text-[#1A1A2E]'
                      : 'bg-[#0F3460] text-[#E4C675] border border-[#C9A84C]/40'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#0A0E17] font-medium rounded-tr-none shadow-md'
                        : 'bg-[#16213E]/90 text-white/95 border border-[#C9A84C]/20 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Time */}
                  <div
                    className={`text-[10px] text-white/40 px-1 ${
                      msg.role === 'user' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </div>

                  {/* Quick Action Chips */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act.action)}
                          className="bg-[#1A1A2E] hover:bg-[#0F3460] text-[#E4C675] border border-[#C9A84C]/30 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer shadow-sm"
                        >
                          {act.action === 'open_mortgage' && <Calculator className="w-3 h-3 text-[#C9A84C]" />}
                          {act.action === 'open_visit' && <Calendar className="w-3 h-3 text-[#C9A84C]" />}
                          {act.action === 'open_map' && <MapPin className="w-3 h-3 text-[#C9A84C]" />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0F3460] text-[#E4C675] border border-[#C9A84C]/40 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-[#16213E]/90 border border-[#C9A84C]/20 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse delay-150" />
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse delay-300" />
                  <span className="text-white/60 text-xs mr-2">در حال تحلیل هوشمند...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Prompts (if fewer than 4 messages) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-white/5 bg-[#16213E]/40 flex gap-1.5 overflow-x-auto scrollbar-none">
              {PRESET_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="whitespace-nowrap bg-white/5 hover:bg-[#C9A84C]/20 text-white/80 hover:text-[#E4C675] text-[11px] px-2.5 py-1 rounded-full border border-white/10 hover:border-[#C9A84C]/30 transition-all cursor-pointer flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-[#16213E] border-t border-[#C9A84C]/25 flex items-center gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="سوال خود درباره املاک، وام یا رزرو بازدید را بنویسید..."
              className="flex-1 bg-[#1A1A2E] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#C9A84C]/30 focus:border-[#C9A84C] focus:outline-none placeholder-white/40"
              disabled={isLoading}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] flex items-center justify-center shadow-md hover:shadow-[0_4px_16px_rgba(201,168,76,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0"
              aria-label="ارسال پیام"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
