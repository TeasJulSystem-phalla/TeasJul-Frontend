// src/components/feedback/FeedbackStatusBadge.jsx
import Badge from "../ui/Badge";

const STATUS_META = {
  PENDING: {
    variant: "warning",
    label: "រង់ចាំយល់ព្រម (Pending)",
  },
  PUBLISHED: {
    variant: "success",
    label: "បានផ្សាយ (Published)",
  },
  UNPUBLISHED: {
    variant: "neutral",
    label: "បានដកផ្សាយ (Unpublished)",
  },
};

const FeedbackStatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { variant: "default", label: status || "—" };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
};

export default FeedbackStatusBadge;