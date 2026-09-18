// src/page/public/RegisterBusinessPage.jsx
import { Link } from "react-router-dom";
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
  {
    icon: Building2,
    title: "គ្រប់គ្រងអចលនទ្រព្យបង្រួម",
    description:
      "គ្រប់គ្រងផ្ទះ វីឡា អាផាតមិន និងបន្ទប់ទាំងអស់របស់អ្នកក្នុងកន្លែងតែមួយ — ការជួល មុខងារ និងស្ថានភាពនៃរាល់អចលនទ្រព្យ។",
  },
  {
    icon: Users,
    title: "អ្នកជួល និងកិច្ចសន្យារបស់អ្នក",
    description:
      "គ្រប់គ្រងទិន្នន័យអ្នកជួល កិច្ចសន្យាជួល ការអញ្ជើញ និងការផ្ទេរសិទ្ធិចូល — តាមដានយ៉ាងច្បាស់លាស់។",
  },
  {
    icon: Receipt,
    title: "វិក្កយបត្រ និងថ្លៃប្រើប្រាស់",
    description:
      "ចេញវិក្កយបត្រប្រចាំខែ កត់ត្រាអគ្គិសនី/ទឹក គណនាថ្លៃប្រើប្រាស់ និងតាមដានការទូទាត់ដោយស្វ័យប្រវត្តតាមបែបឌីជីថល។",
  },
  {
    icon: BarChart3,
    title: "របាយការណ៍ចំណូល",
    description:
      "ដឹងពីចំណូលជួលរបស់អ្នកក្នុងមួយខែ មួយដង និងតាមផ្ទះនីមួយៗ — ជួយធ្វើការសម្រេចចិត្តបានប្រសើរ។",
  },
  {
    icon: FileText,
    title: "ផ្សាយបន្ទប់សម្រាប់ជួល",
    description:
      "ដាក់បន្ទប់ទៅក្នុងបញ្ជីសាធារណៈ ដើម្បីឱ្យអ្នកស្វែងរកជួលឃើញ ជាមួយការពិនិត្យផ្សាយមុនចេញផ្សាយ។",
  },
  {
    icon: Handshake,
    title: "ការគាំទ្រដោយផ្ទាល់",
    description:
      "ក្រុមការងារ TeasJul ត្រៀមជួយអ្នកពីការរៀបចំគណនី ការដាក់បន្ទប់ រហូតដល់ការប្រើប្រាស់ប្រចាំថ្ងៃ។",
  },
];

const ONBOARDING_STEPS = [
  {
    icon: Phone,
    title: "ទាក់ទងយើង",
    description:
      "ទាក់ទងក្រុមការងារតាមទូរស័ព្ទ ឬអ៊ីមែល ដើម្បីប្រាប់ពីអចលនទ្រព្យរបស់អ្នក។",
  },
  {
    icon: Calendar,
    title: "ជួប និងពិភាក្សា",
    description:
      "យើងកំណត់ពេលជួប ស្វែងយល់ពីតម្រូវការរបស់អ្នក និងរៀបចំផែនការដាក់ឱ្យដំណើរការ។",
  },
  {
    icon: Sparkles,
    title: "រៀបចំ និងចាប់ផ្តើម",
    description:
      "ក្រុមការងារជួយរៀបចំគណនី អចលនទ្រព្យ និងបន្ទប់របស់អ្នក ឱ្យត្រៀមជួលភ្លាមៗ។",
  },
];

