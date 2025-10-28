import React from 'react';

interface FilterControlsProps {
  startDate: Date;
  setStartDate: (date: Date) => void;
  numMonths: number;
  setNumMonths: (num: number) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ startDate, setStartDate, numMonths, setNumMonths }) => {
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    setStartDate(new Date(year, month - 1, 1));
  };

  const handleNumMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNumMonths(Number(e.target.value));
  };

  const getMonthInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  return (
    <div className="px-4 pt-2 pb-4">
      <div className="flex items-center space-x-4">
        <div>
          <label htmlFor="start-month" className="block text-xs font-medium text-text-light/70 dark:text-text-dark/70 mb-1">Mois de début</label>
          <input
            type="month"
            id="start-month"
            value={getMonthInputValue(startDate)}
            onChange={handleMonthChange}
            className="block w-full text-sm bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-status-confirmed"
          />
        </div>
        <div>
          <label htmlFor="num-months" className="block text-xs font-medium text-text-light/70 dark:text-text-dark/70 mb-1">Mois à afficher</label>
          <select
            id="num-months"
            value={numMonths}
            onChange={handleNumMonthsChange}
            className="block w-full text-sm bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-status-confirmed"
          >
            {[1, 2, 3, 4, 5, 6, 12].map(num => (
              <option key={num} value={num}>{num} mois</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;