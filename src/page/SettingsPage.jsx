import { useState, useEffect, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import { useSettings } from "../hooks/useSettings";
import { useThemeSettings } from "../hooks/useThemeSettings";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Switch from "../components/ui/Switch";
import Tabs from "../components/ui/Tabs";
import Spinner from "../components/ui/Spinner";
import {
  Settings,
  Palette,
  FileText,
  Receipt,
  FileSignature,
  CreditCard,
  Send,
  Save,
  RotateCcw,
  Building2,
  Globe,
  Hash,
  Clock,
  Mail,
  Phone,
  MapPin,
  Type,
  Eye,
  EyeOff,
  SunMoon,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

const PRESET_COLORS = [
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#16A34A" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Orange", value: "#EA580C" },
  { name: "Red", value: "#DC2626" },
];

const THEME_MODE_OPTIONS = [
  { value: "LIGHT", label: "Light", desc: "ភ្លឺ", icon: Sun },
  { value: "DARK", label: "Dark", desc: "ងងឹត", icon: Moon },
  { value: "SYSTEM", label: "System", desc: "ប្រព័ន្ធ (ផ្ទៃស)", icon: Monitor },
];

const TABS = [
  { value: "general", label: "ទូទៅ (General)", icon: Settings },
  { value: "appearance", label: "រូបរាង (Appearance)", icon: SunMoon },
  { value: "branding", label: "ម៉ាក (Branding)", icon: Palette },
  { value: "documents", label: "ឯកសារ (Documents)", icon: FileText },
  { value: "invoice", label: "វិក្កយបត្រ (Invoice)", icon: Receipt },
  { value: "contract", label: "កិច្ចសន្យា (Contract)", icon: FileSignature },
  { value: "receipt", label: "បង្កាន់ដៃ (Receipt)", icon: CreditCard },
  { value: "telegram", label: "Telegram", icon: Send },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "KHR", label: "KHR (៛)" },
  { value: "BOTH", label: "Both (USD + KHR)" },
];

const DISPLAY_CURRENCY_OPTIONS = [
  { value: "USD", label: "USD Only" },
  { value: "KHR", label: "KHR Only" },
  { value: "BOTH", label: "Both" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Phnom_Penh", label: "Asia/Phnom_Penh (GMT+7)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (GMT+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "UTC", label: "UTC (GMT+0)" },
];

const LANGUAGE_OPTIONS = [
  { value: "KM", label: "ខ្មែរ (Khmer)" },
  { value: "EN", label: "English" },
  { value: "BOTH", label: "Both (KM + EN)" },
];

export default function SettingsPage() {
  const { settings, loading, saving, error, saveSettings, DEFAULT_SETTINGS } = useSettings();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings && !loading) {
      setForm(settings);
    }
  }, [settings, loading]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }, []);

  const handleNumberChange = useCallback((field, value) => {
    const num = value === "" ? "" : Number(value);
    setForm((prev) => ({ ...prev, [field]: num }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    try {
      const saved = await saveSettings(form);
      setDirty(false);
      window.dispatchEvent(new CustomEvent('rentalhub:settings-updated', { detail: saved }));
      toast.success("រក្សាទុកជោគជ័យ", "ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ");
    } catch {
      toast.error("បរាជ័យ", "មិនអាចរក្សាទុកការកំណត់បានទេ");
    }
  };

  const handleReset = () => {
    setForm(settings);
    setDirty(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ការកំណត់ (Settings)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងការកំណត់អាជីវកម្ម និងការកំណត់ឯកសាររបស់អ្នក
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <Button variant="ghost" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={handleReset}>
              បោះបង់
            </Button>
          )}
          <Button
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={saving}
            disabled={!dirty || saving}
          >
            រក្សាទុក
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-slate-200 px-4 dark:border-gray-700">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <GeneralSection form={form} onChange={handleChange} onNumberChange={handleNumberChange} />
          )}
          {activeTab === "appearance" && (
            <AppearanceSection />
          )}
          {activeTab === "branding" && (
            <BrandingSection form={form} onChange={handleChange} />
          )}
          {activeTab === "documents" && (
            <DocumentSection form={form} onChange={handleChange} />
          )}
          {activeTab === "invoice" && (
            <InvoiceSection form={form} onChange={handleChange} onNumberChange={handleNumberChange} />
          )}
          {activeTab === "contract" && (
            <ContractSection form={form} onChange={handleChange} />
          )}
          {activeTab === "receipt" && (
            <ReceiptSection form={form} onChange={handleChange} />
          )}
          {activeTab === "telegram" && (
            <TelegramSection form={form} onChange={handleChange} />
          )}
        </div>
      </div>

      {dirty && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={saving}
            className="shadow-lg"
          >
            រក្សាទុកការកំណត់
          </Button>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function GeneralSection({ form, onChange, onNumberChange }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Globe} title="ការកំណត់ទូទៅ" subtitle="រូបិយប័ណ្ណ អត្រាប្តូរប្រាក់ និងការកំណត់ទូទៅ" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Select
          label="រូបិយប័ណ្ណមូលដ្ឋាន (Base Currency)"
          options={CURRENCY_OPTIONS}
          value={form.baseCurrency}
          onChange={(e) => onChange("baseCurrency", e.target.value)}
        />
        <Select
          label="រូបិយប័ណ្ណបង្ហាញ (Display Currency)"
          options={DISPLAY_CURRENCY_OPTIONS}
          value={form.displayCurrency}
          onChange={(e) => onChange("displayCurrency", e.target.value)}
        />
        <Input
          label="អត្រាប្តូរប្រាក់ (Exchange Rate)"
          type="number"
          value={form.exchangeRate}
          onChange={(e) => onNumberChange("exchangeRate", e.target.value)}
          helperText="ឧ. 1 USD = 4100 KHR"
          leftIcon={<Hash className="h-4 w-4" />}
        />
        <Select
          label="ទម្រង់កាលបរិច្ឆេទ (Date Format)"
          options={DATE_FORMAT_OPTIONS}
          value={form.dateFormat}
          onChange={(e) => onChange("dateFormat", e.target.value)}
        />
        <Select
          label="តំបន់ពេលវេលា (Timezone)"
          options={TIMEZONE_OPTIONS}
          value={form.timezone}
          onChange={(e) => onChange("timezone", e.target.value)}
        />
      </div>

      {form.displayCurrency !== "USD" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>ឧទាហរណ៍:</strong> $100 × {form.exchangeRate || 4100} ={" "}
            {new Intl.NumberFormat("km-KH").format(
              Math.round((Number(form.exchangeRate) || 4100) * 100)
            )}
            ៛
          </p>
        </div>
      )}
    </div>
  );
}

