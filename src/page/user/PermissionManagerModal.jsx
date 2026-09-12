import { useMemo, useState } from 'react';
import {
  Search,
  KeyRound,
  ShieldCheck,
  Layers,
  Eraser,
  CheckCheck,
  Lock,
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const OTHER_MODULE = 'ផ្សេងៗ';

const PermissionManagerModal = ({
  open,
  onClose,
  role,
  permissions,
  loading,
  selected,
  onToggle,
  onToggleModule,
  onSelectAll,
  onClearAll,
  onSave,
  saving,
  ownerLocked = false,
}) => {
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const map = {};
    for (const p of permissions) {
      const key = p.module || OTHER_MODULE;
      (map[key] = map[key] || []).push(p);
    }
    return map;
  }, [permissions]);

  const q = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!q) return Object.entries(grouped);
    return Object.entries(grouped)
      .map(([module, perms]) => [
        module,
        perms.filter((p) =>
          [p.name, p.code, p.description, p.module]
            .filter(Boolean)
            .some((s) => s.toLowerCase().includes(q))
        ),
      ])
      .filter(([, perms]) => perms.length > 0);
  }, [grouped, q]);

  const totalCount = permissions.length;
  const effectiveSelectedCount = ownerLocked ? totalCount : Object.values(selected).filter(Boolean).length;
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const allSelected = totalCount > 0 && effectiveSelectedCount === totalCount;
  const pct = totalCount ? Math.round((effectiveSelectedCount / totalCount) * 100) : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="គ្រប់គ្រងសិទ្ធិ"
      description={role ? `កំណត់សិទ្ធិឱ្យតួនាទី "${role.name}"។` : undefined}
      size="xl"
      footer={
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            បោះបង់
          </Button>
          <Button
            onClick={onSave}
            loading={saving}
            disabled={ownerLocked}
            leftIcon={ownerLocked ? <Lock className="h-4 w-4" /> : undefined}
          >
            {ownerLocked
              ? 'Owner មានសិទ្ធិពេញលេញ'
              : saving
                ? 'កំពុងរក្សាទុក...'
                : `រក្សាទុកសិទ្ធិ (${effectiveSelectedCount})`}
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Owner full-access banner */}
          {ownerLocked && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/15">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Lock className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Owner មានសិទ្ធិពេញលេញ
                </p>
                <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                  តួនាទី Owner (ភាគម្ចាស់) ទទួលបានសិទ្ធិទាំងអស់នៅក្នុងប្រព័ន្ធ និងមិនអាចកែប្រែបានទេ។
                </p>
              </div>
            </div>
          )}

          {/* Role summary + bulk actions */}
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <KeyRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                  {role?.name}
                </p>
                <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                  {role?.code}
                </p>
              </div>
              <Badge variant={allSelected ? 'success' : 'default'} className="ml-1 shrink-0">
                {effectiveSelectedCount}/{totalCount} បានជ្រើសរើស
              </Badge>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant={allSelected ? 'outline' : 'secondary'}
                size="sm"
                leftIcon={<CheckCheck className="h-4 w-4" />}
                disabled={allSelected || ownerLocked}
                onClick={onSelectAll}
              >
                ជ្រើសរើសទាំងអស់
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eraser className="h-4 w-4" />}
                disabled={selectedCount === 0 || ownerLocked}
                onClick={onClearAll}
              >
                សម្អាត
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${ownerLocked ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
              {pct}%
            </span>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="ស្វែងរកសិទ្ធិតាមឈ្មោះ លេខកូដ ឬការពិពណ៌នា..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {filteredGroups.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="រកមិនឃើញសិទ្ធិ"
              description={
                q
                  ? 'សូមព្យាយាមស្វែងរកជាមួយពាក្យផ្សេងទៀត។'
                  : 'មិនមានសិទ្ធិណាមួយសម្រាប់កំណត់ទេ។'
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredGroups.map(([module, perms]) => {
                const selectedInModule = perms.filter((p) => ownerLocked || selected[p.id]).length;
                const allInModule = selectedInModule === perms.length;
                const modulePct = perms.length
                  ? Math.round((selectedInModule / perms.length) * 100)
                  : 0;
                return (
                  <div
                    key={module}
                    className="overflow-hidden rounded-lg border border-slate-200 dark:border-gray-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                      <div className="flex min-w-0 items-center gap-2">
                        <Layers className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                        <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {module}
                        </span>
                        <Badge variant={allInModule ? 'success' : 'neutral'}>
                          {selectedInModule}/{perms.length}
                        </Badge>
                        <span className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
                          {modulePct}%
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
                          disabled={allInModule || ownerLocked}
                          onClick={() => onToggleModule(perms, true)}
                        >
                          ទាំងអស់
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Eraser className="h-3.5 w-3.5" />}
                          disabled={selectedInModule === 0 || ownerLocked}
                          onClick={() => onToggleModule(perms, false)}
                        >
                          សម្អាត
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-gray-800">
                      {perms.map((p) => {
                        const checked = ownerLocked || !!selected[p.id];
                        return (
                          <div
                            key={p.id}
                            className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                              checked
                                ? 'bg-indigo-50/60 dark:bg-indigo-900/10'
                                : 'hover:bg-slate-50 dark:hover:bg-gray-800/30'
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={ownerLocked}
                              onChange={() => onToggle(p.id)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 dark:text-white">
                                {p.name}
                              </p>
                              {p.description && (
                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                  {p.description}
                                </p>
                              )}
                            </div>
                            <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                              {p.code}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PermissionManagerModal;