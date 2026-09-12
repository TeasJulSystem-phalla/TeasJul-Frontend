import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronDown,
  DoorOpen,
  FileText,
  HelpCircle,
  Home,
  Info,
  Mail,
  Phone,
  Search,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { Button, Card, EmptyState, Input } from '../components/ui/index.js';
import { SUPPORT_CONTACT, FAQS, QUICK_GUIDES } from '../data/helpData.js';
import { useSettings } from '../hooks/useSettings.js';

const GUIDE_ICONS = {
  home: Home,
  rooms: DoorOpen,
  tenants: Users,
  contracts: FileText,
  payments: Wallet,
  reports: BarChart3,
  maintenance: Wrench,
};

const normalize = (value) => String(value || '').toLocaleLowerCase();

const includesSearch = (item, searchTerm) =>
  [item.title, item.description, item.category, item.question, item.answer, ...(item.keywords || [])]
    .some((value) => normalize(value).includes(searchTerm));

const QuickGuideCard = ({ guide, onClick }) => {
  const Icon = GUIDE_ICONS[guide.icon] || HelpCircle;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-36 w-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/20"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="mt-4 flex items-center justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold text-slate-800 dark:text-white">{guide.title}</span>
          <span className="mt-1 block text-[13px] leading-5 text-slate-500 dark:text-slate-400">{guide.description}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200" aria-hidden="true" />
      </span>
    </button>
  );
};

const FAQAccordion = ({ faq, isOpen, onToggle }) => {
  const contentId = `faq-answer-${faq.id}`;

  return (
    <div className="border-b border-slate-100 last:border-b-0 dark:border-gray-800">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <span>
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{faq.category}</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-white">{faq.question}</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div id={contentId} className="pb-4 pr-9 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {faq.answer}
        </div>
      )}
    </div>
  );
};

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqId, setOpenFaqId] = useState(null);

  const query = normalize(searchTerm.trim());
  const filteredGuides = useMemo(
    () => (query ? QUICK_GUIDES.filter((guide) => includesSearch(guide, query)) : QUICK_GUIDES),
    [query]
  );
  const filteredFaqs = useMemo(
    () => (query ? FAQS.filter((faq) => includesSearch(faq, query)) : FAQS),
    [query]
  );

  const isManager = location.pathname.startsWith('/manager');
  const assistantPath = isManager ? '/manager/assistant' : '/assistant';
  const guidePath = (route) => {
    if (isManager) {
      const managerRoutes = {
        properties: '/manager/properties',
        rooms: '/manager/rooms',
        tenants: '/manager/tenants',
        contracts: '/manager/contracts',
        payments: '/manager/finance/payments',
        reports: '/manager/reports',
        maintenance: '/manager/maintenance',
      };
      return managerRoutes[route];
    }

    const ownerRoutes = {
      properties: '/properties',
      rooms: '/rooms',
      tenants: '/tenants',
      contracts: '/contracts',
      payments: '/finance/payments',
      reports: '/owner-report',
      maintenance: '/maintenance',
    };
    return ownerRoutes[route];
  };

  const supportEmail = (settings?.email || SUPPORT_CONTACT.email || '').trim();
  const supportPhone = (settings?.phone || SUPPORT_CONTACT.phone || '').trim();
  const hasResults = filteredGuides.length > 0 || filteredFaqs.length > 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300">
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">ជំនួយ និងការគាំទ្រ</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            ស្វែងរកចម្លើយ និងស្វែងយល់ពីរបៀបប្រើប្រាស់ប្រព័ន្ធ TeasJul
          </p>
        </div>
      </header>

      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 dark:bg-gray-800/50">
          <Input
            label="ស្វែងរកជំនួយ"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ស្វែងរកជំនួយ..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </Card>

      {query && !hasResults ? (
        <Card>
          <EmptyState
            icon={Search}
            title="រកមិនឃើញលទ្ធផល"
            description="សាកល្បងស្វែងរកដោយប្រើពាក្យផ្សេងទៀត"
          />
        </Card>
      ) : (
        <>
          {filteredGuides.length > 0 && (
            <section aria-labelledby="quick-guides-title">
              <div className="mb-4">
                <h2 id="quick-guides-title" className="text-base font-semibold text-slate-800 dark:text-white">មគ្គុទេសក៍រហ័ស</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ចូលទៅកាន់ផ្នែកដែលអ្នកត្រូវការជំនួយ។</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredGuides.map((guide) => (
                  <QuickGuideCard key={guide.id} guide={guide} onClick={() => navigate(guidePath(guide.route))} />
                ))}
              </div>
            </section>
          )}

          {filteredFaqs.length > 0 && (
            <section aria-labelledby="faq-title">
              <div className="mb-4">
                <h2 id="faq-title" className="text-base font-semibold text-slate-800 dark:text-white">សំណួរដែលសួរញឹកញាប់</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ចម្លើយសម្រាប់ការប្រើប្រាស់ប្រព័ន្ធប្រចាំថ្ងៃ។</p>
              </div>
              <Card className="px-6">
                {filteredFaqs.map((faq) => (
                  <FAQAccordion
                    key={faq.id}
                    faq={faq}
                    isOpen={openFaqId === faq.id}
                    onToggle={() => setOpenFaqId((current) => (current === faq.id ? null : faq.id))}
                  />
                ))}
              </Card>
            </section>
          )}
        </>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-6 text-white dark:border-gray-700 dark:bg-gray-800" aria-labelledby="assistant-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="assistant-title" className="text-base font-semibold">ត្រូវការជំនួយបន្ថែម?</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">
                សួរ AI Assistant ដើម្បីទទួលបានជំនួយទាក់ទងនឹងការគ្រប់គ្រងផ្ទះ បន្ទប់ អ្នកជួល ការទូទាត់ និងរបាយការណ៍។
              </p>
            </div>
          </div>
          <Button variant="secondary" className="shrink-0 bg-white text-slate-900 hover:bg-slate-100" leftIcon={<Bot className="h-4 w-4" />} onClick={() => navigate(assistantPath)}>
            សួរ AI Assistant
          </Button>
        </div>
      </section>

      <section aria-labelledby="contact-support-title">
        <Card title="ទាក់ទងក្រុមគាំទ្រ" description="ប្រសិនបើអ្នកមិនអាចរកចម្លើយដែលត្រូវការ សូមទាក់ទងក្រុមគាំទ្រ។">
          {supportEmail || supportPhone ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-700 dark:text-slate-200 dark:hover:bg-gray-800">
                  <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  {supportEmail}
                </a>
              )}
              {supportPhone && (
                <a href={`tel:${supportPhone}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-700 dark:text-slate-200 dark:hover:bg-gray-800">
                  <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  {supportPhone}
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-gray-800/60 dark:text-slate-400">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>ព័ត៌មានទំនាក់ទំនងក្រុមគាំទ្រមិនទាន់បានកំណត់នៅឡើយទេ។ អ្នកគ្រប់គ្រងអាចកំណត់លេខទូរស័ព្ទ ឬអ៊ីមែលអាជីវកម្មនៅក្នុងការកំណត់។</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
