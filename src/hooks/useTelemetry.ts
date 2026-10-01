import { useState, useEffect, useCallback } from 'react';
import { TelemetryEvent, TelemetryEventType, TelemetrySummary, Property } from '../types';
import {
  trackTelemetryEvent,
  getTelemetrySummary,
  clearTelemetryEvents,
  seedDemoTelemetry,
} from '../utils/telemetry';

export function useTelemetry() {
  const [summary, setSummary] = useState<TelemetrySummary>(() => getTelemetrySummary());

  const refreshSummary = useCallback(() => {
    setSummary(getTelemetrySummary());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refreshSummary();
    };

    window.addEventListener('dream_home_telemetry_updated', handleUpdate);
    return () => {
      window.removeEventListener('dream_home_telemetry_updated', handleUpdate);
    };
  }, [refreshSummary]);

  const track = useCallback(
    (type: TelemetryEventType, details: Record<string, any> = {}): TelemetryEvent => {
      const evt = trackTelemetryEvent(type, details);
      return evt;
    },
    []
  );

  const clear = useCallback(() => {
    clearTelemetryEvents();
    refreshSummary();
  }, [refreshSummary]);

  const seed = useCallback(
    (properties: Property[]) => {
      seedDemoTelemetry(properties);
      refreshSummary();
    },
    [refreshSummary]
  );

  const trackPropertyView = useCallback(
    (propertyId: string, title: string, meta: Record<string, any> = {}) => {
      return track('property_view', { propertyId, title, ...meta });
    },
    [track]
  );

  const trackSearch = useCallback(
    (query: string, filters: Record<string, any> = {}) => {
      return track('search_query', { query, ...filters });
    },
    [track]
  );

  const trackCalculator = useCallback(
    (calculatorType: 'mortgage' | 'roi', details: Record<string, any> = {}) => {
      const type = calculatorType === 'mortgage' ? 'calculator_mortgage' : 'calculator_roi';
      return track(type, details);
    },
    [track]
  );

  const trackScheduleVisit = useCallback(
    (propertyId: string, propertyTitle: string) => {
      return track('schedule_visit_click', { propertyId, propertyTitle });
    },
    [track]
  );

  return {
    summary,
    track,
    trackPropertyView,
    trackSearch,
    trackCalculator,
    trackScheduleVisit,
    clear,
    seed,
    refreshSummary,
  };
}
