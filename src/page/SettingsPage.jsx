import { useState, useEffect, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import { useSettings } from "../hooks/useSettings";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Switch from "../components/ui/Switch";
import Tabs from "../components/ui/Tabs";
import Spinner from "../components/ui/Spinner";
import ThemeSettingsSection from "../components/common/ThemeSettingsSection";
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
  SunMoon,
  UserSquare,
  Briefcase,
  Calendar,
} from "lucide-react";

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

// Mirrors the backend Gender enum. The leading "" entry keeps the field optional.
const GENDER_OPTIONS = [
  { value: "", label: "មិនជ្រើសរើស (Not specified)" },
  { value: "MALE", label: "ប្រុស (Male)" },
  { value: "FEMALE", label: "ស្រី (Female)" },
  { value: "OTHER", label: "ផ្សេងទៀត (Other)" },
];

const EMPTY_CONTRACT_PARTY = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  nationality: "",
  nationalId: "",
  currentAddress: "",
  phone: "",
  occupation: "",
};

export default function SettingsPage() {
  const { settings, loading, saving, error, saveSettings, DEFAULT_SETTINGS } = useSettings();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [partyErrors, setPartyErrors] = useState({});

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

  const handlePartyChange = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      contractParty: { ...EMPTY_CONTRACT_PARTY, ...(prev.contractParty || {}), [field]: value },
    }));
    setDirty(true);
    setPartyErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  // Optional fields stay optional: only length limits and a real, non-future
  // date are enforced, so valid Cambodian names and addresses are never rejected.
  const validateContractParty = useCallback((party) => {
    const errs = {};
    const trimmed = {
      fullName: (party.fullName || "").trim(),
      dateOfBirth: (party.dateOfBirth || "").trim(),
      nationalId: (party.nationalId || "").trim(),
      currentAddress: (party.currentAddress || "").trim(),
      phone: (party.phone || "").trim(),
    };

    if (trimmed.fullName.length > 200) errs.fullName = "ឈ្មោះមិនត្រូវលើសពី 200 តួអក្សរ";
    if (trimmed.nationalId.length > 100) errs.nationalId = "លេខអត្តសញ្ញាណបថណ្ណលេខមិនត្រូវលើសពី 100 តួអក្សរ";
    if (trimmed.currentAddress.length > 255) errs.currentAddress = "អាសថយដ្ឋានមិនត្រូវលើសពី 255 តួអក្សរ";
    if (trimmed.phone.length > 30) errs.phone = "លេខទូរស័ព្ទមិនត្រូវលើសពី 30 តួអក្សរ";
    if (trimmed.dateOfBirth) {
      const dob = new Date(trimmed.dateOfBirth);
      if (Number.isNaN(dob.getTime())) {
        errs.dateOfBirth = "ថ្ងៃខែឆ្នាំកំណើតមិនត្រឹមតែណា";
      } else if (dob.getTime() > Date.now()) {
        errs.dateOfBirth = "ថ្ងៃខែឆ្នាំកំណើតត្រូវតែជាថ្ងៃកន្លងមក";
      }
    }
    return errs;
  }, []);

  const handleSave = async () => {
    const party = { ...EMPTY_CONTRACT_PARTY, ...(form.contractParty || {}) };
    const errs = validateContractParty(party);
    setPartyErrors(errs);
    if (Object.keys(errs).length > 0) {
      setActiveTab("contract");
      toast.error("ការកំណត់បរាជ័យ", "សូមកែពាក្យពថត៌មានកិច្ចសន្យាដែលមិនត្រឹមតែណា");
      return;
    }

    // Send the block with trimmed values so leading/trailing spaces never reach
    // the contract document.
    const payload = {
      ...form,
      contractParty: {
        fullName: party.fullName.trim(),
        gender: party.gender || null,
        dateOfBirth: party.dateOfBirth || null,
        nationality: party.nationality.trim(),
        nationalId: party.nationalId.trim(),
        currentAddress: party.currentAddress.trim(),
        phone: party.phone.trim(),
        occupation: party.occupation.trim(),
      },
    };

    try {
      const saved = await saveSettings(payload);
      setDirty(false);
      window.dispatchEvent(new CustomEvent('rentalhub:settings-updated', { detail: saved }));
      toast.success("រក្សាទុកជោគជ័យ", "ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ");
    } catch {
      toast.error("បរាជ័យ", "មិនអាចរក្សាទុកការកំណត់បានទេ");
    }
  };

  const handleReset = () => {
    setForm(settings);
    setPartyErrors({});
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ការកំណត់ (Settings)
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងការកំណត់អាជីវកម្ម និងការកំណត់ឯកសាររបស់អ្នក
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
        <div className="border-b border-slate-200 px-2 dark:border-gray-700 sm:px-4">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "general" && (
            <GeneralSection form={form} onChange={handleChange} onNumberChange={handleNumberChange} />
          )}
          {activeTab === "appearance" && <ThemeSettingsSection />}
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
            <ContractSection
              form={form}
              onChange={handleChange}
              onPartyChange={handlePartyChange}
              partyErrors={partyErrors}
            />
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
        <div className="fixed left-4 right-20 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6">
          <Button
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={saving}
            className="w-full shadow-lg sm:w-auto"
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
          placeholder="ឧ. TeasJul"
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
            onChange={(checked) => onChange("invoiceShowUsd", checked)}
            label="បង្ហាញ USD"
          />
          <Switch
            checked={form.invoiceShowKhr}
            onChange={(checked) => onChange("invoiceShowKhr", checked)}
            label="បង្ហាញ KHR"
          />
          <Switch
            checked={form.invoiceShowLogo}
            onChange={(checked) => onChange("invoiceShowLogo", checked)}
            label="បង្ហាញឡូហ្គោ"
          />
          <Switch
            checked={form.invoiceShowBusinessInfo}
            onChange={(checked) => onChange("invoiceShowBusinessInfo", checked)}
            label="បង្ហាញព័ត៌មានអាជីវកម្ម"
          />
        </div>
      </div>
    </div>
  );
}

