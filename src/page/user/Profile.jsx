import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Building2,
  MapPin,
  BedDouble,
  Edit3,
} from "lucide-react";
import { userApi } from "../../api/user.api";
import useToast from "../../components/ui/Toast";
import Skeleton from "../../components/ui/Skeleton";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";

const STATUS_VARIANT = {
  ACTIVE: "success",
  INACTIVE: "danger",
  LOCKED: "warning",
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

const getAvatarColor = (str) => {
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
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date();
  const date = new Date(dateStr);
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
};

const HOUSE_STATUS_VARIANT = {
  ACTIVE: "success",
  INACTIVE: "danger",
  MAINTENANCE: "warning",
};

const Profile = () => {
  const toast = useToast();

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
      setHouses(housesData);
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
    if (!editForm.firstName.trim()) errs.firstName = "តម្រូវឱ្យបញ្ចូលនាមត្រកូល";
    if (!editForm.lastName.trim()) errs.lastName = "តម្រូវឱ្យបញ្ចូលគោត្តនាម";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEdit()) return;
    setEditLoading(true);
    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim() || null,
        avatar: editForm.avatar.trim() || null,
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-1.5 h-3 w-28" />
              <Skeleton className="mt-2 h-5 w-16 rounded-full" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-20" />
                </div>
              </div>
              <Skeleton className="mt-3 h-3.5 w-48" />
              <Skeleton className="mt-2 h-5 w-20 rounded-full" />
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
    (user.firstName || "") + (user.lastName || "") + user.username
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">ប្រវត្តិរូប</h1>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Edit3 className="h-4 w-4" />}
          onClick={openEdit}
        >
          កែប្រែប្រវត្តិរូប
        </Button>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Cover / avatar section */}
        <div className="relative">
          <div className="h-28 rounded-t-xl bg-gradient-to-r from-slate-800 to-slate-600 dark:from-gray-800 dark:to-gray-700" />
          <div className="relative -mt-12 px-6 pb-6">
            <div className="flex items-end gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={getFullName(user)}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-900"
                />
              ) : (
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg ${avatarColor}`}
                >
                  {getInitials(user.firstName, user.lastName)}
                </div>
              )}
              <div className="min-w-0 pb-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {getFullName(user)}
                </h2>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-6 py-5 sm:grid-cols-2 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
              <Mail className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">អ៊ីមែល</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{user.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
              <Phone className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">លេខទូរស័ព្ទ</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{user.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
              <Shield className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ស្ថានភាព</p>
              <Badge variant={STATUS_VARIANT[user.status] || "default"} className="mt-1">
                {user.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
              <Clock className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការចូលចុងក្រោយ</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
              <Calendar className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">បានចូលរួម</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
              <User className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">ការធ្វើបច្ចុប្បន្នភាពចុងក្រោយ</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {user.updatedAt ? formatRelativeTime(user.updatedAt) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible houses */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
          ផ្ទះដែលខ្ញុំអាចចូលប្រើបាន
        </h2>
        {houses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <Building2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
              អ្នកមិនទាន់មានសិទ្ធិចូលប្រើផ្ទះណាមួយនៅឡើយទេ។
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {houses.map((house) => (
              <div
                key={house.id}
                className="rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/20"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                          {house.name}
                        </h3>
                        {house.code && (
                          <p className="text-[12px] font-mono text-slate-400 dark:text-slate-500">
                            {house.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={HOUSE_STATUS_VARIANT[house.status] || "default"}>
                      {house.status}
                    </Badge>
                  </div>

                  {house.address && (
                    <div className="mt-3 flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{house.address}</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
                    <BedDouble className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span>
                      {house.availableRooms}/{house.totalRooms} បន្ទប់
                    </span>
                  </div>

                  {house.description && (
                    <p className="mt-2 line-clamp-2 text-[13px] text-slate-500 dark:text-slate-400">
                      {house.description}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 px-5 py-2.5 dark:border-gray-800">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    បង្កើតនៅ {new Date(house.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit profile modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="កែប្រែប្រវត្តិរូប"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setEditModal(false)} disabled={editLoading}>
              បោះបង់
            </Button>
            <Button onClick={handleEditSubmit} loading={editLoading}>
              រក្សាទុកការផ្លាស់ប្តូរ
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={getFullName(user)}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ${avatarColor}`}
              >
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {getFullName(user)}
              </p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                @{user.username}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="នាមត្រកូល"
              required
              placeholder="នាមត្រកូល"
              value={editForm.firstName}
              onChange={(e) => handleEditChange("firstName", e.target.value)}
              error={editErrors.firstName}
            />
            <Input
              label="គោត្តនាម"
              required
              placeholder="គោត្តនាម"
              value={editForm.lastName}
              onChange={(e) => handleEditChange("lastName", e.target.value)}
              error={editErrors.lastName}
            />
          </div>
          <Input
            label="លេខទូរស័ព្ទ"
            placeholder="លេខទូរស័ព្ទ"
            value={editForm.phone}
            onChange={(e) => handleEditChange("phone", e.target.value)}
          />
          <Input
            label="URL រូបភាពតំណាង"
            placeholder="https://example.com/avatar.jpg"
            value={editForm.avatar}
            onChange={(e) => handleEditChange("avatar", e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
