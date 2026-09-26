import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../components/ui/Toast";
import {
  useAdminLoginRateLimitSettings,
  validateLoginRateLimitSettings,
} from "../../hooks/useAdminLoginRateLimitSettings";
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
  ShieldAlert,
  ShieldCheck,
  Save,
  RotateCcw,
  RefreshCw,
  KeyRound,
  Timer,
} from "lucide-react";

export default function AdminLoginRateLimitSettingsPage() {
  const {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    saveSettings,
    DEFAULT_LOGIN_RATE_LIMIT_SETTINGS,
  } = useAdminLoginRateLimitSettings();
  const toast = useToast();

  const [form, setForm] = useState(DEFAULT_LOGIN_RATE_LIMIT_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (settings && !loading) {
      setForm(settings);
      setDirty(false);
      setFieldErrors({});
    }
  }, [settings, loading]);

  const handleToggle = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setDirty(true);
  }, []);

  const handleNumberChange = useCallback((field, rawValue) => {
    const parsed = rawValue === "" ? "" : Number(rawValue);
    setForm((prev) => ({ ...prev, [field]: parsed }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    const errors = validateLoginRateLimitSettings(form);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      toast.error("កំហុស", "សូមកែតម្រូវប្រាក់ចូលមុនពេលរក្សាទុក។");
      return;
    }

    try {
      await saveSettings(form);
      setDirty(false);
      toast.success(
        "រក្សាទុកជោគជ័យ",
        "ការកំណត់ការកម្រិតការចូលប្រព័ន្ធត្រូវបានធ្វើបច្ចុប្បន្នភាព"
      );
    } catch {
      toast.error("បរាជ័យ", "មិនអាចរក្សាទុកការកំណត់ការកម្រិតការចូលប្រព័ន្ធបានទេ");
    }
  };

  const handleReset = () => {
    setForm(settings || DEFAULT_LOGIN_RATE_LIMIT_SETTINGS);
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

  const isEnabled = Boolean(form.loginRateLimitEnabled);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ការកំណត់ការកម្រិតការចូលប្រព័ន្ធ (Login Rate Limiting)
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងចំនួនការព្យាយាមចូលប្រព័ន្ធ និងរយៈពេលរង់ចាំសម្លាប់គណនី — SUPER_ADMIN
            Only
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
                <ShieldCheck className="h-6 w-6" />
              ) : (
                <ShieldAlert className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  បើកការកម្រិតការចូលប្រព័ន្ធ (Enable Login Rate Limiting)
                </h3>
                <Badge variant={isEnabled ? "success" : "default"}>
                  {isEnabled ? "សកម្ម (ON)" : "អសកម្ម (OFF)"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                បើក ឬបិទការកម្រិតការចូលប្រព័ន្ធទៅលើ endpoint ចូលប្រព័ន្ធ។ បើបិទ
                អ្នកប្រើប្រព័ន្ធនឹងមានការព្យាយាមចូលប្រព័ន្ធដោយមិនមានការកម្រិត។
              </p>
            </div>
          </div>
          <div className="sm:self-center">
            <Switch
              checked={isEnabled}
              onChange={(checked) => handleToggle("loginRateLimitEnabled", checked)}
              label={isEnabled ? "ON" : "OFF"}
            />
          </div>
        </div>
      </Card>

      {/* Numeric Settings */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className={!isEnabled ? "opacity-60" : ""}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">
                  ចំនួនការព្យាយាមបរាជ័យអតិបរមា (Max Failed Attempts)
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  ចំនួនដែលគណនីមួយអាចព្យាយាមចូលក្នុងរយៈពេលចាំសម្លាប់។ លើសពីនេះ
                  គណនីនឹងត្រូវបានរង់ចាំ។ (1–100)
                </p>
              </div>
            </div>
            <Input
              type="number"
              min="1"
              max="100"
              step="1"
              disabled={!isEnabled}
              value={form.maxFailedAttempts ?? ""}
              onChange={(e) => handleNumberChange("maxFailedAttempts", e.target.value)}
              error={fieldErrors.maxFailedAttempts}
              helperText="ចំនួនលម្អតគតលេខត្រឹមតែ។"
            />
          </div>
        </Card>

        <Card className={!isEnabled ? "opacity-60" : ""}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">
                  រយៈពេលរង់ចាំ (នាទី) — Lockout Duration (minutes)
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  បន្ទាប់ពីការព្យាយាមចូលចាប់ល្អ គណនីនឹងត្រូវបានរង់ចាំរយៈពេល
                  នេះមុនសិន។ (1–1440 នាទី)
                </p>
              </div>
            </div>
            <Input
              type="number"
              min="1"
              max="1440"
              step="1"
              disabled={!isEnabled}
              value={form.lockoutDurationMinutes ?? ""}
              onChange={(e) => handleNumberChange("lockoutDurationMinutes", e.target.value)}
              error={fieldErrors.lockoutDurationMinutes}
              helperText="ចំនួនលម្អតគតលេខត្រឹមតែ។"
            />
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ការកំណត់ទាំងនេះជះលើកម្មវិធីកម្រិតការចូលប្រព័ន្ធ
          ដែលកំពុងប្រើស្រាប់ចូលប្រព័ន្ធតែមួយ។ ការព្យាយាមដែលជោគជ័យ
          នឹងមិនបានរាប់អានជាការព្យាយាមបរាជ័យឡើយ។ តម្រូវការការចូលប្រព័ន្ធ
          ដោយមានគណនីទូទៅ និងការបញ្ជូនពាក្យសម្ងាត់ នៅត្រូវបានកំណត់ដោយឡែនដោយឡែក។
        </p>
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
