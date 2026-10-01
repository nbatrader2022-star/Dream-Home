import { TelemetryEvent, TelemetryEventType, TelemetrySummary, Property } from '../types';

const TELEMETRY_STORAGE_KEY = 'dream_home_telemetry_events';
const MAX_STORED_EVENTS = 400;

export function getStoredTelemetryEvents(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to parse telemetry events:', err);
    return [];
  }
}

export function trackTelemetryEvent(
  type: TelemetryEventType,
  details: Record<string, any> = {}
): TelemetryEvent {
  const newEvent: TelemetryEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    timestamp: new Date().toISOString(),
    details,
  };

  try {
    const events = getStoredTelemetryEvents();
    events.unshift(newEvent);
    // Keep list bounded to prevent localStorage bloat
    if (events.length > MAX_STORED_EVENTS) {
      events.length = MAX_STORED_EVENTS;
    }
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(events));

    // Dispatch event so active admin panel can react live
    window.dispatchEvent(new CustomEvent('dream_home_telemetry_updated', { detail: newEvent }));
  } catch (err) {
    console.warn('Telemetry tracking error:', err);
  }

  return newEvent;
}

export function getTelemetrySummary(): TelemetrySummary {
  const events = getStoredTelemetryEvents();

  let propertyViewsCount = 0;
  let searchQueriesCount = 0;
  let calculatorUsageCount = 0;
  let visitBookingsIntentsCount = 0;

  const propViewsMap: Record<string, { id: string; title: string; views: number; price: number; location: string }> = {};
  const searchTermsMap: Record<string, number> = {};

  for (const evt of events) {
    switch (evt.type) {
      case 'property_view':
        propertyViewsCount++;
        if (evt.details?.propertyId) {
          const id = evt.details.propertyId;
          if (!propViewsMap[id]) {
            propViewsMap[id] = {
              id,
              title: evt.details.title || 'ملک نامشخص',
              views: 0,
              price: evt.details.price || 0,
              location: evt.details.location || '',
            };
          }
          propViewsMap[id].views++;
        }
        break;

      case 'search_query':
        searchQueriesCount++;
        if (evt.details?.query && typeof evt.details.query === 'string') {
          const clean = evt.details.query.trim();
          if (clean.length > 1) {
            searchTermsMap[clean] = (searchTermsMap[clean] || 0) + 1;
          }
        }
        break;

      case 'calculator_mortgage':
      case 'calculator_roi':
        calculatorUsageCount++;
        break;

      case 'schedule_visit_click':
        visitBookingsIntentsCount++;
        break;

      default:
        break;
    }
  }

  const topProperties = Object.values(propViewsMap)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const topSearchTerms = Object.entries(searchTermsMap)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalEvents: events.length,
    propertyViewsCount,
    searchQueriesCount,
    calculatorUsageCount,
    visitBookingsIntentsCount,
    topProperties,
    topSearchTerms,
    recentEvents: events.slice(0, 30),
  };
}

export function clearTelemetryEvents(): void {
  try {
    localStorage.removeItem(TELEMETRY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('dream_home_telemetry_updated'));
  } catch (err) {
    console.warn('Error clearing telemetry:', err);
  }
}

export function seedDemoTelemetry(properties: Property[]): void {
  const sampleEvents: TelemetryEvent[] = [];
  const now = Date.now();

  const searchWords = ['الهیه', 'نیاوران', 'پنت‌هاوس', 'ویلا استخردار', 'زعفرانیه', 'فرشته', 'نوساز ۳ خواب', 'سعادت‌آباد'];

  // Seed sample searches
  for (let i = 0; i < 24; i++) {
    const term = searchWords[i % searchWords.length];
    sampleEvents.push({
      id: `evt-demo-s-${i}`,
      type: 'search_query',
      timestamp: new Date(now - i * 1400000).toISOString(),
      details: { query: term, resultsCount: Math.floor(Math.random() * 8) + 1 },
    });
  }

  // Seed sample property views
  properties.slice(0, 6).forEach((prop, idx) => {
    const viewCount = Math.floor(Math.random() * 15) + 5;
    for (let j = 0; j < viewCount; j++) {
      sampleEvents.push({
        id: `evt-demo-p-${idx}-${j}`,
        type: 'property_view',
        timestamp: new Date(now - (idx * 10 + j) * 850000).toISOString(),
        details: {
          propertyId: prop.id,
          title: prop.title,
          price: prop.price,
          location: prop.location,
        },
      });
    }
  });

  // Seed calculators
  for (let k = 0; k < 12; k++) {
    sampleEvents.push({
      id: `evt-demo-c-${k}`,
      type: k % 2 === 0 ? 'calculator_mortgage' : 'calculator_roi',
      timestamp: new Date(now - k * 3600000).toISOString(),
      details: {
        loanAmount: 15000000000,
        monthlyInstallment: 245000000,
      },
    });
  }

  // Seed visit bookings clicks
  for (let v = 0; v < 6; v++) {
    sampleEvents.push({
      id: `evt-demo-v-${v}`,
      type: 'schedule_visit_click',
      timestamp: new Date(now - v * 7200000).toISOString(),
      details: { propertyTitle: properties[v % properties.length]?.title },
    });
  }

  sampleEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(sampleEvents));
  window.dispatchEvent(new CustomEvent('dream_home_telemetry_updated'));
}
