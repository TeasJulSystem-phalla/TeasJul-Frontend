import { useEffect, useState } from "react";
import { useThemeSettings, DEFAULT_THEME } from "../../hooks/useThemeSettings";

const applyTheme = (theme) => {
  const root = document.documentElement;

  // SYSTEM renders a full black & white look: white background with black accents.
  const systemMode = theme.themeMode === "SYSTEM";
  const primary = systemMode ? "#000000" : theme.primaryColor || DEFAULT_THEME.primaryColor;
  const secondary = systemMode ? "#000000" : theme.secondaryColor || DEFAULT_THEME.secondaryColor;

  root.style.setProperty("--app-primary", primary);
  root.style.setProperty("--app-secondary", secondary);

  // DARK = dark background. LIGHT and SYSTEM both render white background with
  // dark (black) text - SYSTEM never follows the OS dark mode.
  if (theme.themeMode === "DARK") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const ThemeProvider = ({ children }) => {
  const { theme, loading } = useThemeSettings();
  const [override, setOverride] = useState(null);

  const active = override || (loading ? DEFAULT_THEME : theme);

  useEffect(() => {
    return applyTheme(active);
  }, [active]);

  useEffect(() => {
    const handler = (e) => {
      setOverride({ ...DEFAULT_THEME, ...(e.detail || {}) });
    };
    window.addEventListener("rentalhub:theme-updated", handler);
    return () => window.removeEventListener("rentalhub:theme-updated", handler);
  }, []);

  return children;
};

export default ThemeProvider;