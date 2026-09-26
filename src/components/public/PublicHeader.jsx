import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, Check, ChevronDown, Send } from "lucide-react";

import logo from "../../assets/logo.png";

const LINKS = [
  { to: "/", key: "home" },
  { to: "/about", key: "about" },
  { to: "/rooms", key: "rooms" },
  { to: "/marketing", key: "marketing" },
  { to: "/contact", key: "contact" },
];

// Flags loaded from URL — no local files needed
const LANGUAGES = [
  {
    code: "km",
    label: "ខ្មែរ",
    sub: "Khmer",
    flag: "https://flagcdn.com/kh.svg",
  },
  {
    code: "en",
    label: "English",
    sub: "EN",
    flag: "https://flagcdn.com/gb.svg",
  },
];

const TELEGRAM_PHONE = "0962657233";

const PublicHeader = ({ active }) => {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  // Convert 0962657233 -> +855962657233 for Telegram
  const handleContactUs = () => {
    const international = `855${TELEGRAM_PHONE.replace(/^0+/, "")}`;
    window.open(`https://t.me/+${international}`, "_blank", "noopener,noreferrer");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-[#f8f8f6]/85 backdrop-blur-xl">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mx-auto flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            aria-label={t("navbar.homeLabel")}
            className="relative flex h-14 w-24 shrink-0 items-center sm:w-28"
          >
            <img
              src={logo}
              alt="TeasJul"
              className="absolute left-0 top-1/2 h-10 w-auto -translate-y-1/2 origin-left scale-[2.2] object-contain sm:scale-[2.5]"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 xl:flex">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                className={`font-khmer text-[13px] font-medium transition-colors ${
                  active === link.key
                    ? "text-[#0f2942]"
                    : "text-slate-800 hover:text-[#0f2942]"
                }`}
              >
                {t(`navbar.${link.key}`)}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                aria-label="Change language"
              >
                <img
                  src={currentLang.flag}
                  alt=""
                  className="h-4 w-6 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
                />
                <span className="hidden sm:block">{currentLang.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                    langOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_50px_-15px_rgba(15,41,66,0.25)]">
                  <div className="border-b border-slate-100 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                        Language
                      </span>
                    </div>
                  </div>
                  <ul className="py-1">
                    {LANGUAGES.map((lang) => {
                      const isActive = lang.code === i18n.language;
                      return (
                        <li key={lang.code}>
                          <button
                            onClick={() => changeLang(lang.code)}
                            className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                              isActive
                                ? "bg-slate-50 font-semibold text-[#0f2942]"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <img
                              src={lang.flag}
                              alt=""
                              className="h-5 w-7 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/5"
                            />
                            <span className="flex-1">
                              <span className="block font-khmer">
                                {lang.label}
                              </span>
                              <span className="block text-[11px] text-slate-400">
                                {lang.sub}
                              </span>
                            </span>
                            {isActive && (
                              <Check className="h-3.5 w-3.5 text-[#0f2942]" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleContactUs}
              className="font-khmer flex items-center gap-1.5 rounded-md bg-[#0f2942] px-3.5 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
              aria-label="ទាក់ទងយើង"
            >
              <Send className="h-3.5 w-3.5" />
              <span>ទាក់ទងពួកយើង</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-slate-700 xl:hidden"
              aria-label={t("navbar.menu")}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-2 xl:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`font-khmer block py-2.5 text-[14px] ${
                  active === link.key
                    ? "font-semibold text-[#0f2942]"
                    : "text-slate-700 hover:text-[#0f2942]"
                }`}
              >
                {t(`navbar.${link.key}`)}
              </Link>
            ))}

            <div className="mt-3 border-t border-slate-100 pt-3">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                Language
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => {
                  const isActive = lang.code === i18n.language;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => changeLang(lang.code)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[12.5px] transition-colors ${
                        isActive
                          ? "border-[#0f2942] bg-[#0f2942] text-white"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <img
                        src={lang.flag}
                        alt=""
                        className="h-4 w-6 shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/5"
                      />
                      <span className="font-khmer">{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;