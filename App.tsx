import React, { useState, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState<Date | null>(null);

  useEffect(() => {
    if (searchDate) {
      // Navigate calendar view to the month of the selected searchDate
      const newCurrentDate = new Date(Date.UTC(searchDate.getUTCFullYear(), searchDate.getUTCMonth(), 1));
      setCurrentDate(newCurrentDate);
    }
  }, [searchDate]);

  const filteredProperties = PROPERTIES.filter(property =>
    property.nameFR.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchDate={searchDate}
          setSearchDate={setSearchDate}
          bookingsBySlug={bookingsBySlug}
        />
        <div className="px-4 pb-4">
          <AvailabilityGrid
            loading={loading}
            properties={filteredProperties}
            bookingsBySlug={bookingsBySlug}
            monthDate={currentDate}
            isMobile={isMobile}
            selectedPropertySlug={selectedPropertySlug}
            searchDate={searchDate}
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