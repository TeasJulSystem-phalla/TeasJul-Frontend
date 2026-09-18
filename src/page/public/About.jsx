// src/page/About.jsx
import {
  ChevronRight,
  Target,
  Eye,
  Heart,
  Users,
  Building2,
  TrendingUp,
  Shield,
  Sparkles,
  Home,
  CheckCircle2,
} from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';

const stats = [
  { value: '12,000+', label: 'អ្នកប្រើប្រាស់សកម្ម' },
  { value: '3,500+', label: 'អចលនទ្រព្យ' },
  { value: '25', label: 'ខេត្ត-ក្រុង' },
  { value: '4.9', label: 'ការវាយតម្លៃ' },
];

const values = [
  {
    icon: Shield,
    title: 'ភាពជឿជាក់',
    description:
      'យើងផ្ទៀងផ្ទាត់រាល់អចលនទ្រព្យ និងម្ចាស់ផ្ទះ ដើម្បីធានាថាលោកអ្នកទទួលបានព័ត៌មានត្រឹមត្រូវ។',
  },
  {
    icon: Users,
    title: 'តម្លាភាព',
    description:
      'គ្មានកម្រៃលាក់កំបាំង គ្មានការភាន់ច្រឡំ។ តម្លៃ និងលក្ខខណ្ឌត្រូវបានបង្ហាញច្បាស់លាស់។',
  },
  {
    icon: Heart,
    title: 'ការយកចិត្តទុកដាក់',
    description:
      'យើងដាក់អ្នកប្រើប្រាស់ជាចំបង។ ក្រុមការងាររបស់យើងត្រៀមខ្លួនជួយលោកអ្នកគ្រប់ពេល។',
  },
  {
    icon: Sparkles,
    title: 'នវានុវត្តន៍',
    description:
      'យើងអភិវឌ្ឍបច្ចេកវិទ្យាថ្មីៗ ដើម្បីធ្វើឱ្យការស្វែងរកផ្ទះកាន់តែងាយស្រួល និងរហ័ស។',
  },
];

const timeline = [
  {
    year: '2019',
    title: 'ការចាប់ផ្តើម',
    description:
      'គម្រោងចាប់ផ្តើមឡើងដោយក្រុមអ្នកសហគ្រិនវ័យក្មេង 3 នាក់ ដែលមានចក្ខុវិស័យធ្វើឱ្យការជួលផ្ទះកាន់តែងាយស្រួល។',
  },
  {
    year: '2020',
    title: 'ការបើកដំណើរការផ្លូវការ',
    description:
      'គេហទំព័រត្រូវបានបើកដំណើរការជាផ្លូវការ ជាមួយអចលនទ្រព្យជាង 500 នៅភ្នំពេញ។',
  },
  {
    year: '2022',
    title: 'ការពង្រីកខេត្ត',
    description:
      'ពង្រីកសេវាកម្មទៅខេត្តសៀមរាប បាត់ដំបង និងក្រុងព្រះសីហនុ ជាមួយអ្នកប្រើប្រាស់ជាង 5,000។',
  },
  {
    year: '2024',
    title: 'ការរីកចម្រើន',
    description:
      'បម្រើអ្នកប្រើប្រាស់ជាង 12,000 នាក់ និងអចលនទ្រព្យជាង 3,500 នៅទូទាំងប្រទេស។',
  },
];

