import React from 'react';
import { Property, Booking, BookingStatus } from '../types';

interface AvailabilityGridProps {
  properties: Property[];
  bookingsBySlug: Map<string, Booking[]>;
  startDate: Date;
  numMonths: number;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ properties, bookingsBySlug, startDate, numMonths }) => {
  const months: Date[] = [];
  for (let i = 0; i < numMonths; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    months.push(date);
  }

  let totalDays = 0;
  const monthData = months.map(monthDate => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const monthName = monthDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const startDay = totalDays + 1;
    totalDays += daysInMonth;
    return { year, month, daysInMonth, monthName, startDay };
  });

  const firstDayOfGrid = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  const renderBookings = (propertySlug: string) => {
    const bookings = bookingsBySlug.get(propertySlug.toLowerCase()) || [];
    
    return bookings.map((booking) => {
      const startDiff = Math.floor((booking.startDate.getTime() - firstDayOfGrid.getTime()) / (1000 * 3600 * 24));
      const duration = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 3600 * 24));
      
      if (startDiff + duration < 0 || startDiff >= totalDays) {
        return null;
      }

      const left = Math.max(0, startDiff);
      const right = Math.min(totalDays, startDiff + duration);
      const width = right - left;

      if (width <= 0) return null;
      
      const bgColor = booking.status === BookingStatus.Confirmed ? 'bg-status-confirmed' : 'bg-status-option';
      
      return (
        <div
          key={booking.id}
          className={`absolute h-[60%] top-[20%] ${bgColor} text-white text-xs overflow-hidden rounded-sm cursor-pointer`}
          style={{
            left: `calc(${(100 / totalDays) * left}%)`,
            width: `calc(${(100 / totalDays) * width}%)`,
          }}
        >
        </div>
      );
    });
  };

  return (
    <div className="overflow-x-auto border border-border-light dark:border-border-dark rounded-lg">
      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${totalDays}, minmax(35px, 1fr))` }}>
        {/* Top-left corner */}
        <div className="sticky top-0 left-0 z-20 bg-card-light dark:bg-card-dark border-b border-r border-border-light dark:border-border-dark"></div>
        
        {/* Month Headers */}
        {monthData.map(({ monthName, startDay, daysInMonth }) => (
          <div key={monthName} style={{ gridColumn: `${startDay + 1} / span ${daysInMonth}` }} className="sticky top-0 z-10 bg-card-light dark:bg-card-dark text-center font-semibold p-2 border-b border-r border-border-light dark:border-border-dark text-sm">
            {monthName}
          </div>
        ))}

        {/* Day Headers */}
        {monthData.flatMap(({ year, month, daysInMonth }, monthIndex) => 
            [...Array(daysInMonth)].map((_, dayIndex) => {
                const day = dayIndex + 1;
                const date = new Date(year, month, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const gridColumnStart = monthData.slice(0, monthIndex).reduce((acc, m) => acc + m.daysInMonth, 1) + dayIndex + 1;
                return (
                    <div
                        key={`${year}-${month}-${day}`}
                        style={{ gridRow: 2, gridColumn: gridColumnStart }}
                        className={`sticky top-12 z-10 bg-card-light dark:bg-card-dark text-center text-xs p-1 h-8 flex items-center justify-center border-b border-r border-border-light dark:border-border-dark ${isWeekend ? 'text-text-light/60 dark:text-text-dark/60' : ''}`}
                    >
                        {day}
                    </div>
                );
            })
        )}
        
        {/* Property Rows */}
        {properties.map((property, propertyIndex) => (
          <React.Fragment key={property.slug}>
            <div className="sticky left-0 bg-card-light dark:bg-card-dark z-10 p-2 border-b border-r border-border-light dark:border-border-dark flex items-center" style={{gridRow: propertyIndex + 3}}>
              <img src={property.imageUrl} alt={property.nameEN} className="w-8 h-8 object-cover rounded-full mr-3" />
              <span className="font-medium text-sm">{property.nameEN}</span>
            </div>
            <div className="col-span-1 relative h-16 border-b border-border-light dark:border-border-dark" style={{ gridColumn: `2 / span ${totalDays}`, gridRow: propertyIndex + 3 }}>
              {/* Day cells for grid lines */}
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)`}}>
                {[...Array(totalDays)].map((_, i) => (
                   <div key={i} className={`h-full border-r border-border-light dark:border-border-dark`}></div>
                ))}
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