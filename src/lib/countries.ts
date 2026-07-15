export type PaymentRegion = 'uganda' | 'international';
export type PaymentProvider = 'flutterwave' | 'stripe';

export interface CountryOption {
  code: string;
  name: string;
  paymentRegion: PaymentRegion;
  currency: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'UG', name: 'Uganda', paymentRegion: 'uganda', currency: 'UGX' },
  { code: 'KE', name: 'Kenya', paymentRegion: 'international', currency: 'USD' },
  { code: 'TZ', name: 'Tanzania', paymentRegion: 'international', currency: 'USD' },
  { code: 'RW', name: 'Rwanda', paymentRegion: 'international', currency: 'USD' },
  { code: 'NG', name: 'Nigeria', paymentRegion: 'international', currency: 'USD' },
  { code: 'GH', name: 'Ghana', paymentRegion: 'international', currency: 'USD' },
  { code: 'ZA', name: 'South Africa', paymentRegion: 'international', currency: 'USD' },
  { code: 'US', name: 'United States', paymentRegion: 'international', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', paymentRegion: 'international', currency: 'USD' },
  { code: 'CA', name: 'Canada', paymentRegion: 'international', currency: 'USD' },
  { code: 'AU', name: 'Australia', paymentRegion: 'international', currency: 'USD' },
  { code: 'IN', name: 'India', paymentRegion: 'international', currency: 'USD' },
  { code: 'OTHER', name: 'Other country', paymentRegion: 'international', currency: 'USD' },
];

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  uganda: 'UG',
  kenya: 'KE',
  tanzania: 'TZ',
  rwanda: 'RW',
  nigeria: 'NG',
  ghana: 'GH',
  'south africa': 'ZA',
  'united states': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  canada: 'CA',
  australia: 'AU',
  india: 'IN',
};

export function normalizeCountryCode(input?: string | null): string {
  if (!input?.trim()) return 'UG';
  const trimmed = input.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  const fromName = COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()];
  if (fromName) return fromName;
  const match = SUPPORTED_COUNTRIES.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  return match?.code ?? 'OTHER';
}

export function getCountryByCode(code: string): CountryOption {
  const normalized = normalizeCountryCode(code);
  return (
    SUPPORTED_COUNTRIES.find((c) => c.code === normalized) ??
    SUPPORTED_COUNTRIES.find((c) => c.code === 'OTHER')!
  );
}

export function getPaymentRegion(countryCode: string): PaymentRegion {
  return getCountryByCode(countryCode).paymentRegion;
}

export interface LocationPreset {
  label: string;
  address: string;
  district: string;
  country: string;
  coordinates: { latitude: number; longitude: number };
}

/** Quick-location shortcuts shown per country on signup/settings */
export const COUNTRY_LOCATION_PRESETS: Record<string, LocationPreset[]> = {
  UG: [
    { label: 'Kampala', address: 'Kampala', district: 'Kampala', country: 'Uganda', coordinates: { latitude: 0.3476, longitude: 32.5825 } },
    { label: 'Entebbe', address: 'Entebbe', district: 'Wakiso', country: 'Uganda', coordinates: { latitude: 0.0644, longitude: 32.4465 } },
    { label: 'Jinja', address: 'Jinja', district: 'Jinja', country: 'Uganda', coordinates: { latitude: 0.4244, longitude: 33.2042 } },
  ],
  KE: [
    { label: 'Nairobi', address: 'Nairobi', district: 'Nairobi', country: 'Kenya', coordinates: { latitude: -1.2921, longitude: 36.8219 } },
    { label: 'Mombasa', address: 'Mombasa', district: 'Mombasa', country: 'Kenya', coordinates: { latitude: -4.0435, longitude: 39.6682 } },
    { label: 'Kisumu', address: 'Kisumu', district: 'Kisumu', country: 'Kenya', coordinates: { latitude: -0.0917, longitude: 34.768 } },
  ],
  TZ: [
    { label: 'Dar es Salaam', address: 'Dar es Salaam', district: 'Dar es Salaam', country: 'Tanzania', coordinates: { latitude: -6.7924, longitude: 39.2083 } },
    { label: 'Arusha', address: 'Arusha', district: 'Arusha', country: 'Tanzania', coordinates: { latitude: -3.3869, longitude: 36.683 } },
  ],
  RW: [
    { label: 'Kigali', address: 'Kigali', district: 'Kigali', country: 'Rwanda', coordinates: { latitude: -1.9441, longitude: 30.0619 } },
  ],
  NG: [
    { label: 'Lagos', address: 'Lagos', district: 'Lagos', country: 'Nigeria', coordinates: { latitude: 6.5244, longitude: 3.3792 } },
    { label: 'Abuja', address: 'Abuja', district: 'FCT', country: 'Nigeria', coordinates: { latitude: 9.0765, longitude: 7.3986 } },
  ],
  GH: [
    { label: 'Accra', address: 'Accra', district: 'Greater Accra', country: 'Ghana', coordinates: { latitude: 5.6037, longitude: -0.187 } },
  ],
  ZA: [
    { label: 'Johannesburg', address: 'Johannesburg', district: 'Gauteng', country: 'South Africa', coordinates: { latitude: -26.2041, longitude: 28.0473 } },
    { label: 'Cape Town', address: 'Cape Town', district: 'Western Cape', country: 'South Africa', coordinates: { latitude: -33.9249, longitude: 18.4241 } },
  ],
  US: [
    { label: 'New York', address: 'New York', district: 'New York', country: 'United States', coordinates: { latitude: 40.7128, longitude: -74.006 } },
  ],
  GB: [
    { label: 'London', address: 'London', district: 'Greater London', country: 'United Kingdom', coordinates: { latitude: 51.5074, longitude: -0.1278 } },
  ],
};

export function getLocationPresets(countryCode: string): LocationPreset[] {
  const code = normalizeCountryCode(countryCode);
  return COUNTRY_LOCATION_PRESETS[code] ?? [];
}

export function getLocationPlaceholders(countryCode: string) {
  const country = getCountryByCode(countryCode);
  switch (country.code) {
    case 'UG':
      return { address: 'e.g., Ntinda, Kampala', district: 'e.g., Kampala' };
    case 'KE':
      return { address: 'e.g., Westlands, Nairobi', district: 'e.g., Nairobi County' };
    case 'NG':
      return { address: 'e.g., Ikeja, Lagos', district: 'e.g., Lagos State' };
    default:
      return { address: `e.g., City or area in ${country.name}`, district: 'e.g., Region or state' };
  }
}
