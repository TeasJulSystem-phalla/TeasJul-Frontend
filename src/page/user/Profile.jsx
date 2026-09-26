import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Building2,
  MapPin,
  BedDouble,
  Edit3,
  ChevronRight,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Key,
  Users,
  Star,
  Activity,
  Globe,
  Smartphone,
  MailCheck,
  Fingerprint,
  CalendarDays,
  Clock4,
} from "lucide-react";
import { userApi } from "../../api/user.api";
import useToast from "../../components/ui/Toast";
import Skeleton from "../../components/ui/Skeleton";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";

const STATUS_VARIANT = {
  ACTIVE: { color: "emerald", icon: CheckCircle, label: "សកម្ម" },
  INACTIVE: { color: "gray", icon: XCircle, label: "អសកម្ម" },
  LOCKED: { color: "amber", icon: AlertCircle, label: "ចាក់សោ" },
  PENDING: { color: "blue", icon: Clock, label: "កំពុងរង់ចាំ" },
};

const HOUSE_STATUS_VARIANT = {
  ACTIVE: { color: "emerald", icon: CheckCircle, label: "សកម្ម" },
  INACTIVE: { color: "gray", icon: XCircle, label: "អសកម្ម" },
  MAINTENANCE: { color: "amber", icon: AlertCircle, label: "ថែទាំ" },
  FULL: { color: "blue", icon: Users, label: "ពេញ" },
};

const AVATAR_COLORS = [
  "from-blue-400 to-blue-500",
  "from-emerald-400 to-emerald-500",
  "from-violet-400 to-violet-500",
  "from-amber-400 to-amber-500",
  "from-rose-400 to-rose-500",
  "from-cyan-400 to-cyan-500",
  "from-pink-400 to-pink-500",
  "from-indigo-400 to-indigo-500",
  "from-teal-400 to-teal-500",
  "from-orange-400 to-orange-500",
];

const getAvatarColor = (str) => {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (firstName, lastName) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

const getFullName = (user) => {
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "User";
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return null;
  try {
    const now = new Date();
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return "ទើបតែឥឡូវនេះ";
    if (diffMins < 60) return `${diffMins} នាទីមុន`;
    if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;
    if (diffDays < 7) return `${diffDays} ថ្ងៃមុន`;
    if (diffWeeks < 4) return `${diffWeeks} សប្តាហ៍មុន`;
    return `${diffMonths} ខែមុន`;
  } catch {
    return null;
  }
};

const formatUserId = (id) => {
  if (!id) return "—";
  const idStr = String(id);
  return idStr.length > 8 ? `#${idStr.slice(0, 8)}` : `#${idStr}`;
};

const InfoItem = ({ icon: Icon, label, value, subValue }) => (
  <div className="group flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200 border border-slate-100/60 dark:border-slate-700/40 hover:border-slate-200 dark:hover:border-slate-600">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
        {value || "—"}
      </p>
      {subValue && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {subValue}
        </p>
      )}
    </div>
  </div>
);

