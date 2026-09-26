import { useState, useEffect, useCallback } from "react";
import { adminLoginRateLimitSettingsApi } from "../api/adminLoginRateLimitSettings.api";

/**
 * Mirrors the backend defaults, which in turn mirror the shipped
 * AUTH_LOGIN_ACCOUNT policy (5 attempts / 15 minutes).
 */
export const DEFAULT_LOGIN_RATE_LIMIT_SETTINGS = {
  loginRateLimitEnabled: true,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 15,
};

export const MAX_FAILED_ATTEMPTS_RANGE = { min: 1, max: 100 };
export const LOCKOUT_DURATION_RANGE = { min: 1, max: 1440 };

const isWholeNumber = (value) =>
  Number.isInteger(value) && !Number.isNaN(value) && !Number.isInfinite(value);

const isInRange = (value, { min, max }) =>
  isWholeNumber(value) && value >= min && value <= max;

/**
 * Same rules the API enforces, checked before sending so the form can explain
 * the problem inline instead of surfacing a bare 400.
 */
export function validateLoginRateLimitSettings(form) {
  const errors = {};

  if (typeof form.loginRateLimitEnabled !== "boolean") {
    errors.loginRateLimitEnabled = "Please choose ON or OFF.";
  }
  if (!isWholeNumber(form.maxFailedAttempts)) {
    errors.maxFailedAttempts = "Enter a whole number of attempts.";
  } else if (!isInRange(form.maxFailedAttempts, MAX_FAILED_ATTEMPTS_RANGE)) {
    errors.maxFailedAttempts = `Must be between ${MAX_FAILED_ATTEMPTS_RANGE.min} and ${MAX_FAILED_ATTEMPTS_RANGE.max}.`;
  }
  if (!isWholeNumber(form.lockoutDurationMinutes)) {
    errors.lockoutDurationMinutes = "Enter a whole number of minutes.";
  } else if (!isInRange(form.lockoutDurationMinutes, LOCKOUT_DURATION_RANGE)) {
    errors.lockoutDurationMinutes = `Must be between ${LOCKOUT_DURATION_RANGE.min} and ${LOCKOUT_DURATION_RANGE.max}.`;
  }

  return errors;
}

export function useAdminLoginRateLimitSettings() {
  const [settings, setSettings] = useState(DEFAULT_LOGIN_RATE_LIMIT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminLoginRateLimitSettingsApi.getLoginRateLimitSettings();
      setSettings(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not load the login rate limiting settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (form) => {
    try {
      setSaving(true);
      setError(null);
      const data = await adminLoginRateLimitSettingsApi.updateLoginRateLimitSettings({
        loginRateLimitEnabled: form.loginRateLimitEnabled,
        maxFailedAttempts: form.maxFailedAttempts,
        lockoutDurationMinutes: form.lockoutDurationMinutes,
      });
      setSettings(data);
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not save the login rate limiting settings.";
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    saveSettings,
    DEFAULT_LOGIN_RATE_LIMIT_SETTINGS,
  };
}
