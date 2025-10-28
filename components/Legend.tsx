
import React from 'react';

const Legend: React.FC = () => {
  return (
    <div className="flex items-center justify-end gap-6 mt-4 px-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-status-confirmed"></div>
        <span className="text-sm text-text-dark/80">Confirmed</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-status-option"></div>
        <span className="text-sm text-text-dark/80">Option</span>
      </div>
    </div>
  );
};

export default Legend;
