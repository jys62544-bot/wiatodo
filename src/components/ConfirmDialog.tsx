interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ title, message, confirmText, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/20 px-4">
      <div className="w-full max-w-xs rounded-md border border-slate-200 bg-white p-4 shadow-xl">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-5 text-slate-500">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-secondary" type="button" onClick={onCancel}>
            取消
          </button>
          <button className="btn-danger" type="button" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
