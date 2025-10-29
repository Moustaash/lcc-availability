import React from 'react';
import { Property } from '../types';

interface FilterControlsProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  properties: Property[];
  selectedPropertySlug: string;
  setSelectedPropertySlug: (slug: string) => void;
  isMobile: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({ 
  currentDate, 
  setCurrentDate,
  properties,
  selectedPropertySlug,
  setSelectedPropertySlug,
  isMobile 
}) => {
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    // Adjust for time zone issues by creating date in UTC
    if (!isNaN(year) && !isNaN(month)) {
      setCurrentDate(new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1)));
  };

  const getMonthInputValue = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  return (
    <div className="px-4 pt-2 pb-4 flex flex-col items-center gap-4">
      <div className="flex items-center space-x-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-1">
        <button
          onClick={handlePrevMonth}
          aria-label="Mois précédent"
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-text-light dark:text-text-dark"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <input
          type="month"
          id="start-month"
          value={getMonthInputValue(currentDate)}
          onChange={handleMonthChange}
          className="bg-transparent border-none text-text-light dark:text-text-dark focus:outline-none focus:ring-0 text-center font-semibold"
          style={{ colorScheme: 'dark' }}
        />
        <button
          onClick={handleNextMonth}
          aria-label="Mois suivant"
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-text-light dark:text-text-dark"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      {isMobile && (
        <div className="w-full">
          <label className="sr-only">Choisir un bien</label>
          <div className="flex overflow-x-auto space-x-3 pb-2 -mx-4 px-4 scrollbar-hide">
            {properties.map(prop => (
              <button
                key={prop.slug}
                onClick={() => setSelectedPropertySlug(prop.slug)}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg border-2 w-20
                  transition-all duration-200 ease-in-out
                  ${selectedPropertySlug === prop.slug 
                    ? 'border-primary bg-primary/10' 
                    : 'border-transparent bg-card-light dark:bg-card-dark hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                aria-pressed={selectedPropertySlug === prop.slug}
              >
                <img 
                  src={prop.imageUrl} 
                  alt={prop.nameFR} 
                  className="w-10 h-10 object-cover rounded-full mb-1"
                />
                <span className="text-xs font-medium text-text-light dark:text-text-dark text-center truncate w-full">
                  {prop.nameFR}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;