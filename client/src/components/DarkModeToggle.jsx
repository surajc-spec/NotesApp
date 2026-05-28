import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const DarkModeToggle = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-muted hover:text-accent border border-border/80 shadow-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
      title={`Theme Mode: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} (Click to switch)`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* System Icon */}
        <span className={`absolute transform transition-all duration-500 flex items-center justify-center ${themeMode === 'system' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`}>
          <Monitor size={20} className="text-blue-500 dark:text-blue-400" />
        </span>
        {/* Sun Icon */}
        <span className={`absolute transform transition-all duration-500 flex items-center justify-center ${themeMode === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`}>
          <Sun size={20} className="text-yellow-500 dark:text-yellow-400" />
        </span>
        {/* Moon Icon */}
        <span className={`absolute transform transition-all duration-500 flex items-center justify-center ${themeMode === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`}>
          <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
        </span>
      </div>
    </button>
  );
};

export default DarkModeToggle;

