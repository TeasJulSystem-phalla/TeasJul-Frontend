import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../components/ui/Toast";
import { useAdminNotificationSettings } from "../../hooks/useAdminNotificationSettings";
import {
  Card,
  Button,
  Switch,
  Spinner,
  Badge,
  Alert,
} from "../../components/ui/index.js";
import {
  Bell,
  BellRing,
  Send,
  Save,
  RotateCcw,
  RefreshCw,
  Building2,
  Receipt,
  Wallet,
  Wrench,
  DoorOpen,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function AdminNotificationSettingsPage() {
  const {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    saveSettings,
    DEFAULT_NOTIFICATION_SETTINGS,
  } = useAdminNotificationSettings();
  const toast = useToast();

  const [form, setForm] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings && !loading) {
      setForm(settings);
      setDirty(false);
    }
  }, [settings, loading]);

  const handleToggle = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    try {
      await saveSettings(form);
      setDirty(false);
      toast.success(
        "រក្សាទុកជោគជ័យ",
        "ការកំណត់ការជូនដំណឹងប្រព័ន្ធត្រូវបានធ្វើបច្ចុប្បន្នភាព"
      );
    } catch {
      toast.error("បរាជ័យ", "មិនអាចរក្សាទុកការកំណត់ការជូនដំណឹងបានទេ");
    }
  };

  const handleReset = () => {
    setForm(settings || DEFAULT_NOTIFICATION_SETTINGS);
    setDirty(false);
  };

  if (loading && !settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isMasterOn = Boolean(form.systemNotificationsEnabled);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ការកំណត់ការជូនដំណឹងប្រព័ន្ធ (Notification Settings)
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងការបើក/បិទការជូនដំណឹងប្រព័ន្ធ និងប្រភេទព្រឹត្តិការណ៍នីមួយៗ — SUPER_ADMIN Only
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
            រក្សាទុក
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error} dismissible />
      )}

      {/* Master System Switch Card */}
      <Card className="border-2 border-slate-200/90 dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isMasterOn
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-slate-500"
              }`}
            >
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  ប្រព័ន្ធជូនដំណឹងទាំងមូល (Master System Notifications)
                </h3>
                <Badge variant={isMasterOn ? "success" : "default"}>
                  {isMasterOn ? "សកម្ម (Active)" : "អសកម្ម (Disabled)"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                បើក ឬបិទការជូនដំណឹងទាំងអស់នៅក្នុងប្រព័ន្ធទាំងមូល។ ប្រសិនបើបិទ ការជូនដំណឹងទាំងអស់នឹងត្រូវបានផ្អាកជាបណ្ដោះអាសន្ន។
              </p>
            </div>
          </div>
          <div className="sm:self-center">
            <Switch
              checked={form.systemNotificationsEnabled}
              onChange={(checked) =>
                handleToggle("systemNotificationsEnabled", checked)
              }
              label={form.systemNotificationsEnabled ? "បើកដំណើរការ" : "បិទ"}
            />
          </div>
        </div>
      </Card>

      {/* Delivery Channels */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            បណ្តាញបញ្ជូនសារ (Delivery Channels)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            កំណត់បណ្តាញដែលត្រូវប្រើសម្រាប់ការបញ្ជូនសារជូនដំណឹង
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* In-App Notifications */}
          <Card className={!isMasterOn ? "opacity-60" : ""}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    ការជូនដំណឹងក្នុងកម្មវិធី (In-App Notifications)
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    បង្ហាញការជូនដំណឹងនៅផ្នែកខាងលើ (Bell icon) និងបញ្ជីជូនដំណឹងរបស់គណនីនីមួយៗ
                  </p>
                </div>
              </div>
              <Switch
                checked={form.inAppNotificationsEnabled}
                disabled={!isMasterOn}
                onChange={(checked) =>
                  handleToggle("inAppNotificationsEnabled", checked)
                }
              />
            </div>
          </Card>

          {/* Telegram Notifications */}
          <Card className={!isMasterOn ? "opacity-60" : ""}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    ការជូនដំណឹងតាម Telegram (Telegram Bot)
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    បញ្ជូនសារទៅកាន់ Telegram តាមរយៈ Telegram Bot ដែលបានកំណត់
                  </p>
                </div>
              </div>
              <Switch
                checked={form.telegramNotificationsEnabled}
                disabled={!isMasterOn}
                onChange={(checked) =>
                  handleToggle("telegramNotificationsEnabled", checked)
                }
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Notification Types Sections */}
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ប្រភេទព្រឹត្តិការណ៍ជូនដំណឹង (System Event Types)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            ជ្រើសរើសប្រភេទព្រឹត្តិការណ៍ជាក់លាក់ដែលប្រព័ន្ធត្រូវដំណើរការជូនដំណឹង
          </p>
        </div>

        {/* Section 1: Property & Listings */}
        <Card
          title="អចលនទ្រព្យ និងការផ្សាយ (Properties & Listings)"
          description="ព្រឹត្តិការណ៍ទាក់ទងនឹងការដាក់ស្នើបន្ទប់ និងការចាត់តាំងបន្ទប់"
          className={!isMasterOn ? "opacity-60" : ""}
        >
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            <EventToggleRow
              icon={Building2}
              title="ការដាក់ស្នើអចលនទ្រព្យថ្មី (New Property Submission)"
              code="PROPERTY_SUBMITTED"
              description="ជូនដំណឹងដល់ SUPER_ADMIN នៅពេលម្ចាស់អចលនទ្រព្យដាក់ស្នើបន្ទប់/អចលនទ្រព្យដើម្បីពិនិត្យអនុម័ត"
              checked={form.propertySubmittedEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("propertySubmittedEnabled", val)}
              badge="SUPER_ADMIN"
            />
            <EventToggleRow
              icon={DoorOpen}
              title="ការចាត់តាំងបន្ទប់ជួល (Room Assignment)"
              code="ROOM_ASSIGNED"
              description="ជូនដំណឹងដល់អ្នកជួលនៅពេលពួកគេត្រូវបានចាត់តាំងបន្ទប់ជួលក្នុងកិច្ចសន្យា"
              checked={form.roomAssignedEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("roomAssignedEnabled", val)}
              badge="TENANT"
            />
          </div>
        </Card>

        {/* Section 2: Finance & Invoices */}
        <Card
          title="ហិរញ្ញវត្ថុ និងវិក្កយបត្រ (Finance & Invoices)"
          description="ព្រឹត្តិការណ៍ទាក់ទងនឹងវិក្កយបត្រ និងប្រតិបត្តិការទូទាត់ប្រាក់"
          className={!isMasterOn ? "opacity-60" : ""}
        >
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            <EventToggleRow
              icon={Receipt}
              title="ការចេញវិក្កយបត្រថ្មី (Invoice Issued)"
              code="INVOICE_CREATED"
              description="ជូនដំណឹងដល់អ្នកជួលនៅពេលវិក្កយបត្រប្រចាំខែត្រូវបានបង្កើតរួចរាល់"
              checked={form.invoiceCreatedEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("invoiceCreatedEnabled", val)}
              badge="TENANT"
            />
            <EventToggleRow
              icon={Wallet}
              title="ការចាប់ផ្តើមទូទាត់ (Payment Initiated)"
              code="PAYMENT_CREATED"
              description="ជូនដំណឹងដល់អ្នកជួលនៅពេលការទូទាត់តាមប្រព័ន្ធអនឡាញត្រូវបានចាប់ផ្តើម"
              checked={form.paymentCreatedEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("paymentCreatedEnabled", val)}
              badge="TENANT"
            />
            <EventToggleRow
              icon={CheckCircle2}
              title="ការទូទាត់ជោគជ័យ (Payment Confirmed)"
              code="PAYMENT_SUCCESS"
              description="ជូនដំណឹងដល់ម្ចាស់ អ្នកគ្រប់គ្រង និងអ្នកជួលនៅពេលការទូទាត់ត្រូវបានបញ្ជាក់ជោគជ័យ"
              checked={form.paymentSuccessEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("paymentSuccessEnabled", val)}
              badge="ALL ROLES"
              tone="emerald"
            />
            <EventToggleRow
              icon={XCircle}
              title="ការទូទាត់មិនជោគជ័យ (Payment Failed)"
              code="PAYMENT_FAILED"
              description="ជូនដំណឹងដល់អ្នកជួលនៅពេលប្រតិបត្តិការទូទាត់មានបញ្ហាបរាជ័យ"
              checked={form.paymentFailedEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("paymentFailedEnabled", val)}
              badge="TENANT"
              tone="rose"
            />
          </div>
        </Card>

        {/* Section 3: Maintenance & Contracts */}
        <Card
          title="ការជួសជុល និងកិច្ចសន្យា (Maintenance & Contracts)"
          description="ព្រឹត្តិការណ៍ទាក់ទងនឹងសំណើជួសជុល និងសុពលភាពកិច្ចសន្យា"
          className={!isMasterOn ? "opacity-60" : ""}
        >
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            <EventToggleRow
              icon={Wrench}
              title="សំណើជួសជុលថ្មី (Maintenance Request)"
              code="MAINTENANCE_REQUEST"
              description="ជូនដំណឹងដល់ម្ចាស់ និងអ្នកគ្រប់គ្រងនៅពេលអ្នកជួលដាក់សំណើជួសជុលសម្ភារ"
              checked={form.maintenanceRequestEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("maintenanceRequestEnabled", val)}
              badge="OWNER & MANAGER"
            />
            <EventToggleRow
              icon={Wrench}
              title="ការធ្វើបច្ចុប្បន្នភាពស្ថានភាពជួសជុល (Maintenance Status)"
              code="MAINTENANCE_STATUS"
              description="ជូនដំណឹងដល់អ្នកជួលនៅពេលស្ថានភាពសំណើជួសជុលត្រូវបានផ្លាស់ប្តូរ"
              checked={form.maintenanceStatusEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("maintenanceStatusEnabled", val)}
              badge="TENANT"
            />
            <EventToggleRow
              icon={Clock}
              title="កិច្ចសន្យាជិតផុតកំណត់ (Contract Expiring Soon)"
              code="CONTRACT_EXPIRING"
              description="ជូនដំណឹងជាមុនរយៈពេល ៣០ ថ្ងៃមុនពេលកិច្ចសន្យាជួលដល់ថ្ងៃផុតកំណត់"
              checked={form.contractExpiringEnabled}
              disabled={!isMasterOn}
              onChange={(val) => handleToggle("contractExpiringEnabled", val)}
              badge="ALL ROLES"
              tone="amber"
            />
          </div>
        </Card>
      </div>

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

function EventToggleRow({
  icon: Icon,
  title,
  code,
  description,
  checked,
  disabled,
  onChange,
  badge,
  tone = "slate",
}) {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  };

  return (
    <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            toneClasses[tone] || toneClasses.slate
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13.5px] font-semibold text-slate-800 dark:text-white">
              {title}
            </p>
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
              ({code})
            </span>
            {badge && (
              <Badge variant="default" className="text-[10px]">
                {badge}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0 self-end sm:self-center">
        <Switch
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
