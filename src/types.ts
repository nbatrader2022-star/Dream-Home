export type TransactionType = 'buy' | 'rent' | 'presale' | 'mortgage';

export type PropertyType = 'apartment' | 'villa' | 'commercial' | 'land' | 'penthouse' | 'garden';

export type PropertyStatus = 'sale' | 'rent' | 'presale' | 'sold';

export interface PropertyAgent {
  id: string;
  name: string;
  role: string;
  titleEn?: string;
  phone: string;
  whatsapp: string;
  photo: string;
  rating: number;
  dealsCount: number;
  soldCount?: number;
  activeListingsCount?: number;
  experienceYears: number;
  specialty?: string;
  areasServed?: string[];
  responseRatePercent?: number;
  languages?: string[];
  email?: string;
  bio?: string;
  licenseNumber?: string;
}

export type SupportedCityKey =
  | 'tehran'
  | 'karaj'
  | 'isfahan'
  | 'shiraz'
  | 'mashhad'
  | 'sanandaj'
  | 'zahedan'
  | 'hamedan'
  | 'rasht'
  | 'gorgan'
  | 'sari'
  | 'babol'
  | 'amol'
  | 'qorveh'
  | 'arak'
  | 'kermanshah'
  | 'tabriz'
  | 'ardabil'
  | 'birjand'
  | 'kerman'
  | 'yasuj'
  | string;

export interface Property {
  id: string;
  title: string;
  slug: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  price: number; // in Tomans
  rentPrice?: number; // per month in Tomans
  depositPrice?: number; // mortgage deposit in Tomans
  location: string;
  neighborhood: string;
  city: SupportedCityKey;
  cityNameFa: string;
  area: number; // in sq meters
  bedrooms: number;
  bathrooms: number;
  parking: number;
  floor: number;
  totalFloors: number;
  buildingAge: number; // 0 = new / نوساز
  images: string[];
  description: string;
  amenities: string[];
  agent: PropertyAgent;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: PropertyStatus;
  featured: boolean;
  virtualTourAvailable: boolean;
  createdAt: string;
  completionYear?: string;
  viewsCount: number;
  renovations?: RenovationProject[];
}

export interface RenovationProject {
  id: string;
  roomName: string;
  beforeImage: string;
  afterImage: string;
  beforeTitle: string;
  afterTitle: string;
  description: string;
  durationWeeks?: number;
  costTomans?: number;
  valueAddedPercent?: number;
  materials?: string[];
}

export interface NeighborhoodInsights {
  neighborhood: string;
  city: string;
  isLiveGoogleSearch: boolean;
  insightsText?: string;
  weather: {
    temp: string;
    condition: string;
    aqi: string;
    trend: string;
  };
  amenities: Array<{
    category: string;
    items: string[];
  }>;
  sources: Array<{
    title: string;
    uri: string;
  }>;
}

export interface RoiInputs {
  purchasePrice: number;
  renovationCost: number;
  monthlyRent: number;
  depositAmount: number;
  annualOperatingCostPercent: number; // e.g. 5%
  appreciationRatePercent: number; // e.g. 28%
  holdingYears: number; // 1, 3, 5, 10
}

export interface RoiResults {
  totalInitialInvestment: number;
  grossAnnualRentalIncome: number;
  netAnnualOperatingIncome: number;
  netRentalYieldPercent: number;
  futurePropertyValue: number;
  capitalGain: number;
  totalProfit: number;
  annualizedRoiPercent: number;
  paybackPeriodYears: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  cityKey: SupportedCityKey;
  image: string;
  propertyCount: number;
  avgPricePerMeter: string;
  priceRange: string;
  description: string;
  tags: string[];
  lat: number;
  lng: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  titleEn?: string;
  experienceYears: number;
  dealsCount: number;
  soldCount?: number;
  activeListingsCount?: number;
  responseRatePercent?: number;
  rating: number;
  specialty: string;
  areasServed: string[];
  languages?: string[];
  phone: string;
  whatsapp: string;
  email?: string;
  photo: string;
  bio: string;
  licenseNumber?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  property: string;
  quote: string;
  stars: number;
  photo: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'market' | 'guide' | 'invest' | 'legal' | 'tax';
  categoryFa: string;
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface PropertyFilters {
  searchQuery: string;
  transactionType: TransactionType | 'all';
  propertyType: PropertyType | 'all';
  city: string;
  neighborhood: string;
  priceRange: string; // '', '1', '2', '3', '4'
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number | 'all';
  bathrooms?: number | 'all';
  hasParking?: boolean;
  hasElevator?: boolean;
  hasStorage?: boolean;
  buildingAgeMax?: number | 'all'; // e.g. 0 (نوساز), 5, 10
  floorCategory?: 'all' | 'ground' | 'middle' | 'top' | 'penthouse';
  isFurnished?: boolean;
  hasPool?: boolean;
  hasTerrace?: boolean;
  isSmartHome?: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'area-desc';
}

export interface VisitBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  date: string;
  timeSlot: string;
  visitType: 'in-person' | 'virtual-3d';
  name: string;
  phone: string;
  notes?: string;
  trackingCode: string;
  createdAt: string;
}

export type BookingRequest = VisitBooking;

export interface ValuationResult {
  estimatedMin: number;
  estimatedFair: number;
  estimatedMax: number;
  pricePerMeter: number;
  demandScore: number; // 1-10
  growthPrediction: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  savedProperties: string[];
  role?: 'client' | 'vip' | 'investor' | 'superadmin' | 'admin';
  createdAt: string;
}

export interface AdminUserRecord {
  id: string;
  userId?: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'editor';
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedProperties?: Property[];
  quickActions?: Array<{
    label: string;
    action: string;
    payload?: any;
  }>;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  heroHeadline: string;
  heroSubheadline: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  statsProperties: string;
  statsSatisfaction: string;
  statsDeals: string;
  statsExperience: string;
}

export interface SavedSearch {
  id: string;
  title: string;
  city?: string;
  neighborhood?: string;
  propertyType?: PropertyType | 'all';
  transactionType?: TransactionType | 'all';
  maxPrice?: number;
  minPrice?: number;
  minBedrooms?: number;
  createdAt: string;
  alertsEnabled: boolean;
  lastNotifiedPropertyId?: string;
}

export type TelemetryEventType =
  | 'property_view'
  | 'search_query'
  | 'filter_change'
  | 'calculator_mortgage'
  | 'calculator_roi'
  | 'virtual_tour_open'
  | 'schedule_visit_click'
  | 'property_save_toggle'
  | 'property_compare_toggle'
  | 'agent_contact_click';

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  timestamp: string; // ISO string
  details: Record<string, any>;
  path?: string;
}

export interface TelemetrySummary {
  totalEvents: number;
  propertyViewsCount: number;
  searchQueriesCount: number;
  calculatorUsageCount: number;
  visitBookingsIntentsCount: number;
  topProperties: Array<{ id: string; title: string; views: number; price: number; location: string }>;
  topSearchTerms: Array<{ term: string; count: number }>;
  recentEvents: TelemetryEvent[];
}

