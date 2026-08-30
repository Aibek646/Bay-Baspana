type ConfirmDialogProps = {
    title: string;
    message: string;
    confirmLabel?: string;
    busyLabel?: string;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmDialog = ({
    title,
    message,
    confirmLabel = 'Подтвердить',
    busyLabel = 'Выполняем…',
    busy = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => (
    <div
        onClick={busy ? undefined : onCancel}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-5 pb-10"
    >
        <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface w-full max-w-sm rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.20)]"
        >
            <h2 className="text-ink text-lg font-bold">{title}</h2>
            <p className="text-muted mt-2">{message}</p>

            <div className="mt-5 space-y-2">
                <button
                    onClick={onConfirm}
                    disabled={busy}
                    className="w-full rounded-xl bg-red-500 py-3 font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
                >
                    {busy ? busyLabel : confirmLabel}
                </button>
                <button
                    onClick={onCancel}
                    disabled={busy}
                    className="bg-ground text-ink w-full rounded-xl py-3 font-medium transition-opacity active:opacity-70 disabled:opacity-50"
                >
                    Отмена
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmDialog;
