import React from 'react';
import { Property } from '../types';

interface FilterControlsProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  properties: Property[];
  selectedPropertySlug: string;
  setSelectedPropertySlug: (slug: string) => void;
  isMobile: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchDate: Date | null;
  setSearchDate: (date: Date | null) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ 
  currentDate, 
  setCurrentDate,
  properties,
  selectedPropertySlug,
  setSelectedPropertySlug,
  isMobile,
  searchTerm,
  setSearchTerm,
  searchDate,
  setSearchDate,
}) => {
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month)) {
      setCurrentDate(new Date(Date.UTC(year, month - 1, 1)));
    }
  };

  const handleDateSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      setSearchDate(new Date(Date.UTC(year, month - 1, day)));
    } else {
      setSearchDate(null);
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

  const getDateInputValue = (date: Date | null) => {
    if (!date) return '';
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-1 md:w-max">
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

        <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light/50 dark:text-text-dark/50 pointer-events-none">
              calendar_today
            </span>
            <input
              type="date"
              placeholder="Rechercher par date..."
              value={getDateInputValue(searchDate)}
              onChange={handleDateSearchChange}
              className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
              aria-label="Rechercher par date"
              style={{ colorScheme: 'dark' }}
            />
             {searchDate && (
              <button onClick={() => setSearchDate(null)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Effacer la date">
                  <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
        </div>

        {!isMobile && (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light/50 dark:text-text-dark/50 pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher un chalet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
              aria-label="Rechercher un chalet"
            />
          </div>
        )}
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