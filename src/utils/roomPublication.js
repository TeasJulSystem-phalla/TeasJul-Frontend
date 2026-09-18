// Shared helpers + metadata for the room-list publication workflow.
// Mirrors the backend RoomPublicationStatus enum.

export const PUBLICATION_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  UNPUBLISHED: "UNPUBLISHED",
};

export const PUBLICATION_META = {
  DRAFT: {
    label: "ព្រាង (Draft)",
    variant: "neutral",
    dot: "bg-slate-400",
  },
  PENDING_APPROVAL: {
    label: "រង់ចាំការអនុម័ត (Pending)",
    variant: "warning",
    dot: "bg-amber-500",
  },
  PUBLISHED: {
    label: "បានផ្សាយ (Published)",
    variant: "success",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "បានបដិសេធ (Rejected)",
    variant: "danger",
    dot: "bg-red-500",
  },
  UNPUBLISHED: {
    label: "មិនបានផ្សាយ (Unpublished)",
    variant: "default",
    dot: "bg-gray-400",
  },
};

export const PUBLICATION_META_ENTRIES = Object.entries(PUBLICATION_META).map(
  ([value, meta]) => ({ value, ...meta })
);

export const publicationLabel = (status) =>
  PUBLICATION_META[status]?.label || status || "—";

export const publicationVariant = (status) =>
  PUBLICATION_META[status]?.variant || "default";

/**
 * Whether a room may be submitted for public review from the UI.
 *
 * Only DRAFT / REJECTED rooms that are currently AVAILABLE can be re-submitted.
 * The backend `RoomPublicationService` is the source of truth and rejects
 * invalid transitions regardless of this helper.
 */
export const canSubmitRoom = (room) => {
  if (!room) return false;
  const publishable = ["DRAFT", "REJECTED"].includes(room.publicationStatus);
  return publishable && room.status === "AVAILABLE";
};