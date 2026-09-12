import { useState, useEffect, useCallback } from "react";
import themeApi from "../api/theme.api";

export const DEFAULT_THEME = {
  themeMode: "LIGHT",
  primaryColor: "#2563EB",
  secondaryColor: "#0F172A",
};

export function useThemeSettings() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await themeApi.getTheme();
      setTheme({ ...DEFAULT_THEME, ...data });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load theme");
      setTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  }, []);

  const notifyApplied = useCallback((data) => {
    window.dispatchEvent(new CustomEvent("rentalhub:theme-updated", { detail: data }));
  }, []);

  const saveTheme = useCallback(
    async (form) => {
      try {
        setSaving(true);
        setError(null);
        const data = await themeApi.updateTheme(form);
        const next = { ...DEFAULT_THEME, ...data };
        setTheme(next);
        notifyApplied(next);
        return next;
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to save theme";
        setError(msg);
        throw new Error(msg, { cause: err });
      } finally {
        setSaving(false);
      }
    },
    [notifyApplied]
  );

  const resetTheme = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const data = await themeApi.resetTheme();
      const next = { ...DEFAULT_THEME, ...data };
      setTheme(next);
      notifyApplied(next);
      return next;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset theme";
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setSaving(false);
    }
  }, [notifyApplied]);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  return {
    theme,
    loading,
    saving,
    error,
    fetchTheme,
    saveTheme,
    resetTheme,
    DEFAULT_THEME,
  };
}