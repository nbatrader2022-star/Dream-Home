import { Property, SavedSearch } from '../types';
import { formatPrice, toPersianDigits } from './formatters';

const SAVED_SEARCHES_KEY = 'dream_home_saved_searches';
const PRICE_SNAPSHOT_KEY = 'dream_home_saved_prices_snapshot';
const NOTIFIED_PROPS_KEY = 'dream_home_notified_props';

export function getStoredSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(SAVED_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'search-default-1',
        title: 'آپارتمان‌های لوکس نیاوران و الهیه',
        neighborhood: 'نیاوران',
        propertyType: 'apartment',
        maxPrice: 30000000000,
        createdAt: '1403/11/15',
        alertsEnabled: true,
      },
    ];
  } catch {
    return [];
  }
}

export function saveStoredSavedSearches(searches: SavedSearch[]) {
  try {
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  } catch (err) {
    console.warn('Error saving searches:', err);
  }
}

export function addSavedSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'alertsEnabled'>): SavedSearch {
  const current = getStoredSavedSearches();
  const newSearch: SavedSearch = {
    ...search,
    id: `search-${Date.now()}`,
    createdAt: new Date().toLocaleDateString('fa-IR'),
    alertsEnabled: true,
  };
  current.unshift(newSearch);
  saveStoredSavedSearches(current);
  return newSearch;
}

export function removeSavedSearch(id: string): SavedSearch[] {
  const current = getStoredSavedSearches().filter((s) => s.id !== id);
  saveStoredSavedSearches(current);
  return current;
}

export function toggleSearchAlert(id: string): SavedSearch[] {
  const current = getStoredSavedSearches().map((s) =>
    s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s
  );
  saveStoredSavedSearches(current);
  return current;
}

// 1. Price Change Checker for Saved Properties
export function checkSavedPropertiesPriceChanges(
  savedPropertyIds: string[],
  properties: Property[],
  onNotify: (title: string, message: string, property: Property) => void
) {
  if (!savedPropertyIds || savedPropertyIds.length === 0 || !properties || properties.length === 0) {
    return;
  }

  let snapshot: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(PRICE_SNAPSHOT_KEY);
    if (raw) snapshot = JSON.parse(raw);
  } catch {}

  let hasUpdates = false;

  savedPropertyIds.forEach((id) => {
    const prop = properties.find((p) => p.id === id);
    if (!prop) return;

    const oldPrice = snapshot[id];
    const currentPrice = prop.price;

    if (oldPrice !== undefined && oldPrice !== currentPrice) {
      const diff = currentPrice - oldPrice;
      const isDecrease = diff < 0;
      const diffFormatted = formatPrice(Math.abs(diff));

      const title = isDecrease
        ? '🔔 کاهش قیمت در ملک نشان‌شده شما'
        : '📈 تغییر قیمت در ملک نشان‌شده';

      const message = `قیمت «${prop.title}» در ${prop.location} با ${diffFormatted} ${
        isDecrease ? 'کاهش' : 'افزایش'
      } به ${formatPrice(currentPrice)} رسید.`;

      onNotify(title, message, prop);
    }

    // Update snapshot
    if (snapshot[id] !== currentPrice) {
      snapshot[id] = currentPrice;
      hasUpdates = true;
    }
  });

  if (hasUpdates) {
    try {
      localStorage.setItem(PRICE_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {}
  }
}

// 2. New Matching Properties Checker for Saved Searches
export function checkNewPropertiesForSavedSearches(
  savedSearches: SavedSearch[],
  properties: Property[],
  onNotify: (title: string, message: string, property: Property) => void
) {
  if (!savedSearches || savedSearches.length === 0 || !properties || properties.length === 0) {
    return;
  }

  let notifiedIds: string[] = [];
  try {
    const raw = localStorage.getItem(NOTIFIED_PROPS_KEY);
    if (raw) notifiedIds = JSON.parse(raw);
  } catch {}

  const newlyNotified: string[] = [];

  savedSearches
    .filter((s) => s.alertsEnabled)
    .forEach((search) => {
      properties.forEach((prop) => {
        // Skip already notified properties
        if (notifiedIds.includes(prop.id) || newlyNotified.includes(prop.id)) {
          return;
        }

        // Match criteria
        const matchesCity = !search.city || search.city === 'all' || prop.city === search.city;
        const matchesType = !search.propertyType || search.propertyType === 'all' || prop.propertyType === search.propertyType;
        const matchesNeighborhood =
          !search.neighborhood ||
          prop.neighborhood?.includes(search.neighborhood) ||
          prop.location?.includes(search.neighborhood);
        const matchesMaxPrice = !search.maxPrice || prop.price <= search.maxPrice;
        const matchesBedrooms = !search.minBedrooms || prop.bedrooms >= search.minBedrooms;

        if (matchesCity && matchesType && matchesNeighborhood && matchesMaxPrice && matchesBedrooms) {
          newlyNotified.push(prop.id);
          const title = '✨ ملک جدید منطبق با جستجوی شما';
          const message = `ملک جدید «${prop.title}» در ${prop.location} با قیمت ${formatPrice(
            prop.price
          )} مطابق معیارهای «${search.title}» ثبت شد.`;

          onNotify(title, message, prop);
        }
      });
    });

  if (newlyNotified.length > 0) {
    try {
      localStorage.setItem(NOTIFIED_PROPS_KEY, JSON.stringify([...notifiedIds, ...newlyNotified]));
    } catch {}
  }
}
