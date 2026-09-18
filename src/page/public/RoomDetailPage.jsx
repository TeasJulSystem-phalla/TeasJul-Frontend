import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";

import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";
import RoomDetailView from "../../components/room/RoomDetailView";
import { publicRoomApi } from "../../api/public.api";

const RoomDetailPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      publicRoomApi.getRoom(id),
      publicRoomApi.getSimilarRooms(id).catch(() => [])
    ])
      .then(([roomData, similarData]) => {
        if (!cancelled) {
          setRoom(roomData);
          setSimilarRooms(similarData);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || "មិនអាចផ្ទុកលម្អិតបន្ទប់បានទេ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6]">
        <PublicHeader active="rooms" />
        <main className="mx-auto flex min-h-[50vh] max-w-[1100px] items-center justify-center px-4 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#0f2942]" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#f8f8f6]">
        <PublicHeader active="rooms" />
        <main className="mx-auto flex min-h-[50vh] max-w-[1100px] flex-col items-center justify-center gap-3 px-4 py-16 text-center">
          <Building2 className="h-10 w-10 text-slate-300" />
          <p className="font-khmer text-[14px] text-slate-600">
            {error || "មិនបានរកឃើញបន្ទប់នេះទេ"}
          </p>
          <Link
            to="/public/rooms"
            className="font-khmer rounded-lg bg-[#0f2942] px-4 py-2 text-[12.5px] text-white hover:bg-[#173a5c]"
          >
            ត្រឡប់ទៅបញ្ជីបន្ទប់
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <PublicHeader active="rooms" />
      <RoomDetailView room={room} similarRooms={similarRooms} showBreadcrumb showContact showAvailableRooms />
      <PublicFooter />
    </div>
  );
};

export default RoomDetailPage;
