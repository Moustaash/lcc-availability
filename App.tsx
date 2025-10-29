import React, { useState } from 'react';
import { useCalendarData } from './hooks/useCalendarData';
import { PROPERTIES } from './constants';
import Header from './components/Header';
import AvailabilityGrid from './components/AvailabilityGrid';
import FilterControls from './components/FilterControls';
import Legend from './components/Legend';
import Spinner from './components/Spinner';
import { ThemeProvider } from './contexts/ThemeContext';
import { useMediaQuery } from './hooks/useMediaQuery';

const App: React.FC = () => {
  const { bookingsBySlug, syncStatus, loading, error } = useCalendarData();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // Default to Oct 2025 for demo
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedPropertySlug, setSelectedPropertySlug] = useState<string>(PROPERTIES[0]?.slug);

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
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          properties={PROPERTIES}
          selectedPropertySlug={selectedPropertySlug}
          setSelectedPropertySlug={setSelectedPropertySlug}
          isMobile={isMobile}
        />
        <div className="px-4 pb-4">
          <AvailabilityGrid
            properties={PROPERTIES}
            bookingsBySlug={bookingsBySlug}
            monthDate={currentDate}
            isMobile={isMobile}
            selectedPropertySlug={selectedPropertySlug}
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