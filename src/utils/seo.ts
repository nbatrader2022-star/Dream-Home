import { Property } from '../types';
import { formatPrice } from './formatters';
import { SiteSEOConfig, PageSEOConfig, DEFAULT_SEO_CONFIG } from '../types/seo';

const SEO_STORAGE_KEY = 'dream_home_seo_settings_v1';

export function getStoredSEOConfig(): SiteSEOConfig {
  try {
    const saved = localStorage.getItem(SEO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SEO_CONFIG,
        ...parsed,
        pages: {
          ...DEFAULT_SEO_CONFIG.pages,
          ...(parsed.pages || {}),
        },
      };
    }
  } catch (e) {
    console.warn('Failed to parse stored SEO config:', e);
  }
  return DEFAULT_SEO_CONFIG;
}

export function storeSEOConfigLocally(config: SiteSEOConfig) {
  try {
    localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save SEO config to localStorage:', e);
  }
}

export async function fetchServerSEOConfig(): Promise<SiteSEOConfig> {
  try {
    const res = await fetch('/api/admin/seo');
    if (res.ok) {
      const data = await res.json();
      if (data && data.config) {
        storeSEOConfigLocally(data.config);
        return data.config;
      }
    }
  } catch (e) {
    console.warn('Could not fetch SEO config from server, using local fallback:', e);
  }
  return getStoredSEOConfig();
}

export async function saveSEOConfigToServer(config: SiteSEOConfig): Promise<{
  success: boolean;
  updatedIndexHtml?: boolean;
  message?: string;
  error?: string;
}> {
  // 1. Immediately save to localStorage and apply to current DOM
  storeSEOConfigLocally(config);

  // 2. Send to backend to directly write to index.html and metadata.json
  try {
    const res = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        updatedIndexHtml: false,
        error: errData.error || `خطا در ارتباط با سرور (${res.status})`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      updatedIndexHtml: data.updatedIndexHtml ?? true,
      message: data.message || 'تنظیمات سئو ذخیره و فایل index.html با موفقیت به‌روزرسانی شد.',
    };
  } catch (err: any) {
    console.error('Failed to save SEO to server:', err);
    return {
      success: false,
      updatedIndexHtml: false,
      error: err.message || 'خطا در ارسال تنظیمات به سرور.',
    };
  }
}

function setMetaAttribute(selector: string, attribute: string, value: string) {
  let el = document.querySelector(selector);
  if (!el) {
    const isProperty = selector.includes('property="');
    const isName = selector.includes('name="');
    const tagMatch = selector.match(/\[(property|name)="([^"]+)"\]/);
    if (tagMatch) {
      el = document.createElement('meta');
      el.setAttribute(tagMatch[1], tagMatch[2]);
      document.head.appendChild(el);
    }
  }
  if (el) {
    el.setAttribute(attribute, value);
  }
}

function setCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * Dynamically applies SEO meta tags according to the active page and configuration.
 */
