import { useState, useEffect } from 'react';
import { Booking, RawBooking, BookingStatus, SyncStatus } from '../types';
import { rawBookingData } from '../services/bookingData';

const processBookings = (data: RawBooking[]): Map<string, Booking[]> => {
  const bookingMap = new Map<string, Booking[]>();

  // Only process bookings that are actually unavailable/occupied.
  const unavailableBookings = data.filter(rb => !rb.is_available);

  unavailableBookings.forEach((rawBooking) => {
    const slug = rawBooking.lot_ref.toLowerCase();

    // The booking is for the nights from startDate up to (but not including) endDate.
    const booking: Booking = {
      id: `${rawBooking.lot_no}-${rawBooking.start_date}`,
      propertySlug: slug,
      startDate: new Date(rawBooking.start_date),
      endDate: new Date(rawBooking.end_date),
      status: rawBooking.Mode === 'reservation' ? BookingStatus.Confirmed : BookingStatus.Option,
      price: parseFloat(rawBooking.price_total_eur),
      isAvailable: rawBooking.is_available,
    };

    if (!bookingMap.has(slug)) {
      bookingMap.set(slug, []);
    }
    bookingMap.get(slug)!.push(booking);
  });

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
        // Simulate network delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const processedData = processBookings(rawBookingData);
        setBookingsBySlug(processedData);
        setSyncStatus(SyncStatus.Success);
      } catch (err) {
        setError('Échec du traitement des données de réservation.');
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