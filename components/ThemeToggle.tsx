import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-text-light/70 dark:text-text-dark/70 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none"
      aria-label="Changer de thème"
    >
      {theme === 'light' ? (
        <span className="material-symbols-outlined">dark_mode</span>
      ) : (
        <span className="material-symbols-outlined">light_mode</span>
      )}
    </button>
  );
};

export default ThemeToggle;