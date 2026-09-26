import { useState, useEffect, useCallback } from "react";
import { adminNotificationSettingsApi } from "../api/adminNotificationSettings.api";

export const DEFAULT_NOTIFICATION_SETTINGS = {
  systemNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
  telegramNotificationsEnabled: true,
  propertySubmittedEnabled: true,
  invoiceCreatedEnabled: true,
  paymentCreatedEnabled: true,
  paymentSuccessEnabled: true,
  paymentFailedEnabled: true,
  maintenanceRequestEnabled: true,
  maintenanceStatusEnabled: true,
  contractExpiringEnabled: true,
  roomAssignedEnabled: true,
};

export function useAdminNotificationSettings() {
  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminNotificationSettingsApi.getNotificationSettings();
      setSettings(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចទាញយកការកំណត់ជូនដំណឹងបានទេ។"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (form) => {
    try {
      setSaving(true);
      setError(null);
      const data = await adminNotificationSettingsApi.updateNotificationSettings(form);
      setSettings(data);
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "មិនអាចរក្សាទុកការកំណត់ជូនដំណឹងបានទេ។";
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
    DEFAULT_NOTIFICATION_SETTINGS,
  };
}
