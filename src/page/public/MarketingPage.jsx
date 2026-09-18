// src/page/public/MarketingPage.jsx
import { Link } from "react-router-dom";
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
import heroImage from "../../assets/image.png";

const KH = "font-[Kantumruy_Pro,Hanuman,Inter,sans-serif]";

const FEATURES = [
  {
    icon: Building2,
    title: "គ្រប់គ្រងអចលនទ្រព្យ និងបន្ទប់",
    description:
      "បង្កើតផ្ទះ វីឡា អាផាតមិន ខុនដូ និងបន្ទប់ ជាមួយមុខងារ សេវាកម្ម និងរូបភាពលម្អិត។",
  },
  {
    icon: Users,
    title: "អ្នកជួល និងកិច្ចសន្យាជួល",
    description:
      "គ្រប់គ្រងអ្នកជួល កិច្ចសន្យា ការអញ្ជើញ និងការប្រគល់សិទ្ធិចូលប្រើប្រាស់ដោយសុវត្ថិភាព។",
  },
  {
    icon: Receipt,
    title: "វិក្កយបត្រ និងទូទាត់",
    description:
      "ចេញវិក្កយបត្រប្រចាំខែ កត់ត្រាថ្លៃភ្លើង/ទឹក គណនា និងតាមដានការទូទាត់ទាំងអស់ក្នុងកន្លែងតែមួយ។",
  },
  {
    icon: BarChart3,
    title: "របាយការណ៍ចំណូល",
    description:
      "របាយការណ៍ចំណូល និងស្ថិតិតាមខែ តាមអចលនទ្រព្យ — ជួយសម្រេចចិត្តលើការគ្រប់គ្រងបានត្រឹមត្រូវ។",
  },
  {
    icon: Wrench,
    title: "សំណើជួសជុល (Maintenance)",
    description:
      "អ្នកជួលដាក់សំណើជួសជុល ហើយក្រុមគ្រប់គ្រងតាមដាន និងដោះស្រាយតាមប្រភេទ។",
  },
  {
    icon: Globe,
    title: "ផ្សាយបន្ទប់សម្រាប់ជួល",
    description:
      "ដាក់បន្ទប់ចូលបញ្ជីសាធារណៈ ជាមួយការពិនិត្យដោយក្រុមការងារមុនផ្សាយ ដើម្បីទាក់ទាញអ្នកជួល។",
  },
  {
    icon: ShieldCheck,
    title: "សុវត្ថិភាព និងសិទ្ធិច្បាស់លាស់",
    description:
      "គ្រប់គ្រងតួនាទី និងសិទ្ធិរបស់ម្ចាស់ អ្នកគ្រប់គ្រង និងអ្នកជួល ជាមួយការផ្ទៀងផ្ទាត់ពីរជំហាន។",
  },
  {
    icon: DoorOpen,
    title: "ទ្វារចូលអ្នកជួល",
    description:
      "អ្នកជួលអាចមើលរាល់ប្រវត្តិ វិក្កយបត្រ ការទូទាត់ និងដាក់សំណើបានដោយខ្លួនឯង។",
  },
];

const TESTIMONIAL_META = [1, 2, 3, 4, 5];

