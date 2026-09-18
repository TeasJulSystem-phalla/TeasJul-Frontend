import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ScanEye, Send, MapPin, Loader2, Building2, CheckCircle2 } from "lucide-react";

import { Button, Card, Alert, ConfirmDialog, Skeleton } from "../../components/ui/index.js";
import RoomDetailView from "../../components/room/RoomDetailView.jsx";
import PublicFooter from "../../components/public/PublicFooter.jsx";
import PublicationStatusBadge from "../../components/room/PublicationStatusBadge.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { roomApi } from "../../api/room.api";
import { houseApi } from "../../api/house.api";
import { roomTypeApi } from "../../api/roomType.api";
import { roomUtilityApi } from "../../api/roomUtility.api";
import { useHouseImages } from "../../hooks/useHouseImages";
import { useRoomTypeImages } from "../../hooks/useRoomTypeImages";
import { useBasePath } from "../../hooks/useBasePath.js";
import { canSubmitRoom } from "../../utils/roomPublication.js";
import { buildOwnerListingPreview } from "../../utils/roomPublicPreview.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value) || 0
  );

/**
 * Full-page, REAL public-style preview of an owner's room listing BEFORE
 * submission. Rendered standalone (public look & feel) so the Owner can verify
 * exactly what customers will see. Lives OUTSIDE the dashboard Layout.
 *
 * Flow: Editor → "Preview Public Listing" → this page → "Back to Edit" /
 * "Submit for Approval" (explicit confirm – never automatic).
 */
const RoomListingPreviewPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const basePath = useBasePath();
  const toast = useToast();

  const [room, setRoom] = useState(null);
  const [house, setHouse] = useState(null);
  const [roomType, setRoomType] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const houseImages = useHouseImages(house?.id);
  const roomTypeImages = useRoomTypeImages(roomType?.id);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const roomData = await roomApi.getRoomById(roomId);
        const [houseData, roomTypeData, roomAmenities, roomUtilities, houseNearby] =
          await Promise.all([
            roomData.houseId
              ? houseApi.getHouseById(roomData.houseId)
              : Promise.resolve(null),
            roomData.roomTypeId
              ? roomTypeApi.getRoomTypeById(roomData.roomTypeId)
              : Promise.resolve(null),
            roomApi.getRoomAmenities(roomId),
            roomUtilityApi.getRoomUtilities(roomId),
            roomData.houseId
              ? houseApi.getNearbyLocations(roomData.houseId)
              : Promise.resolve([]),
          ]);
        if (cancelled) return;
        setRoom(roomData);
        setHouse(houseData);
        setRoomType(roomTypeData);
        setAmenities(roomAmenities || []);
        setUtilities(roomUtilities || []);
        setNearby(houseNearby || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "មិនអាចផ្ទុកការផ្សាយជាមុនបានទេ។"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const previewRoom = useMemo(
    () =>
      buildOwnerListingPreview({
        room,
        house,
        roomType,
        houseImages: houseImages.images,
        roomTypeImages: roomTypeImages.images,
        amenities,
        utilities,
        nearby,
      }),
    [
      room,
      house,
      roomType,
      houseImages.images,
      roomTypeImages.images,
      amenities,
      utilities,
      nearby,
    ]
  );

  const editPath = `${basePath}/rooms/${roomId}/listing`;
  const backToEdit = () => navigate(editPath);
  const backToRooms = () => navigate(`${basePath}/rooms`);

  const isEligible = room ? canSubmitRoom(room) : false;
  const eligibleHint = room
    ? room.publicationStatus === "PENDING_APPROVAL"
      ? "បន្ទប់នេះកំពុងស្ថិតក្នុងការរង់ចាំការអនុម័តពីអ្នកគ្រប់គ្រងប្រព័ន្ធ។"
      : room.publicationStatus === "PUBLISHED"
      ? "បន្ទប់នេះត្រូវបានផ្សាយជាសាធារណៈរួចហើយ។"
      : room.status !== "AVAILABLE"
      ? "ដើម្បីដាក់ស្នើ ស្ថានភាពបន្ទប់ត្រូវមានស្ថានភាព «ទំនេរ (Available)»។"
      : "បន្ទប់នេះមិនអាចដាក់ស្នើក្នុងពេលនេះទេ។"
    : null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await roomApi.submitRoomForApproval(roomId);
      setRoom(res);
      setSubmitted(true);
      setConfirmOpen(false);
      toast.success(
        "បានដាក់ស្នើ",
        "បន្ទប់ត្រូវបានដាក់ស្នើសុំឱ្យអ្នកគ្រប់គ្រងប្រព័ន្ធអនុម័ត។"
      );
    } catch (err) {
      toast.error(
        "បរាជ័យ",
        err.response?.data?.message ||
          err.response?.data?.error ||
          "មិនអាចដាក់ស្នើបានទេ។"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---- success (already submitted) view ----
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f8f6]">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
          <Card
            title="បន្ទប់ត្រូវបានដាក់ស្នើសុំអនុម័តដោយជោគជ័យ"
            description="អ្នកគ្រប់គ្រងប្រព័ន្ធនឹងពិនិត្យ និងអនុម័ត ឬបដិសេធការផ្សាយរបស់អ្នក។"
            footer={
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => navigate(`${basePath}/submissions`)}
                >
                  តាមដានការផ្សាយរបស់ខ្ញុំ
                </Button>
                <Button variant="outline" onClick={backToRooms}>
                  ត្រឡប់ទៅបញ្ជីបន្ទប់
                </Button>
              </div>
            }
          >
            <div className="mx-auto max-w-[900px] bg-[#f8f8f6]">
              <RoomDetailView room={previewRoom} showBreadcrumb={false} />
            </div>
          </Card>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // ---- loading ----
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6]">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-center gap-4 px-4 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#0f2942]" />
          <div className="w-full max-w-3xl space-y-4">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ---- error ----
  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#f8f8f6]">
        <div className="mx-auto flex min-h-[60vh] max-w-[1100px] flex-col items-center justify-center gap-3 px-4 py-16 text-center">
          <Building2 className="h-10 w-10 text-slate-300" />
          <p className="text-[14px] text-slate-600">
            {error || "មិនបានរកឃើញបន្ទប់នេះទេ"}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={backToEdit}>
              ត្រឡប់ទៅកែប្រែ
            </Button>
            <Button variant="outline" size="sm" onClick={backToRooms}>
              ត្រឡប់ទៅបញ្ជីបន្ទប់
            </Button>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Owner preview action bar (review-only chrome – NOT part of the public page) */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={backToEdit}
              disabled={submitting}
            >
              ត្រឡប់ទៅកែប្រែ (Back to Edit)
            </Button>
            <div className="hidden sm:block">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0f2942]">
                <ScanEye className="h-3.5 w-3.5" />
                ការផ្សាយជាមុន (Public Listing Preview)
              </p>
              <p className="text-[11px] text-slate-400">
                នេះជាអ្វីដែលអតិថិជននឹងឃើញបន្ទាប់ពីអ្នកគ្រប់គ្រងប្រព័ន្ធអនុម័ត។
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <PublicationStatusBadge status={room.publicationStatus} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="h-4 w-4" />}
              onClick={() => setConfirmOpen(true)}
              loading={submitting}
              disabled={!isEligible}
            >
              ដាក់ស្នើសុំអនុម័ត (Submit for Approval)
            </Button>
          </div>
        </div>

        {/* Verification strip */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-2 text-[11.5px] text-slate-500 sm:px-6">
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              បានរក្សាទុករួចរាល់ — ពិនិត្យមុនពេលដាក់ស្នើ
            </span>
            {previewRoom.latitude != null && previewRoom.longitude != null && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Lat/Lng: {previewRoom.latitude}, {previewRoom.longitude}
              </span>
            )}
            {previewRoom.availableFrom && (
              <span>ចូលរស់នៅបានចាប់ពី: {previewRoom.availableFrom}</span>
            )}
            {previewRoom.houseName && (
              <span>ញ្ញា: {previewRoom.houseName}</span>
            )}
            <span>ថ្លៃជួល: {formatCurrency(previewRoom.monthlyRent)}/ខែ</span>
          </div>
        </div>
      </div>

      {!isEligible && eligibleHint && (
        <div className="mx-auto max-w-[1100px] px-4 pt-5 sm:px-6">
          <Alert variant="info" title="ការដាក់ស្នើ" description={eligibleHint} />
        </div>
      )}

      {/* REAL public room detail rendering */}
      <RoomDetailView room={previewRoom} showBreadcrumb={false} />

      <PublicFooter />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="ដាក់ស្នើសុំអនុម័ត?"
        description="តើអ្នកប្រាកដក្នុងការដាក់ស្នើការផ្សាយនេះសម្រាប់ការពិនិត្យដោយអ្នកគ្រប់គ្រងប្រព័ន្ធមែនទេ? បន្ទាប់ពីអនុម័ត អតិថិជននឹងឃើញការផ្សាយនេះជាសាធារណៈ។"
        confirmText="ដាក់ស្នើ"
        cancelText="បោះបង់"
        loading={submitting}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default RoomListingPreviewPage;