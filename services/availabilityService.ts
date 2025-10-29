import { PROPERTIES } from '../constants';
import { RawBooking } from '../types';
import { loadIcsBookings } from './icsService';

const JSON_FALLBACK_URL = '/data/availability.json';

const shouldUseIcs = () => {
  const flag = (import.meta?.env?.VITE_USE_ICS ?? 'true').toString().toLowerCase();
  return !(flag === 'false' || flag === '0' || flag === 'no');
};

const normalizeBase = (base: string | undefined): string => {
  if (!base) return '/availability';
  const trimmed = base.trim();
  if (!trimmed) return '/availability';
  if (trimmed === '/') return '/';
  return trimmed.replace(/\/+$/, '');
};

const joinUrl = (base: string, path: string) => {
  const sanitizedPath = path.replace(/^\/+/, '');
  if (!base || base === '/') return `/${sanitizedPath}`;
  return `${base}/${sanitizedPath}`;
};

const lotRefFromSlug = (slug: string) => slug.replace(/-/g, '-').toUpperCase();

const loadFromIcs = async (): Promise<RawBooking[] | null> => {
  if (!shouldUseIcs()) return null;

  const base = normalizeBase(import.meta?.env?.VITE_ICS_BASE_URL as string | undefined);
  const sources = PROPERTIES.map((property) => ({
    slug: property.slug,
    url: joinUrl(base, `${property.slug}.ics`),
    lotRef: lotRefFromSlug(property.slug),
  }));

  const { bookings, successfulCalendars } = await loadIcsBookings(sources);
  if (successfulCalendars > 0) {
    return bookings;
  }
  return null;
};

const loadFromJson = async (): Promise<RawBooking[]> => {
  const res = await fetch(JSON_FALLBACK_URL, { cache: 'no-store' });
  if (!res.ok) {
    let errorMsg = 'Failed to load availability';
    try {
      const errorBody = await res.json();
      errorMsg = errorBody.error || errorMsg;
    } catch (e) {
      // Could not parse error body, use default message.
    }
    throw new Error(errorMsg);
  }
  return (await res.json()) as RawBooking[];
};

export async function loadAvailability(): Promise<RawBooking[]> {
  try {
    const icsBookings = await loadFromIcs();
    if (icsBookings) {
      return icsBookings;
    }
  } catch (error) {
    console.error(error);
  }

  return await loadFromJson();
}
