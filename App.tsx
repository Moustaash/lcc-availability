
import React, { useState } from 'react';
import Header from './components/Header';
import AvailabilityGrid from './components/AvailabilityGrid';
import Legend from './components/Legend';
import Spinner from './components/Spinner';
import { useCalendarData } from './hooks/useCalendarData';
import { PROPERTIES } from './constants';

// FIX: The `date-fns` library is loaded globally from a script, not imported as a module.
// This declares the global variable to TypeScript.
declare const dateFns: any;

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { bookingsBySlug, syncStatus, loading, error } = useCalendarData();

  const handlePrevMonth = () => {
    // FIX: Use the global `dateFns` object, consistent with other components.
    setCurrentDate(current => dateFns.subMonths(current, 1));
  };

  const handleNextMonth = () => {
    // FIX: Use the global `dateFns` object, consistent with other components.
    setCurrentDate(current => dateFns.addMonths(current, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-background-dark">
      <Header 
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      <main className="flex-grow flex flex-col mt-6">
        {loading && (
          <div className="flex-grow flex flex-col items-center justify-center">
            <Spinner />
            <p className="mt-4 text-text-dark/80">Loading calendar data...</p>
          </div>
        )}
        {error && (
          <div className="flex-grow flex items-center justify-center bg-red-900/50 text-red-300 p-4 rounded-lg">
            <span className="material-symbols-outlined mr-2">error</span>
            <p>Error loading calendar data: {error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="flex-grow flex flex-col">
            <AvailabilityGrid
              properties={PROPERTIES}
              bookingsBySlug={bookingsBySlug}
              syncStatus={syncStatus}
              viewDate={currentDate}
            />
            <Legend />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
