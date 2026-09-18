import { useState } from "react";
import { Send } from "lucide-react";
import { Button, ConfirmDialog, Modal } from "../ui/index.js";
import { useToast } from "../ui/Toast.jsx";
import { roomApi } from "../../api/room.api.js";
import { canSubmitRoom } from "../../utils/roomPublication.js";

/**
 * Safe "Submit for Review" control for a room.
 *
 * Renders a button (text or icon-only). When a `preview` node is provided the
 * click opens a public-style preview modal first; its "បញ្ជូនទៅពិនិត្យ (Submit)"
 * footer button then opens the confirmation dialog. Otherwise the confirmation
 * dialog opens directly, and confirming calls `POST /rooms/:id/submit` with an
 * in-flight guard against double submission. When the room is not eligible
 * (`canSubmitRoom`) the control is disabled.
 */
const SubmitForReviewButton = ({
  room,
  onSuccess,
  size = "sm",
  iconOnly = false,
  disabled = false,
  label = "ដាក់ស្នើសម្រាប់ការពិនិត្យ (Submit for Review)",
  className = "",
  preview = null,
  previewTitle = "ពិនិត្យជាមុន (Preview)",
}) => {
  const toast = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const eligible = canSubmitRoom(room);
  const clickable = eligible && !disabled;

  const openFlow = () => {
    if (preview) setPreviewOpen(true);
    else setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!room) return;
    setSubmitting(true);
    try {
      await roomApi.submitRoomForApproval(room.id);
      setConfirmOpen(false);
      toast.success(
        "បានដាក់ស្នើសម្រាប់ការពិនិត្យ",
        `បន្ទប់ ${room.roomNumber || room.name || room.id} កំពុងរង់ចាំការអនុម័ត។`
      );
      if (onSuccess) await onSuccess(room);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "ការដាក់ស្នើបរាជ័យ សូមព្យាយាមម្តងទៀត។";
      toast.error("ការដាក់ស្នើបរាជ័យ", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {iconOnly ? (
        <Button
          variant="outline"
          size="sm"
          disabled={!clickable}
          leftIcon={<Send className="h-4 w-4 text-primary" />}
          onClick={openFlow}
          className={className}
          aria-label={label}
          title={label}
        />
      ) : (
        <Button
          variant="primary"
          size={size}
          disabled={!clickable}
          leftIcon={<Send className="h-4 w-4" />}
          onClick={openFlow}
          className={className}
        >
          {label}
        </Button>
      )}

      {preview && (
        <Modal
          open={previewOpen && !!room}
          onClose={() => setPreviewOpen(false)}
          title={previewTitle}
          description="មើលឃើញដូចអ្នកទស្សនានៅលើគេហទំព័រសាធារណៈ មុននឹងដាក់ស្នើសម្រាប់ការពិនិត្យ។"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                បោះបង់
              </Button>
              <Button
                variant="primary"
                leftIcon={<Send className="h-4 w-4" />}
                onClick={() => {
                  setPreviewOpen(false);
                  setConfirmOpen(true);
                }}
              >
                បញ្ជូនទៅពិនិត្យ (Submit)
              </Button>
            </>
          }
        >
          {preview}
        </Modal>
      )}

      <ConfirmDialog
        open={confirmOpen && !!room}
        title="ដាក់ស្នើសម្រាប់ការពិនិត្យ"
        description={`ផ្ញើបន្ទប់ "${room?.name || room?.roomNumber || room?.id}" ទៅកាន់អ្នកគ្រប់គ្រងប្រព័ន្ធសម្រាប់ការពិនិត្យ និងបោះពុម្ពផ្សាយ?`}
        confirmText="ដាក់ស្នើ"
        cancelText="បោះបង់"
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default SubmitForReviewButton;