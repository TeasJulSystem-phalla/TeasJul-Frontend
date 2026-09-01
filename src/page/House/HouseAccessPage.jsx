import { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Plus,
  Trash2,
  ShieldCheck,
  UserCircle2,
  RefreshCw,
  Home,
  Check,
} from "lucide-react";
import { houseApi } from "../../api/house.api";
import { useHouses } from "../../hooks/useHouses";
import { useMyRoles } from "../../hooks/useMyRoles";
import useToast from "../../components/ui/Toast";
import Skeleton from "../../components/ui/Skeleton";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const HouseAccessPage = () => {
  const { houses, loading: housesLoading, error: housesError } = useHouses();
  const { isOwner, loading: rolesLoading } = useMyRoles();
  const toast = useToast();

  const [selectedHouseId, setSelectedHouseId] = useState("");
  const [access, setAccess] = useState([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const [grantHouseId, setGrantHouseId] = useState(null);
  const [userId, setUserId] = useState("");
  const [granting, setGranting] = useState(false);

  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const selectedHouse = houses.find((h) => String(h.id) === String(selectedHouseId));

  const loadAccess = useCallback(
    async (houseId) => {
      setAccessLoading(true);
      setAccessError(null);
      try {
        const data = await houseApi.getHouseUsers(houseId);
        setAccess(data);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "ការទាញយកអ្នកគ្រប់គ្រងបរាជ័យ។";
        setAccessError(message);
      } finally {
        setAccessLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOwner && houses.length > 0 && !selectedHouseId) {
      setSelectedHouseId(String(houses[0].id));
    }
  }, [isOwner, houses, selectedHouseId]);

  useEffect(() => {
    if (selectedHouseId) {
      loadAccess(selectedHouseId);
    } else {
      setAccess([]);
    }
  }, [selectedHouseId, loadAccess]);

  const handleGrant = async () => {
    if (!grantHouseId || !userId) return;
    setGranting(true);
    try {
      await houseApi.grantAccess(grantHouseId, userId);
      toast.success("បានបន្ថែមសិទ្ធិ", "អ្នកប្រើត្រូវបានផ្តល់សិទ្ធិចូលដំណើរការផ្ទះដោយជោគជ័យ។");
      setGrantHouseId(null);
      setUserId("");
      loadAccess(grantHouseId);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការផ្តល់សិទ្ធិបរាជ័យ។";
      toast.error("កំហុស", message);
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await houseApi.revokeAccess(revokeTarget.houseId, revokeTarget.userId);
      toast.success("បានដកសិទ្ធិ", "សិទ្ធិចូលដំណើរការត្រូវបានដកចេញ។");
      setRevokeTarget(null);
      loadAccess(revokeTarget.houseId);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការដកសិទ្ធិបរាជ័យ។";
      toast.error("កំហុស", message);
    } finally {
      setRevoking(false);
    }
  };

  const loadCandidates = useCallback(
    async (houseId) => {
      setCandidatesLoading(true);
      try {
        const data = await houseApi.getAccessCandidates(houseId);
        setCandidates(data);
      } catch (err) {
        setCandidates([]);
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "ការទាញយកអ្នកគ្រប់គ្រងបរាជ័យ។";
        toast.error("កំហុស", message);
      } finally {
        setCandidatesLoading(false);
      }
    },
    [toast]
  );

  const userOptions = candidates.map((u) => ({
    value: String(u.id),
    label: `${u.username}${u.email ? ` (${u.email})` : ""}`,
  }));

  if (housesLoading || rolesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            ការចូលដំណើរការផ្ទះ
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            គ្រប់គ្រងសិទ្ធិចូលដំណើរការផ្ទះរបស់អ្នកគ្រប់គ្រង។
          </p>
        </div>
        <Alert
          variant="warning"
          title="មិនមានសិទ្ធិ"
          description="មានតែម្ចាស់ផ្ទះទេដែលអាចគ្រប់គ្រងសិទ្ធិចូលដំណើរការផ្ទះបាន។"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            ការចូលដំណើរការផ្ទះ
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ជ្រើសរើសផ្ទះ និងគ្រប់គ្រងអ្នកគ្រប់គ្រងដែលអាចចូលដំណើរការ។
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => selectedHouseId && loadAccess(selectedHouseId)}
        >
          ធ្វើឱ្យស្រស់
        </Button>
      </div>

      {housesError && <Alert variant="danger" title="កំហុស" description={housesError} dismissible />}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            ជ្រើសរើសផ្ទះ
          </label>
          {houses.length > 0 && (
            <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[12px] font-medium text-gray-600 dark:bg-gray-950/40 dark:text-gray-400">
              {houses.length} {houses.length > 1 ? "ផ្ទះ" : "ផ្ទះ"}
            </span>
          )}
        </div>
        {houses.length === 0 ? (
          <EmptyState
            icon={Home}
            title="មិនមានផ្ទះទេ"
            description="អ្នកមិនទាន់មានផ្ទះណាមួយនៅឡើយទេ។"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {houses.map((house) => {
              const isSelected = String(house.id) === String(selectedHouseId);
              return (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => setSelectedHouseId(String(house.id))}
                  aria-pressed={isSelected}
                  className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 ${
                    isSelected
                      ? "border-gray-500 bg-gradient-to-br from-gray-50 to-gray-100/60 shadow-md shadow-gray-500/10 dark:from-gray-950/40 dark:to-gray-900/20 dark:border-gray-500"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-br from-gray-500 to-indigo-600 shadow-md shadow-gray-500/30"
                          : "bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-gray-50 group-hover:to-gray-100 dark:from-gray-800 dark:to-gray-700"
                      }`}
                    >
                      <Home
                        className={`h-5 w-5 transition-colors duration-200 ${
                          isSelected
                            ? "text-white"
                            : "text-slate-500 group-hover:text-gray-600 dark:text-slate-400 dark:group-hover:text-gray-400"
                        }`}
                      />
                    </div>
                    {isSelected ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-500 shadow-sm shadow-gray-500/30">
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-200 transition-colors group-hover:border-gray-300 dark:border-gray-700 dark:group-hover:border-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-[15px] font-semibold transition-colors duration-200 ${
                        isSelected
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-slate-800 dark:text-white"
                      }`}
                    >
                      {house.name}
                    </p>
                    {house.code && (
                      <p className="mt-0.5 truncate text-[12px] text-slate-400 dark:text-slate-500">
                        {house.code}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto pt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-200 ${
                        isSelected
                          ? "bg-white/70 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                          : "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400"
                      }`}
                    >
                      <KeyRound className="h-3 w-3" />
                      អ្នកគ្រប់គ្រង
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <KeyRound className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-slate-800 dark:text-white">
              {selectedHouse?.name || "ផ្ទះ"}
            </p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              អ្នកគ្រប់គ្រងដែលមានសិទ្ធិក្នុងផ្ទះនេះ
            </p>
          </div>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          disabled={!selectedHouseId}
          onClick={() => {
            setGrantHouseId(selectedHouseId);
            setUserId("");
            loadCandidates(selectedHouseId);
          }}
        >
          បន្ថែមអ្នកគ្រប់គ្រង
        </Button>
      </div>

      {accessError && <Alert variant="danger" title="កំហុស" description={accessError} dismissible />}

      {accessLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : access.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="មិនទាន់មានអ្នកគ្រប់គ្រងទេ"
          description="បន្ថែមអ្នកគ្រប់គ្រងដើម្បីផ្តល់សិទ្ធិចូលដំណើរការផ្ទះនេះ។"
        />
      ) : (
        <div className="space-y-2">
          {access.map((item) => (
            <div
              key={`${item.houseId}-${item.userId}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <UserCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-800 dark:text-white">
                    {item.username || `អ្នកប្រើ #${item.userId}`}
                  </p>
                  <Badge variant="info" className="mt-1">
                    អ្នកគ្រប់គ្រង
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.createdAt && (
                  <span className="hidden text-[12px] text-slate-400 sm:block">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => setRevokeTarget(item)}
                >
                  ដកសិទ្ធិ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!grantHouseId}
        onClose={() => setGrantHouseId(null)}
        title="បន្ថែមអ្នកគ្រប់គ្រង"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setGrantHouseId(null)} disabled={granting}>
              បោះបង់
            </Button>
            <Button onClick={handleGrant} loading={granting} disabled={!userId}>
              ផ្តល់សិទ្ធិ
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              ជ្រើសរើសអ្នកប្រើដែលមានតួនាទីជាអ្នកគ្រប់គ្រង (MANAGER) ដើម្បីអាចចូលដំណើរការផ្ទះ{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {grantHouseId && houses.find((h) => String(h.id) === String(grantHouseId))?.name}
              </span>
              ។
            </p>
          </div>
          <Select
            label="អ្នកប្រើ"
            options={userOptions}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          {candidatesLoading ? (
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              កំពុងទាញយកអ្នកគ្រប់គ្រងដែលអាចជ្រើសរើសបាន...
            </p>
          ) : userOptions.length === 0 ? (
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              មិនមានអ្នកប្រើដែលមានតួនាទីអ្នកគ្រប់គ្រង (MANAGER) ដែលនៅសល់សម្រាប់ផ្ទះនេះទេ។
            </p>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!revokeTarget}
        title="ដកសិទ្ធិអ្នកគ្រប់គ្រង"
        description={`តើអ្នកប្រាកដថាចង់ដកសិទ្ធិ "${revokeTarget?.username || revokeTarget?.userId}" ពីផ្ទះនេះ?`}
        confirmText="ដកសិទ្ធិ"
        cancelText="បោះបង់"
        danger
        loading={revoking}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
};

export default HouseAccessPage;
