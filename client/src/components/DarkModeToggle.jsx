import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-muted hover:text-accent border border-border/80 shadow-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <span className={`absolute transform transition-all duration-500 flex items-center justify-center ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`}>
          <Sun size={20} className="text-yellow-400" />
        </span>
        {/* Moon Icon */}
        <span className={`absolute transform transition-all duration-500 flex items-center justify-center ${theme === 'dark' ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
          <Moon size={20} className="text-indigo-500" />
        </span>
      </div>
    </button>
  );
};

export default DarkModeToggle;
