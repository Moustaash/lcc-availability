import React, { useState } from 'react';
import { useCalendarData } from './hooks/useCalendarData';
import { PROPERTIES } from './constants';
import Header from './components/Header';
import AvailabilityGrid from './components/AvailabilityGrid';
import FilterControls from './components/FilterControls';
import Legend from './components/Legend';
import Spinner from './components/Spinner';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  const { bookingsBySlug, syncStatus, loading, error } = useCalendarData();
  const [startDate, setStartDate] = useState(new Date(2025, 9, 1)); // Default to Oct 2025 for demo
  const [numMonths, setNumMonths] = useState(3);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 p-4">
          <p>{error}</p>
        </div>
      );
    }

    return (
      <>
        <FilterControls
          startDate={startDate}
          setStartDate={setStartDate}
          numMonths={numMonths}
          setNumMonths={setNumMonths}
        />
        <div className="px-4 pb-4">
          <AvailabilityGrid
            properties={PROPERTIES}
            bookingsBySlug={bookingsBySlug}
            startDate={startDate}
            numMonths={numMonths}
          />
        </div>
        <Legend />
      </>
    );
  };
  
  return (
    <ThemeProvider>
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-text-light dark:text-text-dark">
            <Header syncStatus={syncStatus} />
            <main>
                {renderContent()}
            </main>
        </div>
    </ThemeProvider>
  );
};

export default App;