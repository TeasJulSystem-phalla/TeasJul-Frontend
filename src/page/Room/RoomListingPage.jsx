import { useNavigate, useParams } from "react-router-dom";
import RoomListingEditor from "../../components/room/RoomListingEditor.jsx";
import { useBasePath } from "../../hooks/useBasePath.js";

export default function RoomListingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const basePath = useBasePath();
  return (
    <RoomListingEditor
      mode="owner"
      roomId={roomId}
      basePath={basePath}
      onBack={() => navigate(`${basePath}/rooms`)}
      submissionsPath={`${basePath}/submissions`}
    />
  );
}