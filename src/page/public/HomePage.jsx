// src/pages/public/HomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  MapPin,
  Home,
  Hotel,
  Building2,
  DoorOpen,
  Building,
  ArrowRight,
  ArrowUpRight,
  SearchX,
  RotateCcw,
  DollarSign,
  MessageCircle,
  BedDouble,
  ShieldCheck,
  Key,
  ChevronDown,
} from "lucide-react";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import { RoomCard, SkeletonCard } from "../../components/room/RoomCard";
import { publicRoomApi } from "../../api/public.api";
import { useAuthStore } from "../../store/auth.store";

import heroCity from "../../assets/image.jpg";

const PROPERTY_TYPES = [
  { type: "HOUSE", icon: Home },
  { type: "VILLA", icon: Hotel },
  { type: "APARTMENT", icon: Building2 },
  { type: "CONDO", icon: Building },
  { type: "ROOM", icon: DoorOpen },
];

const WHY_FEATURES = [
  { icon: Building2, key: "publicListings" },
  { icon: DollarSign, key: "clearPricing" },
  { icon: MessageCircle, key: "directContact" },
  { icon: BedDouble, key: "multiRooms" },
];

const KH = "font-[Kantumruy_Pro,Hanuman,Inter,sans-serif]";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const [latest, setLatest] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLatestLoading(true);
    setLatestError(null);

    Promise.allSettled([
      publicRoomApi.listRooms({ size: 6, sort: "NEWEST" }),
      publicRoomApi.listRooms({ size: 40, sort: "NEWEST" }),
    ]).then(([latestResult, locationsResult]) => {
      if (cancelled) return;

      if (latestResult.status === "fulfilled") {
        setLatest(latestResult.value?.content || []);
      } else {
        setLatestError(
          latestResult.reason?.response?.data?.message ||
            latestResult.reason?.message ||
            t("home.loadError")
        );
      }

      if (locationsResult.status === "fulfilled") {
        const seen = new Set();
        const distinct = [];
        for (const item of locationsResult.value?.content || []) {
          const city = item.cityProvince?.trim();
          if (city && !seen.has(city)) {
            seen.add(city);
            distinct.push(city);
          }
          if (distinct.length >= 6) break;
        }
        setLocations(distinct);
      }

      setLatestLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [retryKey, t]);

  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("cityProvince", location.trim());
    if (propertyType) params.set("propertyType", propertyType);
    if (budget.trim()) {
      const [min, max] = budget
        .split("-")
        .map((s) => s.trim().replace("$", ""));
      if (min) params.set("minRent", min);
      if (max) params.set("maxRent", max);
    }
    const qs = params.toString();
    navigate(`/rooms${qs ? `?${qs}` : ""}`);
  };

  const startListing = () => {
    navigate(accessToken ? "/dashboard" : "/login");
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <PublicHeader active="home" />
      <section className="relative w-full">
        <div className="relative h-[78vh] min-h-[620px] w-full overflow-hidden">
          <img
            src={heroCity}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />

          <div
            className={`relative z-10 mx-auto flex h-full w-full max-w-[1240px] flex-col justify-center px-6 sm:px-10 lg:px-16 ${KH}`}
          >
            <h1 className="max-w-[680px] text-[36px] font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)] sm:text-[48px] lg:text-[60px]">
              {t("home.heroTitle1")}
              <br />
              {t("home.heroTitle2")}
            </h1>

            <p className="mt-5 max-w-[540px] text-[13.5px] leading-[1.75] text-white/85 sm:text-[15px]">
              {t("home.heroSubtitle")}
            </p>

            <form onSubmit={submitSearch} className="mt-9 w-full max-w-[920px]">
              <div className="rounded-[22px] bg-white p-2.5 shadow-[0_30px_80px_-25px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                  {/* Location */}
                  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-3.5 transition-colors hover:bg-slate-100">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <MapPin className="h-4 w-4 text-[#0f2942]" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${KH}`}
                      >
                        {t("home.searchLocation")}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={t("home.searchLocationPlaceholder")}
                          className={`w-full border-0 bg-transparent text-[13.5px] font-semibold text-[#0f2942] placeholder:font-normal placeholder:text-slate-300 focus:outline-none ${KH}`}
                        />
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-3.5 transition-colors hover:bg-slate-100">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Home className="h-4 w-4 text-[#0f2942]" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${KH}`}
                      >
                        {t("home.searchType")}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className={`w-full cursor-pointer appearance-none border-0 bg-transparent text-[13.5px] font-semibold text-[#0f2942] focus:outline-none ${KH}`}
                        >
                          <option value="">{t("home.searchTypePlaceholder")}</option>
                          {PROPERTY_TYPES.map((pt) => (
                            <option key={pt.type} value={pt.type}>
                              {t(`propertyType.${pt.type}`)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-3.5 transition-colors hover:bg-slate-100">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <DollarSign className="h-4 w-4 text-[#0f2942]" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${KH}`}
                      >
                        {t("home.searchBudget")}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder={t("home.searchBudgetPlaceholder")}
                          className={`w-full border-0 bg-transparent text-[13.5px] font-semibold text-[#0f2942] placeholder:font-normal placeholder:text-slate-300 focus:outline-none ${KH}`}
                        />
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#0f2942] px-8 py-4 text-[13.5px] font-semibold text-white transition-all hover:bg-sky-500 hover:shadow-lg ${KH}`}
                  >
                    <Search className="h-4 w-4" />
                    <span>{t("home.searchButton")}</span>
                  </button>
                </div>
              </div>

              {locations.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className={`text-[11.5px] text-white/60 ${KH}`}>
                    {t("home.popular")}
                  </span>
                  {locations.slice(0, 5).map((loc) => (
                    <Link
                      key={loc}
                      to={`/rooms?cityProvince=${encodeURIComponent(loc)}`}
                      className={`inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 ${KH}`}
                    >
                      <MapPin className="h-3 w-3" />
                      {loc}
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
      <section className="w-full border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
          <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className={KH}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f2942]/50">
                {t("home.eyebrowCategories")}
              </span>
              <h2 className="mt-2 text-[26px] font-bold leading-[1.1] tracking-tight text-[#0f2942] sm:text-[32px]">
                {t("home.exploreByType")}
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-[1.7] text-slate-500">
                {t("home.exploreByTypeSub")}
              </p>
            </div>

            <Link
              to="/rooms"
              className={`group inline-flex shrink-0 items-center gap-2 text-[13px] font-medium text-[#0f2942] ${KH}`}
            >
              {t("common.viewAll")}
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 transition-colors group-hover:border-[#0f2942] group-hover:bg-[#0f2942] group-hover:text-white">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {PROPERTY_TYPES.map((pt, i) => {
              const Icon = pt.icon;
              const num = String(i + 1).padStart(2, "0");
              return (
                <Link
                  key={pt.type}
                  to={`/rooms?propertyType=${pt.type}`}
                  className="group flex items-center gap-5 py-4 transition-colors hover:bg-slate-50 sm:gap-8"
                >
                  <span className="shrink-0 text-[18px] font-black leading-none text-slate-300 transition-colors group-hover:text-[#0f2942] sm:text-[22px]">
                    {num}
                  </span>

                  <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white sm:flex">
                    <Icon
                      className="h-4 w-4 text-[#0f2942]"
                      strokeWidth={1.75}
                    />
                  </span>

                  <h3
                    className={`flex-1 text-[16px] font-bold text-[#0f2942] sm:text-[18px] ${KH}`}
                  >
                    {t(`propertyType.${pt.type}`)}
                  </h3>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors group-hover:border-[#0f2942] group-hover:bg-[#0f2942] group-hover:text-white">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="w-full bg-[#fafaf8]">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div className={KH}>
              <h2 className="text-[24px] font-bold text-[#0f2942] sm:text-[30px]">
                {t("home.latestTitle")}
              </h2>
              <p className="mt-1.5 text-[13px] text-slate-500">
                {t("home.latestSub")}
              </p>
            </div>
            <Link
              to="/rooms"
              className={`hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-[#0f2942] transition-all hover:gap-2.5 sm:flex ${KH}`}
            >
              {t("common.viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latestLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} view="grid" />
              ))}
            </div>
          ) : latestError ? (
            <div
              className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center ${KH}`}
            >
              <SearchX className="h-10 w-10 text-slate-300" />
              <p className="mt-3 max-w-sm text-[13.5px] leading-[1.9] text-slate-600">
                {latestError}
              </p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="mt-5 flex items-center gap-2 rounded-lg bg-[#0f2942] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("common.tryAgain")}
              </button>
            </div>
          ) : latest.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center ${KH}`}
            >
              <Building2 className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-[14px] font-medium text-[#0f2942]">
                {t("home.noProperties")}
              </p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                {t("home.noPropertiesSub")}
              </p>
              <Link
                to="/rooms"
                className="mt-5 flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-medium text-slate-700 transition-colors hover:border-[#0f2942] hover:text-[#0f2942]"
              >
                {t("home.browseRooms")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((room) => (
                  <Link
                    key={room.id}
                    to={`/rooms/${room.id}`}
                    className="block"
                  >
                    <RoomCard room={room} view="grid" />
                  </Link>
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <Link
                  to="/rooms"
                  className={`inline-flex items-center gap-2 rounded-full border border-[#0f2942] px-6 py-3 text-[13px] font-medium text-[#0f2942] transition-all hover:bg-[#0f2942] hover:text-white ${KH}`}
                >
                  {t("common.viewAllProperties")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      
      <section className="w-full border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div className={`lg:sticky lg:top-24 lg:self-start ${KH}`}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f2942]/50">
                {t("home.eyebrowWhy")}
              </span>
              <h2 className="mt-3 text-[28px] font-bold leading-tight text-[#0f2942] sm:text-[36px]">
                {t("home.whyTitle")}
              </h2>
              <p className="mt-4 text-[13.5px] leading-[1.95] text-slate-500">
                {t("home.whySub")}
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {WHY_FEATURES.map((f, i) => {
                const num = String(i + 1).padStart(2, "0");
                return (
                  <div
                    key={f.key}
                    className="group flex items-start gap-6 py-8 first:pt-0 last:pb-0"
                  >
                    <span className="shrink-0 pt-1 text-[36px] font-black leading-none text-slate-200 transition-colors group-hover:text-[#0f2942] sm:text-[44px]">
                      {num}
                    </span>
                    <div className="flex-1">
                      <h3
                        className={`text-[17px] font-bold text-[#0f2942] sm:text-[19px] ${KH}`}
                      >
                        {t(`home.whyFeatures.${f.key}.title`)}
                      </h3>
                      <p
                        className={`mt-2 max-w-xl text-[13.5px] leading-[1.95] text-slate-600 ${KH}`}
                      >
                        {t(`home.whyFeatures.${f.key}.description`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA — Owner listing
      ============================================================ */}
      {/* ============================================================
    CTA — Owner listing
============================================================ */}
<section className="w-full bg-[#fafaf8] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
  <div className="mx-auto w-full max-w-[1240px]">
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT — text + button */}
      <div className={`flex flex-col justify-center px-8 py-14 sm:px-12 sm:py-16 lg:px-14 lg:py-20 ${KH}`}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f2942]/50">
          {t("home.ownerEyebrow")}
        </span>

        <h2 className="mt-3 text-[28px] font-bold leading-[1.15] tracking-tight text-[#0f2942] sm:text-[36px] lg:text-[40px]">
          {t("home.ownerTitle")}
        </h2>

        <p className="mt-4 max-w-md text-[14px] leading-[1.8] text-slate-500 sm:text-[15px]">
          {t("home.ownerSub")}
        </p>

        <div className="mt-8">
          <button
            onClick={startListing}
            className={`group inline-flex items-center gap-3 rounded-full bg-[#0f2942] px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-sky-500 ${KH}`}
          >
            {t("home.listProperty")}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      </div>

      {/* RIGHT — visual panel */}
      <div className="relative min-h-[280px] bg-[#0f2942] lg:min-h-full">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Soft sky glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 70% 30%, rgba(56,189,248,0.35) 0%, transparent 60%)",
          }}
        />

        {/* Content inside panel */}
        <div className={`relative z-10 flex h-full flex-col justify-center px-8 py-14 sm:px-12 sm:py-16 ${KH}`}>
          <div className="space-y-5">
            {[
              { icon: ShieldCheck, text: t("home.ownerPerks.freeListing") },
              { icon: MessageCircle, text: t("home.ownerPerks.directTalent") },
              { icon: Key, text: t("home.ownerPerks.easyManage") },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.08]">
                    <Icon className="h-4 w-4 text-sky-300" strokeWidth={1.75} />
                  </span>
                  <p className="text-[13.5px] font-medium text-white/90">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Big numbers below */}
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
            <div>
              <p className="text-[26px] font-bold text-white">2,000+</p>
              <p className="mt-1 text-[11.5px] text-white/50">
                {t("home.statListings")}
              </p>
            </div>
            <div>
              <p className="text-[26px] font-bold text-white">500+</p>
              <p className="mt-1 text-[11.5px] text-white/50">
                {t("home.statOwners")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <PublicFooter />
    </div>
  );
};

export default HomePage;