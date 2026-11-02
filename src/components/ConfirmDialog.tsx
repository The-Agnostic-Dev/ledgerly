import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="button danger" disabled={busy} onClick={() => onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
