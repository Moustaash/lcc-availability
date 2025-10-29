import { useState, useEffect } from 'react';
import { Booking, RawBooking, BookingStatus, SyncStatus } from '../types';
import { loadAvailability } from '../services/availabilityService';

// Slug robuste (ETOILE / Savoie-53 → etoile / savoie-53)
const toSlug = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu,'').replace(/\s+/g,'-').trim();

const isUnavailable = (rb: RawBooking) => {
  const m = (rb.Mode || '').toLowerCase();
  if (m === 'reservation' || m === 'option') return true; // priorité au Mode
  return rb.is_available === false;                        // fallback
};

const statusOf = (rb: RawBooking): BookingStatus => {
  const m = (rb.Mode || '').toLowerCase();
  if (m === 'reservation') return BookingStatus.Confirmed;
  if (m === 'option')      return BookingStatus.Option;
  return BookingStatus.Confirmed; // fallback sémantique
};

const processBookings = (data: RawBooking[]): Map<string, Booking[]> => {
  const bookingMap = new Map<string, Booking[]>();

  // garde seulement les lignes valides, tri par start_date
  const items = data
    .filter(isUnavailable)
    .filter(rb => rb.lot_ref && rb.start_date && rb.end_date)
    .sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  for (const rb of items) {
    const slug = toSlug(String(rb.lot_ref));
    const start = new Date(rb.start_date);
    const end   = new Date(rb.end_date);
    if (!(start < end)) continue; // protection date inversée/égale

    const booking: Booking = {
      id: `${slug}-${rb.lot_no ?? ''}-${start.toISOString()}`,
      propertySlug: slug,
      startDate: start,
      endDate: end,
      status: statusOf(rb),
      price: parseFloat(String(rb.price_total_eur ?? '0')),
      isAvailable: !!rb.is_available,
    };

    if (!bookingMap.has(slug)) bookingMap.set(slug, []);
    bookingMap.get(slug)!.push(booking);
  }
  return bookingMap;
};


export const useCalendarData = () => {
  const [bookingsBySlug, setBookingsBySlug] = useState<Map<string, Booking[]>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.Idle);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSyncStatus(SyncStatus.Syncing);
      try {
        const availabilityData = await loadAvailability();
        const processedData = processBookings(availabilityData);
        setBookingsBySlug(processedData);
        setSyncStatus(SyncStatus.Success);
      } catch (err) {
        setError('Échec du chargement des données de disponibilité.');
        setSyncStatus(SyncStatus.Error);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { bookingsBySlug, syncStatus, loading, error };
};