export function applyPageSEO(
  pageKey: string,
  dynamicContext?: { property?: Property | null; title?: string }
) {
  const seoConfig = getStoredSEOConfig();
  const pages = seoConfig.pages;

  // Handle property detail page with dynamic interpolation
  if (pageKey === 'property' && dynamicContext?.property) {
    const prop = dynamicContext.property;
    const template = pages.propertyDetailTemplate || DEFAULT_SEO_CONFIG.pages.propertyDetailTemplate;

    const formattedPrice = formatPrice(prop.price);
    const interpolate = (str: string) => {
      return (str || '')
        .replace(/\{title\}/g, prop.title || '')
        .replace(/\{location\}/g, prop.location || '')
        .replace(/\{city\}/g, prop.cityNameFa || prop.city || 'تهران')
        .replace(/\{price\}/g, formattedPrice)
        .replace(/\{area\}/g, prop.area ? `${prop.area}` : '')
        .replace(/\{bedrooms\}/g, prop.bedrooms ? `${prop.bedrooms}` : '');
    };

    const finalTitle = interpolate(template.title);
    const finalDesc = interpolate(template.description);
    const finalKeywords = interpolate(template.keywords);
    const finalImage = (prop.images && prop.images.length > 0) ? prop.images[0] : (template.ogImage || seoConfig.defaultOgImage);
    const canonical = `${window.location.origin}/property/${encodeURIComponent(prop.slug || prop.id)}`;

    document.title = finalTitle;
    setMetaAttribute('meta[name="description"]', 'content', finalDesc);
    setMetaAttribute('meta[property="og:title"]', 'content', finalTitle);
    setMetaAttribute('meta[property="og:description"]', 'content', finalDesc);
    setMetaAttribute('meta[property="og:image"]', 'content', finalImage);
    setMetaAttribute('meta[property="og:url"]', 'content', canonical);
    setMetaAttribute('meta[property="og:type"]', 'content', template.ogType || 'article');
    setMetaAttribute('meta[name="twitter:title"]', 'content', finalTitle);
    setMetaAttribute('meta[name="twitter:description"]', 'content', finalDesc);
    setMetaAttribute('meta[name="twitter:image"]', 'content', finalImage);
    setMetaAttribute('meta[name="keywords"]', 'content', finalKeywords);
    setMetaAttribute('meta[name="robots"]', 'content', template.robots || 'index, follow');
    setCanonicalUrl(canonical);

    // Schema.org RealEstateListing JSON-LD
    injectPropertySchema(prop, finalDesc, finalImage, canonical);
    return;
  }

  // Map other page keys
  let pageConfig: PageSEOConfig = pages.home;
  switch (pageKey) {
    case 'properties':
      pageConfig = pages.properties || DEFAULT_SEO_CONFIG.pages.properties;
      break;
    case 'support':
      pageConfig = pages.support || DEFAULT_SEO_CONFIG.pages.support;
      break;
    case 'consultants':
      pageConfig = pages.consultants || DEFAULT_SEO_CONFIG.pages.consultants;
      break;
    case 'services':
      pageConfig = pages.services || DEFAULT_SEO_CONFIG.pages.services;
      break;
    case 'how-it-works':
      pageConfig = pages.howItWorks || DEFAULT_SEO_CONFIG.pages.howItWorks;
      break;
    case 'privacy':
      pageConfig = pages.privacy || DEFAULT_SEO_CONFIG.pages.privacy;
      break;
    case 'terms':
      pageConfig = pages.terms || DEFAULT_SEO_CONFIG.pages.terms;
      break;
    case 'admin':
      pageConfig = pages.admin || DEFAULT_SEO_CONFIG.pages.admin;
      break;
    case 'home':
    default:
      pageConfig = pages.home || DEFAULT_SEO_CONFIG.pages.home;
      break;
  }

  const title = pageConfig.title || DEFAULT_SEO_CONFIG.pages.home.title;
  const description = pageConfig.description || DEFAULT_SEO_CONFIG.pages.home.description;
  const image = pageConfig.ogImage || seoConfig.defaultOgImage;
  const canonical = pageConfig.canonicalUrl || `${window.location.origin}/${pageKey === 'home' ? '' : pageKey}`;

  document.title = title;
  setMetaAttribute('meta[name="description"]', 'content', description);
  setMetaAttribute('meta[property="og:title"]', 'content', title);
  setMetaAttribute('meta[property="og:description"]', 'content', description);
  setMetaAttribute('meta[property="og:image"]', 'content', image);
  setMetaAttribute('meta[property="og:url"]', 'content', canonical);
  setMetaAttribute('meta[property="og:type"]', 'content', pageConfig.ogType || 'website');
  setMetaAttribute('meta[name="twitter:title"]', 'content', title);
  setMetaAttribute('meta[name="twitter:description"]', 'content', description);
  setMetaAttribute('meta[name="twitter:image"]', 'content', image);
  setMetaAttribute('meta[name="keywords"]', 'content', pageConfig.keywords || '');
  setMetaAttribute('meta[name="robots"]', 'content', pageConfig.robots || 'index, follow');
  setCanonicalUrl(canonical);

  // Clean up property schema when not on property page
  const existingScript = document.getElementById('property-jsonld-schema');
  if (existingScript) {
    existingScript.remove();
  }
}

function injectPropertySchema(property: Property, description: string, image: string, canonicalUrl: string) {
  const jsonLdId = 'property-jsonld-schema';
  let existingScript = document.getElementById(jsonLdId);

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || description,
    image: property.images && property.images.length > 0 ? property.images : [image],
    url: canonicalUrl,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'IRR',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.cityNameFa || 'تهران',
      streetAddress: property.location,
      addressCountry: 'IR',
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK',
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
  };

  if (!existingScript) {
    existingScript = document.createElement('script');
    existingScript.id = jsonLdId;
    existingScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(existingScript);
  }
  existingScript.textContent = JSON.stringify(schemaData);
}

// Backward compatibility alias
export function updatePropertySEO(property: Property | null) {
  if (property) {
    applyPageSEO('property', { property });
  } else {
    applyPageSEO('home');
  }
}
