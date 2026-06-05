"use client";

type Props = {
  open: boolean;
  message?: string;
  onClose: () => void;
};

export function SaveAlertModal({
  open,
  message = "저장되었습니다.",
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-[var(--pink-border)] bg-white p-6 text-center shadow-[0_8px_32px_var(--pink-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="save-modal-title"
          className="text-base font-semibold text-[var(--pink-deep)]"
        >
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[var(--pink-accent)] py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          확인
        </button>
      </div>
    </div>
  );
}