const team = [
  { name: 'សុខ ដារា', role: 'សហស្ថាបនិក & CEO' },
  { name: 'ចាន់ សុភា', role: 'សហស្ថាបនិក & CTO' },
  { name: 'លី មុនី', role: 'ប្រធានផ្នែកប្រតិបត្តិការ' },
  { name: 'ហេង ស្រីនី', role: 'ប្រធានផ្នែកទីផ្សារ' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15,41,66,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,41,66,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative">
        <PublicHeader active="about" />

        {/* ================= HERO ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-1.5 text-[12px] text-slate-500">
              <a href="#" className="khmer hover:text-[#0f2942]">
                ទំព័រដើម
              </a>
              <ChevronRight className="h-3 w-3" />
              <span className="khmer font-medium text-slate-700">អំពីយើង</span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h1 className="khmer text-[30px] font-bold leading-tight text-[#0f2942] sm:text-[40px] lg:text-[46px]">
                  យើងជួយលោកអ្នក<br />
                  ស្វែងរកផ្ទះដ៏ល្អបំផុត
                </h1>
                <p className="khmer mt-4 max-w-xl text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
                  ស្វែងរកផ្ទះ (Rooms) គឺជាវេទិកាឈានមុខគេក្នុងការជួយមនុស្សរាប់ពាន់នាក់
                  ស្វែងរកអចលនទ្រព្យជួលនៅទូទាំងប្រទេសកម្ពុជា។
                  យើងភ្ជាប់ម្ចាស់ផ្ទះជាមួយអ្នកជួលតាមរយៈបច្ចេកវិទ្យាទំនើប និងសេវាកម្មដែលអាចទុកចិត្តបាន។
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#"
                    className="khmer rounded-md bg-[#0f2942] px-5 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3d5f]"
                  >
                    ស្វែងរកផ្ទះ
                  </a>
                  <a
                    href="#"
                    className="khmer rounded-md border border-slate-300 bg-white px-5 py-3 text-[13px] font-medium text-[#0f2942] transition-colors hover:border-[#0f2942]"
                  >
                    ទាក់ទងយើង
                  </a>
                </div>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                    alt="Our team"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-4 -left-4 hidden rounded-lg border border-slate-200 bg-white p-4 sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0f2942]">
                      <TrendingUp className="h-5 w-5 text-white" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="khmer text-[16px] font-bold text-[#0f2942]">
                        +250%
                      </p>
                      <p className="khmer text-[11px] text-slate-500">
                        ការរីកចម្រើន / ឆ្នាំ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-slate-200 bg-white p-5 text-center sm:p-6"
                >
                  <p className="khmer text-[24px] font-bold text-[#0f2942] sm:text-[28px]">
                    {stat.value}
                  </p>
                  <p className="khmer mt-1 text-[12px] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= MISSION & VISION ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Mission */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0f2942]">
                  <Target className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="khmer mt-4 text-[18px] font-bold text-[#0f2942] sm:text-[20px]">
                  បេសកកម្ម
                </h3>
                <p className="khmer mt-3 text-[13.5px] leading-relaxed text-slate-600">
                  ធ្វើឱ្យការស្វែងរកផ្ទះជួលក្នុងប្រទេសកម្ពុជាកាន់តែងាយស្រួល តម្លាភាព
                  និងគួរឱ្យទុកចិត្តសម្រាប់មនុស្សគ្រប់រូប។ យើងខិតខំបង្កើតបទពិសោធន៍
                  ដែលអ្នកជួល និងម្ចាស់ផ្ទះអាចទំនាក់ទំនងគ្នាបានយ៉ាងរលូន។
                </p>
              </div>

              {/* Vision */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0f2942]">
                  <Eye className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="khmer mt-4 text-[18px] font-bold text-[#0f2942] sm:text-[20px]">
                  ចក្ខុវិស័យ
                </h3>
                <p className="khmer mt-3 text-[13.5px] leading-relaxed text-slate-600">
                  ក្លាយជាវេទិកាអចលនទ្រព្យជួលឈានមុខគេនៅកម្ពុជា និងអាស៊ីអាគ្នេយ៍
                  ដែលមនុស្សរាប់លាននាក់អាចស្វែងរកផ្ទះជួលដ៏ល្អបំផុត
                  តាមរយៈបច្ចេកវិទ្យាទំនើប និងសេវាកម្មដែលអាចទុកចិត្តបាន។
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= VALUES ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
            <div className="mb-8 text-center">
              <h2 className="khmer text-[24px] font-bold text-[#0f2942] sm:text-[28px]">
                គុណតម្លៃរបស់យើង
              </h2>
              <p className="khmer mx-auto mt-2 max-w-xl text-[13px] text-slate-500">
                គោលការណ៍ដែលដឹកនាំរាល់សកម្មភាពរបស់យើង
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-[#0f2942]/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e8f0f7]">
                      <Icon className="h-5 w-5 text-[#0f2942]" strokeWidth={1.75} />
                    </div>
                    <h3 className="khmer mt-4 text-[14.5px] font-semibold text-[#0f2942]">
                      {value.title}
                    </h3>
                    <p className="khmer mt-2 text-[12.5px] leading-relaxed text-slate-600">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= TIMELINE ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
            <div className="mb-8 text-center">
              <h2 className="khmer text-[24px] font-bold text-[#0f2942] sm:text-[28px]">
                ដំណើររបស់យើង
              </h2>
              <p className="khmer mx-auto mt-2 max-w-xl text-[13px] text-slate-500">
                គន្លឹះសំខាន់ៗក្នុងការអភិវឌ្ឍន៍របស់យើង
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="relative space-y-6 border-l-2 border-slate-200 pl-6">
                {timeline.map((item) => (
                  <div key={item.year} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0f2942] bg-white">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#0f2942]" />
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5">
                      <div className="flex items-center gap-3">
                        <span className="khmer rounded bg-[#e8f0f7] px-2.5 py-1 text-[11.5px] font-semibold text-[#0f2942]">
                          {item.year}
                        </span>
                        <h3 className="khmer text-[14.5px] font-semibold text-[#0f2942]">
                          {item.title}
                        </h3>
                      </div>
                      <p className="khmer mt-2 text-[12.5px] leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= TEAM ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
            <div className="mb-8 text-center">
              <h2 className="khmer text-[24px] font-bold text-[#0f2942] sm:text-[28px]">
                ក្រុមការងាររបស់យើង
              </h2>
              <p className="khmer mx-auto mt-2 max-w-xl text-[13px] text-slate-500">
                មនុស្សដែលនៅពីក្រោយគ្រប់ជោគជ័យ
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#0f2942]/30"
                >
                  {/* Avatar placeholder with initials */}
                  <div className="flex aspect-square items-center justify-center bg-[#e8f0f7]">
                    <span className="khmer text-[28px] font-bold text-[#0f2942]">
                      {member.name.split(' ')[0].charAt(0)}
                      {member.name.split(' ')[1]?.charAt(0)}
                    </span>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="khmer text-[13.5px] font-semibold text-[#0f2942]">
                      {member.name}
                    </h3>
                    <p className="khmer mt-0.5 text-[11.5px] text-slate-500">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= WHY US ================= */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 sm:p-8 lg:p-10">
                  <h2 className="khmer text-[22px] font-bold text-[#0f2942] sm:text-[26px]">
                    ហេតុអ្វីជ្រើសរើសយើង?
                  </h2>
                  <p className="khmer mt-2 text-[13px] text-slate-500">
                    អ្វីដែលធ្វើឱ្យយើងខុសពីអ្នកដទៃ
                  </p>

                  <ul className="mt-6 space-y-4">
                    {[
                      {
                        title: 'អចលនទ្រព្យផ្ទៀងផ្ទាត់',
                        desc: 'រាល់ការផ្សាយត្រូវបានពិនិត្យដោយក្រុមការងារ',
                      },
                      {
                        title: 'ស្វែងរកឆ្លាតវៃ',
                        desc: 'តម្រងជាក់លាក់តាមតម្លៃ ទីតាំង និងលក្ខណៈពិសេស',
                      },
                      {
                        title: 'គាំទ្រ 24/7',
                        desc: 'ក្រុមការងារជួយលោកអ្នកគ្រប់ពេល',
                      },
                      {
                        title: 'ឥតគិតថ្លៃ',
                        desc: 'គ្មានកម្រៃសម្រាប់អ្នកជួល',
                      },
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0f2942]">
                          <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                        <div>
                          <p className="khmer text-[13.5px] font-medium text-[#0f2942]">
                            {item.title}
                          </p>
                          <p className="khmer mt-0.5 text-[12.5px] text-slate-600">
                            {item.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Side panel */}
                <div className="bg-[#0f2942] p-6 sm:p-8 lg:p-10">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="khmer text-[18px] font-bold text-white sm:text-[20px]">
                        ចាប់ផ្តើមជាមួយយើងថ្ងៃនេះ
                      </h3>
                      <p className="khmer mt-3 text-[13px] leading-relaxed text-white/70">
                        ស្វែងរកផ្ទះជួលដ៏ល្អបំផុតសម្រាប់អ្នក
                        ឬដាក់ផ្សាយអចលនទ្រព្យរបស់អ្នកជាមួយយើងឥតគិតថ្លៃ។
                      </p>
                    </div>

                    <div className="mt-8 space-y-2.5">
                      <a
                        href="#"
                        className="khmer flex items-center justify-center gap-2 rounded-md bg-white py-3 text-[13px] font-medium text-[#0f2942] transition-colors hover:bg-slate-100"
                      >
                        <Home className="h-4 w-4" />
                        ស្វែងរកផ្ទះជួល
                      </a>
                      <a
                        href="#"
                        className="khmer flex items-center justify-center gap-2 rounded-md border border-white/20 py-3 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
                      >
                        <Building2 className="h-4 w-4" />
                        ដាក់ផ្សាយអចលនទ្រព្យ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
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
                  <div className="leading-tight">
                    <p className="khmer text-[13px] font-bold text-[#0f2942]">
                      ស្វែងរកផ្ទះ
                    </p>
                    <p className="text-[10px] font-medium text-slate-500">Rooms</p>
                  </div>
                </div>
                <p className="khmer mt-4 text-[12.5px] leading-relaxed text-slate-500">
                  ការប្រើប្រាស់ដ៏ងាយស្រួល និងរហ័សសម្រាប់ស្វែងរកការជួលផ្ទះនៅកម្ពុជា។
                </p>
              </div>

              <div>
                <h4 className="khmer text-[13px] font-semibold text-[#0f2942]">
                  ទំព័រ
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {['អំពីយើង', 'ជួលផ្ទះ', 'ជួលបន្ទប់', 'ទំនាក់ទំនង'].map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="khmer text-[13px] font-semibold text-[#0f2942]">
                  ជំនួយ
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {['សំណួរញឹកញាប់', 'គោលការណ៍', 'លក្ខខណ្ឌ'].map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="khmer text-[12.5px] text-slate-500 hover:text-[#0f2942]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="khmer text-[13px] font-semibold text-[#0f2942]">
                  ទំនាក់ទំនង
                </h4>
                <ul className="mt-4 space-y-2.5 text-[12.5px] text-slate-500">
                  <li className="khmer">+855 12 345 678</li>
                  <li className="khmer">hello@rooms.kh</li>
                  <li className="khmer">ភ្នំពេញ, កម្ពុជា</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-100 pt-6">
              <p className="khmer text-center text-[12px] text-slate-400">
                © 2025 ស្វែងរកផ្ទះ. រក្សាសិទ្ធិទាំងអស់។
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap');
        .khmer { font-family: 'Kantumruy Pro', sans-serif; }
        html, body { margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default About;