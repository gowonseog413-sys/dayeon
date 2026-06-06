"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  inquiryCategoryLabel,
  inquiryStatusLabel,
} from "@/lib/inquiry-labels";
import type { Inquiry } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InquiryMailboxModal({ open, onClose, onUnreadChange }: Props) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ inquiries: Inquiry[]; unread: number }>(
        "/api/inquiries/mine",
        { token: getToken() },
      );
      setInquiries(data.inquiries);
      onUnreadChange?.(data.unread);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    if (open) {
      setSelected(null);
      load();
    }
  }, [open, load]);

  async function openDetail(inq: Inquiry) {
    setSelected(inq);
    if (inq.status === "answered" && !inq.userReadAt) {
      try {
        const data = await api<{ inquiry: Inquiry }>(
          `/api/inquiries/${inq.id}/read`,
          { method: "POST", token: getToken() },
        );
        setSelected(data.inquiry);
        setInquiries((prev) =>
          prev.map((i) => (i.id === inq.id ? data.inquiry : i)),
        );
        const unread = inquiries.filter(
          (i) =>
            i.id === inq.id
              ? false
              : i.status === "answered" && !i.userReadAt,
        ).length;
        onUnreadChange?.(unread);
      } catch {
        /* ignore */
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-2 border-[var(--pink-border)] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="mailbox-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-4 py-3">
          <h2 id="mailbox-title" className="text-base font-semibold text-[var(--pink-deep)]">
            {selected ? "문의 상세" : "편지함 — 1:1 문의"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-gray-500 hover:bg-white hover:text-gray-800"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">불러오는 중…</p>
          ) : selected ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-[var(--pink-accent)] hover:underline"
              >
                ← 목록으로
              </button>
              <div className="rounded-xl border border-[var(--pink-border)] bg-[var(--pink-bg-soft)] p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {inquiryCategoryLabel(selected.category)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      selected.status === "answered"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {inquiryStatusLabel(selected.status)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{selected.subject}</h3>
                <p className="mt-1 text-[11px] text-gray-400">{formatDate(selected.createdAt)}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{selected.body}</p>
              </div>

              {selected.replies.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--pink-deep)]">답변</p>
                  {selected.replies.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-sky-100 bg-sky-50/80 p-3"
                    >
                      <p className="text-[11px] font-medium text-sky-700">다연 고객센터</p>
                      <p className="mt-1 text-[11px] text-gray-400">{formatDate(r.createdAt)}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{r.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                  아직 답변이 등록되지 않았습니다.
                </p>
              )}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">문의 내역이 없습니다.</p>
              <a
                href="/profile/inquiries"
                className="mt-3 inline-block text-sm font-medium text-[var(--pink-accent)] hover:underline"
                onClick={onClose}
              >
                1:1 문의 작성하기 →
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {inquiries.map((inq) => {
                const unread = inq.status === "answered" && !inq.userReadAt;
                return (
                  <li key={inq.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(inq)}
                      className="flex w-full items-start gap-3 py-3 text-left transition hover:bg-[var(--pink-bg-soft)]"
                    >
                      <span className="mt-1 text-lg" aria-hidden>
                        {unread ? "✉️" : "📭"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-gray-900">
                            {inq.subject}
                          </span>
                          {unread ? (
                            <span className="rounded-full bg-[var(--pink-accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                              NEW
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-gray-400">
                          {inquiryCategoryLabel(inq.category)} · {formatDate(inq.createdAt)}
                        </span>
                        <span
                          className={`mt-1 inline-block text-[10px] ${
                            inq.status === "answered" ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {inquiryStatusLabel(inq.status)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!selected && inquiries.length > 0 ? (
          <div className="border-t border-gray-100 px-4 py-3 text-center">
            <a
              href="/profile/inquiries"
              className="text-sm text-[var(--pink-accent)] hover:underline"
              onClick={onClose}
            >
              새 문의 작성하기
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
