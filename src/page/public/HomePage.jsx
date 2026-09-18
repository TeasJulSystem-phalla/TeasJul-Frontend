// src/pages/public/HomePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Home,
  Hotel,
  Building2,
  DoorOpen,
  Building,
  ArrowRight,
  SearchX,
  RotateCcw,
  DollarSign,
  MessageCircle,
  BedDouble,
  Sparkles,
} from "lucide-react";
import PublicHeader from "../../components/public/PublicHeader";
import { publicRoomApi } from "../../api/public.api";
import { useAuthStore } from "../../store/auth.store";
import HomePropertyCard from "../../components/public/HomePropertyCard";

// Vite asset import
import heroImage from "../../assets/hero.png";

const PROPERTY_TYPES = [
  { type: "HOUSE", label: "ផ្ទះ", icon: Home },
  { type: "VILLA", label: "វីឡា", icon: Hotel },
  { type: "APARTMENT", label: "អាផាតមិន", icon: Building2 },
  { type: "CONDO", label: "ខុនដូ", icon: Building },
  { type: "ROOM", label: "បន្ទប់", icon: DoorOpen },
];

const WHY_FEATURES = [
  {
    icon: Building2,
    title: "បញ្ជីអចលនទ្រព្យសាធារណៈ",
    description:
      "រុករកផ្ទះ អាផាតមិន ខុនដូ វីឡា និងបន្ទប់ដែលមានស្រាប់ពីម្ចាស់អចលនទ្រព្យពិតប្រាកដ។",
  },
  {
    icon: DollarSign,
    title: "តម្លៃជួលច្បាស់លាស់",
    description:
      "មើលតម្លៃជួលប្រចាំខែ ប្រាក់កក់ និងថ្លៃផ្សេងៗជាមុន មុនពេលទាក់ទងអ្នកណាម្នាក់។",
  },
  {
    icon: MessageCircle,
    title: "ទាក់ទងម្ចាស់ដោយផ្ទាល់",
    description:
      "ទាក់ទងម្ចាស់ ឬអ្នកគ្រប់គ្រងអចលនទ្រព្យដោយផ្ទាល់ ដើម្បីសួរឬកក់ទុកមើលទីតាំង។",
  },
  {
    icon: BedDouble,
    title: "បន្ទប់ច្រើនអាចជ្រើសរើស",
    description:
      "ការផ្សាយជាច្រើនមានបន្ទប់ច្រើនក្នុងអចលនទ្រព្យតែមួយ ដែលធ្វើឱ្យជ្រើសរើសបានងាយស្រួល។",
  },
];

const HOW_STEPS = [
  {
    number: "01",
    title: "ស្វែងរក",
    description: "រកអចលនទ្រព្យដែលត្រូវនឹងតម្រូវការរបស់អ្នក។",
  },
  {
    number: "02",
    title: "ប្រៀបធៀប",
    description: "ពិនិត្យបន្ទប់ តម្លៃ សេវាកម្ម និងទីតាំង។",
  },
  {
    number: "03",
    title: "ទាក់ទង",
    description: "ទាក់ទងម្ចាស់អចលនទ្រព្យដោយផ្ទាល់។",
  },
];

