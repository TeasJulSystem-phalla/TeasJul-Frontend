import { useTranslation } from "react-i18next";
import { LANG_KH, LANG_EN, changeLanguage } from "../../i18n";

const OPTIONS = [
  { code: LANG_EN, label: "EN" },
  { code: LANG_KH, label: "ខ្មែរ" },
];

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div
      className="flex items-center rounded-md border border-slate-300 bg-white p-0.5"
      role="group"
      aria-label={t("lang.label")}
    >
      {OPTIONS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => changeLanguage(code)}
          aria-pressed={current === code}
          className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
            current === code
              ? "bg-[#0f2942] text-white"
              : "text-slate-600 hover:text-[#0f2942]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;