const RegisterBusinessPage = () => {
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
              សម្រាប់ម្ចាស់អចលនទ្រព្យ (For Property Owners)
            </span>
            <h1 className="mt-5 text-[32px] font-extrabold leading-[1.4] tracking-tight text-white sm:text-[42px]">
              គ្រប់គ្រងអាជីវកម្មជួលរបស់អ្នក
              <span className="text-[#7dd3fc]"> ជាមួយ TeasJul</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.9] text-white/90">
              ពីការគ្រប់គ្រងបន្ទប់ អ្នកជួល កិច្ចសន្យា វិក្កយបត្រ រហូតដល់របាយការណ៍ចំណូល —
              TeasJul ជួយប្រមូលផ្តុំអ្វីៗគ្រប់យ៉ាងក្នុងកន្លែងតែមួយ។
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-slate-100"
              >
                ទាក់ទងមកពួកយើង
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/public/rooms"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                មើលបញ្ជីបន្ទប់ជួល
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
              អត្ថប្រយោជន៍សម្រាប់ម្ចាស់អចលនទ្រព្យ
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-slate-500">
              អ្វីដែល TeasJul ផ្តល់ឱ្យម្ចាស់អាជីវកម្មជួល — ឧបករណ៍ប្រើប្រាស់ងាយស្រួលក្នុងការគ្រប់គ្រងប្រចាំថ្ងៃ។
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#0f2942]/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f0f7]">
                    <Icon className="h-5 w-5 text-[#0f2942]" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-semibold text-[#0f2942]">{b.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.9] text-slate-600">{b.description}</p>
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
              ចាប់ផ្តើមដោយរបៀបណា
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-slate-500">
              ដំណើរការសាមញ្ញ ដោយក្រុមការងារជួយរៀបចំឱ្យអ្នក។
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ONBOARDING_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6"
                >
                  <span className="text-[36px] font-extrabold text-[#0f2942]/10">
                    0{i + 1}
                  </span>
                  <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f0f7]">
                    <Icon className="h-5 w-5 text-[#0f2942]" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-2 text-[16px] font-bold text-[#0f2942]">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.9] text-slate-600">{step.description}</p>
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
              មតិពីម្ចាស់អចលនទ្រព្យ
            </h2>
            <p className="mt-1 text-[13.5px] leading-[1.9] text-slate-500">
              អ្វីដែលម្ចាស់អចលនទ្រព្យបានចែករំលែកពីបទពិសោធន៍ជាមួយ TeasJul។
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
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
              <Quote className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-[14px] font-medium text-[#0f2942]">
                មិនទាន់មានមតិទេ
              </p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                មតិពីម្ចាស់ដែលបានផ្សាយរួចនឹងបង្ហាញនៅទីនេះ។
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-[#fafaf8] p-6"
                >
                  <div className="flex items-center gap-0.5" aria-label={`ចំណាត់ថ្នាក់ ${t.rating}/5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        aria-hidden="true"
                        className={`h-4 w-4 ${
                          n <= t.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[13.5px] leading-[1.9] text-slate-700">
                    “{t.comment}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f2942] text-[13px] font-bold text-white">
                      {(t.ownerName || "ម្ចាស់").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0f2942]">{t.ownerName}</p>
                      <p className="text-[11.5px] text-slate-400">ម្ចាស់អចលនទ្រព្យ</p>
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
              ត្រៀមគ្រប់គ្រងអចលនទ្រព្យរបស់អ្នកជាមួយ TeasJul?
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-[1.9] text-white/70">
              ទាក់ទងក្រុមការងាររបស់យើងដើម្បីពិភាក្សា និងរៀបចំការចាប់ផ្តើម។
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${siteContact.email}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#0f2942] transition-colors hover:bg-slate-100"
            >
              <Mail className="h-4 w-4" />
              ទាក់ទងមកយើង
            </a>
            <a
              href="#contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
            >
              <Calendar className="h-4 w-4" />
              កំណត់ពេលជួប (Schedule a Meeting)
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
                <dt className="text-[11.5px] font-medium uppercase tracking-wider text-white/50">អ៊ីមែល</dt>
                <dd className="mt-0.5 text-[13.5px] font-medium text-white">{siteContact.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#7dd3fc]" />
              <div>
                <dt className="text-[11.5px] font-medium uppercase tracking-wider text-white/50">ទូរស័ព្ទ</dt>
                <dd className="mt-0.5 text-[13.5px] font-medium text-white">{siteContact.phone}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#7dd3fc]" />
              <div>
                <dt className="text-[11.5px] font-medium uppercase tracking-wider text-white/50">ម៉ោងបើក</dt>
                <dd className="mt-0.5 text-[13.5px] font-medium text-white">{siteContact.workingHours}</dd>
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