import { useState, useEffect, useCallback } from "react";
import settingsApi from "../api/settings.api";

const DEFAULT_SETTINGS = {
  baseCurrency: "USD",
  displayCurrency: "USD",
  exchangeRate: 4100,
  dateFormat: "DD/MM/YYYY",
  timezone: "Asia/Phnom_Penh",
  businessName: "",
  logoUrl: "",
  phone: "",
  email: "",
  address: "",
  primaryColor: "#3b82f6",
  secondaryColor: "#10b981",
  documentLanguage: "KM",
  invoicePrefix: "INV",
  invoiceDefaultDueDays: 10,
  invoiceFooter: "",
  invoiceShowUsd: true,
  invoiceShowKhr: true,
  invoiceShowLogo: true,
  invoiceShowBusinessInfo: true,
  contractTitle: "កិច្ចសន្យាជួលផ្ទះ",
  contractPaymentTerms: "",
  contractDepositTerms: "",
  contractTerminationTerms: "",
  contractAdditionalTerms: "",
  contractLanguage: "KM",
  // Party A - the owner's own identity printed on rental agreements.
  // Snapshotted onto each contract when it is created.
  contractParty: {
    fullName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    nationalId: "",
    currentAddress: "",
    houseNumber: "",
    streetNumber: "",
    sangkat: "",
    khan: "",
    cityProvince: "",
    phone: "",
    occupation: "",
  },
  receiptPrefix: "RCP",
  receiptLanguage: "KM",
  receiptFooter: "",
  receiptShowPaymentMethod: true,
  receiptShowTransactionId: true,
  receiptShowUsd: true,
  receiptShowKhr: true,
  telegramBotToken: "",
  telegramChatId: "",
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (form) => {
    try {
      setSaving(true);
      setError(null);
      const data = await settingsApi.updateSettings(form);
      setSettings(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save settings";
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
    DEFAULT_SETTINGS,
  };
}
