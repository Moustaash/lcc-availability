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
    <div className="p-4">
      <div className="bg-card-light dark:bg-card-dark rounded-lg p-4 flex items-center space-x-4 border border-border-light dark:border-border-dark">
        <div>
          <label htmlFor="start-month" className="block text-xs font-medium text-text-light/70 dark:text-text-dark/70 mb-1">Start Month</label>
          <input
            type="month"
            id="start-month"
            value={getMonthInputValue(startDate)}
            onChange={handleMonthChange}
            className="block w-full text-base bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-status-confirmed/50"
          />
        </div>
        <div>
          <label htmlFor="num-months" className="block text-xs font-medium text-text-light/70 dark:text-text-dark/70 mb-1">Months to Display</label>
          <select
            id="num-months"
            value={numMonths}
            onChange={handleNumMonthsChange}
            className="block w-full text-base bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-status-confirmed/50"
          >
            {[1, 2, 3, 4, 5, 6, 12].map(num => (
              <option key={num} value={num}>{num} month{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;