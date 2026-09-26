// src/components/public/PublicFooter.jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import siteContact from "../../config/siteContact.js";
import { LANG_KH, LANG_EN, changeLanguage } from "../../i18n";

const PAGES = [
  { key: "home", to: "/" },
  { key: "allRooms", to: "/rooms" },
  { key: "whyTeasJul", to: "/marketing" },
  { key: "about", to: "/about" },
  { key: "contact", to: "/contact" },
];

const SUPPORT = ["faq", "privacy", "terms"];

const LANGS = [
  { code: LANG_EN, label: "EN" },
  { code: LANG_KH, label: "ខ្មែរ" },
];

const ContactRow = ({ icon: Icon, children }) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#e8f0f7]">
      <Icon className="h-3.5 w-3.5 text-[#0f2942]" strokeWidth={1.75} />
    </span>
    <span className="text-[12.5px] leading-[1.8] text-slate-600">{children}</span>
  </li>
);

const PublicFooter = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0f7]">
                <svg viewBox="0 0 44 44" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path
                    d="M22 3 L25.5 18.5 L41 22 L25.5 25.5 L22 41 L18.5 25.5 L3 22 L18.5 18.5 Z"
                    fill="#0f2942"
                  />
                  <path
                    d="M22 12 L23.5 20.5 L32 22 L23.5 23.5 L22 32 L20.5 23.5 L12 22 L20.5 20.5 Z"
                    fill="#fff"
                  />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="font-khmer text-[16px] font-bold text-[#0f2942]">
                  {t("footer.brandName")}
                </p>
                <p className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
                  {t("footer.brandSub")}
                </p>
              </div>
            </div>
            <p className="font-khmer mt-5 max-w-[280px] text-[13px] leading-[1.9] text-slate-500">
              {t("footer.tagline")}
            </p>

            {/* Language toggle */}
            <div
              className="mt-6 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5"
              role="group"
              aria-label={t("lang.label")}
            >
              {LANGS.map((lang) => {
                const active = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    aria-pressed={active}
                    className={`font-khmer rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                      active
                        ? "bg-[#0f2942] text-white"
                        : "text-slate-500 hover:text-[#0f2942]"
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-khmer text-[12px] font-semibold uppercase tracking-wider text-[#0f2942]">
              {t("footer.pages")}
            </h4>
            <ul className="mt-5 space-y-3">
              {PAGES.map((page) => (
                <li key={page.key}>
                  <Link
                    to={page.to}
                    className="font-khmer group inline-flex items-center gap-1 text-[13px] text-slate-500 transition-colors hover:text-[#0f2942]"
                  >
                    {t(`footer.${page.key}`)}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-khmer text-[12px] font-semibold uppercase tracking-wider text-[#0f2942]">
              {t("footer.support")}
            </h4>
            <ul className="mt-5 space-y-3">
              {SUPPORT.map((key) => (
                <li
                  key={key}
                  className="font-khmer text-[13px] text-slate-500 transition-colors hover:text-[#0f2942]"
                >
                  {t(`footer.${key}`)}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-khmer text-[12px] font-semibold uppercase tracking-wider text-[#0f2942]">
              {t("footer.contactTitle")}
            </h4>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={`mailto:${siteContact.email}`}
                  className="flex items-start gap-3 transition-colors hover:text-[#0f2942]"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#e8f0f7]">
                    <Mail className="h-3.5 w-3.5 text-[#0f2942]" strokeWidth={1.75} />
                  </span>
                  <span className="break-all text-[12.5px] leading-[1.8] text-slate-600">
                    {siteContact.email}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteContact.phone.replace(/\s/g, "")}`}
                  className="flex items-start gap-3 transition-colors hover:text-[#0f2942]"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#e8f0f7]">
                    <Phone className="h-3.5 w-3.5 text-[#0f2942]" strokeWidth={1.75} />
                  </span>
                  <span className="text-[12.5px] leading-[1.8] text-slate-600">
                    {siteContact.phone}
                  </span>
                </a>
              </li>
              <ContactRow icon={MapPin}>{t("footer.location")}</ContactRow>
              <ContactRow icon={Clock}>{t("footer.workingHours")}</ContactRow>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="font-khmer text-[12px] text-slate-400">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="font-khmer text-[12px] text-slate-400">
            {t("footer.location")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;