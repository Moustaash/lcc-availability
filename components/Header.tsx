import React from 'react';
import { SyncStatus } from '../types';
import ThemeToggle from './ThemeToggle';
import Spinner from './Spinner';

interface HeaderProps {
  syncStatus: SyncStatus;
}

const Header: React.FC<HeaderProps> = ({ syncStatus }) => {
  const getStatusIndicator = () => {
    switch (syncStatus) {
      case SyncStatus.Syncing:
        return (
          <div className="flex items-center space-x-2 text-sm text-text-light/70 dark:text-text-dark/70">
            <Spinner />
            <span>Syncing...</span>
          </div>
        );
      case SyncStatus.Success:
        return (
          <div className="flex items-center space-x-2 text-sm text-green-500">
            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            <span>Synced</span>
          </div>
        );
      case SyncStatus.Error:
        return (
          <div className="flex items-center space-x-2 text-sm text-red-500">
            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
            <span>Sync Error</span>
          </div>
        );
      case SyncStatus.Idle:
      default:
        return null;
    }
  };

  return (
    <header className="p-4 sm:px-6 sm:py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Chalet Availability
        </h1>
        <div className="flex items-center space-x-4">
          {getStatusIndicator()}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;