const COPY = {
  badge: "ស្វែងរកបន្ទប់ អាផាតមិន ខុនដូ ផ្ទះ និងវីឡា",
  titleLine1: "ស្វែងរកកន្លែងដែល",
  titleLine2: "មានអារម្មណ៍ដូចផ្ទះ។",
  subtitle:
    "ស្វែងរកបន្ទប់ អាផាតមិន ខុនដូ ផ្ទះ និងវីឡា សម្រាប់និស្សិត កម្មករ និងគ្រួសារ។",
  keyword: "ពាក្យគន្លឹះ",
  keywordPlaceholder: "បន្ទប់ ផ្ទះ អាផាតមិន...",
  location: "ទីតាំង",
  locationPlaceholder: "ក្រុង ឬខេត្ត",
  propertyType: "ប្រភេទអចលនទ្រព្យ",
  allTypes: "គ្រប់ប្រភេទ",
  minPrice: "តម្លៃទាបបំផុត",
  maxPrice: "តម្លៃខ្ពស់បំផុត",
  search: "ស្វែងរក",
  popular: "ពេញនិយម៖",
  exploreByType: "រុករកតាមប្រភេទអចលនទ្រព្យ",
  exploreByTypeSub: "រកអចលនទ្រព្យដែលត្រូវនឹងតម្រូវការរបស់អ្នក",
  latestProperties: "អចលនទ្រព្យថ្មីៗ",
  latestPropertiesSub: "បញ្ជីអចលនទ្រព្យដែលទើបផ្សាយថ្មីៗ",
  viewAll: "មើលទាំងអស់",
  viewAllProperties: "មើលអចលនទ្រព្យទាំងអស់",
  noProperties: "មិនទាន់មានអចលនទ្រព្យទេ",
  noPropertiesSub: "អចលនទ្រព្យដែលផ្សាយរួចនឹងបង្ហាញនៅទីនេះ",
  browseRooms: "រុករកបន្ទប់",
  tryAgain: "ព្យាយាមម្តងទៀត",
  exploreByLocation: "រុករកតាមទីតាំង",
  exploreByLocationSub: "រុករកអចលនទ្រព្យនៅទីតាំងពេញនិយម",
  whyChoose: "ហេតុអ្វីជ្រើសរើស TeasJul?",
  whyChooseSub: "អ្វីៗគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីរកកន្លែងជួល",
  howItWorks: "របៀបប្រើ TeasJul",
  howItWorksSub: "រកកន្លែងជួលបន្ទាប់របស់អ្នកក្នុងបីជំហានសាមញ្ញ",
  ownerCtaTitle: "មានអចលនទ្រព្យចង់ជួល?",
  ownerCtaSub: "ផ្សាយអចលនទ្រព្យរបស់អ្នក និងទាក់ទងអ្នកជួលសក្តានុពល។",
  listProperty: "ផ្សាយអចលនទ្រព្យ",
  footerTagline:
    "វិធីសាមញ្ញ និងរហ័សដើម្បីរកអចលនទ្រព្យជួល បន្ទប់ ផ្ទះ និងអាផាតមិន។",
  footerExplore: "រុករក",
  footerProperties: "អចលនទ្រព្យ",
  footerRooms: "បន្ទប់",
  footerForOwners: "សម្រាប់ម្ចាស់",
  footerListProperty: "ផ្សាយអចលនទ្រព្យ",
  footerLogin: "ចូលប្រើ",
  footerSupport: "ជំនួយ",
  footerContact: "ទាក់ទង",
  footerFaq: "សំណួរញឹកញាប់",
  footerRights: "រក្សាសិទ្ធិគ្រប់បែបយ៉ាង។",
};

const KH = "font-[Kantumruy_Pro,Hanuman,Inter,sans-serif]";

