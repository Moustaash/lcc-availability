
import React from 'react';

// This tells TypeScript about the global dateFns object from the CDN script
declare const dateFns: any;

interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-border-dark">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Les Chalets Covarel</h1>
        <h2 className="text-lg text-text-dark/70">Availability Visualizer</h2>
      </div>
      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-semibold border border-border-dark rounded-md hover:bg-card-dark transition-colors"
        >
          Today
        </button>
        <div className="flex items-center gap-1 bg-card-dark border border-border-dark rounded-md p-1">
           <button onClick={onPrevMonth} aria-label="Previous month" className="p-1 rounded-md hover:bg-background-dark transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="w-32 text-center font-bold text-lg">
            {dateFns.format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={onNextMonth} aria-label="Next month" className="p-1 rounded-md hover:bg-background-dark transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
