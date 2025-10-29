import React from 'react';

const Legend: React.FC = () => {
  return (
    <div className="p-4 mt-2">
      <div className="flex items-center justify-end space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-status-confirmed mr-2"></div>
          <span className="text-sm text-text-light/80 dark:text-text-dark/80">Réservé</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-status-option mr-2"></div>
          <span className="text-sm text-text-light/80 dark:text-text-dark/80">Option</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm border border-border-light dark:border-border-dark mr-2"></div>
          <span className="text-sm text-text-light/80 dark:text-text-dark/80">Disponible</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;