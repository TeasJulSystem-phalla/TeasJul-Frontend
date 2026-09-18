import { Badge } from "../ui/index.js";
import { PUBLICATION_META, publicationVariant } from "../../utils/roomPublication.js";

// Renders the room-list publication status as a colored badge.
const PublicationStatusBadge = ({ status, className = "" }) => {
  const meta = PUBLICATION_META[status];
  if (!meta) return null;

  return (
    <Badge variant={publicationVariant(status)} className={className}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </Badge>
  );
};

export default PublicationStatusBadge;