import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  RefreshCw,
  Save,
  ClipboardList,
  DoorClosed,
  Droplets,
  Zap,
  Calendar,
} from 'lucide-react';
import { useUtilityReadings } from '../../hooks/useUtilityReadings.js';
import { useHouses } from '../../hooks/useHouses.js';
import { useToast } from '../../components/ui/Toast.jsx';
import {
  Card,
  Button,
  Badge,
  Alert,
  Input,
  Select,
  EmptyState,
  Skeleton,
} from '../../components/ui/index.js';

const MONTH_OPTIONS = [
  { value: '1', label: 'មករា' },
  { value: '2', label: 'កុម្ភៈ' },
  { value: '3', label: 'មីនា' },
  { value: '4', label: 'មេសា' },
  { value: '5', label: 'ឧសភា' },
  { value: '6', label: 'មិថុនា' },
  { value: '7', label: 'កក្កដា' },
  { value: '8', label: 'សីហា' },
  { value: '9', label: 'កញ្ញា' },
  { value: '10', label: 'តុលា' },
  { value: '11', label: 'វិច្ឆិកា' },
  { value: '12', label: 'ធ្នូ' },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = currentYear - i;
  return { value: String(y), label: String(y) };
});

const TYPE_ICON = { WATER: Droplets, ELECTRICITY: Zap };

