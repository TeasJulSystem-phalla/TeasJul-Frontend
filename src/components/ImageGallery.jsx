import { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Star,
  Trash2,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Loader2,
  ImageOff,
  Info,
} from 'lucide-react';
import { Button, Alert, EmptyState, ConfirmDialog, Skeleton } from './ui/index.js';
import useToast from './ui/Toast.jsx';

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  fallback;

export default function ImageGallery({
  images = [],
  loading = false,
  error = null,
  uploading = false,
  uploadError = null,
  canManage = false,
  onUpload,
  onRemove,
  onSetPrimary,
  onMove,
  onRetry,
  title = 'រូបភាព',
  emptyDescription = 'មិនទាន់មានរូបភាពនៅឡើយទេ។ ផ្ទុករូបភាពដំបូងដើម្បីចាប់ផ្តើម។',
}) {
  const fileInputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const toast = useToast();

  const hero = images.find((img) => img.isPrimary) || images[0];

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    onUpload(files)
      .then(() => {
        toast.success('ផ្ទុករូបភាព', `បានផ្ទុករូបភាព ${files.length} សន្លឹកដោយជោគជ័យ។`);
      })
      .catch((err) => {
        toast.error('កំហុស', getErrorMessage(err, 'មិនអាចផ្ទុករូបភាពបានទេ។'));
      });
  };

  const handleSetPrimary = async (id) => {
    setActionId(id);
    try {
      await onSetPrimary(id);
      toast.success('រូបភាពសំខាន់', 'បានកំណត់រូបភាពនេះជារូបភាពធំដោយជោគជ័យ។');
    } catch (err) {
      toast.error('កំហុស', getErrorMessage(err, 'មិនអាចកំណត់រូបភាពសំខាន់បានទេ។'));
    } finally {
      setActionId(null);
    }
  };

  const handleMove = async (id, direction) => {
    try {
      await onMove(id, direction);
    } catch (err) {
      toast.error('កំហុស', getErrorMessage(err, 'មិនអាចរៀបចំលំដាប់រូបភាពបានទេ។'));
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onRemove(deleteTarget.id);
      toast.success('លុបរូបភាព', 'រូបភាពត្រូវបានលុបដោយជោគជ័យ។');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('កំហុស', getErrorMessage(err, 'មិនអាចលុបរូបភាពបានទេ។'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h3>
              {images.length > 0 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500 dark:bg-gray-800 dark:text-slate-400">
                  {images.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">គ្រប់គ្រង និងរៀបចំរូបភាព</p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Upload className="h-4 w-4" />}
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'កំពុងផ្ទុក...' : 'ផ្ទុករូបភាព'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="danger" title="កំហុស" description={error}>
          <div className="mt-3">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>
              ព្យាយាមម្តងទៀត
            </Button>
          </div>
        </Alert>
      )}

      {uploadError && <Alert variant="danger" title="កំហុស" description={uploadError} dismissible />}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl sm:h-72" />
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : images.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="មិនមានរូបភាព"
          description={emptyDescription}
          action={
            canManage ? (
              <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()}>
                ផ្ទុករូបភាពដំបូង
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
            <img
              src={hero.secureUrl}
              alt="រូបភាពធំ"
              className="h-64 w-full object-cover sm:h-80"
            />
            {hero.isPrimary && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                <Star className="h-3.5 w-3.5 fill-current" />
                រូបភាពសំខាន់
              </span>
            )}
            <span className="absolute bottom-3 right-3 rounded-md bg-gray-900/60 px-2 py-1 font-mono text-[11px] font-medium text-white backdrop-blur">
              {images.indexOf(hero) + 1}/{images.length}
            </span>
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="text-sm font-medium text-white">កំពុងផ្ទុក...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`group relative aspect-square overflow-hidden rounded-lg border bg-slate-100 dark:bg-gray-800/50 ${
                  img.isPrimary
                    ? 'border-amber-400/70 ring-1 ring-amber-400/40'
                    : 'border-slate-200 dark:border-gray-800'
                }`}
              >
                <img src={img.secureUrl} alt="រូបភាព" className="h-full w-full object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded bg-gray-900/60 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white backdrop-blur">
                  {idx + 1}
                </span>
                {img.isPrimary && (
                  <span className="absolute right-1.5 top-1.5 drop-shadow-md">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </span>
                )}
                {canManage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="ឡើងលើ"
                        disabled={idx === 0}
                        onClick={() => handleMove(img.id, -1)}
                        className="rounded-full bg-white/15 p-1.5 text-white transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="ចុះក្រោម"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMove(img.id, 1)}
                        className="rounded-full bg-white/15 p-1.5 text-white transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          aria-label="ធ្វើជារូបភាពសំខាន់"
                          disabled={actionId === img.id}
                          onClick={() => handleSetPrimary(img.id)}
                          className="rounded-full bg-white/15 p-1.5 text-amber-300 transition-colors hover:bg-amber-400 hover:text-white disabled:cursor-wait disabled:opacity-50"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="លុប"
                        onClick={() => setDeleteTarget(img)}
                        className="rounded-full bg-white/15 p-1.5 text-red-300 transition-colors hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {canManage && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Info className="h-3.5 w-3.5 shrink-0" />
          JPEG, PNG, WEBP — រូបភាពនីមួយៗតិចជាង 5MB ។ រូបភាពដែលមានសញ្ញាផ្កាយនឹងបង្ហាញនៅគ្រប់ទីកន្លែង។
        </p>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="លុបរូបភាព"
        description="តើអ្នកប្រាកដថាចង់លុបរូបភាពនេះ? សកម្មភាពនេះមិនអាចបញ្ឈប់បានទេ។"
        confirmText="លុប"
        cancelText="បោះបង់"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}