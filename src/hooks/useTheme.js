// hooks/useTheme.js
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'rentalhub-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useTheme = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggleTheme };
};
