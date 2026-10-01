import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Phone,
  Heart,
  Scale,
  MapPin,
  Calculator,
  Menu,
  X,
  Instagram,
  Send,
  MessageCircle,
  Linkedin,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  User,
  Bot,
  LayoutGrid,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Briefcase,
  Workflow,
  LayoutDashboard,
  BookOpen,
  Settings,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Globe,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';
import { UserProfile } from '../types';
import brandLogo from '../assets/images/armani_luxury_logo_1788674026359.jpg';
import { getAdminVisibilitySettings, isUserAuthorizedAdmin } from '../data/admins';
import { subscribeToSupabaseAuth, getCurrentAdminSession } from '../services/supabaseAuth';

interface NavbarProps {
  savedCount: number;
  compareCount: number;
  onOpenSaved: () => void;
  onOpenCompare: () => void;
  onOpenMap?: () => void;
  onOpenMapExplorer?: () => void;
  onOpenMortgage?: () => void;
  onOpenMortgageCalculator?: () => void;
  onOpenRoi?: () => void;
  onOpenConsultation?: () => void;
  onOpenAdmin?: (tab?: 'cms' | 'admins' | 'properties' | 'blog' | 'settings' | 'bookings' | 'analytics' | 'media' | 'seo') => void;
  onOpenVisualEditor?: () => void;
  isAdmin?: boolean;
  onNavigate?: (sectionId: string) => void;
  user?: UserProfile | null;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  currentPage?: string;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export function Navbar({
  savedCount,
  compareCount,
  onOpenSaved,
  onOpenCompare,
  onOpenMap,
  onOpenMapExplorer,
  onOpenMortgage,
  onOpenMortgageCalculator,
  onOpenRoi,
  onOpenConsultation,
  onOpenAdmin,
  onOpenVisualEditor,
  isAdmin = false,
  onNavigate,
  user,
  onGoogleSignIn,
  onSignOut,
  currentPage = 'home',
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const VISIBLE_COUNT = 5;
  const mobileMenuScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic Header Height Measurement for Global CSS Variable
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty('--header-height', `${height}px`);
        }
      }
    };

    updateHeaderHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(navRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // Body scroll locking and background interaction prevention when mobile menu is OPEN
  useEffect(() => {
    if (!mobileMenuOpen) return;

    // Save previous document states
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    // Compensate scrollbar width to prevent desktop/tablet layout jumping
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    // Complete lock on page/body scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';

    // Intercept touch movements outside the dedicated scrollable menu container
    // This prevents rubber-banding and scroll chaining on iOS & Android
    const handleTouchMove = (e: TouchEvent) => {
      const scrollEl = mobileMenuScrollRef.current;
      if (!scrollEl) {
        e.preventDefault();
        return;
      }
      // If the touch originated outside the scrollable menu container, prevent default
      if (!scrollEl.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.body.style.paddingRight = '';
    };
  }, [mobileMenuOpen]);

  // Automatically close menu on Escape key or when screen is resized to desktop
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);



  // Admin visibility preference check
  const [visibilitySettings, setVisibilitySettings] = useState(() => getAdminVisibilitySettings());
  const [isSupabaseAdmin, setIsSupabaseAdmin] = useState<boolean>(false);

  useEffect(() => {
    getCurrentAdminSession().then((res) => {
      if (res.isSuperAdmin) setIsSupabaseAdmin(true);
    });

    const unsub = subscribeToSupabaseAuth((state) => {
      setIsSupabaseAdmin(state.isSuperAdmin);
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setVisibilitySettings(getAdminVisibilitySettings());
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event triggered when settings update in AdminManagementTab
    window.addEventListener('dream_home_admin_settings_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dream_home_admin_settings_changed', handleStorageChange);
    };
  }, []);

  const isStrictAuthorized = Boolean(
    isSupabaseAdmin ||
    (user?.email && isUserAuthorizedAdmin(user.email)) ||
    isAdmin
  );

  // Only verified Super Admin in Supabase or authorized admin emails see the Admin Panel button
  const shouldShowAdmin = isStrictAuthorized;

  const handleOpenMap = () => {
    if (onOpenMap) onOpenMap();
    else if (onOpenMapExplorer) onOpenMapExplorer();
  };

  const handleOpenMortgage = () => {
    if (onOpenMortgage) onOpenMortgage();
    else if (onOpenMortgageCalculator) onOpenMortgageCalculator();
  };

  const handleConsultation = () => {
    if (onOpenConsultation) onOpenConsultation();
    else if (onNavigate) onNavigate('contact');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        const yOffset = -85;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  };

  // Complete desktop menu items preserved in exact specified order for the 5-item Carousel
  const desktopMenuItems = [
    {
      id: 'categories',
      label: 'دسته‌بندی‌ها',
      icon: <LayoutGrid className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'categories'),
    },
    {
      id: 'properties',
      label: 'ملک‌های ویژه',
      icon: <Sparkles className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'properties'),
    },
    {
      id: 'mortgage',
      label: 'محاسبه اقساط',
      icon: <Calculator className="w-4 h-4 text-[#C9A84C]" />,
      onClick: handleOpenMortgage,
    },
    {
      id: 'neighborhoods',
      label: 'محله‌های لوکس',
      icon: <MapPin className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'neighborhoods'),
    },
    {
      id: 'how-it-works',
      label: 'روش کار',
      icon: <Workflow className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'how-it-works'),
    },
    {
      id: 'consultants',
      label: 'مشاوران',
      icon: <Users className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'consultants'),
    },
    {
      id: 'services',
      label: 'خدمات تخصصی',
      icon: <Briefcase className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'services'),
    },
    {
      id: 'blog',
      label: 'مقالات',
      icon: <FileText className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'blog'),
    },
    {
      id: 'map',
      label: 'نقشه املاک',
      icon: <MapPin className="w-4 h-4 text-[#C9A84C]" />,
      onClick: handleOpenMap,
    },
    {
      id: 'roi',
      label: 'محاسبه ROI',
      icon: <TrendingUp className="w-4 h-4 text-[#C9A84C]" />,
      onClick: () => {
        if (onOpenRoi) onOpenRoi();
        else {
          const el = document.getElementById('roi-calculator');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
    {
      id: 'cities',
      label: 'شهرها و پروژه‌ها',
      icon: <Building2 className="w-4 h-4 text-[#C9A84C]" />,
      onClick: (e: React.MouseEvent) => handleNavClick(e, 'cities'),
    },
  ];

  const maxCarouselIndex = Math.max(0, desktopMenuItems.length - VISIBLE_COUNT);

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1));
  };

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <>
      <nav
        ref={navRef}
        id="navbar"
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          scrolled || (currentPage && currentPage !== 'home')
            ? 'bg-[#1A1A2E]/95 backdrop-blur-xl border-b border-[#C9A84C]/20 py-2 sm:py-2.5 shadow-2xl'
            : 'bg-[#1A1A2E]/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none py-2.5 sm:py-3.5 md:py-5 border-b border-[#C9A84C]/10 md:border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-3 shrink-0 group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border border-[#C9A84C]/40 flex items-center justify-center bg-[#0A0E17] shadow-[0_4px_20px_rgba(201,168,76,0.3)] group-hover:scale-105 transition-transform duration-300 shrink-0">
              <img
                src={brandLogo}
                alt="لوگوی اختصاصی خانه آرمانی"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-white text-right">
              <span className="text-sm sm:text-base md:text-[18px] font-bold block leading-tight tracking-wide font-primary">
                خانه آرمانی
              </span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-light opacity-60 block tracking-widest uppercase">
                Dream Home Real Estate
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links - Exactly 5 visible items with Horizontal Carousel */}
          <div
            id="desktop-menu-carousel-wrapper"
            className="hidden lg:flex items-center gap-1.5 xl:gap-2 mx-1 xl:mx-1.5 shrink-0"
            dir="rtl"
          >
            {/* Right Arrow Button (›) - Go to previous items in RTL (Right direction) */}
            <button
              id="navbar-carousel-prev-btn"
              onClick={handlePrevCarousel}
              disabled={carouselIndex === 0}
              aria-label="گزینه‌های قبلی منو"
              title={carouselIndex === 0 ? 'ابتدای فهرست منو' : 'مشاهده گزینه‌های قبلی (راست)'}
              className={`p-1.5 xl:p-2 rounded-full border transition-all duration-200 flex items-center justify-center shrink-0 ${
                carouselIndex === 0
                  ? 'opacity-20 text-white/30 border-white/5 cursor-not-allowed pointer-events-none'
                  : 'bg-white/10 hover:bg-[#C9A84C]/25 text-white/90 hover:text-[#E4C675] border-white/20 hover:border-[#C9A84C]/60 shadow-md cursor-pointer active:scale-95'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Viewport Window - Displays Exactly 5 Items at all times */}
            <div
              id="navbar-carousel-viewport"
              className="overflow-hidden w-[450px] xl:w-[550px] 2xl:w-[640px] max-w-[calc(100vw-500px)] select-none"
              dir="rtl"
            >
              <div
                className="flex items-center transition-transform duration-300 ease-out"
                style={{
                  width: `${(desktopMenuItems.length / VISIBLE_COUNT) * 100}%`,
                  transform: `translateX(${carouselIndex * (100 / desktopMenuItems.length)}%)`,
                }}
              >
                {desktopMenuItems.map((item) => (
                  <div
                    key={item.id}
                    style={{ width: `${100 / desktopMenuItems.length}%` }}
                    className="shrink-0 px-1 xl:px-1.5 flex items-center justify-center"
                  >
                    <button
                      onClick={item.onClick}
                      title={item.label}
                      className="w-full text-center flex items-center justify-center gap-1 xl:gap-1.5 py-1.5 xl:py-2 rounded-lg text-[13px] xl:text-sm font-medium transition-all cursor-pointer truncate whitespace-nowrap px-1.5 xl:px-2 text-white/85 hover:text-[#E4C675] hover:bg-white/10"
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Left Arrow Button (‹) - Go to next items in RTL (Left direction) */}
            <button
              id="navbar-carousel-next-btn"
              onClick={handleNextCarousel}
              disabled={carouselIndex >= maxCarouselIndex}
              aria-label="گزینه‌های بعدی منو"
              title={carouselIndex >= maxCarouselIndex ? 'انتهای فهرست منو' : 'مشاهده گزینه‌های بعدی (چپ)'}
              className={`p-1.5 xl:p-2 rounded-full border transition-all duration-200 flex items-center justify-center shrink-0 ${
                carouselIndex >= maxCarouselIndex
                  ? 'opacity-20 text-white/30 border-white/5 cursor-not-allowed pointer-events-none'
                  : 'bg-white/10 hover:bg-[#C9A84C]/25 text-white/90 hover:text-[#E4C675] border-white/20 hover:border-[#C9A84C]/60 shadow-md cursor-pointer active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Admin Panel Button (Visible on Desktop only for authorized admins; hidden on mobile and tablet) */}
            {shouldShowAdmin && onOpenAdmin && (
              <button
                id="navbar-admin-panel-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenAdmin('cms');
                }}
                className="hidden lg:flex items-center gap-1 bg-[#C9A84C]/15 hover:bg-[#C9A84C] text-[#E4C675] hover:text-[#1A1A2E] text-[10px] xl:text-[11px] font-bold px-2 xl:px-2.5 py-1 rounded-full border border-[#C9A84C]/40 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                title="ورود به پنل مدیریت سایت"
              >
                <ShieldCheck className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                <span>پنل ادمین</span>
              </button>
            )}

            {/* Free Consultation CTA (Naturally expands when Admin Panel is hidden) */}
            <button
              id="navbar-consultation-btn"
              onClick={handleConsultation}
              className={`bg-gradient-to-r from-[#A07830] via-[#C9A84C] to-[#E4C675] text-[#1A1A2E] font-bold rounded-full transition-all whitespace-nowrap cursor-pointer shrink-0 hover:-translate-y-0.5 ${
                shouldShowAdmin
                  ? 'text-[10px] xl:text-xs px-2.5 xl:px-3 py-1 xl:py-1.5 shadow-[0_4px_16px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.5)]'
                  : 'text-xs xl:text-sm px-4 xl:px-5 py-1.5 xl:py-2 shadow-[0_4px_20px_rgba(201,168,76,0.4)] hover:shadow-[0_8px_28px_rgba(201,168,76,0.55)]'
              }`}
              title="دریافت مشاوره رایگان"
            >
              مشاوره رایگان
            </button>

            {/* Compare Button (Visible only on md+) */}
            <button
              onClick={onOpenCompare}
              title="مقایسه ملک‌ها"
              className="hidden md:flex relative p-1.5 xl:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-all border border-white/15"
            >
              <Scale className="w-3.5 h-3.5" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-[#1A1A2E] text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {toPersianDigits(compareCount)}
                </span>
              )}
            </button>

            {/* Saved Favorites Button (Visible only on md+) */}
            <button
              onClick={onOpenSaved}
              title="ملک‌های نشان‌شده"
              className="hidden md:flex relative p-1.5 xl:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-all border border-white/15"
            >
              <Heart className={`w-3.5 h-3.5 ${savedCount > 0 ? 'fill-[#E84393] text-[#E84393]' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E84393] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                  {toPersianDigits(savedCount)}
                </span>
              )}
            </button>

            {/* Phone Call Button (Icon-only on tablet & desktop, no phone number text) */}
            <a
              href="tel:02155556666"
              aria-label="تماس با مشاوران املاک خانه آرمانی"
              title="تماس با مشاوران (۰۲۱-۵۵۵۵-۶۶۶۶)"
              className="hidden md:flex relative p-1.5 xl:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-[#C9A84C] transition-all border border-white/15 hover:border-[#C9A84C]/60 shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
            </a>

            {/* Google Sign-In / User Profile (Only visible on md+; on mobile it lives inside the hamburger menu) */}
            {user ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 xl:gap-1.5 bg-[#1A1A2E]/90 hover:bg-[#1A1A2E] text-white px-1.5 xl:px-2 py-1 rounded-full border border-[#C9A84C]/60 hover:border-[#C9A84C] transition-all cursor-pointer shadow-md"
                  title={user.displayName || 'حساب کاربری'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-5 h-5 xl:w-6 xl:h-6 rounded-full object-cover border border-[#C9A84C]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A07830] text-[#1A1A2E] font-bold text-[10px] flex items-center justify-center">
                      {user.displayName ? user.displayName.charAt(0) : 'U'}
                    </div>
                  )}
                  <span className="hidden xl:inline text-[11px] font-semibold max-w-[65px] truncate text-white/90">
                    {user.displayName}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 border border-[#1A1A2E]" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#1A1A2E]/95 backdrop-blur-xl border border-[#C9A84C]/40 shadow-2xl p-3 z-50 animate-fadeIn font-secondary text-right">
                    <div className="flex items-center gap-3 p-2 border-b border-white/10 pb-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A84C]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-[#1A1A2E] font-bold flex items-center justify-center">
                          {user.displayName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm truncate font-primary">
                          {user.displayName}
                        </div>
                        <div className="text-white/50 text-[11px] truncate" dir="ltr">
                          {user.email}
                        </div>
                        <div className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#E4C675] bg-[#C9A84C]/15 px-1.5 py-0.5 rounded border border-[#C9A84C]/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>احراز هویت گوگل | همگام‌سازی ابری</span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (onOpenSaved) onOpenSaved();
                        }}
                        className="w-full flex items-center justify-between text-xs text-white/80 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-[#E84393]" />
                          املاک نشان‌شده من
                        </span>
                        <span className="bg-[#E84393]/20 text-[#E84393] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {toPersianDigits(savedCount)}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleOpenMortgage();
                        }}
                        className="w-full flex items-center justify-between text-xs text-white/80 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-[#C9A84C]" />
                          محاسبه‌گر وام مسکن
                        </span>
                      </button>

                      {/* Admin Panel Direct Access - ONLY VISIBLE IF CURRENT USER IS ADMIN */}
                      {shouldShowAdmin && onOpenAdmin && (
                        <>
                          <div className="pt-2 pb-1 border-t border-white/10 mt-2">
                            <span className="text-[10px] font-bold text-[#E4C675] tracking-wider px-1">
                              دسترسی‌های مدیریت (Admin)
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              onOpenAdmin('cms');
                            }}
                            className="w-full flex items-center justify-between text-xs text-[#E4C675] bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 px-3 py-2 rounded-lg transition-colors cursor-pointer font-bold border border-[#C9A84C]/40"
                          >
                            <span className="flex items-center gap-2">
                              <LayoutDashboard className="w-4 h-4 text-[#C9A84C]" />
                              داشبورد و تنظیمات سایت
                            </span>
                            <span className="bg-[#C9A84C] text-[#1A1A2E] text-[9px] font-black px-1.5 py-0.5 rounded">
                              CMS
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              onOpenAdmin('properties');
                            }}
                            className="w-full flex items-center justify-between text-xs text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                              مدیریت و ثبت املاک
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              onOpenAdmin('media');
                            }}
                            className="w-full flex items-center justify-between text-xs text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <ImageIcon className="w-3.5 h-3.5 text-[#C9A84C]" />
                              مدیریت رسانه و تصاویر
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              onOpenAdmin('admins');
                            }}
                            className="w-full flex items-center justify-between text-xs text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                              مدیریت مدیران و دسترسی
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              onOpenAdmin('seo');
                            }}
                            className="w-full flex items-center justify-between text-xs text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-[#C9A84C]" />
                              مدیریت سئو و متاتگ‌ها (SEO)
                            </span>
                          </button>
                        </>
                      )}

                      {/* Visual Page Builder Direct Access - ONLY VISIBLE IF CURRENT USER IS ADMIN */}
                      {shouldShowAdmin && onOpenVisualEditor && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenVisualEditor();
                          }}
                          className="w-full flex items-center justify-between text-xs text-[#0A0E17] bg-gradient-to-r from-[#C9A84C] to-[#E4C675] hover:opacity-95 px-3 py-2 rounded-lg transition-all cursor-pointer font-black shadow-md mt-1"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#0A0E17]" />
                            ویرایشگر زنده بصری (Page Builder)
                          </span>
                          <span className="bg-[#0A0E17] text-[#E4C675] text-[9px] font-black px-1.5 py-0.5 rounded">
                            Live
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (onSignOut) onSignOut();
                        }}
                        className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        خروج از حساب کاربری
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="hidden md:flex items-center gap-1 xl:gap-1.5 bg-white/10 hover:bg-white/15 text-white font-medium text-[10px] xl:text-xs px-2 xl:px-2.5 py-1 rounded-full border border-[#C9A84C]/50 hover:border-[#C9A84C] shadow-sm hover:shadow-[0_4px_16px_rgba(201,168,76,0.3)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="ورود با حساب گوگل جهت همگام‌سازی ابری املاک"
              >
                <GoogleIcon />
                <span className="hidden lg:inline text-[10px] xl:text-xs">ورود با گوگل</span>
                <span className="lg:hidden text-[10px]">ورود</span>
              </button>
            )}

            {/* Hamburger for mobile and tablet (lg:hidden) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
              aria-label="منو"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div
        id="mobile-drawer-menu"
        className={`fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-[#1A1A2E] z-[60] lg:hidden flex flex-col justify-between p-6 sm:p-8 transition-transform duration-500 ease-out overscroll-contain touch-none select-none ${
          mobileMenuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
        style={{
          height: '100dvh',
          maxHeight: '100dvh',
          overscrollBehavior: 'contain',
        }}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/10 mt-12 sm:mt-16 shrink-0 select-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C9A84C] flex items-center justify-center text-[#1A1A2E]">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg">خانه آرمانی</span>
          </div>
          <button
            onClick={closeMenu}
            className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
            aria-label="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile User Profile or Google Sign In */}
        <div className="py-3 sm:py-4 border-b border-white/10 shrink-0 select-auto">
          {user ? (
            <div className="bg-white/5 border border-[#C9A84C]/30 rounded-xl p-3 flex items-center justify-between text-right">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-[#C9A84C]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-[#1A1A2E] font-bold flex items-center justify-center">
                    {user.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-white font-bold text-sm">{user.displayName}</div>
                  <div className="text-white/50 text-[11px]" dir="ltr">{user.email}</div>
                  <div className="text-[10px] text-[#E4C675] mt-0.5">همگام‌سازی ابری فعال است</div>
                </div>
              </div>
              <button
                onClick={() => {
                  closeMenu();
                  if (onSignOut) onSignOut();
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="خروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                closeMenu();
                if (onGoogleSignIn) onGoogleSignIn();
              }}
              className="w-full flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 px-4 rounded-xl border border-[#C9A84C]/40 text-sm transition-all cursor-pointer"
            >
              <GoogleIcon />
              <span>ورود با حساب گوگل</span>
            </button>
          )}
        </div>

        <div
          ref={mobileMenuScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y custom-menu-scrollbar py-3 pr-1 pl-0.5 flex flex-col gap-2 text-right select-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
          }}
        >
          {/* Gemini AI Bot Trigger in Mobile Menu */}
          <button
            onClick={() => {
              closeMenu();
              window.dispatchEvent(new CustomEvent('open-gemini-chat'));
            }}
            className="w-full bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] border border-[#C9A84C] rounded-xl p-3 text-right flex items-center justify-between shadow-md mb-2 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center text-[#1A1A2E]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-xs">مشاور هوشمند Gemini (AI)</div>
                <div className="text-[10px] text-[#E4C675]">پاسخ به سوالات ملکی و حقوقی</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          <button
            onClick={(e) => handleNavClick(e, 'cities')}
            className="w-full text-[#E4C675] text-sm font-bold py-2.5 px-3 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/40 hover:bg-[#C9A84C]/25 transition-colors flex items-center justify-between shadow-sm cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C9A84C]" />
              شهرها و پروژه‌ها (۲۱ کلان‌شهر)
            </span>
            <span className="text-[10px] bg-[#C9A84C] text-[#1A1A2E] font-black px-2 py-0.5 rounded-full">
              جدید
            </span>
          </button>

          <button
            onClick={(e) => handleNavClick(e, 'categories')}
            className="w-full text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>دسته‌بندی‌های املاک</span>
            <LayoutGrid className="w-4 h-4 text-[#C9A84C]" />
          </button>

          <button
            onClick={(e) => handleNavClick(e, 'properties')}
            className="w-full text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors text-right cursor-pointer"
          >
            ملک‌های ویژه و منتخب
          </button>

          <button
            onClick={() => {
              closeMenu();
              if (onOpenMapExplorer) onOpenMapExplorer();
              else if (onOpenMap) onOpenMap();
            }}
            className="text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>کاوش هوشمند روی نقشه</span>
            <MapPin className="w-4 h-4 text-[#C9A84C]" />
          </button>

          <button
            onClick={() => {
              closeMenu();
              if (onOpenMortgageCalculator) onOpenMortgageCalculator();
              else if (onOpenMortgage) onOpenMortgage();
            }}
            className="text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>محاسبه‌گر اقساط وام مسکن</span>
            <Calculator className="w-4 h-4 text-[#C9A84C]" />
          </button>

          {onOpenRoi && (
            <button
              onClick={() => {
                closeMenu();
                onOpenRoi();
              }}
              className="text-[#E4C675] text-sm font-bold py-2 px-2 rounded-lg bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>محاسبه‌گر بازده سرمایه‌گذاری (ROI)</span>
              <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
            </button>
          )}

          <button
            onClick={(e) => handleNavClick(e, 'neighborhoods')}
            className="w-full text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors text-right cursor-pointer"
          >
            محله‌های لوکس تهران و شهرستان‌ها
          </button>

          <button
            onClick={() => {
              closeMenu();
              if (onNavigate) onNavigate('how-it-works');
            }}
            className="text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors flex items-center justify-between cursor-pointer w-full text-right"
          >
            <span>روش کار و فرآیند معاملات</span>
            <Workflow className="w-4 h-4 text-[#C9A84C]" />
          </button>

          <button
            onClick={() => {
              closeMenu();
              if (onNavigate) onNavigate('consultants');
            }}
            className="text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors flex items-center justify-between cursor-pointer w-full text-right"
          >
            <span>مشاوران و کارشناسان ارشد</span>
            <Users className="w-4 h-4 text-[#C9A84C]" />
          </button>

          <button
            onClick={() => {
              closeMenu();
              if (onNavigate) onNavigate('services');
            }}
            className="text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors flex items-center justify-between cursor-pointer w-full text-right"
          >
            <span>خدمات تخصصی، حقوقی و ارزیابی</span>
            <Briefcase className="w-4 h-4 text-[#C9A84C]" />
          </button>

          <button
            onClick={(e) => handleNavClick(e, 'blog')}
            className="w-full text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors text-right cursor-pointer"
          >
            مقالات آموزشی و راهنمای حقوقی
          </button>

          <button
            onClick={() => {
              closeMenu();
              onOpenSaved();
            }}
            className="text-white/90 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-white/5 border-b border-white/5 hover:text-[#C9A84C] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>املاک نشان‌شده ({toPersianDigits(savedCount)})</span>
            <Heart className="w-4 h-4 text-[#E84393]" />
          </button>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-col gap-2.5 shrink-0 select-auto">
          <button
            onClick={() => {
              closeMenu();
              onOpenConsultation();
            }}
            className="w-full bg-gradient-to-r from-[#A07830] to-[#C9A84C] text-[#1A1A2E] font-bold text-sm py-3 rounded-xl shadow-lg cursor-pointer"
          >
            درخواست مشاوره رایگان
          </button>
          <div className="flex items-center justify-between text-xs text-white/70 px-1">
            <span dir="ltr">09389951723</span>
            <span>nabikalandar0@gmail.com</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/60 pt-1">
            <a href="tel:09389951723" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:text-[#C9A84C]">
              <Phone className="w-4 h-4" />
            </a>
            <a href="https://wa.me/989389951723" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:text-[#C9A84C]">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
