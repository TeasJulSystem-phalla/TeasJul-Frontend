// src/page/public/MarketingPage.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  Receipt,
  BarChart3,
  Wrench,
  Globe,
  ShieldCheck,
  Quote,
  Star,
  DoorOpen,
  MonitorSmartphone,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import { usePublicTestimonials } from "../../hooks/usePublicTestimonials.js";

// Import hero image
import heroImage from "../../assets/poster.png";

const KH = "font-[Kantumruy_Pro,Hanuman,Inter,sans-serif]";

const FEATURES = [
  { icon: Building2, key: "property" },
  { icon: Users, key: "tenants" },
  { icon: Receipt, key: "billing" },
  { icon: BarChart3, key: "reports" },
  { icon: Wrench, key: "maintenance" },
  { icon: Globe, key: "publish" },
  { icon: ShieldCheck, key: "security" },
  { icon: DoorOpen, key: "tenantData" },
];

const HOW_STEPS = ["account", "property", "manage"];

const TESTIMONIAL_META = [1, 2, 3, 4, 5];

const MarketingPage = () => {
  const { t } = useTranslation();
  const { testimonials, loading, error, refetch } = usePublicTestimonials();

  const hasTestimonials = testimonials.length > 0;
  const avgRating = hasTestimonials
    ? testimonials.reduce((sum, tst) => sum + (tst.rating || 0), 0) /
      testimonials.length
    : 0;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <PublicHeader active="marketing" />

      {/* ================= HERO ================= */}
      <section className="relative w-full overflow-hidden bg-white">
        {/* Subtle gray grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Soft gray glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 460px at 12% -10%, rgba(15,41,66,0.06) 0%, transparent 60%)",
          }}
        />

        <div
          className={`relative mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24 ${KH}`}
        >
          {/* ---------- Left: text ---------- */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-[11.5px] font-medium text-[#0f2942]">
              <Sparkles className="h-3 w-3" />
              {t("marketing.heroBadge")}
            </span>

            <h1 className="mt-5 text-[32px] font-extrabold leading-[1.4] tracking-tight text-[#0f2942] sm:text-[42px] lg:text-[46px]">
              {t("marketing.heroTitle1")}
              <span className="text-gray-500"> {t("marketing.heroTitleAccent")}</span>
            </h1>

            <p className="mt-5 text-[15px] leading-[1.9] text-gray-600">
              {t("marketing.heroSubtitle")}
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register-business"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0f2942] px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-black"
              >
                {t("marketing.startBtn")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/rooms"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#0f2942] bg-transparent px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-gray-100"
              >
                {t("marketing.findRoomBtn")}
              </Link>
            </div>

            {/* Trust row — semantic colors */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t("marketing.trust.noCost")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {t("marketing.trust.twoFactor")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4 text-amber-500" />
                {t("marketing.trust.support247")}
              </span>
            </div>
          </div>

          {/* ---------- Right: hero image ---------- */}
          <div className="relative flex items-center justify-center">
            {/* Soft glow behind image */}
            <div className="absolute -inset-8 rounded-3xl bg-[#0f2942]/5 blur-3xl" />

            <img
              src={heroImage}
              alt={t("marketing.heroImageAlt")}
              className="relative w-full max-w-[560px] rounded-2xl object-contain"
            />
          </div>
        </div>

        {/* Trust strip */}
       {hasTestimonials && (
  <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gray-800 ${KH}`}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 200px at 15% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* Avg rating */}
        <div className="flex items-center gap-4 px-6 py-6 sm:px-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </span>
          <div>
            <p className="text-[26px] font-bold leading-none text-white">
              {avgRating.toFixed(1)}
              <span className="ml-1 text-[14px] font-medium text-white/50">
                / 5
              </span>
            </p>
            <p className="mt-1.5 text-[12px] text-white/60">
              {t("marketing.strip.avgRating")}
            </p>
          </div>
        </div>

        {/* Review count */}
        <div className="flex items-center gap-4 px-6 py-6 sm:px-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Quote className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-[26px] font-bold leading-none text-white">
              {testimonials.length}
            </p>
            <p className="mt-1.5 text-[12px] text-white/60">
              {t("marketing.strip.reviews")}
            </p>
          </div>
        </div>

        {/* Published */}
        <div className="flex items-center gap-4 px-6 py-6 sm:px-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </span>
          <div>
            <p className="text-[26px] font-bold leading-none text-white">
              100%
            </p>
            <p className="mt-1.5 text-[12px] text-white/60">
              {t("marketing.strip.published")}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </section>

      {/* ================= FEATURES ================= */}
      <section className="w-full bg-[#fafaf8]">
        <div
          className={`mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 ${KH}`}
        >
          <div className="mb-8 max-w-2xl">
            <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
              {t("marketing.featuresTitle")}
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-gray-500">
              {t("marketing.featuresSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.key}
                  className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-[#0f2942]/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f2942]">
                    <Icon
                      className="h-5 w-5 text-white"
                      strokeWidth={1.75}
                    />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-semibold text-[#0f2942]">
                    {t(`marketing.features.${f.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.9] text-gray-600">
                    {t(`marketing.features.${f.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="w-full bg-white">
        <div
          className={`mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 ${KH}`}
        >
          <div className="mb-8 max-w-2xl">
            <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
              {t("marketing.testiTitle")}
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-gray-500">
              {t("marketing.testiSub")}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-xl border border-gray-200 bg-gray-50 p-6"
                >
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 h-3 w-full animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-gray-200" />
                  <div className="mt-6 h-3 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
              <p className="max-w-sm text-[13.5px] leading-[1.9] text-gray-600">
                {error}
              </p>
              <button
                onClick={refetch}
                className="mt-4 flex items-center gap-2 rounded-md bg-[#0f2942] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-black"
              >
                {t("common.tryAgain")}
              </button>
            </div>
          ) : !hasTestimonials ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
              <Quote className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-[14px] font-medium text-[#0f2942]">
                {t("marketing.testiEmpty")}
              </p>
              <p className="mt-1 text-[12.5px] text-gray-500">
                {t("marketing.testiEmptySub")}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                <span className="flex items-center gap-1.5">
                  {/* Amber star — universal rating color */}
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-[17px] font-bold text-[#0f2942]">
                    {avgRating.toFixed(1)}/5
                  </span>
                </span>
                <span className="h-4 w-px bg-gray-300" aria-hidden="true" />
                <span className="text-[13px] text-gray-600">
                  {t("marketing.testiBasedOn", { count: testimonials.length })}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((tst) => (
                  <figure
                    key={tst.id}
                    className="relative flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-6 transition-colors hover:border-[#0f2942]/30"
                  >
                    <Quote
                      className="absolute right-5 top-5 h-8 w-8 text-gray-300"
                      aria-hidden="true"
                    />
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={t("marketing.testiRating", { rating: tst.rating })}
                    >
                      {TESTIMONIAL_META.map((n) => (
                        <Star
                          key={n}
                          aria-hidden="true"
                          className={`h-4 w-4 ${
                            n <= tst.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-[13.5px] leading-[1.9] text-gray-700">
                      “{tst.comment}”
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-200 pt-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f2942] text-[13px] font-bold text-white">
                        {(tst.ownerName || t("marketing.testiOwner")).charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#0f2942]">
                          {tst.ownerName}
                        </p>
                        <p className="text-[11.5px] text-gray-400">
                          {t("marketing.testiOwner")}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="w-full bg-[#fafaf8]">
        <div
          className={`mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 ${KH}`}
        >
          <div className="mb-8 max-w-2xl">
            <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
              {t("marketing.howTitle")}
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-gray-500">
              {t("marketing.howSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_STEPS.map((key, i) => (
              <div
                key={key}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6"
              >
                <span className="text-[36px] font-extrabold text-gray-200">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-[16px] font-bold text-[#0f2942]">
                  {t(`marketing.how.${key}.title`)}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.9] text-gray-600">
                  {t(`marketing.how.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        id="cta"
        className="relative w-full overflow-hidden bg-[#0f2942]"
      >
        <div
          className={`mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-4 py-16 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8 ${KH}`}
        >
          <div className="flex-1">
            <h2 className="text-[24px] font-bold text-white sm:text-[28px]">
              {t("marketing.ctaTitle")}
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-[1.9] text-white/70">
              {t("marketing.ctaSub")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              to="/register-business"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-gray-100"
            >
              {t("marketing.ctaForOwners")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/rooms"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <MonitorSmartphone className="h-4 w-4" />
              {t("marketing.ctaFindRoom")}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default MarketingPage;