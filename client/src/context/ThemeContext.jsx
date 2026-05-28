import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme_mode') || 'system';
  });

  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let currentTheme = 'light';
      if (themeMode === 'system') {
        currentTheme = darkQuery.matches ? 'dark' : 'light';
      } else {
        currentTheme = themeMode;
      }

      setActiveTheme(currentTheme);

      if (currentTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    updateTheme();
    localStorage.setItem('theme_mode', themeMode);

    const handleChange = () => {
      if (themeMode === 'system') {
        updateTheme();
      }
    };

    // Modern and backward compatible event listener handling
    if (darkQuery.addEventListener) {
      darkQuery.addEventListener('change', handleChange);
    } else {
      darkQuery.addListener(handleChange);
    }

    return () => {
      if (darkQuery.removeEventListener) {
        darkQuery.removeEventListener('change', handleChange);
      } else {
        darkQuery.removeListener(handleChange);
      }
    };
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'system') return 'dark';
      if (prev === 'dark') return 'light';
      return 'system';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

