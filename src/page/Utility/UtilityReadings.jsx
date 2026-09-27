import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  RefreshCw,
  Save,
  ClipboardList,
  DoorClosed,
  Droplets,
  Zap,
  Search,
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

const STATUS_FILTERS = [
  { value: 'ALL', label: 'ទាំងអស់' },
  { value: 'NOT_ENTERED', label: 'មិនទាន់បញ្ចូល' },
  { value: 'ENTERED', label: 'បានបញ្ចូល' },
];

const TENANT_STATUS_FILTERS = [
  { value: 'ALL', label: 'ទាំងអស់' },
  { value: 'OCCUPIED', label: 'មានអ្នកជួល' },
];

export default function UtilityReadings() {
  const { getMonthlySheet, getMonthlySheetFloors, saveMonthlySheet } = useUtilityReadings();
  const { houses, loading: housesLoading, error: housesError } = useHouses();
  const toast = useToast();

  const [houseId, setHouseId] = useState('');
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));
  const [floor, setFloor] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [tenantStatus, setTenantStatus] = useState('ALL');

  const [sheet, setSheet] = useState([]);
  const [currents, setCurrents] = useState({});
  const [readErrors, setReadErrors] = useState({});
  const [sheetLoading, setSheetLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sheetError, setSheetError] = useState(null);
  const [floorOptions, setFloorOptions] = useState([]);
  const [floorsLoading, setFloorsLoading] = useState(false);

  const houseOptions = useMemo(
    () => [
      { value: '', label: 'អចលនទ្រព្យទាំងអស់' },
      ...houses.map((h) => ({ value: String(h.id), label: h.name || `អចលនទ្រព្យ #${h.id}` })),
    ],
    [houses]
  );

  const floorSelectOptions = useMemo(
    () => [
      { value: '', label: 'ជាន់ទាំងអស់' },
      ...(floorOptions || []).map((f) => ({ value: String(f), label: String(f) })),
    ],
    [floorOptions]
  );

  useEffect(() => {
    let cancelled = false;
    setFloorsLoading(true);
    getMonthlySheetFloors(houseId ? { houseId: Number(houseId) } : {})
      .then((floors) => {
        if (!cancelled) setFloorOptions(floors || []);
      })
      .catch(() => {
        if (!cancelled) setFloorOptions([]);
      })
      .finally(() => {
        if (!cancelled) setFloorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [houseId, getMonthlySheetFloors]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!floor || !floorOptions.length) return;
    if (!floorOptions.includes(Number(floor))) setFloor('');
  }, [floor, floorOptions]);

  const loadSheet = useCallback(async () => {
    setSheetLoading(true);
    setSheetError(null);
    const params = { year: Number(year), month: Number(month) };
    if (houseId) params.houseId = Number(houseId);
    if (floor) params.floor = Number(floor);
    if (search) params.search = search;
    if (status !== 'ALL') params.status = status;
    try {
      const rows = await getMonthlySheet(params);
      setSheet(rows || []);
      const next = {};
      (rows || []).forEach((r) => {
        if (r.currentReading != null) next[String(r.meterId)] = r.currentReading;
      });
      setCurrents(next);
      setReadErrors({});
    } catch (err) {
      setSheetError(
        err.response?.data?.message || err.response?.data?.error || 'មិនអាចផ្ទុកបញ្ជីបានទេ។'
      );
    } finally {
      setSheetLoading(false);
    }
  }, [houseId, year, month, floor, search, status, getMonthlySheet]);

  useEffect(() => {
    loadSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseId, year, month, floor, search, status]);

  const refresh = useCallback(() => {
    loadSheet();
    if (houseId) {
      getMonthlySheetFloors({ houseId: Number(houseId) })
        .then(setFloorOptions)
        .catch(() => {});
    } else {
      getMonthlySheetFloors({})
        .then(setFloorOptions)
        .catch(() => {});
    }
  }, [houseId, loadSheet, getMonthlySheetFloors]);

  // "មានអ្នកជួល" reuses the tenant the sheet already resolved server-side from an ACTIVE
  // rental contract with a tenant assignment whose term covers today, so a booking,
  // cancelled/terminated contract or a tenant elsewhere never counts as occupied.
  const hasActiveTenant = useCallback(
    (group) => Boolean(String(group.room?.tenantName || '').trim()),
    []
  );

  const rooms = useMemo(() => {
    const map = new Map();
    sheet.forEach((r) => {
      if (!map.has(r.roomId)) map.set(r.roomId, { room: r, meters: [] });
      map.get(r.roomId).meters.push(r);
    });
    const groups = [...map.values()];
    return tenantStatus === 'OCCUPIED' ? groups.filter(hasActiveTenant) : groups;
  }, [sheet, tenantStatus, hasActiveTenant]);

  const valueOf = useCallback((meterId) => currents[String(meterId)], [currents]);

  const isMeterEntered = useCallback(
    (r) => {
      const val = valueOf(r.meterId);
      return val != null && val !== '';
    },
    [valueOf]
  );

  const isRoomEntered = useCallback(
    (group) => group.meters.length > 0 && group.meters.every(isMeterEntered),
    [isMeterEntered]
  );

  const totalRooms = rooms.length;
  const totalFilled = useMemo(() => rooms.filter(isRoomEntered).length, [rooms, isRoomEntered]);
  const totalPending = Math.max(totalRooms - totalFilled, 0);

  const validateReading = useCallback((r, val) => {
    if (val == null || val === '') return null;
    const num = Number(val);
    if (!Number.isFinite(num) || num < 0) {
      return 'តម្លៃត្រូវតែជាលេខ ហើយមិនអាចអវិជ្ជមានបានទេ។';
    }
    if (r.previousReading != null && num < Number(r.previousReading)) {
      return 'ការអានបច្ចុប្បន្នមិនអាចតិចជាងការអានមុនបានទេ។';
    }
    return null;
  }, []);

  const handleReadingChange = (meterId, value) => {
    setCurrents((prev) => ({ ...prev, [String(meterId)]: value }));
    setReadErrors((prev) => ({ ...prev, [String(meterId)]: undefined }));
  };

  const handleSaveAll = async () => {
    const errors = {};
    const rowsByHouse = {};
    for (const r of sheet) {
      const val = currents[String(r.meterId)];
      if (val == null || val === '') continue;
      const err = validateReading(r, val);
      if (err) errors[String(r.meterId)] = err;
      if (r.houseId != null) {
        rowsByHouse[r.houseId] = rowsByHouse[r.houseId] || [];
        rowsByHouse[r.houseId].push({ meterId: r.meterId, currentReading: Number(val) });
      }
    }
    const houseIds = Object.keys(rowsByHouse);
    if (houseIds.length === 0) {
      toast.error('គ្មានទិន្នន័យ', 'សូមបញ្ចូលការអានម៉ែត្រយ៉ាងហោចណាស់មួយបន្ទប់មុនពេលរក្សាទុក។');
      return;
    }
    if (Object.values(errors).some(Boolean)) {
      setReadErrors(errors);
      toast.error('មានបញ្ហាសុពលភាព', 'សូមកែតម្រង់តម្លៃដែលបានបន្លិចមុនពេលរក្សាទុក។');
      return;
    }

    setSaving(true);
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    try {
      for (const hid of houseIds) {
        const result = await saveMonthlySheet({
          houseId: Number(hid),
          billingYear: Number(year),
          billingMonth: Number(month),
          rows: rowsByHouse[hid],
        });
        createdCount += result.createdCount || 0;
        updatedCount += result.updatedCount || 0;
        skippedCount += result.skippedCount || 0;
      }
      toast.success(
        'រក្សាទុកជោគជ័យ',
        `បានបង្កើត ${createdCount} កំណត់ត្រា កែប្រែ ${updatedCount} រំលង ${skippedCount}។`
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

  const renderEmptyState = () => {
    if (search) {
      return (
        <EmptyState
          icon={Search}
          title="រកមិនឃើញបន្ទប់ដែលត្រូវនឹងការស្វែងរកទេ។"
          description="សូមព្យាយាមលេខបន្ទប់ ឈ្មោះអ្នកជួល ឬលេខម៉ែត្រផ្សេង។"
        />
      );
    }
    if (tenantStatus === 'OCCUPIED') {
      return (
        <EmptyState
          icon={DoorClosed}
          title="រកមិនឃើញបន្ទប់ដែលកំពុងមានអ្នកជួលទេ។"
          description="សូមកែប្រូរតម្រងដែលផ្សេង ឬជ្រើសរើស «ទាំងអស់» ដើម្បីមើលបន្ទប់ទាំងអស់។"
        />
      );
    }
    if (status === 'NOT_ENTERED') {
      return (
        <EmptyState
          icon={ClipboardList}
          title="ការអានម៉ែត្រទាំងអស់ត្រូវបានបញ្ចូលសម្រាប់រយៈពេលនេះហើយ។"
          description="មិនមានបន្ទប់នៅសល់សម្រាប់បំពេញតាមតម្រងដែលបានជ្រើសរើសទេ។"
        />
      );
    }
    if (status === 'ENTERED') {
      return (
        <EmptyState
          icon={ClipboardList}
          title="មិនទាន់មានបន្ទប់ណាមួយបានបញ្ចូលការអានសម្រាប់រយៈពេលនេះទេ។"
          description="សូមកត់ត្រាការអានបច្ចុប្បន្នសម្រាប់បន្ទប់ជាមុនសិន។"
        />
      );
    }
    return (
      <EmptyState
        icon={ClipboardList}
        title={houseId ? 'រកមិនឃើញបន្ទប់សម្រាប់អចលនទ្រព្យនេះទេ។' : 'រកមិនឃើញបន្ទប់ក្នុងអចលនទ្រព្យរបស់អ្នកទេ។'}
        description="សូមបន្ថែមម៉ែត្រប្រើប្រាស់ និងចាត់តាំងឱ្យបន្ទប់ មុនពេលកត់ត្រាការអានប្រចាំខែ។"
      />
    );
  };

  const showNoHouses = !housesLoading && houses.length === 0;

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
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh} disabled={sheetLoading}>
            ធ្វើឱ្យស្រស់
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveAll} loading={saving} disabled={sheetLoading}>
            រក្សាទុកទាំងអស់
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:flex-wrap">
          <div className="w-full sm:w-56">
            <Select label="អចលនទ្រព្យ" options={houseOptions} value={String(houseId)} onChange={(e) => setHouseId(e.target.value)} />
          </div>
          <div className="w-full sm:w-32">
            <Select label="ឆ្នាំ" options={YEAR_OPTIONS} value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="w-full sm:w-40">
            <Select label="ខែ" options={MONTH_OPTIONS} value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="w-full sm:w-36">
            <Select
              label="ជាន់"
              options={floorSelectOptions}
              value={String(floor)}
              onChange={(e) => setFloor(e.target.value)}
              disabled={floorsLoading || !floorOptions.length}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="ស្ថានភាពអ្នកជួល"
              options={TENANT_STATUS_FILTERS}
              value={tenantStatus}
              onChange={(e) => setTenantStatus(e.target.value)}
            />
          </div>
          <div className="w-full lg:max-w-xs lg:flex-1">
            <Input
              placeholder="ស្វែងរកបន្ទប់ អ្នកជួល ឬលេខម៉ែត្រ..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3 dark:border-gray-800">
          <span className="mr-1 text-xs font-medium text-slate-400 dark:text-slate-500">ស្ថានភាពអាន៖</span>
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={status === f.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Card>

      {(housesError || sheetError) && (
        <Alert variant="danger" title="កំហុសក្នុងការផ្ទុក" description={housesError || sheetError} dismissible />
      )}

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="បន្ទប់" value={totalRooms} icon={DoorClosed} />
        <SummaryCard label="បានបញ្ចូល" value={totalFilled} icon={ClipboardList} />
        <SummaryCard label="នៅសល់" value={totalPending} icon={Calendar} />
      </div>

      {!showNoHouses && sheetLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-14 ${i > 0 ? 'mt-2' : ''} w-full`} />
          ))}
        </div>
      ) : showNoHouses ? (
        <EmptyState
          icon={DoorClosed}
          title="រកមិនឃើញអចលនទ្រព្យទេ។"
          description="សូមបន្ថែមអចលនទ្រព្យជាមុនសិន បន្ទាប់មកចាត់តាំងម៉ែត្រប្រើប្រាស់ឱ្យបន្ទប់ ដើម្បីចាប់ផ្តើមកត់ត្រាការអាន។"
        />
      ) : sheet.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {rooms.map(({ room, meters }) => (
            <div key={room.roomId} className="border-b border-slate-100 last:border-0 dark:border-gray-800">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm dark:bg-gray-800 dark:text-slate-300">
                  <DoorClosed className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  បន្ទប់ {room.roomNumber}
                </span>
                {room.floorNumber != null && (
                  <Badge variant="neutral">ជាន់ {room.floorNumber}</Badge>
                )}
                {room.houseName && (
                  <Badge variant="neutral" className="hidden sm:inline-flex">{room.houseName}</Badge>
                )}
                {room.tenantName && (
                  <span className="hidden text-xs text-slate-400 sm:inline">អ្នកជួល៖ {room.tenantName}</span>
                )}
                <Badge variant="neutral" className="ml-auto">ម៉ែត្រ {meters.length}</Badge>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-gray-800">
                {meters.map((r) => {
                  const Icon = TYPE_ICON[r.utilityTypeCode] || TYPE_ICON[r.utilityTypeName] || Zap;
                  const val = valueOf(r.meterId);
                  const usage =
                    val != null && val !== '' && r.previousReading != null
                      ? Number(val) - Number(r.previousReading)
                      : null;
                  const meterError = readErrors[String(r.meterId)];
                  return (
                    <div
                      key={r.meterId}
                      className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] sm:items-start sm:gap-4"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-300">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                            {r.utilityTypeName || 'ប្រើប្រាស់'}
                          </p>
                          <p className="text-xs text-slate-400">លេខ {r.meterNumber}</p>
                        </div>
                      </div>
                      <ReadOnlyField label="លើកមុន" value={r.previousReading ?? '0'} />
                      <ReadOnlyField
                        label="បច្ចុប្បន្ន"
                        value={r.currentReading != null ? String(r.currentReading) : '—'}
                      />
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
                          error={meterError}
                          onChange={(e) => handleReadingChange(r.meterId, e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 flex items-start justify-end sm:col-span-1 sm:pt-6">
                        {val != null && val !== '' && (
                          <Badge variant={usage != null && usage >= 0 ? 'info' : 'danger'}>
                            ប្រើ: {usage != null ? `${usage} ${r.utilityTypeUnit || ''}`.trim() : '—'}
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