const Profile = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const securityPath = () => {
    const { pathname } = window.location;
    if (pathname.startsWith("/manager")) return "/manager/security";
    if (pathname.startsWith("/tenant")) return "/tenant/security";
    if (pathname.startsWith("/owner")) return "/owner/settings/security";
    return "/owner/settings/security";
  };

  const [user, setUser] = useState(null);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", avatar: "" });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, housesData] = await Promise.all([
        userApi.getCurrentUser(),
        userApi.getMyAccessibleHouses().catch(() => []),
      ]);
      setUser(userData);
      setHouses(Array.isArray(housesData) ? housesData : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការផ្ទុកប្រវត្តិរូបបានបរាជ័យ។";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = () => {
    if (!user) return;
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    });
    setEditErrors({});
    setEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.firstName?.trim()) errs.firstName = "តម្រូវឱ្យបញ្ចូលនាមត្រកូល";
    if (!editForm.lastName?.trim()) errs.lastName = "តម្រូវឱ្យបញ្ចូលគោត្តនាម";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEdit()) return;
    if (!user?.id) {
      toast.error("កំហុស", "មិនអាចកំណត់អត្តសញ្ញាណអ្នកប្រើប្រាស់បានទេ");
      return;
    }
    setEditLoading(true);
    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone?.trim() || null,
        avatar: editForm.avatar?.trim() || null,
      };
      const updated = await userApi.updateUser(user.id, payload);
      setUser(updated);
      setEditModal(false);
      toast.success("បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប", "ប្រវត្តិរូបរបស់អ្នកត្រូវបានរក្សាទុក។");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបបានបរាជ័យ។";
      toast.error("ការធ្វើបច្ចុប្បន្នភាពបានបរាជ័យ", message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-1.5 h-3 w-32" />
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1 h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-3 w-40" />
              <Skeleton className="mt-2 h-3 w-28" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ប្រវត្តិរូប</h1>
        <Alert variant="danger" title="កំហុស" description={error} dismissible />
      </div>
    );
  }

  if (!user) return null;

  const avatarColor = getAvatarColor(
    (user.firstName || "") + (user.lastName || "") + (user.username || "")
  );

  const statusInfo = STATUS_VARIANT[user.status] || STATUS_VARIANT.ACTIVE;
  const StatusIcon = statusInfo.icon;

  const totalHouses = Array.isArray(houses) ? houses.length : 0;
  const activeHouses = Array.isArray(houses) ? houses.filter(h => h?.status === "ACTIVE").length : 0;
  const totalRooms = Array.isArray(houses) 
    ? houses.reduce((acc, h) => acc + (h?.totalRooms || 0), 0) 
    : 0;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            ប្រវត្តិរូប
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
              {user.role || "អ្នកប្រើប្រាស់"}
            </span>
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងសិទ្ធិចូលប្រើផ្ទះ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Shield className="h-4 w-4" />}
            onClick={() => navigate(securityPath())}
            className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          >
            សន្តិសុខ
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="h-4 w-4" />}
            onClick={openEdit}
            className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          >
            កែប្រែប្រវត្តិរូប
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="relative h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white dark:from-slate-800/90 to-transparent" />
        </div>

        {/* Avatar & Name */}
        <div className="relative -mt-12 px-6 pb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={getFullName(user)}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white shadow-sm bg-gradient-to-br ${avatarColor} ring-2 ring-white dark:ring-slate-800`}
                >
                  {getInitials(user.firstName, user.lastName)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {getFullName(user)}
                </h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-50 dark:bg-${statusInfo.color}-900/20 text-${statusInfo.color}-600 dark:text-${statusInfo.color}-400 border border-${statusInfo.color}-200/50 dark:border-${statusInfo.color}-800/30`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-0.5">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  @{user.username || "គ្មានឈ្មោះ"}
                </p>
                <span className="text-xs text-slate-300 dark:text-slate-600">|</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <MailCheck className="h-3.5 w-3.5" />
                  <span>{user.email || "—"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>
                    ចូលរួម {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Clock4 className="h-3.5 w-3.5" />
                  <span>សកម្ម {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 pb-4">
          {[
            { icon: Home, label: "ផ្ទះសរុប", value: totalHouses },
            { icon: Key, label: "សិទ្ធិចូលប្រើ", value: activeHouses },
            { icon: Users, label: "បន្ទប់សរុប", value: totalRooms },
            { icon: Star, label: "កម្រិត", value: "មាស" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50/70 dark:bg-slate-700/30 rounded-lg p-2.5 text-center border border-slate-100/50 dark:border-slate-700/30">
              <stat.icon className="h-4 w-4 mx-auto text-slate-400 dark:text-slate-500" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 px-6 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <InfoItem icon={Mail} label="អ៊ីមែល" value={user.email} />
          <InfoItem icon={Smartphone} label="លេខទូរស័ព្ទ" value={user.phone} />
          <InfoItem 
            icon={Shield} 
            label="ស្ថានភាព" 
            value={statusInfo.label} 
            subValue={user.updatedAt ? `ចាប់តាំងពី ${formatRelativeTime(user.updatedAt)}` : null} 
          />
          <InfoItem icon={Globe} label="តួនាទី" value={user.role || "អ្នកប្រើប្រាស់"} />
          <InfoItem icon={Fingerprint} label="ID អ្នកប្រើប្រាស់" value={formatUserId(user.id)} />
          <InfoItem 
            icon={Activity} 
            label="ស្ថានភាពចុងក្រោយ" 
            value={user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "—"} 
          />
        </div>
      </div>

      {/* Houses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                ផ្ទះដែលខ្ញុំអាចចូលប្រើបាន
              </h2>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {totalHouses} ផ្ទះ
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
            <Key className="inline h-3 w-3 mr-1" />
            {activeHouses} សកម្ម
          </span>
        </div>

        {!Array.isArray(houses) || houses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-base font-medium text-slate-600 dark:text-slate-300">
              មិនទាន់មានផ្ទះ
            </h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              អ្នកមិនទាន់មានសិទ្ធិចូលប្រើផ្ទះណាមួយនៅឡើយទេ។
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {houses.map((house, index) => {
              if (!house) return null;
              const status = HOUSE_STATUS_VARIANT[house.status] || HOUSE_STATUS_VARIANT.ACTIVE;
              const StatusIcon = status.icon;
              const available = house.availableRooms || 0;
              const total = house.totalRooms || 0;
              const occupancy = total > 0 ? Math.round((available / total) * 100) : 0;

              return (
                <div
                  key={house.id ?? `house-${index}`}
                  className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-${status.color}-50 dark:bg-${status.color}-900/20 flex items-center justify-center text-${status.color}-500 dark:text-${status.color}-400`}>
                          <Building2 className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                            {house.name || "គ្មានឈ្មោះ"}
                          </h3>
                          {house.code && (
                            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                              {house.code}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-${status.color}-50 dark:bg-${status.color}-900/20 text-${status.color}-600 dark:text-${status.color}-400 border border-${status.color}-200/50 dark:border-${status.color}-800/30`}>
                        <StatusIcon className="h-2.5 w-2.5" />
                        {status.label}
                      </span>
                    </div>

                    {house.address && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />
                        <span className="truncate">{house.address}</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <BedDouble className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span>
                          <span className="font-medium">{available}</span>
                          <span className="text-slate-400 dark:text-slate-500">/{total}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-0.5">បន្ទប់</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${status.color}-400 rounded-full transition-all duration-500`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          {occupancy}%
                        </span>
                      </div>
                    </div>

                    {house.description && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {house.description}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {house.createdAt ? new Date(house.createdAt).toLocaleDateString() : "—"}
                      </p>
                      <button className="text-[10px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors flex items-center gap-0.5">
                        មើល
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-slate-400" />
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">កែប្រែប្រវត្តិរូប</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួន
              </p>
            </div>
          </div>
        }
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModal(false)}
              disabled={editLoading}
            >
              បោះបង់
            </Button>
            <Button
              size="sm"
              onClick={handleEditSubmit}
              loading={editLoading}
              className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              រក្សាទុក
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-3 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={getFullName(user)}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
              />
            ) : (
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white bg-gradient-to-br ${avatarColor}`}
              >
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {getFullName(user)}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                @{user.username || "គ្មានឈ្មោះ"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                <Mail className="inline h-3 w-3 mr-1" />
                {user.email || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="នាមត្រកូល"
              required
              placeholder="បញ្ចូលនាមត្រកូល"
              value={editForm.firstName}
              onChange={(e) => handleEditChange("firstName", e.target.value)}
              error={editErrors.firstName}
              className="text-sm"
            />
            <Input
              label="គោត្តនាម"
              required
              placeholder="បញ្ចូលគោត្តនាម"
              value={editForm.lastName}
              onChange={(e) => handleEditChange("lastName", e.target.value)}
              error={editErrors.lastName}
              className="text-sm"
            />
          </div>

          <Input
            label="លេខទូរស័ព្ទ"
            placeholder="បញ្ចូលលេខទូរស័ព្ទ"
            value={editForm.phone}
            onChange={(e) => handleEditChange("phone", e.target.value)}
            className="text-sm"
            leftIcon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
          />

          <Input
            label="URL រូបភាពតំណាង"
            placeholder="https://example.com/avatar.jpg"
            value={editForm.avatar}
            onChange={(e) => handleEditChange("avatar", e.target.value)}
            className="text-sm"
            leftIcon={<Camera className="h-3.5 w-3.5 text-slate-400" />}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Profile;