const HomePage = () => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const t = COPY;

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
            "មិនអាចផ្ទុកអចលនទ្រព្យបានទេ។"
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
  }, [retryKey]);

  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (location.trim()) params.set("cityProvince", location.trim());
    if (propertyType) params.set("propertyType", propertyType);
    if (minPrice.trim()) params.set("minRent", minPrice.trim());
    if (maxPrice.trim()) params.set("maxRent", maxPrice.trim());
    const qs = params.toString();
    navigate(`/public/rooms${qs ? `?${qs}` : ""}`);
  };

  const startListing = () => {
    navigate(accessToken ? "/properties" : "/login");
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="relative flex min-h-screen flex-col">
        <PublicHeader active="home" />

        <section className="relative w-full overflow-hidden">
          {/* Background image */}
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />

          
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,30,55,0.55) 0%, rgba(10,30,55,0.25) 35%, rgba(10,30,55,0.55) 70%, rgba(10,30,55,0.85) 100%)",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,22,40,0.65) 0%, rgba(8,22,40,0.35) 45%, rgba(8,22,40,0.05) 75%, transparent 100%)",
            }}
          />

          {/* Content */}
          <div
            className={`relative mx-auto flex w-full max-w-[1400px] flex-col px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${KH}`}
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11.5px] font-medium text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3" />
                {t.badge}
              </span>

              <h1 className="mt-5 text-[32px] font-extrabold leading-[1.45] tracking-tight text-white sm:text-[42px] lg:text-[52px]">
                {t.titleLine1}
                <br className="hidden sm:block" />
                <span className="relative whitespace-nowrap">
                  {" "}
                  {t.titleLine2}
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-[#7dd3fc]/70"
                    viewBox="0 0 200 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 9.5C47 2 153 2 199 9.5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-[1.9] text-white/90">
                {t.subtitle}
              </p>
            </div>

            {/* Search panel */}
            <form
              onSubmit={submitSearch}
              aria-label="Search properties"
              className="mt-10 w-full"
            >
              <div className="rounded-2xl border border-white/20 bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.3fr_1fr_0.85fr_0.85fr_auto] lg:items-end">
                  <div>
                    <label
                      htmlFor="hero-search"
                      className="block text-[11.5px] font-medium text-slate-500"
                    >
                      {t.keyword}
                    </label>
                    <input
                      id="hero-search"
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder={t.keywordPlaceholder}
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-[#0f2942] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hero-location"
                      className="block text-[11.5px] font-medium text-slate-500"
                    >
                      {t.location}
                    </label>
                    <input
                      id="hero-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={t.locationPlaceholder}
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-[#0f2942] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hero-type"
                      className="block text-[11.5px] font-medium text-slate-500"
                    >
                      {t.propertyType}
                    </label>
                    <select
                      id="hero-type"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="mt-1.5 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[13.5px] font-medium text-slate-700 focus:border-[#0f2942] focus:outline-none"
                    >
                      <option value="">{t.allTypes}</option>
                      {PROPERTY_TYPES.map((pt) => (
                        <option key={pt.type} value={pt.type}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="hero-min"
                      className="block text-[11.5px] font-medium text-slate-500"
                    >
                      {t.minPrice}
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-slate-400">
                        $
                      </span>
                      <input
                        id="hero-min"
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-7 pr-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-[#0f2942] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="hero-max"
                      className="block text-[11.5px] font-medium text-slate-500"
                    >
                      {t.maxPrice}
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-slate-400">
                        $
                      </span>
                      <input
                        id="hero-max"
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="2000"
                        className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-7 pr-3 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-[#0f2942] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-md bg-[#0f2942] px-6 py-3 text-[13.5px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
                  >
                    <Search className="h-4 w-4" />
                    {t.search}
                  </button>
                </div>

                {locations.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <span className="text-[12px] text-slate-400">
                      {t.popular}
                    </span>
                    {locations.map((loc) => (
                      <Link
                        key={loc}
                        to={`/public/rooms?cityProvince=${encodeURIComponent(
                          loc
                        )}`}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-medium text-slate-600 transition-colors hover:border-[#0f2942] hover:text-[#0f2942]"
                      >
                        <MapPin className="h-3 w-3" />
                        {loc}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* ================= PROPERTY TYPES ================= */}
        <section className="w-full bg-[#fafaf8]">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8">
            <div className={`mb-6 ${KH}`}>
              <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
                {t.exploreByType}
              </h2>
              <p className="mt-1 text-[13px] text-slate-500">
                {t.exploreByTypeSub}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {PROPERTY_TYPES.map((pt) => {
                const Icon = pt.icon;
                return (
                  <Link
                    key={pt.type}
                    to={`/public/rooms?propertyType=${pt.type}`}
                    className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center transition-colors hover:border-[#0f2942]/40 hover:shadow-[0_8px_30px_rgb(15,41,66,0.08)]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0f7] transition-colors group-hover:bg-[#0f2942]">
                      <Icon
                        className="h-5 w-5 text-[#0f2942] transition-colors group-hover:text-white"
                        strokeWidth={1.75}
                      />
                    </span>
                    <span
                      className={`text-[14px] font-semibold text-[#0f2942] ${KH}`}
                    >
                      {pt.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= LATEST PROPERTIES ================= */}
        <section className="w-full bg-[#fafaf8]">
          <div className="mx-auto w-full max-w-[1400px] px-4 pb-14 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className={KH}>
                <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
                  {t.latestProperties}
                </h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  {t.latestPropertiesSub}
                </p>
              </div>
              <Link
                to="/public/rooms"
                className={`hidden items-center gap-1 text-[13px] font-medium text-[#0f2942] hover:underline sm:flex ${KH}`}
              >
                {t.viewAll}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {latestLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-[360px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="h-[170px] w-full shrink-0 animate-pulse bg-slate-200" />
                    <div className="flex flex-1 flex-col space-y-3 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="mt-auto h-9 w-full animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestError ? (
              <div
                className={`flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center ${KH}`}
              >
                <SearchX className="h-10 w-10 text-slate-300" />
                <p className="mt-3 max-w-sm text-[13.5px] leading-[1.9] text-slate-600">
                  {latestError}
                </p>
                <button
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="mt-4 flex items-center gap-2 rounded-md bg-[#0f2942] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.tryAgain}
                </button>
              </div>
            ) : latest.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center ${KH}`}
              >
                <Building2 className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-[14px] font-medium text-[#0f2942]">
                  {t.noProperties}
                </p>
                <p className="mt-1 text-[12.5px] text-slate-500">
                  {t.noPropertiesSub}
                </p>
                <Link
                  to="/public/rooms"
                  className="mt-4 flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-medium text-slate-700 transition-colors hover:border-[#0f2942] hover:text-[#0f2942]"
                >
                  {t.browseRooms}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {latest.map((room) => (
                    <HomePropertyCard key={room.id} room={room} />
                  ))}
                </div>
                <div className="mt-6 flex justify-center sm:hidden">
                  <Link
                    to="/public/rooms"
                    className={`flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-[#0f2942] hover:text-[#0f2942] ${KH}`}
                  >
                    {t.viewAllProperties}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ================= BROWSE BY LOCATION ================= */}
        {locations.length > 0 && (
          <section className="w-full bg-[#fafaf8]">
            <div className="mx-auto w-full max-w-[1400px] px-4 pb-14 sm:px-6 lg:px-8">
              <div className={`mb-6 ${KH}`}>
                <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
                  {t.exploreByLocation}
                </h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  {t.exploreByLocationSub}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {locations.map((loc) => (
                  <Link
                    key={loc}
                    to={`/public/rooms?cityProvince=${encodeURIComponent(loc)}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 transition-colors hover:border-[#0f2942]/40 hover:shadow-[0_4px_16px_rgb(15,41,66,0.08)]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0f7]">
                      <MapPin className="h-4 w-4 text-[#0f2942]" />
                    </span>
                    <span
                      className={`text-[13.5px] font-medium text-[#0f2942] ${KH}`}
                    >
                      {loc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= WHY TEASJUL ================= */}
        <section className="w-full bg-[#fafaf8]">
          <div className="mx-auto w-full max-w-[1400px] px-4 pb-14 sm:px-6 lg:px-8">
            <div className={`mb-6 ${KH}`}>
              <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
                {t.whyChoose}
              </h2>
              <p className="mt-1 text-[13px] text-slate-500">
                {t.whyChooseSub}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#0f2942]/30"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f0f7]">
                      <Icon
                        className="h-5 w-5 text-[#0f2942]"
                        strokeWidth={1.75}
                      />
                    </span>
                    <h3
                      className={`mt-4 text-[14.5px] font-semibold text-[#0f2942] ${KH}`}
                    >
                      {f.title}
                    </h3>
                    <p
                      className={`mt-1.5 text-[12.5px] leading-[1.9] text-slate-600 ${KH}`}
                    >
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="w-full bg-[#fafaf8]">
          <div className="mx-auto w-full max-w-[1400px] px-4 pb-14 sm:px-6 lg:px-8">
            <div className={`mb-6 ${KH}`}>
              <h2 className="text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
                {t.howItWorks}
              </h2>
              <p className="mt-1 text-[13px] text-slate-500">
                {t.howItWorksSub}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {HOW_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6"
                >
                  <span className="text-[36px] font-extrabold text-[#0f2942]/10">
                    {step.number}
                  </span>
                  <h3
                    className={`mt-2 text-[16px] font-bold text-[#0f2942] ${KH}`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`mt-2 text-[13px] leading-[1.9] text-slate-600 ${KH}`}
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= OWNER CTA ================= */}
        <section className="w-full bg-[#0f2942]">
          <div
            className={`mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-4 py-14 text-center sm:flex-row sm:px-6 sm:py-16 sm:text-left lg:px-8 ${KH}`}
          >
            <div className="flex-1">
              <h2 className="text-[24px] font-bold text-white sm:text-[28px]">
                {t.ownerCtaTitle}
              </h2>
              <p className="mt-2 max-w-lg text-[14px] leading-[1.9] text-white/70">
                {t.ownerCtaSub}
              </p>
            </div>
            <button
              onClick={startListing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-slate-100"
            >
              {t.listProperty}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className={`w-full border-t border-slate-200 bg-white ${KH}`}>
          <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 44 44" className="h-9 w-9" fill="none">
                    <path
                      d="M22 3 L25.5 18.5 L41 22 L25.5 25.5 L22 41 L18.5 25.5 L3 22 L18.5 18.5 Z"
                      fill="#0f2942"
                    />
                    <path
                      d="M22 12 L23.5 20.5 L32 22 L23.5 23.5 L22 32 L20.5 23.5 L12 22 L20.5 20.5 Z"
                      fill="#fff"
                    />
                  </svg>
                  <p className="text-[14px] font-bold text-[#0f2942]">
                    TeasJul
                  </p>
                </div>
                <p className="mt-4 max-w-[260px] text-[12.5px] leading-[1.9] text-slate-500">
                  {t.footerTagline}
                </p>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-[#0f2942]">
                  {t.footerExplore}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link
                      to="/public/rooms"
                      className="text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                    >
                      {t.footerProperties}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/public/rooms"
                      className="text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                    >
                      {t.footerRooms}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-[#0f2942]">
                  {t.footerForOwners}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <button
                      onClick={startListing}
                      className="text-left text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                    >
                      {t.footerListProperty}
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                    >
                      {t.footerLogin}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-[#0f2942]">
                  {t.footerSupport}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link
                      to="/public/about"
                      className="text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                    >
                      {t.footerContact}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/public/about"
                      className="text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                    >
                      {t.footerFaq}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-100 pt-6 text-center">
              <p className="text-[12px] text-slate-400">
                &copy; 2026 TeasJul. {t.footerRights}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;