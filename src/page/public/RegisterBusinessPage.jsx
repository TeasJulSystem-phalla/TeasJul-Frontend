// src/page/public/RegisterBusinessPage.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Handshake,
  Calendar,
  Phone,
  Mail,
  Quote,
  Star,
} from "lucide-react";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import siteContact from "../../config/siteContact.js";
import { usePublicTestimonials } from "../../hooks/usePublicTestimonials.js";

const KH = "font-[Kantumruy_Pro,Hanuman,Inter,sans-serif]";

const BENEFITS = [
  { icon: Building2, key: "manage" },
  { icon: Users, key: "tenants" },
  { icon: Receipt, key: "invoices" },
  { icon: BarChart3, key: "reports" },
  { icon: FileText, key: "publish" },
  { icon: Handshake, key: "support" },
];

const ONBOARDING_STEPS = [
  { icon: Phone, key: "contact" },
  { icon: Calendar, key: "meet" },
  { icon: Sparkles, key: "setup" },
];

const RegisterBusinessPage = () => {
  const { t } = useTranslation();
  const { testimonials, loading, error, refetch } = usePublicTestimonials();

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <PublicHeader />

      {/* ================= HERO ================= */}
      <section className="relative w-full overflow-hidden bg-[#0f2942]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 380px at 15% -10%, rgba(125,211,252,0.18) 0%, transparent 55%), radial-gradient(800px 320px at 95% 120%, rgba(125,211,252,0.12) 0%, transparent 55%)",
          }}
        />
        <div
          className={`relative mx-auto flex w-full max-w-[1400px] flex-col px-4 py-20 sm:px-6 sm:py-24 lg:px-8 ${KH}`}
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11.5px] font-medium text-white backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              {t("register.badge")}
            </span>
            <h1 className="mt-5 text-[32px] font-extrabold leading-[1.4] tracking-tight text-white sm:text-[42px]">
              {t("register.title")}
              <span className="text-[#7dd3fc]"> {t("register.titleAccent")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.9] text-white/90">
              {t("register.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-slate-100"
              >
                {t("register.contactBtn")}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/rooms"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                {t("register.browseRoomsBtn")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENEFITS ================= */}
      <section className="w-full bg-[#fafaf8]">
        <div className={`mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 ${KH}`}>
          <div className="mb-8 max-w-2xl">
            <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
              {t("register.benefitsTitle")}
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-slate-500">
              {t("register.benefitsSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.key}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#0f2942]/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f0f7]">
                    <Icon className="h-5 w-5 text-[#0f2942]" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-semibold text-[#0f2942]">
                    {t(`register.benefits.${b.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.9] text-slate-600">
                    {t(`register.benefits.${b.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="w-full bg-[#fafaf8]">
        <div className={`mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8 ${KH}`}>
          <div className="mb-8 max-w-2xl">
            <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
              {t("register.howTitle")}
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-slate-500">
              {t("register.howSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ONBOARDING_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6"
                >
                  <span className="text-[36px] font-extrabold text-[#0f2942]/10">
                    0{i + 1}
                  </span>
                  <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f0f7]">
                    <Icon className="h-5 w-5 text-[#0f2942]" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-2 text-[16px] font-bold text-[#0f2942]">
                    {t(`register.how.${step.key}.title`)}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.9] text-slate-600">
                    {t(`register.how.${step.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="w-full bg-white">
        <div className={`mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 ${KH}`}>
          <div className="mb-8 max-w-2xl">
            <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
              {t("register.testiTitle")}
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-slate-500">
              {t("register.testiSub")}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-52 rounded-xl border border-slate-200 bg-white p-5">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-200" />
                  <div className="mt-6 h-3 w-32 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
              <p className="max-w-sm text-[13.5px] leading-[1.9] text-slate-600">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 flex items-center gap-2 rounded-md bg-[#0f2942] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
              >
                {t("common.tryAgain")}
              </button>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
              <Quote className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-[14px] font-medium text-[#0f2942]">
                {t("register.testiEmpty")}
              </p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                {t("register.testiEmptySub")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((tst) => (
                <figure
                  key={tst.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-[#fafaf8] p-6"
                >
                  <div
                    className="flex items-center gap-0.5"
                    aria-label={t("register.testiRating", { rating: tst.rating })}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        aria-hidden="true"
                        className={`h-4 w-4 ${
                          n <= tst.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[13.5px] leading-[1.9] text-slate-700">
                    “{tst.comment}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f2942] text-[13px] font-bold text-white">
                      {(tst.ownerName || t("register.testiOwner")).charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0f2942]">{tst.ownerName}</p>
                      <p className="text-[11.5px] text-slate-400">{t("register.testiOwner")}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="relative w-full overflow-hidden bg-[#0f2942]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 360px at 90% 0%, rgba(125,211,252,0.16) 0%, transparent 55%)",
          }}
        />
        <div className={`relative mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 ${KH}`}>
          <div className="max-w-2xl">
            <h2 className="text-[24px] font-bold text-white sm:text-[28px]">
              {t("register.ctaTitle")}
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-[1.9] text-white/70">
              {t("register.ctaSub")}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${siteContact.email}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-slate-100"
            >
              <Mail className="h-4 w-4" />
              {t("register.emailBtn")}
            </a>
            <a
              href="#contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
            >
              <Calendar className="h-4 w-4" />
              {t("register.scheduleBtn")}
            </a>
            <a
              href={`tel:${siteContact.phone.replace(/\s/g, "")}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
            >
              <Phone className="h-4 w-4" />
              {siteContact.phone}
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#7dd3fc]" />
              <div>
                <dt className="text-[11.5px] font-medium uppercase tracking-wider text-white/50">
                  {t("register.contactLabels.email")}
                </dt>
                <dd className="mt-0.5 text-[13.5px] font-medium text-white">{siteContact.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#7dd3fc]" />
              <div>
                <dt className="text-[11.5px] font-medium uppercase tracking-wider text-white/50">
                  {t("register.contactLabels.phone")}
                </dt>
                <dd className="mt-0.5 text-[13.5px] font-medium text-white">{siteContact.phone}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#7dd3fc]" />
              <div>
                <dt className="text-[11.5px] font-medium uppercase tracking-wider text-white/50">
                  {t("register.contactLabels.hours")}
                </dt>
                <dd className="mt-0.5 text-[13.5px] font-medium text-white">
                  {t("footer.workingHours")}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default RegisterBusinessPage;