function BrandingSection({ form, onChange }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Palette} title="ម៉ាកអាជីវកម្ម" subtitle="ព័ត៌មានអាជីវកម្ម និងរូបភាព" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="ឈ្មោះអាជីវកម្ម (Business Name)"
          value={form.businessName}
          onChange={(e) => onChange("businessName", e.target.value)}
          placeholder="ឧ. RentalHub"
          leftIcon={<Building2 className="h-4 w-4" />}
        />
        <Input
          label="URL ឡូហ្គោ (Logo URL)"
          value={form.logoUrl}
          onChange={(e) => onChange("logoUrl", e.target.value)}
          placeholder="https://example.com/logo.png"
          leftIcon={<Type className="h-4 w-4" />}
        />
        <Input
          label="ទូរស័ព្ទ (Phone)"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="012 345 678"
          leftIcon={<Phone className="h-4 w-4" />}
        />
        <Input
          label="អ៊ីមែល (Email)"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="info@business.com"
          leftIcon={<Mail className="h-4 w-4" />}
        />
        <div className="md:col-span-2">
          <Input
            label="អាស័យដ្ឋាន (Address)"
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="រាជធានីភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា"
            leftIcon={<MapPin className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            ពណ៌សំខាន់ (Primary Color)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primaryColor || "#3b82f6"}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-slate-300 dark:border-gray-600"
            />
            <Input
              value={form.primaryColor || "#3b82f6"}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            ពណ៌ទីពីរ (Secondary Color)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.secondaryColor || "#10b981"}
              onChange={(e) => onChange("secondaryColor", e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-slate-300 dark:border-gray-600"
            />
            <Input
              value={form.secondaryColor || "#10b981"}
              onChange={(e) => onChange("secondaryColor", e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentSection({ form, onChange }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={FileText} title="ការកំណត់ឯកសារ" subtitle="ភាសាលំនាំដើមសម្រាប់ឯកសារទាំងអស់" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Select
          label="ភាសាឯកសារ (Document Language)"
          options={LANGUAGE_OPTIONS}
          value={form.documentLanguage}
          onChange={(e) => onChange("documentLanguage", e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ការកំណត់ភាសានេះនឹងត្រូវបានប្រើប្រាស់សម្រាប់ឯកសារទាំងអស់។
          អ្នកក៏អាចកំណត់ភាសាដាច់ដោយឡែកសម្រាប់វិក្កយបត្រ កិច្ចសន្យា និងបង្កាន់ដៃក្នុងផ្នែកនីមួយៗ។
        </p>
      </div>
    </div>
  );
}

function InvoiceSection({ form, onChange, onNumberChange }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Receipt} title="ការកំណត់វិក្កយបត្រ" subtitle="ទម្រង់ និងការកំណត់សម្រាប់វិក្កយបត្រ" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="កូដវិក្កយបត្រ (Invoice Prefix)"
          value={form.invoicePrefix}
          onChange={(e) => onChange("invoicePrefix", e.target.value)}
          placeholder="INV"
          leftIcon={<Hash className="h-4 w-4" />}
        />
        <Input
          label="ថ្ងៃផុតកំណត់លំនាំដើម (Default Due Days)"
          type="number"
          value={form.invoiceDefaultDueDays}
          onChange={(e) => onNumberChange("invoiceDefaultDueDays", e.target.value)}
          leftIcon={<Clock className="h-4 w-4" />}
        />
        <div className="md:col-span-2">
          <Textarea
            label="អត្ថបទបាត (Footer Text)"
            value={form.invoiceFooter}
            onChange={(e) => onChange("invoiceFooter", e.target.value)}
            placeholder="សូមទូទាត់ត្រឹមថ្ងៃកំណត់..."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">ជម្រើសបង្ហាញ</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Switch
            checked={form.invoiceShowUsd}
            onChange={(e) => onChange("invoiceShowUsd", e.target.checked)}
            label="បង្ហាញ USD"
          />
          <Switch
            checked={form.invoiceShowKhr}
            onChange={(e) => onChange("invoiceShowKhr", e.target.checked)}
            label="បង្ហាញ KHR"
          />
          <Switch
            checked={form.invoiceShowLogo}
            onChange={(e) => onChange("invoiceShowLogo", e.target.checked)}
            label="បង្ហាញឡូហ្គោ"
          />
          <Switch
            checked={form.invoiceShowBusinessInfo}
            onChange={(e) => onChange("invoiceShowBusinessInfo", e.target.checked)}
            label="បង្ហាញព័ត៌មានអាជីវកម្ម"
          />
        </div>
      </div>
    </div>
  );
}

function ContractSection({ form, onChange }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={FileSignature} title="ការកំណត់កិច្ចសន្យា" subtitle="លក្ខខណ្ឌ និងទម្រង់កិច្ចសន្យា" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="ចំណងជើងកិច្ចសន្យា (Contract Title)"
          value={form.contractTitle}
          onChange={(e) => onChange("contractTitle", e.target.value)}
          placeholder="កិច្ចសន្យាជួលផ្ទះ"
        />
        <Select
          label="ភាសាកិច្ចសន្យា (Contract Language)"
          options={LANGUAGE_OPTIONS}
          value={form.contractLanguage}
          onChange={(e) => onChange("contractLanguage", e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Textarea
          label="លក្ខខណ្ឌទូទាត់ (Payment Terms)"
          value={form.contractPaymentTerms}
          onChange={(e) => onChange("contractPaymentTerms", e.target.value)}
          placeholder="អ្នកជួលត្រូវបង់ថ្លៃជួលជាមុននៅដើមខែ..."
          rows={3}
        />
        <Textarea
          label="លក្ខខណ្ឌប្រាក់កក់ (Deposit Terms)"
          value={form.contractDepositTerms}
          onChange={(e) => onChange("contractDepositTerms", e.target.value)}
          placeholder="ប្រាក់កក់ត្រូវបានសងនៅចុងកិច្ចសន្យា..."
          rows={3}
        />
        <Textarea
          label="លក្ខខណ្ឌបញ្ចប់ (Termination Terms)"
          value={form.contractTerminationTerms}
          onChange={(e) => onChange("contractTerminationTerms", e.target.value)}
          placeholder="ភាគីណាមួយអាចបញ្ចប់កិច្ចសន្យាជាមុន..."
          rows={3}
        />
        <Textarea
          label="លក្ខខណ្ឌបន្ថែម (Additional Terms)"
          value={form.contractAdditionalTerms}
          onChange={(e) => onChange("contractAdditionalTerms", e.target.value)}
          placeholder="លក្ខខណ្ឌបន្ថែមផ្សេងៗ..."
          rows={3}
        />
      </div>
    </div>
  );
}

function ReceiptSection({ form, onChange }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={CreditCard} title="ការកំណត់បង្កាន់ដៃ" subtitle="ទម្រង់ និងការកំណត់សម្រាប់បង្កាន់ដៃ" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="កូដបង្កាន់ដៃ (Receipt Prefix)"
          value={form.receiptPrefix}
          onChange={(e) => onChange("receiptPrefix", e.target.value)}
          placeholder="RCP"
          leftIcon={<Hash className="h-4 w-4" />}
        />
        <Select
          label="ភាសាបង្កាន់ដៃ (Receipt Language)"
          options={LANGUAGE_OPTIONS}
          value={form.receiptLanguage}
          onChange={(e) => onChange("receiptLanguage", e.target.value)}
        />
        <div className="md:col-span-2">
          <Textarea
            label="អត្ថបទបាត (Footer Text)"
            value={form.receiptFooter}
            onChange={(e) => onChange("receiptFooter", e.target.value)}
            placeholder="សូមអរគុណសម្រាប់ការទូទាត់..."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">ជម្រើសបង្ហាញ</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Switch
            checked={form.receiptShowPaymentMethod}
            onChange={(e) => onChange("receiptShowPaymentMethod", e.target.checked)}
            label="បង្ហាញវិធីសាស្ត្រទូទាត់"
          />
          <Switch
            checked={form.receiptShowTransactionId}
            onChange={(e) => onChange("receiptShowTransactionId", e.target.checked)}
            label="បង្ហាញលេខសម្គាល់ប្រតិបត្តិការ"
          />
          <Switch
            checked={form.receiptShowUsd}
            onChange={(e) => onChange("receiptShowUsd", e.target.checked)}
            label="បង្ហាញ USD"
          />
          <Switch
            checked={form.receiptShowKhr}
            onChange={(e) => onChange("receiptShowKhr", e.target.checked)}
            label="បង្ហាញ KHR"
          />
        </div>
      </div>
    </div>
  );
}

function TelegramSection({ form, onChange }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Send} title="Telegram Bot" subtitle="ជូនដំណឹងទៅ Telegram នៅពេលមានការទូទាត់" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Bot Token (Bot Token)"
          type="text"
          value={form.telegramBotToken}
          onChange={(e) => onChange("telegramBotToken", e.target.value)}
          placeholder="123456789:AAE..."
          leftIcon={<Send className="h-4 w-4" />}
        />
        <Input
          label="Chat ID (Chat ID)"
          type="text"
          value={form.telegramChatId}
          onChange={(e) => onChange("telegramChatId", e.target.value)}
          placeholder="e.g. 123456789 or -1001234567890"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-[13px] text-slate-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-slate-300">
        <p className="font-medium text-slate-700 dark:text-slate-200">របៀបជូនដំណឹង</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>New payment initiated — នៅពេលអ្នកជួលចាប់ផ្តើមទូទាត់ online</li>
          <li>Payment successful — នៅពេលការទូទាត់ត្រូវបានបញ្ជាក់ជោគជ័យ</li>
          <li>
            ប្រើប្រាស់តម្លៃពីការកំណត់នេះ ឬបើទុកទទេ នឹងប្រើតម្លៃពី environment (
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] dark:bg-gray-800">TELEGRAM_BOT_TOKEN</code> /
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] dark:bg-gray-800">TELEGRAM_CHAT_ID</code>)
          </li>
        </ul>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : "#2563EB";
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            onClick={() => onChange(c.value)}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              safe.toLowerCase() === c.value.toLowerCase()
                ? "border-slate-900 dark:border-white"
                : "border-transparent"
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            title="Custom color"
            className="h-8 w-8 cursor-pointer appearance-none rounded border border-slate-300 bg-transparent dark:border-gray-600"
          />
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#2563EB"
            className="w-36"
          />
        </span>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const {
    theme,
    loading,
    saving,
    error,
    saveTheme,
    resetTheme,
    DEFAULT_THEME,
  } = useThemeSettings();
  const toast = useToast();
  const [draft, setDraft] = useState(theme);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading) {
      setDraft({ ...DEFAULT_THEME, ...theme });
    }
  }, [theme, loading, DEFAULT_THEME]);

  const update = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    try {
      await saveTheme(draft);
      setDirty(false);
      toast.success("រក្សាទុកជោគជ័យ", "ប្រធានបទត្រូវបានអនុវត្តដល់កម្មវិធីទាំងមូល");
    } catch {
      toast.error("បរាជ័យ", "មិនអាចរក្សាទុកប្រធានបទបានទេ");
    }
  };

  const handleReset = async () => {
    try {
      const defaults = await resetTheme();
      setDraft(defaults);
      setDirty(false);
      toast.success("កំណត់ឡើងវិញជោគជ័យ", "ប្រធានបទត្រូវបានស្ដារតម្លៃលំនាំដើម");
    } catch {
      toast.error("បរាជ័យ", "មិនអាចកំណត់ប្រធានបទឡើងវិញបានទេ");
    }
  };

  const systemMode = draft.themeMode === "SYSTEM";
  const primary = systemMode ? "#000000" : draft.primaryColor || DEFAULT_THEME.primaryColor;
  const secondary = systemMode ? "#000000" : draft.secondaryColor || DEFAULT_THEME.secondaryColor;
  const previewDark = draft.themeMode === "DARK";

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={SunMoon}
        title="រូបរាង (Appearance)"
        subtitle="ពណ៌ និងរបៀបបង្ហាញទាំងមូលរបស់កម្មវិធី"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          របៀបប្រធានបទ (Theme Mode)
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_MODE_OPTIONS.map((m) => {
            const Icon = m.icon;
            const active = draft.themeMode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => update("themeMode", m.value)}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                  active
                    ? "border-transparent bg-primary text-white"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                }`}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">{m.label}</p>
                  <p className={`text-xs ${active ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ColorField
          label="ពណ៌សំខាន់ (Primary Color)"
          value={draft.primaryColor}
          onChange={(v) => update("primaryColor", v)}
        />
        <ColorField
          label="ពណ៌បន្ទាប់បន្សំ (Secondary Color)"
          value={draft.secondaryColor}
          onChange={(v) => update("secondaryColor", v)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          ការមើលជាមុន (Preview)
        </label>
        <div style={{ "--app-primary": primary, "--app-secondary": secondary }}>
          <div
            className={`space-y-4 rounded-xl border p-6 ${
              previewDark ? "dark border-gray-700 bg-gray-900" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                Button Primary
              </button>
              <button
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  previewDark ? "border-slate-600 text-slate-200" : "border-slate-300 text-slate-700"
                }`}
              >
                Button Ghost
              </button>
            </div>
            <div
              className={`rounded-lg border p-4 ${
                previewDark ? "border-slate-700 bg-gray-800" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className={`text-sm font-semibold ${previewDark ? "text-white" : "text-slate-900"}`}>
                Card Title
              </p>
              <p className={`mt-1 text-sm ${previewDark ? "text-slate-300" : "text-slate-600"}`}>
                Card description with some supporting text.
              </p>
            </div>
            <div className="grid max-w-md grid-cols-2 gap-3">
              <input
                placeholder="Input field"
                className={`rounded-lg border px-3 py-2 text-sm ${
                  previewDark
                    ? "border-slate-600 bg-gray-800 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              />
              <button className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-white">
                Secondary
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-gray-700">
        <Button
          variant="ghost"
          leftIcon={<RotateCcw className="h-4 w-4" />}
          onClick={handleReset}
          disabled={saving}
        >
          កំណត់លំនាំដើម (Reset)
        </Button>
        <Button
          variant="primary"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSave}
          loading={saving}
          disabled={!dirty || saving}
        >
          រក្សាទុក (Save Changes)
        </Button>
      </div>
    </div>
  );
}
