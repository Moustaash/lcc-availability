
import { useState, useEffect } from 'react';
import { PROPERTIES } from '../constants';
import { rawBookingData } from '../services/bookingData';
import { Booking, SyncStatus, BookingStatus, RawBooking } from '../types';

export const useCalendarData = () => {
    const [bookingsBySlug, setBookingsBySlug] = useState<Map<string, Booking[]>>(new Map());
    const [syncStatus, setSyncStatus] = useState<Map<string, SyncStatus>>(new Map());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processBookingData = () => {
            try {
                setLoading(true);
                
                const bookingsMap = new Map<string, Booking[]>();
                PROPERTIES.forEach(p => bookingsMap.set(p.slug, [])); // Initialize for all properties

                // Filter for actual bookings (i.e., not available slots)
                const unavailableSlots = rawBookingData.filter(rb => !rb.is_available);

                unavailableSlots.forEach((rawBooking: RawBooking) => {
                    const slug = rawBooking.lot_ref.toLowerCase().replace(/ /g, '-');
                    
                    if (bookingsMap.has(slug)) {
                        let status = BookingStatus.Unknown;
                        const mode = rawBooking.Mode.toLowerCase();
                        if (mode === 'reservation') {
                            status = BookingStatus.Confirmed;
                        } else if (mode === 'option') {
                            status = BookingStatus.Option;
                        }

                        if (status !== BookingStatus.Unknown) {
                            const booking: Booking = {
                                id: `${slug}-${rawBooking.start_date}-${rawBooking.end_date}`, // Create a unique ID
                                summary: rawBooking.Mode,
                                description: `Booking for ${rawBooking.lot_ref}`,
                                startDate: new Date(rawBooking.start_date),
                                endDate: new Date(rawBooking.end_date),
                                status: status,
                                propertySlug: slug,
                            };
                            bookingsMap.get(slug)?.push(booking);
                        }
                    }
                });

                setBookingsBySlug(bookingsMap);

                // Since data is local and processed synchronously, all are "synced"
                const finalStatusMap = new Map<string, SyncStatus>();
                PROPERTIES.forEach(p => finalStatusMap.set(p.slug, SyncStatus.SYNCED));
                setSyncStatus(finalStatusMap);

            } catch (e) {
                console.error("Failed to process booking data:", e);
                setError("Could not process local booking data.");
                 const errorStatusMap = new Map<string, SyncStatus>();
                PROPERTIES.forEach(p => errorStatusMap.set(p.slug, SyncStatus.ERROR));
                setSyncStatus(errorStatusMap);
            } finally {
                // Use a small timeout to prevent flash of loading screen on fast devices
                setTimeout(() => setLoading(false), 250);
            }
        };

        processBookingData();
    }, []);

    return { bookingsBySlug, syncStatus, loading, error };
};
