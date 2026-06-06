"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function InquirySuccessModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(id);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-success-title"
      onClick={onClose}
    >
      <div
        className="inquiry-success-modal w-full max-w-sm rounded-2xl border-2 border-[var(--pink-border)] bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inquiry-success-check mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg
            viewBox="0 0 52 52"
            className="h-10 w-10 text-emerald-500"
            aria-hidden
          >
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
        <h2
          id="inquiry-success-title"
          className="text-lg font-bold text-[var(--pink-deep)]"
        >
          문의가 접수되었습니다
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          고객센터에서 순차적으로 답변드립니다.
          <br />
          답변은 <span className="font-medium text-[var(--pink-accent)]">편지함</span>에서
          확인하실 수 있습니다.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#1e293b] py-2.5 text-sm font-medium text-white transition hover:bg-[#0f172a]"
        >
          확인
        </button>
      </div>
    </div>
  );
}
