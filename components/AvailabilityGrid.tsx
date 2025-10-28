
import React from 'react';
import { Property, Booking, BookingStatus, SyncStatus } from '../types';
import { NOCODB_CLIENT_URL_TEMPLATE } from '../constants';

declare const dateFns: any;

interface AvailabilityGridProps {
  properties: Property[];
  bookingsBySlug: Map<string, Booking[]>;
  syncStatus: Map<string, SyncStatus>;
  viewDate: Date;
}

const StatusIndicator: React.FC<{ status: SyncStatus | undefined }> = ({ status }) => {
  if (!status) return null;

  switch (status) {
    case SyncStatus.SYNCING:
      return (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-blue-400 border-r-transparent" title="Syncing..."></div>
      );
    case SyncStatus.SYNCED:
      return (
        <span className="material-symbols-outlined text-green-500 text-base" title="Synced">
          check_circle
        </span>
      );
    case SyncStatus.ERROR:
      return (
        <span className="material-symbols-outlined text-red-500 text-base" title="Error syncing">
          error
        </span>
      );
    default:
      return null;
  }
};

const BookingBlock: React.FC<{ booking: Booking, gridStartDate: Date }> = ({ booking, gridStartDate }) => {
  const startOffset = dateFns.differenceInDays(booking.startDate, gridStartDate);
  // Add 1 day to duration because difference is exclusive of end date
  const duration = dateFns.differenceInDays(booking.endDate, booking.startDate) || 1; 

  if (startOffset < 0 || duration <= 0) return null;

  const bgColor = booking.status === BookingStatus.Confirmed ? 'bg-status-confirmed' : 'bg-status-option';
  
  const handleBookingClick = () => {
    // In a real application, we would extract a client ID from the booking data.
    // Since it's not present in the ICS file, we show an alert as a placeholder.
    const nocoDbUrl = NOCODB_CLIENT_URL_TEMPLATE.replace('ID_PLACEHOLDER', 'some-client-id');
    alert(`This would open the client record in NocoDB.
URL (placeholder): ${nocoDbUrl}

Booking Details:
- Summary: ${booking.summary}
- From: ${dateFns.format(booking.startDate, 'yyyy-MM-dd')}
- To: ${dateFns.format(booking.endDate, 'yyyy-MM-dd')}
- Status: ${booking.status}`);
    console.log("Clicked booking:", booking);
  };
  
  return (
    <div
      onClick={handleBookingClick}
      title={`${booking.summary} (${booking.status})`}
      className={`absolute h-full top-0 ${bgColor} rounded text-white text-xs font-bold flex items-center justify-center px-1 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity`}
      style={{
        left: `${startOffset * 2.5}rem`, // Each day is 2.5rem wide
        width: `${duration * 2.5}rem`,
      }}
    >
      <span className="truncate">{booking.summary}</span>
    </div>
  );
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ properties, bookingsBySlug, syncStatus, viewDate }) => {
  const startOfMonth = dateFns.startOfMonth(viewDate);
  const endOfMonth = dateFns.endOfMonth(viewDate);
  const daysInMonth = dateFns.getDaysInMonth(viewDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => dateFns.addDays(startOfMonth, i));

  return (
    <div className="flex-grow overflow-auto border border-border-dark rounded-lg bg-card-dark relative">
      <div className="grid" style={{ gridTemplateColumns: `250px repeat(${daysInMonth}, 2.5rem)` }}>
        {/* Sticky Header Row */}
        <div className="sticky top-0 left-0 z-20 bg-card-dark font-bold p-2 border-r border-b border-border-dark">Property</div>
        {days.map(day => (
          <div key={day.toISOString()} className="sticky top-0 z-10 bg-card-dark text-center border-b border-border-dark py-1">
            <div className="text-xs text-text-dark/60">{dateFns.format(day, 'E')}</div>
            <div className="font-bold">{dateFns.format(day, 'd')}</div>
          </div>
        ))}

        {/* Property Rows */}
        {properties.map((property, index) => (
          <React.Fragment key={property.slug}>
            <div 
              className="sticky left-0 bg-card-dark p-2 border-r border-border-dark flex items-center justify-between z-10"
              style={{ gridRow: index + 2 }}
            >
              <div className="flex items-center overflow-hidden">
                 {property.imageUrl && <img src={property.imageUrl} alt={property.nameEN} className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"/>}
                 <span className="font-semibold text-sm truncate">{property.nameEN}</span>
              </div>
               <div className="ml-2 flex-shrink-0">
                <StatusIndicator status={syncStatus.get(property.slug)} />
              </div>
            </div>
            <div className="relative col-span-full" style={{ gridRow: index + 2, gridColumn: `2 / span ${daysInMonth}` }}>
              {/* Grid lines */}
              {days.map((_, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className="absolute top-0 h-full border-r border-border-dark/50" 
                  style={{ left: `${dayIndex * 2.5}rem`, width: '2.5rem' }}
                ></div>
              ))}
              {/* Bookings */}
              {(bookingsBySlug.get(property.slug) || []).map(booking => {
                if (dateFns.areIntervalsOverlapping({ start: startOfMonth, end: endOfMonth }, { start: booking.startDate, end: booking.endDate })) {
                   return <BookingBlock key={booking.id} booking={booking} gridStartDate={startOfMonth} />;
                }
                return null;
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityGrid;