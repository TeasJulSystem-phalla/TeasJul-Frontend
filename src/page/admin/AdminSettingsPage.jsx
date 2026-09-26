import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "../../components/ui/index.js";
import { Settings, ShieldAlert, Bell, SunMoon, Send } from "lucide-react";

export const ADMIN_SETTINGS_LOGIN_RATE_LIMIT_PATH = "/admin/settings/security/login-rate-limit";
export const ADMIN_SETTINGS_NOTIFICATIONS_PATH = "/admin/settings/notifications";
export const ADMIN_SETTINGS_APPEARANCE_PATH = "/admin/settings/appearance";
export const ADMIN_SETTINGS_TELEGRAM_PATH = "/admin/settings/telegram";

const SETTINGS_TABS = [
  {
    value: ADMIN_SETTINGS_LOGIN_RATE_LIMIT_PATH,
    label: (
      <span className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        ការកំណត់ការកម្រិតការចូលប្រព័ន្ធ (Login Rate Limiting)
      </span>
    ),
  },
  {
    value: ADMIN_SETTINGS_NOTIFICATIONS_PATH,
    label: (
      <span className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        ការកំណត់ការជូនដំណឹងប្រព័ន្ធ (Notification Settings)
      </span>
    ),
  },
  {
    value: ADMIN_SETTINGS_APPEARANCE_PATH,
    label: (
      <span className="flex items-center gap-2">
        <SunMoon className="h-4 w-4" />
        ពណ៌ និងរូបរាង (Color / Theme)
      </span>
    ),
  },
  {
    value: ADMIN_SETTINGS_TELEGRAM_PATH,
    label: (
      <span className="flex items-center gap-2">
        <Send className="h-4 w-4" />
        Telegram (ការជូនដំណឹងផ្ទះ)
      </span>
    ),
  },
];


export default function AdminSettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab =
    SETTINGS_TABS.find((tab) => location.pathname.startsWith(tab.value))?.value ??
    SETTINGS_TABS[0].value;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ការកំណត់ប្រព័ន្ធ (Settings)
          </h1>
        </div>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          ការកំណត់ប្រព័ន្ធទាំងអស់សម្រាប់រដ្ឋបាល — SUPER_ADMIN Only
        </p>
      </div>

      <Tabs
        tabs={SETTINGS_TABS}
        activeTab={activeTab}
        onChange={(value) => navigate(value)}
      />

      <Outlet />
    </div>
  );
}