export default function UtilityReadings() {
  const { error, getMonthlySheet, saveMonthlySheet } = useUtilityReadings();
  const { houses } = useHouses();
  const toast = useToast();

  const [houseId, setHouseId] = useState('');
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));

  const [sheet, setSheet] = useState([]);
  const [currents, setCurrents] = useState({});
  const [sheetLoading, setSheetLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sheetError, setSheetError] = useState(null);

  const houseOptions = useMemo(
    () => houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` })),
    [houses]
  );

  const loadSheet = useCallback(async () => {
    if (!houseId) return;
    setSheetLoading(true);
    setSheetError(null);
    try {
      const rows = await getMonthlySheet(Number(houseId), Number(year), Number(month));
      setSheet(rows || []);
      const next = {};
      (rows || []).forEach((r) => {
        if (r.currentReading != null) next[String(r.meterId)] = r.currentReading;
      });
      setCurrents(next);
    } catch (err) {
      setSheetError(err.response?.data?.message || err.response?.data?.error || 'មិនអាចផ្ទុកបញ្ជីបានទេ។');
    } finally {
      setSheetLoading(false);
    }
  }, [houseId, year, month, getMonthlySheet]);

  useEffect(() => {
    if (houseId) loadSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseId, year, month]);

  const rooms = useMemo(() => {
    const map = new Map();
    sheet.forEach((r) => {
      if (!map.has(r.roomId)) map.set(r.roomId, { room: r, meters: [] });
      map.get(r.roomId).meters.push(r);
    });
    return [...map.values()];
  }, [sheet]);

  const totalRooms = rooms.length;
  const totalFilled = Object.values(currents).filter((v) => v != null && v !== '').length;
  const totalPending = sheet.length - totalFilled;

  const handleReadingChange = (meterId, value) => {
    setCurrents((prev) => ({ ...prev, [String(meterId)]: value }));
  };

  const handleSaveAll = async () => {
    const rows = [];
    for (const r of sheet) {
      const val = currents[String(r.meterId)];
      if (val == null || val === '') continue;
      rows.push({ meterId: r.meterId, currentReading: Number(val) });
    }
    if (rows.length === 0) {
      toast.error('គ្មានទិន្នន័យ', 'សូមបញ្ចូលការអានម៉ែត្រយ៉ាងហោចណាស់មួយបន្ទប់មុនពេលរក្សាទុក។');
      return;
    }

    setSaving(true);
    try {
      const result = await saveMonthlySheet({
        houseId: Number(houseId),
        billingYear: Number(year),
        billingMonth: Number(month),
        rows,
      });
      toast.success(
        'រក្សាទុកជោគជ័យ',
        `បានបង្កើត ${result.createdCount} កំណត់ត្រា កែប្រែ ${result.updatedCount} រំលង ${result.skippedCount}។`
      );
      await loadSheet();
    } catch (err) {
      toast.error(
        'ការរក្សាទុកបរាជ័យ',
        err.response?.data?.message || err.response?.data?.error || 'មិនអាចរក្សាទុកការអានម៉ែត្របានទេ។'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!houseId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ការអានម៉ែត្រប្រចាំខែ</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ជ្រើសរើសអចលនទ្រព្យ រយៈពេលវិក្កយបត្រ បន្ទាប់មកបញ្ចូលការអានម៉ែត្រសម្រាប់បន្ទប់នីមួយៗ។
          </p>
        </div>
        <Card>
          <div className="p-6">
            <Select label="អចលនទ្រព្យ" required options={houseOptions} value="" onChange={(e) => setHouseId(e.target.value)} placeholder="ជ្រើសរើសអចលនទ្រព្យ" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ការអានម៉ែត្រប្រចាំខែ</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            បញ្ចូលការអានម៉ែត្របច្ចុប្បន្ន។ លើកមុន និងការប្រើប្រាស់ត្រូវបានគណនាដោយស្វ័យប្រវត្តិ។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={loadSheet} disabled={sheetLoading}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveAll} loading={saving} disabled={sheetLoading}>
            រក្សាទុកទាំងអស់
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="w-full sm:w-64">
            <Select label="អចលនទ្រព្យ" options={houseOptions} value={String(houseId)} onChange={(e) => setHouseId(e.target.value)} />
          </div>
          <div className="w-full sm:w-40">
            <Select label="ឆ្នាំ" options={YEAR_OPTIONS} value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="w-full sm:w-44">
            <Select label="ខែ" options={MONTH_OPTIONS} value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
        </div>
      </Card>

      {(error || sheetError) && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុក" description={error || sheetError} dismissible />
      )}

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="បន្ទប់" value={totalRooms} icon={DoorClosed} />
        <SummaryCard label="បានបញ្ចូល" value={`${totalFilled}/${sheet.length}`} icon={ClipboardList} />
        <SummaryCard label="នៅសល់" value={totalPending} icon={Calendar} />
      </div>

      {sheetLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-14 ${i > 0 ? 'mt-2' : ''} w-full`} />
          ))}
        </div>
      ) : sheet.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="មិនទាន់មានម៉ែត្រសម្រាប់អចលនទ្រព្យនេះ"
          description="សូមបន្ថែមម៉ែត្រប្រើប្រាស់ និងដាក់បន្ទប់ឲ្យម៉ែត្រនីមួយៗ មុនពេលកត់ត្រាការអានប្រចាំខែ។"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {rooms.map(({ room, meters }) => (
            <div key={room.roomId} className="border-b border-slate-100 last:border-0 dark:border-gray-800">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm dark:bg-gray-800 dark:text-slate-300">
                  <DoorClosed className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">បន្ទប់ {room.roomNumber}</span>
                <Badge variant="neutral" className="ml-auto">ម៉ែត្រ {meters.length}</Badge>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-gray-800">
                {meters.map((r) => {
                  const Icon = TYPE_ICON[r.utilityTypeName] || Zap;
                  const val = currents[String(r.meterId)];
                  const usage = val != null && val !== '' && r.previousReading != null
                    ? Number(val) - Number(r.previousReading)
                    : null;
                  return (
                    <div key={r.meterId} className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-300">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{r.utilityTypeName || 'ប្រើប្រាស់'}</p>
                          <p className="text-xs text-slate-400">លេខ {r.meterNumber}</p>
                        </div>
                      </div>
                      <ReadOnlyField label="លើកមុន" value={r.previousReading ?? '0'} />
                      <ReadOnlyField label={r.utilityTypeName || 'បច្ចុប្បន្ន'} value={r.currentReading != null ? String(r.currentReading) : '—'} />
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          អានបច្ចុប្បន្ន {r.utilityTypeUnit ? `(${r.utilityTypeUnit})` : ''}
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={val ?? ''}
                          placeholder="—"
                          onChange={(e) => handleReadingChange(r.meterId, e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end sm:col-span-1">
                        {val != null && val !== '' && (
                          <Badge variant={(usage ?? 0) >= 0 ? 'info' : 'danger'}>
                            ប្រើ: {usage ?? '0'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!sheetLoading && sheet.length > 0 && (
        <div className="flex justify-end">
          <Button variant="primary" size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveAll} loading={saving}>
            រក្សាទុកទាំងអស់
          </Button>
        </div>
      )}
    </div>
  );
}

const SummaryCard = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const ReadOnlyField = ({ label, value }) => (
  <div>
    <p className="mb-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</p>
    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
  </div>
);
