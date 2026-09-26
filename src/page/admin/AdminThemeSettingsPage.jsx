import ThemeSettingsSection from "../../components/common/ThemeSettingsSection";

/**
 * System color/theme section of the super admin settings hub.
 *
 * <p>Reuses the owner appearance editor and the same `GET`/`PUT
 * /v1/settings/theme` endpoints, so the admin and the owner always share one
 * persisted color value.</p>
 */
export default function AdminThemeSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          ពណ៌ និងរបៀបបង្ហាញទាំងមូល (System Color / Theme)
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          កែប្រើតម្លៃពណ៌ដែលដាក់ស្រាប់កម្មវិធីទាំងមូល ស្របជាមួយម្ចាស់អចលនទ្រព្យ — ការកំណត់នេះជាតម្លៃតែមួយ ដូច្នេះម្ចាស់អចលនទ្រព្យនឹងឃើញការផ្លាស់ប្ដូរដូចខ្លាំង។
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <ThemeSettingsSection
          showHeader={false}
          title="រូបរាង (Appearance)"
          subtitle="ពណ៌ និងរបៀបបង្ហាញទាំងមូលរបស់កម្មវិធី"
        />
      </div>
    </div>
  );
}
