import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../components/ui/Toast";
import {
  useAdminTelegramSettings,
  validateSuperAdminTelegramSettings,
} from "../../hooks/useAdminTelegramSettings";
import {
  Card,
  Button,
  Switch,
  Spinner,
  Badge,
  Alert,
  Input,
} from "../../components/ui/index.js";
import {
  Megaphone,
  MegaphoneOff,
  Save,
  RotateCcw,
  RefreshCw,
  KeyRound,
  Hash,
  Info,
} from "lucide-react";
export default function AdminTelegramSettingsPage() {
  const {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    saveSettings,
    DEFAULT_SUPER_ADMIN_TELEGRAM_SETTINGS,
  } = useAdminTelegramSettings();
  const toast = useToast();

  const [form, setForm] = useState(DEFAULT_SUPER_ADMIN_TELEGRAM_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (settings && !loading) {
      setForm(settings);
      setDirty(false);
      setFieldErrors({});
    }
  }, [settings, loading]);

  const handleToggle = useCallback((value) => {
    setForm((prev) => ({ ...prev, enabled: value }));
    setFieldErrors((prev) => ({ ...prev, enabled: undefined }));
    setDirty(true);
  }, []);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setDirty(true);
  }, []);

  const hasStoredToken = Boolean(
    form.botTokenConfigured ?? settings?.botTokenConfigured
  );

  const handleSave = async () => {
    const errors = validateSuperAdminTelegramSettings(form, hasStoredToken);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      toast.error("កំហុស", "សូមកែតម្រូវប្រាក់ Telegram មុនពេលរក្សាទុក។");
      return;
    }

    try {
      await saveSettings(form);
      setDirty(false);
      toast.success("រក្សាទុកជោគជ័យ", "ការកំណត់ Telegram ត្រូវបានធ្វើបច្ចុប្បន្នភាព");
    } catch {
      toast.error("បរាជ័យ", "មិនអាចរក្សាទុកការកំណត់ Telegram បានទេ");
    }
  };

  const handleReset = () => {
    setForm(settings || DEFAULT_SUPER_ADMIN_TELEGRAM_SETTINGS);
    setFieldErrors({});
    setDirty(false);
  };

  if (loading && !settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isEnabled = Boolean(form.enabled);
  const tokenPlaceholder =
    form.maskedBotToken || DEFAULT_SUPER_ADMIN_TELEGRAM_SETTINGS.maskedBotToken;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Megaphone className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Telegram (ការជូនដំណឹងផ្ទះ)
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            ផ្ញើការជូនដំណឹងទៅ Telegram ពេលមានអចលនទ្រព្យដំណឹងសម្រាប់ការចូលមើល — SUPER_ADMIN Only
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchSettings}
            disabled={loading || saving}
          >
            ធ្វើឱ្យស្រស់
          </Button>
          {dirty && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={handleReset}
              disabled={saving}
            >
              បោះបង់
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={saving}
            disabled={!dirty || saving}
          >
            រក្សាទុកការផ្លាស់ប្តូរ (Save Changes)
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" title="កំហុស" description={error} dismissible />}

      {/* Master Switch */}
      <Card className="border-2 border-slate-200/90 dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isEnabled
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-slate-500"
              }`}
            >
              {isEnabled ? (
                <Megaphone className="h-6 w-6" />
              ) : (
                <MegaphoneOff className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  បើកការជូនដំណឹងតាម Telegram (Enable Telegram Delivery)
                </h3>
                <Badge variant={isEnabled ? "success" : "default"}>
                  {isEnabled ? "សកម្ម (ON)" : "អសកម្ម (OFF)"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                ពេលបើក ប្រព័ន្ធនឹងផ្ញើការជូនដំណឹងទៅ bot និង chat ដែលបានកំណត់ខាងក្រោម នៅពេលមានអចលនទ្រព្យ
                ដំណឹងសម្រាប់ការចូលមើល។
              </p>
            </div>
          </div>
          <div className="sm:self-center">
            <Switch
              checked={isEnabled}
              onChange={handleToggle}
              label={isEnabled ? "ON" : "OFF"}
            />
          </div>
        </div>
      </Card>

      {/* Destination */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className={!isEnabled ? "opacity-60" : ""}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">
                  Bot Token
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  ទទួលពី @BotFather។ ពាក្យសម្ងាត់មិនត្រូវបានបង្ហាញម្ដងទៀត បើទុកទុកចាស់ហើយ
                  មិនអាចមើលវាបានឡើយ។
                </p>
              </div>
            </div>
            <Input
              type="password"
              autoComplete="off"
              disabled={!isEnabled}
              value={form.botToken ?? ""}
              onChange={(e) => handleChange("botToken", e.target.value)}
              placeholder={
                hasStoredToken
                  ? tokenPlaceholder || "***************"
                  : "123456789:AA..."
              }
              error={fieldErrors.botToken}
              helperText={
                hasStoredToken
                  ? "ទុកទទេ ឬបង្ហាញម៉ាស៊គន់ ដើម្បីរក្សាទុក token ដគលមាន។"
                  : "បង្ហាញតែពេលអ្នកចង់ប្តូរ token។"
              }
            />
            {hasStoredToken && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                មាន token ដែលបានរក្សាទុករួចហើយ (stored token is configured)
              </p>
            )}
          </div>
        </Card>

        <Card className={!isEnabled ? "opacity-60" : ""}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">
                  Chat ID
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  លេខ chat របស់អ្នក (ឧ. -1001234567890) ឬ @channelusername។
                </p>
              </div>
            </div>
            <Input
              type="text"
              disabled={!isEnabled}
              value={form.chatId ?? ""}
              onChange={(e) => handleChange("chatId", e.target.value)}
              placeholder="-1001234567890"
              error={fieldErrors.chatId}
              helperText="អាចប្រើលេខ chat ឬឈ្មោះ channel។"
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <p>
              ការជូនដំណឹងត្រូវបានផ្តល់ជូនដំណឹងទៅមិនត្រូវរក្សាទុក បើកការការជូនដំណឹងទូទៅ
              ឬការជូនដំណឹងតាម Telegram បានបិទ ហើយត្រូវបានបើកការជូនដំណឹងអចលនទ្រព្យដំណឹង
              សម្រាប់ការចូលមើលផងដែរ។
            </p>
            {form.lastUpdatedAt && (
              <p>
                បានធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖{" "}
                {new Date(form.lastUpdatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Floating save bar when form is dirty */}
      {dirty && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleReset}
            disabled={saving}
          >
            បោះបង់
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={saving}
            className="shadow-md"
          >
            រក្សាទុកការកំណត់
          </Button>
        </div>
      )}
    </div>
  );
}