const MarketingPage = () => {
  const { testimonials, loading, error, refetch } = usePublicTestimonials();

  const hasTestimonials = testimonials.length > 0;
  const avgRating = hasTestimonials
    ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) /
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
              ប្រព័ន្ធគ្រប់គ្រងការជួលដ៏ទូលំទូលាយ
            </span>

            <h1 className="mt-5 text-[32px] font-extrabold leading-[1.4] tracking-tight text-[#0f2942] sm:text-[42px] lg:text-[46px]">
              គ្រប់គ្រងការជួលទាំងអស់របស់អ្នក
              <span className="text-gray-500"> ក្នុងប្រព័ន្ធតែមួយ</span>
            </h1>

            <p className="mt-5 text-[15px] leading-[1.9] text-gray-600">
              TeasJul ជួយម្ចាស់អចលនទ្រព្យ និងអ្នកគ្រប់គ្រង គ្រប់គ្រងបន្ទប់
              អ្នកជួល កិច្ចសន្យា វិក្កយបត្រ ទឹក/ភ្លើង ការជួសជុល
              និងការផ្សាយបន្ទប់សម្រាប់ជួល — ងាយស្រួល និងមានសុវត្ថិភាព។
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/public/register-business"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0f2942] px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-black"
              >
                ចាប់ផ្តើមជាមួយ TeasJul
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/public/rooms"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#0f2942] bg-transparent px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-gray-100"
              >
                រកបន្ទប់ជួល
              </Link>
            </div>

            {/* Trust row — semantic colors */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                គ្មានការចំណាយដំបូង
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                សុវត្ថិភាពពីរជំហាន
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4 text-amber-500" />
                គាំទ្រពេញ ២៤/៧
              </span>
            </div>
          </div>

          {/* ---------- Right: hero image ---------- */}
          <div className="relative flex items-center justify-center">
            {/* Soft glow behind image */}
            <div className="absolute -inset-8 rounded-3xl bg-[#0f2942]/5 blur-3xl" />

            <img
              src={heroImage}
              alt="TeasJul rental management"
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
              ចំណាត់ថ្នាក់មធ្យម
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
              មតិពីម្ចាស់អចលនទ្រព្យ
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
              បានផ្សាយបន្ទាប់ពីពិនិត្យ
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
              លក្ខណៈពិសេសរបស់ប្រព័ន្ធ
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-gray-500">
              អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវការសម្រាប់គ្រប់គ្រងអាជីវកម្មជួលតាំងពីដើមដល់ចប់។
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-[#0f2942]/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f2942]">
                    <Icon
                      className="h-5 w-5 text-white"
                      strokeWidth={1.75}
                    />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-semibold text-[#0f2942]">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.9] text-gray-600">
                    {f.description}
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
              មតិ និងចំណាត់ថ្នាក់ពីម្ចាស់អចលនទ្រព្យ
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-gray-500">
              មតិពិតដែលត្រូវបានត្រួតពិនិត្យ និងផ្សាយដោយក្រុមការងារ TeasJul
              (published after review by the admin team)។
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
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          ) : !hasTestimonials ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
              <Quote className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-[14px] font-medium text-[#0f2942]">
                មិនទាន់មានមតិទេ
              </p>
              <p className="mt-1 text-[12.5px] text-gray-500">
                មតិដែលបានផ្សាយដោយក្រុមការងារនឹងបង្ហាញនៅទីនេះ។
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
                  ផ្អែកលើមតិ {testimonials.length} ពីម្ចាស់អចលនទ្រព្យបានផ្សាយរួច
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t) => (
                  <figure
                    key={t.id}
                    className="relative flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-6 transition-colors hover:border-[#0f2942]/30"
                  >
                    <Quote
                      className="absolute right-5 top-5 h-8 w-8 text-gray-300"
                      aria-hidden="true"
                    />
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`ចំណាត់ថ្នាក់ ${t.rating}/5`}
                    >
                      {TESTIMONIAL_META.map((n) => (
                        <Star
                          key={n}
                          aria-hidden="true"
                          className={`h-4 w-4 ${
                            n <= t.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-[13.5px] leading-[1.9] text-gray-700">
                      “{t.comment}”
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-200 pt-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f2942] text-[13px] font-bold text-white">
                        {(t.ownerName || "ម្ចាស់").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#0f2942]">
                          {t.ownerName}
                        </p>
                        <p className="text-[11.5px] text-gray-400">
                          ម្ចាស់អចលនទ្រព្យ
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
              ចាប់ផ្តើមប្រើក្នុងបីជំហាន
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-gray-500">
              ដំណើរការសាមញ្ញ — ដោយក្រុមការងារ TeasJul ជួយអ្នករៀបចំ។
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "កំណត់គណនី",
                description:
                  "ក្រុមការងារជួយរៀបចំគណនីម្ចាស់ ឬអ្នកគ្រប់គ្រង។",
              },
              {
                title: "បន្ថែមអចលនទ្រព្យ",
                description: "ដាក់ផ្ទះ បន្ទប់ មុខងារ និងតម្លៃជួល។",
              },
              {
                title: "ផ្សាយ និងគ្រប់គ្រង",
                description: "ផ្សាយបន្ទប់ជួល និងគ្រប់គ្រងប្រចាំថ្ងៃ។",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6"
              >
                <span className="text-[36px] font-extrabold text-gray-200">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-[16px] font-bold text-[#0f2942]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.9] text-gray-600">
                  {step.description}
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
              ត្រៀមធ្វើឱ្យការគ្រប់គ្រងជួលកាន់តែងាយស្រួល?
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-[1.9] text-white/70">
              ទាក់ទងក្រុមការងារ ដើម្បីពិភាក្សា និងចាប់ផ្តើមប្រើប្រាស់ TeasJul។
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              to="/public/register-business"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-gray-100"
            >
              សម្រាប់ម្ចាស់អចលនទ្រព្យ
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/public/rooms"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <MonitorSmartphone className="h-4 w-4" />
              រកបន្ទប់ជួល
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default MarketingPage;