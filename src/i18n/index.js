import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import kh from "./locales/kh.json";
import en from "./locales/en.json";

export const LANG_KH = "kh";
export const LANG_EN = "en";
export const LANGUAGE_STORAGE_KEY = "teasjul_language";
export const DEFAULT_LANGUAGE = LANG_KH;

const getStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === LANG_KH || stored === LANG_EN) return stored;
  } catch {
    // storage unavailable, fall through to default
  }
  return DEFAULT_LANGUAGE;
};

i18n.use(initReactI18next).init({
  resources: {
    [LANG_KH]: { translation: kh },
    [LANG_EN]: { translation: en },
  },
  lng: getStoredLanguage(),
  fallbackLng: LANG_EN,
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
});

export const changeLanguage = (lang) => {
  if (lang !== LANG_KH && lang !== LANG_EN) return;
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // storage unavailable, keep in-memory language only
  }
};

export default i18n;