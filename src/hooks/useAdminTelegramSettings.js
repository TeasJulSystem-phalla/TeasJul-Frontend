import { useState, useEffect, useCallback } from "react";
import { adminTelegramSettingsApi } from "../api/adminTelegramSettings.api";

/** Mirrors the backend default: opt-in, and no credentials stored yet. */
export const DEFAULT_SUPER_ADMIN_TELEGRAM_SETTINGS = {
  enabled: false,
  botTokenConfigured: false,
  maskedBotToken: "",
  chatId: "",
  lastUpdatedAt: null,
};

/** Same shape the API returns; the real token is never part of it. */
const TOKEN_MASK = "***************";

/**
 * The backend never returns the stored token, so the form keeps the mask as a
 * placeholder and sends an empty value unless the user types a new token. Both
 * cases mean "keep what is stored" server-side.
 */
const TELEGRAM_BOT_TOKEN_PATTERN = /^\d{5,12}:[A-Za-z0-9_-]{20,}$/;
const TELEGRAM_CHAT_ID_PATTERN = /^(-?\d{1,20}|@[A-Za-z0-9_]{5,32})$/;

/**
 * The same rules the API enforces, checked before sending so the form can
 * explain the problem inline instead of surfacing a bare 400.
 *
 * @param form          { enabled, botToken, chatId, botTokenConfigured }
 * @param { hasStoredToken } whether a token already exists server-side
 */
export function validateSuperAdminTelegramSettings(form, hasStoredToken) {
  const errors = {};

  if (typeof form.enabled !== "boolean") {
    errors.enabled = "Please choose ON or OFF.";
  }

  const typedToken = (form.botToken ?? "").trim();
  const keepsStoredToken =
    typedToken === "" || typedToken === TOKEN_MASK || typedToken === form.maskedBotToken;
  const willHaveToken = hasStoredToken ? keepsStoredToken || typedToken !== "" : typedToken !== "";

  if (typedToken !== "" && typedToken !== TOKEN_MASK && typedToken !== form.maskedBotToken) {
    if (!TELEGRAM_BOT_TOKEN_PATTERN.test(typedToken)) {
      errors.botToken = "Enter a valid bot token, e.g. 123456789:AA...";
    }
  } else if (typedToken !== "" && typedToken !== form.maskedBotToken) {
    errors.botToken = "Paste a new bot token to replace the stored one.";
  }

  const chatId = (form.chatId ?? "").trim();
  if (form.enabled && chatId === "") {
    errors.chatId = "A chat ID is required before Telegram delivery can be enabled.";
  } else if (chatId !== "" && !TELEGRAM_CHAT_ID_PATTERN.test(chatId)) {
    errors.chatId = "Use a numeric chat id (e.g. -1001234567890) or @channelusername.";
  }

  if (form.enabled && !willHaveToken) {
    errors.botToken = "A bot token is required before Telegram delivery can be enabled.";
  }

  return errors;
}

export function useAdminTelegramSettings() {
  const [settings, setSettings] = useState(DEFAULT_SUPER_ADMIN_TELEGRAM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminTelegramSettingsApi.getTelegramSettings();
      setSettings(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not load the Telegram settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (form) => {
    try {
      setSaving(true);
      setError(null);
      // Send the token as typed. A blank value means "keep the stored token".
      const data = await adminTelegramSettingsApi.updateTelegramSettings({
        enabled: form.enabled,
        botToken: (form.botToken ?? "").trim(),
        chatId: (form.chatId ?? "").trim(),
      });
      setSettings(data);
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not save the Telegram settings.";
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
    DEFAULT_SUPER_ADMIN_TELEGRAM_SETTINGS,
  };
}
