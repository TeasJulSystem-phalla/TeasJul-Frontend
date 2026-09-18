import { useNavigate } from "react-router-dom";
import RoomListingEditor from "../../components/room/RoomListingEditor.jsx";

export default function AdminRoomFormPage() {
  const navigate = useNavigate();
  return (
    <RoomListingEditor
      mode="admin"
      onBack={() => navigate("/admin")}
      submissionsPath="/admin/submissions"
    />
  );
}