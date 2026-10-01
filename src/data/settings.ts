import { SiteSettings } from '../types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'خانه آرمانی',
  siteSubtitle: 'DREAM HOME REAL ESTATE',
  heroHeadline: 'املاک لوکس و بی‌همتا در قلب پایتخت',
  heroSubheadline: 'مشاوره تخصصی، ارزیابی دقیق هوشمند و امن‌ترین پلتفرم سرمایه‌گذاری ملکی',
  contactPhone: '09389951723',
  contactEmail: 'nabikalandar0@gmail.com',
  contactAddress: 'تهران، الهیه، خیابان فرشته، پلاک ۱۸',
  statsProperties: '۱۵۰+',
  statsSatisfaction: '۹۸٪',
  statsDeals: '۱,۲۰۰+',
  statsExperience: '۱۵ سال',
};

export const ADMIN_EMAIL = 'nabikalandar0@gmail.com';

export function getStoredSiteSettings(): SiteSettings {
  try {
    const saved = localStorage.getItem('dream_home_site_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.contactEmail === 'luxury.investor@gmail.com') {
        parsed.contactEmail = 'nabikalandar0@gmail.com';
      }
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to parse stored site settings:', err);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveStoredSiteSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem('dream_home_site_settings', JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save site settings:', err);
  }
}
