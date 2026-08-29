import Button from './Button';
import Modal from './Modal';

const ConfirmDialog = ({
  open,
  title = 'បញ្ជាក់សកម្មភាព',
  description = 'តើអ្នកប្រាកដថាចង់បន្តឬ?',
  confirmText = 'បញ្ជាក់',
  cancelText = 'បោះបង់',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) => {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description} size="sm">
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
