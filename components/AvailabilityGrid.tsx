import React from 'react';
import { Property, Booking, BookingStatus } from '../types';

interface AvailabilityGridProps {
  properties: Property[];
  bookingsBySlug: Map<string, Booking[]>;
  monthDate: Date;
  isMobile: boolean;
  selectedPropertySlug: string;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ properties, bookingsBySlug, monthDate, isMobile, selectedPropertySlug }) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  
  // Mobile View: Classic Calendar for a single property
  if (isMobile) {
    const bookings = bookingsBySlug.get(selectedPropertySlug) || [];
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayDate = new Date(year, month, 1);
    const startingDayOfWeek = (firstDayDate.getDay() + 6) % 7; // Monday is 0

    const calendarDays = Array.from({ length: startingDayOfWeek + daysInMonth }, (_, i) => {
      if (i < startingDayOfWeek) {
        return null; // Empty cell for days before the 1st
      }
      const dayOfMonth = i - startingDayOfWeek + 1;
      const currentDate = new Date(year, month, dayOfMonth);
      
      let bookingStatus: 'start' | 'middle' | 'end' | 'single' | null = null;
      let bookingType: BookingStatus | null = null;
      
      for (const booking of bookings) {
        const normCurrent = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
        const normStart = new Date(Date.UTC(booking.startDate.getFullYear(), booking.startDate.getMonth(), booking.startDate.getDate()));
        const normEnd = new Date(Date.UTC(booking.endDate.getFullYear(), booking.endDate.getMonth(), booking.endDate.getDate()));
        
        if (normCurrent >= normStart && normCurrent < normEnd) {
          bookingType = booking.status;
          const isStart = normCurrent.getTime() === normStart.getTime();
          const isEnd = new Date(normCurrent.getTime() + 24 * 60 * 60 * 1000).getTime() === normEnd.getTime();
          
          if (isStart && isEnd) bookingStatus = 'single';
          else if (isStart) bookingStatus = 'start';
          else if (isEnd) bookingStatus = 'end';
          else bookingStatus = 'middle';
          break;
        }
      }

      return { day: dayOfMonth, bookingStatus, bookingType };
    });

    const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    return (
      <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-2 sm:p-4">
        <h2 className="font-bold text-lg capitalize text-center mb-4">
          {monthDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="grid grid-cols-7 text-center">
          {weekdays.map((wd, i) => (
            <div key={i} className="font-bold text-xs text-text-light/60 dark:text-text-dark/60 pb-2">{wd}</div>
          ))}
          {calendarDays.map((dayData, i) => {
            if (!dayData) {
              return <div key={`empty-${i}`} className="p-1"><div className="h-8 w-8"></div></div>;
            }
            const { day, bookingStatus, bookingType } = dayData;
            
            let wrapperClasses = "p-1";
            let dayClasses = "h-8 w-8 flex items-center justify-center text-sm";
            
            if (bookingStatus) {
              const bgColor = bookingType === BookingStatus.Confirmed ? 'bg-status-confirmed' : 'bg-status-option';
              dayClasses += ` ${bgColor} text-white`;
              if (bookingStatus === 'single') dayClasses += ' rounded-full';
              else if (bookingStatus === 'start') dayClasses += ' rounded-l-full';
              else if (bookingStatus === 'end') dayClasses += ' rounded-r-full';
              else dayClasses += ' w-full rounded-none';
            } else {
              dayClasses += ' rounded-full hover:bg-black/5 dark:hover:bg-white/5';
            }

            return (
              <div key={i} className={wrapperClasses}>
                <div className={dayClasses}>{day}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop View: Original Grid
  const daysInMonth = getDaysInMonth(year, month);
  const monthName = monthDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  const firstDayOfMonth = new Date(year, month, 1);

  const renderBookings = (propertySlug: string) => {
    const bookings = bookingsBySlug.get(propertySlug.toLowerCase()) || [];
    return bookings.map((booking) => {
      const startDiff = (booking.startDate.getTime() - firstDayOfMonth.getTime()) / (1000 * 3600 * 24);
      const duration = (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 3600 * 24);
      if (startDiff + duration <= 0 || startDiff >= daysInMonth) return null;
      const left = Math.max(0, startDiff);
      const right = Math.min(daysInMonth, startDiff + duration);
      const width = right - left;
      if (width <= 0) return null;
      const bgColor = booking.status === BookingStatus.Confirmed ? 'bg-status-confirmed' : 'bg-status-option';
      return (
        <div
          key={booking.id}
          className={`absolute h-[60%] top-[20%] ${bgColor} text-white text-xs overflow-hidden rounded-sm cursor-pointer`}
          style={{ left: `calc(${(100 / daysInMonth) * left}%)`, width: `calc(${(100 / daysInMonth) * width}%)` }}
          title={`${booking.status} - Du ${booking.startDate.toLocaleDateString()} au ${booking.endDate.toLocaleDateString()}`}
        ></div>
      );
    });
  };

  return (
    <div className="overflow-hidden border border-border-light dark:border-border-dark rounded-lg">
      <div className="grid" style={{ gridTemplateColumns: `minmax(150px, auto) repeat(${daysInMonth}, 1fr)` }}>
        <div className="sticky top-0 left-0 z-30 bg-card-light dark:bg-card-dark border-b border-r border-border-light dark:border-border-dark flex items-center justify-center p-2 h-16">
            <h2 className="font-bold text-sm capitalize text-center">{monthName}</h2>
        </div>
        {[...Array(daysInMonth)].map((_, dayIndex) => {
            const day = dayIndex + 1;
            const date = new Date(year, month, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return (
                <div
                    key={`${year}-${month}-${day}`}
                    className={`sticky top-0 z-20 bg-card-light dark:bg-card-dark text-center text-xs p-1 h-16 flex flex-col items-center justify-center border-b border-r border-border-light dark:border-border-dark ${isWeekend ? 'bg-black/5 dark:bg-white/5' : ''}`}
                >
                    <span className={`font-medium uppercase text-xs ${isWeekend ? 'text-text-light/60 dark:text-text-dark/60' : ''}`}>{date.toLocaleString('fr-FR', { weekday: 'short' }).slice(0, 1)}</span>
                    <span className="font-semibold text-base mt-1">{day}</span>
                </div>
            );
        })}
        {properties.map((property, propertyIndex) => (
          <React.Fragment key={property.slug}>
            <div className="sticky left-0 bg-card-light dark:bg-card-dark z-20 p-2 border-b border-r border-border-light dark:border-border-dark flex items-center" style={{gridRow: propertyIndex + 2}}>
              <img src={property.imageUrl} alt={property.nameEN} className="w-8 h-8 object-cover rounded-full mr-3" />
              <span className="font-medium text-sm">{property.nameEN}</span>
            </div>
            <div className="col-span-1 relative h-16 border-b border-border-light dark:border-border-dark" style={{ gridColumn: `2 / span ${daysInMonth}`, gridRow: propertyIndex + 2 }}>
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`}}>
                {[...Array(daysInMonth)].map((_, i) => {
                  const date = new Date(year, month, i + 1);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                   return <div key={i} className={`h-full border-r border-border-light dark:border-border-dark ${isWeekend ? 'bg-black/5 dark:bg-white/5' : ''}`}></div>
                })}
              </div>
              {renderBookings(property.slug)}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityGrid;