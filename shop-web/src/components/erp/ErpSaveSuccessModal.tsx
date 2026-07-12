"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  open: boolean;
  message?: string;
  subMessage?: string;
  onClose: () => void;
  autoCloseMs?: number;
};

export function ErpSaveSuccessModal({
  open,
  message,
  subMessage,
  onClose,
  autoCloseMs = 2800,
}: Props) {
  const { t } = useI18n();
  const displayMessage = message ?? t("erp.save.title");

  useEffect(() => {
    if (!open || autoCloseMs <= 0) return;
    const id = window.setTimeout(onClose, autoCloseMs);
    return () => window.clearTimeout(id);
  }, [open, onClose, autoCloseMs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="erp-save-success-title"
      onClick={onClose}
    >
      <div
        className="inquiry-success-modal w-full max-w-sm rounded-2xl border-2 border-[var(--pink-border)] bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inquiry-success-check mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg viewBox="0 0 52 52" className="h-10 w-10 text-emerald-500" aria-hidden>
            <circle
              className="inquiry-success-circle"
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              className="inquiry-success-tick"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27l8 8 16-18"
            />
          </svg>
        </div>
        <h2 id="erp-save-success-title" className="text-lg font-bold text-[var(--pink-deep)]">
          {displayMessage}
        </h2>
        {subMessage ? <p className="mt-2 text-sm text-gray-600">{subMessage}</p> : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#1e293b] py-2.5 text-sm font-medium text-white transition hover:bg-[#0f172a]"
        >
          {t("erp.save.ok")}
        </button>
      </div>
    </div>
  );
}
