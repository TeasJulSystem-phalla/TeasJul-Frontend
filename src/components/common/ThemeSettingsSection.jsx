import { useCallback, useEffect, useState } from "react";
import { Monitor, Moon, RotateCcw, Save, Sun, SunMoon } from "lucide-react";
import { useToast } from "../ui/Toast";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useThemeSettings } from "../../hooks/useThemeSettings";

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

/**
 * System color/theme editor.
 *
 * <p>Shared by the owner settings page and the super admin settings page. Both
 * roles read and write the same persisted value through
 * `useThemeSettings` (`GET`/`PUT /v1/settings/theme`), so a change made by one
 * is immediately seen by the other.</p>
 */
export default function ThemeSettingsSection({
  title = "រូបរាង (Appearance)",
  subtitle = "ពណ៌ និងរបៀបបង្ហាញទាំងមូលរបស់កម្មវិធី",
  showHeader = true,
}) {
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
      toast.success("កំណត់ឡើងវិញជោគជ័យ", "ប្រធានបទត្រូវបានស្ដារតម្លៃលំនាទ្រព្យដើម");
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
      {showHeader && (
        <SectionHeader icon={SunMoon} title={title} subtitle={subtitle} />
      )}

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
                previewDark ? "border-gray-700 bg-gray-800" : "border-slate-200 bg-slate-50"
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
          កំណត់លំនាទ្រព្យដើម (Reset)
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