function ContractPartySection({ party, onPartyChange, errors }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={UserSquare}
        title="ព័ត៌មានកិច្ចសន្យា (Contract Party A)"
        subtitle="ព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកដែលបោះពុម្ភជាភាគីក ក្នុងកិច្ចសន្យាជួលផ្ទះ"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="ឈ្មោះពេញ (Full Name)"
          value={party.fullName}
          onChange={(e) => onPartyChange("fullName", e.target.value)}
          placeholder="ឧ. សុភា សុខាជ"
          error={errors.fullName}
          leftIcon={<UserSquare className="h-4 w-4" />}
        />
        <Select
          label="ភេទ (Gender)"
          options={GENDER_OPTIONS}
          placeholder=""
          value={party.gender}
          onChange={(e) => onPartyChange("gender", e.target.value)}
        />
        <Input
          label="ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)"
          type="date"
          value={party.dateOfBirth}
          onChange={(e) => onPartyChange("dateOfBirth", e.target.value)}
          error={errors.dateOfBirth}
          leftIcon={<Calendar className="h-4 w-4" />}
        />
        <Input
          label="សញ្ជាតិ (Nationality)"
          value={party.nationality}
          onChange={(e) => onPartyChange("nationality", e.target.value)}
          placeholder="ឧ. ខ្មែរ"
          leftIcon={<Globe className="h-4 w-4" />}
        />
        <Input
          label="អត្តសញ្ញាណបថណ្ណលេខ (National ID)"
          value={party.nationalId}
          onChange={(e) => onPartyChange("nationalId", e.target.value)}
          error={errors.nationalId}
          leftIcon={<Hash className="h-4 w-4" />}
        />
        <Input
          label="ទូរស័ព្ទលេខ (Phone)"
          value={party.phone}
          onChange={(e) => onPartyChange("phone", e.target.value)}
          placeholder="012 345 678"
          error={errors.phone}
          leftIcon={<Phone className="h-4 w-4" />}
        />
        <div className="md:col-span-2">
          <Input
            label="ទីលំនៅបច្ចុប្បន្ន (Current Address)"
            value={party.currentAddress}
            onChange={(e) => onPartyChange("currentAddress", e.target.value)}
            placeholder="រាជធានីភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា"
            error={errors.currentAddress}
            leftIcon={<MapPin className="h-4 w-4" />}
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="មុខរបរបច្ចុប្បន្ន (Occupation)"
            value={party.occupation}
            onChange={(e) => onPartyChange("occupation", e.target.value)}
            placeholder="ឧ. អាជីវករ"
            leftIcon={<Briefcase className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-[13px] text-slate-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-slate-300">
        <p>
          ព័ត៌មាននេះត្រូវបានរក្សាទុកជាភាគីកនៃកិច្ចសន្យាជួលផ្ទះ
          នៅពេលបង្កើត។ កិច្ចសន្យាដែលបានបង្កើតរួចហើយនឹងបង្ហាញព័ត៌មានដូចនៅពេលចុះហត្ថលេខ
          មិនលៀនចាំងការផ្លាស់ប្តូរនៅឯករាជ្យាទេ។ វាលទ្រង់ទ្រាយអាចទុកទទេបាន។
        </p>
      </div>
    </div>
  );
}

function ContractSection({ form, onChange, onPartyChange, partyErrors }) {
  return (
    <div className="space-y-8">
      <ContractPartySection
        party={{ ...EMPTY_CONTRACT_PARTY, ...(form.contractParty || {}) }}
        onPartyChange={onPartyChange}
        errors={partyErrors || {}}
      />

      <div className="space-y-6 border-t border-slate-200 pt-6 dark:border-gray-700">
        <SectionHeader icon={FileSignature} title="លក្ខខណ្ឌ និងទម្រង់កិច្ចសន្យា" subtitle="ចំណងជើង ភាសា និងលក្ខខណ្ឌកិច្ចសន្យា" />

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
            onChange={(checked) => onChange("receiptShowPaymentMethod", checked)}
            label="បង្ហាញវិធីសាស្ត្រទូទាត់"
          />
          <Switch
            checked={form.receiptShowTransactionId}
            onChange={(checked) => onChange("receiptShowTransactionId", checked)}
            label="បង្ហាញលេខសម្គាល់ប្រតិបត្តិការ"
          />
          <Switch
            checked={form.receiptShowUsd}
            onChange={(checked) => onChange("receiptShowUsd", checked)}
            label="បង្ហាញ USD"
          />
          <Switch
            checked={form.receiptShowKhr}
            onChange={(checked) => onChange("receiptShowKhr", checked)}
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
