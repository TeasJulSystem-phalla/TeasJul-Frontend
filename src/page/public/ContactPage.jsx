// src/page/public/ContactPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  Send,
  Building2,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ChevronDown,
  LifeBuoy,
  Headphones,
} from "lucide-react";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import siteContact from "../../config/siteContact.js";

const KH = "font-[Kantumruy_Pro,Hanuman,Inter,sans-serif]";

const CONTACT_CARDS = [
  { icon: Mail, key: "email", href: `mailto:${siteContact.email}` },
  { icon: Phone, key: "phone", href: `tel:${siteContact.phone.replace(/\s/g, "")}` },
  { icon: MapPin, key: "location" },
  { icon: Clock, key: "hours" },
];

const WHY_CONTACT = ["consult", "tech", "account", "partnership"];

const INPUT_CLASS =
  "khmer w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-[#0f2942] focus:outline-none focus:ring-2 focus:ring-[#0f2942]/20 transition-colors";

const inputClass = INPUT_CLASS;

const ContactPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const contactCardValue = (key) => {
    switch (key) {
      case "email":
        return siteContact.email;
      case "phone":
        return siteContact.phone;
      case "location":
        return t("footer.location");
      case "hours":
        return t("footer.workingHours");
      default:
        return "";
    }
  };

  const subjectOptions = [
    { value: "", label: t("contact.subjects.placeholder") },
    ...WHY_CONTACT.map((k) => ({
      value: t(`contact.subjects.${k}`),
      label: t(`contact.subjects.${k}`),
    })),
  ];

  const FAQS = [1, 2, 3, 4].map((n) => ({
    q: t(`contact.faqs.q${n}`),
    a: t(`contact.faqs.a${n}`),
  }));

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject =
      form.subject === t("contact.subjects.other")
        ? `[TeasJul] ${t("contact.otherMailSubject")}`
        : `[TeasJul] ${form.subject}`;
    const body = [
      `${t("contact.name")}: ${form.name}`,
      `${t("contact.email")}: ${form.email}`,
      form.phone ? `${t("contact.phone")}: ${form.phone}` : null,
      "",
      `${t("contact.message")}:`,
      form.message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${siteContact.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <PublicHeader active="contact" />

      {/* ================= HERO ================= */}
      <section className="relative w-full overflow-hidden bg-[#0f2942]">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 380px at 15% -10%, rgba(125,211,252,0.18) 0%, transparent 55%), radial-gradient(800px 320px at 95% 120%, rgba(125,211,252,0.12) 0%, transparent 55%)",
          }}
        />

        <div
          className={`relative mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${KH}`}
        >
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-1.5 text-[12.5px] text-white/60">
            <Link to="/" className="transition-colors hover:text-white">
              {t("contact.breadcrumbHome")}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-white/90">
              {t("contact.breadcrumbContact")}
            </span>
          </div>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-medium text-white/90">
              <LifeBuoy className="h-3 w-3" />
              {t("contact.heroBadge")}
            </span>
            <h1 className="mt-5 text-[32px] font-extrabold leading-[1.35] tracking-tight text-white sm:text-[42px]">
              {t("contact.heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.9] text-white/90">
              {t("contact.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${siteContact.email}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-slate-100"
              >
                <Mail className="h-4 w-4" />
                {t("contact.emailBtn")}
              </a>
              <Link
                to="/rooms"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {t("contact.viewRoomsBtn")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT INFO CARDS ================= */}
      <section className="w-full bg-[#fafaf8]">
        <div
          className={`mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16 ${KH}`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_CARDS.map((card) => {
              const Icon = card.icon;
              const inner = (
                <>
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0f2942]">
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0f2942]" />
                  </div>
                  <h2 className="mt-5 text-[11.5px] font-medium uppercase tracking-wider text-slate-400">
                    {t(`contact.cards.${card.key}.title`)}
                  </h2>
                  <p className="mt-1.5 break-words text-[15px] font-semibold text-[#0f2942]">
                    {contactCardValue(card.key)}
                  </p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {t(`contact.cards.${card.key}.note`)}
                  </p>
                </>
              );
              return card.href ? (
                <a
                  key={card.key}
                  href={card.href}
                  className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0f2942]/30 hover:shadow-md"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={card.key}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FORM + INFO SPLIT ================= */}
      <section className="w-full pb-16 sm:pb-20">
        <div
          className={`mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 ${KH}`}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* ---------- Form ---------- */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0f7] px-3 py-1 text-[11.5px] font-semibold text-[#0f2942]">
                <Send className="h-3.5 w-3.5" />
                {t("contact.formBadge")}
              </span>
              <h2 className="mt-4 text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
                {t("contact.formTitle")}
              </h2>
              <p className="mt-2 text-[13.5px] leading-[1.9] text-slate-500">
                {t("contact.formSub")}
              </p>

              {sent && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-[13px] leading-[1.8] text-emerald-800">
                    {t("contact.success")}
                  </p>
                </div>
              )}

              <form className="mt-7" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                      {t("contact.name")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={update("name")}
                      placeholder={t("contact.namePlaceholder")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                      {t("contact.email")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      placeholder={t("contact.emailPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                      {t("contact.phone")}{" "}
                      <span className="text-slate-400">{t("contact.phoneOptional")}</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder={t("contact.phonePlaceholder")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                      {t("contact.subject")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={update("subject")}
                      className={`${inputClass} ${form.subject ? "" : "text-slate-400"}`}
                    >
                      {subjectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                      {t("contact.message")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={update("message")}
                      placeholder={t("contact.messagePlaceholder")}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-slate-400">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {t("contact.formNote")}
                  </p>
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0f2942] px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1a3d5f]"
                  >
                    <Send className="h-4 w-4" />
                    {t("contact.send")}
                  </button>
                </div>
              </form>
            </div>

            {/* ---------- Info panel ---------- */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0f2942] p-6 sm:p-8 lg:col-span-2">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(500px 240px at 90% -5%, rgba(125,211,252,0.15) 0%, transparent 55%)",
                }}
              />
              <div className="relative">
                <h3 className="text-[18px] font-bold text-white sm:text-[20px]">
                  {t("contact.infoTitle")}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.9] text-white/70">
                  {t("contact.infoSub")}
                </p>

                <ul className="mt-6 space-y-3.5">
                  {WHY_CONTACT.map((k, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <CheckCircle2 className="h-3 w-3 text-emerald-300" strokeWidth={3} />
                      </span>
                      <span className="text-[13px] leading-[1.8] text-white/90">
                        {t(`contact.why.${k}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 space-y-3 border-t border-white/15 pt-6">
                  <a
                    href={`mailto:${siteContact.email}`}
                    className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 transition-colors hover:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                      <Mail className="h-4 w-4 text-white" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10.5px] uppercase tracking-wider text-white/50">
                        {t("contact.infoLabels.email")}
                      </p>
                      <p className="truncate text-[13px] font-medium text-white">{siteContact.email}</p>
                    </div>
                  </a>
                  <a
                    href={`tel:${siteContact.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 transition-colors hover:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                      <Headphones className="h-4 w-4 text-white" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10.5px] uppercase tracking-wider text-white/50">
                        {t("contact.infoLabels.phone")}
                      </p>
                      <p className="truncate text-[13px] font-medium text-white">{siteContact.phone}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                      <Clock className="h-4 w-4 text-white" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10.5px] uppercase tracking-wider text-white/50">
                        {t("contact.infoLabels.hours")}
                      </p>
                      <p className="text-[13px] font-medium text-white">
                        {t("footer.workingHours")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="w-full bg-white">
        <div
          className={`mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 ${KH}`}
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="text-[24px] font-bold text-[#0f2942] sm:text-[28px]">
                {t("contact.faqTitle")}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-[13px] leading-[1.9] text-slate-500">
                {t("contact.faqSub")}
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-xl border transition-colors ${
                      open ? "border-[#0f2942]/30 bg-[#fafaf8]" : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-[14px] font-semibold text-[#0f2942]">{faq.q}</span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f0f7] transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown className="h-3.5 w-3.5 text-[#0f2942]" />
                      </span>
                    </button>
                    {open && (
                      <p className="px-5 pb-5 text-[13px] leading-[1.9] text-slate-600">{faq.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative w-full overflow-hidden bg-[#0f2942]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 300px at 8% 0%, rgba(125,211,252,0.14) 0%, transparent 55%)",
          }}
        />
        <div
          className={`relative mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-4 py-16 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8 ${KH}`}
        >
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70">
              <Building2 className="h-4 w-4" />
              {t("contact.ctaEyebrow")}
            </span>
            <h2 className="mt-2 text-[24px] font-bold leading-[1.4] text-white sm:text-[28px]">
              {t("contact.ctaTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-[1.9] text-white/70">
              {t("contact.ctaSub")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
            <Link
              to="/register-business"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-slate-100"
            >
              {t("contact.ctaForOwners")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/rooms"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
              {t("contact.ctaViewRooms")}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;