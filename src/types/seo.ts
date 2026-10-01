export interface PageSEOConfig {
  key: string;
  nameFa: string;
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  robots: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
  canonicalUrl?: string;
}

export interface SiteSEOConfig {
  defaultTitleSuffix: string;
  siteName: string;
  defaultOgImage: string;
  googleSiteVerification?: string;
  pages: {
    home: PageSEOConfig;
    properties: PageSEOConfig;
    propertyDetailTemplate: PageSEOConfig;
    support: PageSEOConfig;
    consultants: PageSEOConfig;
    services: PageSEOConfig;
    howItWorks: PageSEOConfig;
    privacy: PageSEOConfig;
    terms: PageSEOConfig;
    admin: PageSEOConfig;
  };
  lastUpdated?: string;
  updatedBy?: string;
}

export const DEFAULT_SEO_CONFIG: SiteSEOConfig = {
  defaultTitleSuffix: 'خانه آرمانی | Dream Home Real Estate',
  siteName: 'خانه آرمانی',
  defaultOgImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  googleSiteVerification: '',
  pages: {
    home: {
      key: 'home',
      nameFa: 'صفحه اصلی (لندینگ پیج)',
      title: 'خانه آرمانی | خرید، فروش و رهن املاک لوکس در پایتخت و ۲۱ کلان‌شهر',
      description: 'پلتفرم تخصصی و لوکس املاک خانه آرمانی — خرید، فروش، رهن و اجاره ویلاها و پنت‌هاوس‌های لوکس در ۲۱ کلان‌شهر و پایتخت ایران با تور مجازی ۳۶۰ درجه و ارزیابی هوشمند.',
      keywords: 'املاک لوکس, خرید پنت‌هاوس, ویلا شمال, خرید خانه تهران, الهیه, زعفرانیه, نیاوران, فرشته, خانه آرمانی, ارزیابی قیمت ملک',
      ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'index, follow',
      canonicalUrl: 'https://dreamhome.ir/',
    },
    properties: {
      key: 'properties',
      nameFa: 'ویترین و جستجوی املاک',
      title: 'فهرست املاک لوکس و پنت‌هاوس‌ها | خانه آرمانی',
      description: 'مشاهده و فیلتر پیشرفته فایل‌های اختصاصی، ویلاهای مدرن، پنت‌هاوس‌ها و آپارتمان‌های لوکس با مشخصات کامل و تصاویر باکیفیت.',
      keywords: 'لیست املاک, خرید آپارتمان لوکس, رهن و اجاره پنت‌هاوس, ویلاهای لوکس, فیلتر هوشمند املاک',
      ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'index, follow',
      canonicalUrl: 'https://dreamhome.ir/properties',
    },
    propertyDetailTemplate: {
      key: 'propertyDetailTemplate',
      nameFa: 'الگوی صفحه جزئیات ملک (Dynamic)',
      title: '{title} در {location} | خانه آرمانی',
      description: 'ملک لوکس {title} در محله {location} ({city}). متراژ {area} متر، {bedrooms} خوابه با قیمت {price}. امکانات کامل و هماهنگی بازدید حضوری اختصاصی.',
      keywords: '{title}, ملک در {location}, املاک {city}, خرید خانه {location}',
      ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ogType: 'article',
      robots: 'index, follow',
    },
    support: {
      key: 'support',
      nameFa: 'مرکز پشتیبانی و ارتباط با مشتریان',
      title: 'مرکز پشتیبانی ۲۴/۷ و مشاوره تخصصی | خانه آرمانی',
      description: 'پشتیبانی شبانه‌روزی خریداران و سرمایه‌گذاران، پاسخگویی به سوالات متداول، ثبت درخواست مشاوره حقوقی ملکی و رزرو بازدید در ۲۱ کلان‌شهر.',
      keywords: 'پشتیبانی خانه آرمانی, تماس با مشاور املاک, مشاوره ملکی ۲۴ ساعته, پشتیبانی خرید ملک',
      ogImage: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'index, follow',
      canonicalUrl: 'https://dreamhome.ir/support',
    },
    consultants: {
      key: 'consultants',
      nameFa: 'مشاوران و کارشناسان نخبه',
      title: 'تیم کارشناسان و مشاوران برتر سرمایه‌گذاری ملکی | خانه آرمانی',
      description: 'معرفی مشاوران ارشد، وکلای حقوقی و متخصصان مقیم محله‌های شمیرانات و کلان‌شهرهای ایران با سال‌ها تجربه موفق در معاملات کلان.',
      keywords: 'مشاور املاک لوکس, کارشناس سرمایه‌گذاری ملکی, وکیل معاملات ملکی, مشاوران خانه آرمانی',
      ogImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'index, follow',
      canonicalUrl: 'https://dreamhome.ir/consultants',
    },
    services: {
      key: 'services',
      nameFa: 'خدمات تخصصی ملکی و حقوقی',
      title: 'خدمات ویژه، ارزیابی هوشمند و نظارت حقوقی | خانه آرمانی',
      description: 'خدمات ارزیابی قیمت کارشناسی با هوش مصنوعی، استعلامات ثبتی و شهرداری، تصویربرداری هوایی، تور سه‌بعدی و عقد قراردادهای رسمی.',
      keywords: 'ارزیابی هوشمند ملک, کارشناسی قیمت خانه, استعلام سند رسمی, تور مجازی املاک',
      ogImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'index, follow',
      canonicalUrl: 'https://dreamhome.ir/services',
    },
    howItWorks: {
      key: 'howItWorks',
      nameFa: 'راهنمای فرآیند و سفر مشتری',
      title: 'مسیر ۸ مرحله‌ای خرید و سرمایه‌گذاری هوشمند | خانه آرمانی',
      description: 'آشنایی با مراحل گام‌به‌گام از جستجو و فیلتر هوشمند تا کارشناسی حقوقی، استعلام سند، بازدید و انتقال رسمی سند در خانه آرمانی.',
      keywords: 'راهنمای خرید خانه, مراحل خرید ملک, نحوه سرمایه‌گذاری ملکی, قوانین انتقال سند',
      ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'index, follow',
      canonicalUrl: 'https://dreamhome.ir/how-it-works',
    },
    privacy: {
      key: 'privacy',
      nameFa: 'حریم خصوصی کاربران',
      title: 'سیاست حفظ حریم خصوصی و امنیت اطلاعات | خانه آرمانی',
      description: 'تعهد کامل خانه آرمانی به حفاظت از اطلاعات هویتی، اسناد ملکی و محرمانگی ارتباطات کاربران با بالاترین استانداردهای امنیتی.',
      keywords: 'حریم خصوصی, امنیت داده‌های ملکی, محرمانگی اطلاعات مشتریان',
      ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'noindex, follow',
      canonicalUrl: 'https://dreamhome.ir/privacy',
    },
    terms: {
      key: 'terms',
      nameFa: 'قوانین و مقررات رسمی',
      title: 'شرایط و ضوابط استفاده از خدمات | خانه آرمانی',
      description: 'قوانین و ضوابط قانونی استفاده از سامانه خانه آرمانی، استانداردهای صنفی مشاوران، کارمزد مصوب و چارچوب حقوقی معاملات.',
      keywords: 'قوانین معاملات ملکی, ضوابط صنف مشاوران املاک, شرایط استفاده خانه آرمانی',
      ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'noindex, follow',
      canonicalUrl: 'https://dreamhome.ir/terms',
    },
    admin: {
      key: 'admin',
      nameFa: 'پنل مدیریت و CMS (ادمین)',
      title: 'سامانه مدیریت یکپارچه | خانه آرمانی',
      description: 'پنل اختصاصی مدیریت محتوا، کنترل املاک، آمار و دسترسی مدیران ارشد خانه آرمانی.',
      keywords: 'پنل مدیریت, CMS املاک',
      ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ogType: 'website',
      robots: 'noindex, nofollow',
      canonicalUrl: 'https://dreamhome.ir/admin',
    },
  },
};
