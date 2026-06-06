"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

export type UserMessage = {
  id: string;
  type: string;
  subject: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
};

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

export function UserMailboxModal({ open, onClose, onUnreadChange }: Props) {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [selected, setSelected] = useState<UserMessage | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ messages: UserMessage[]; unread: number }>(
        "/api/messages/mine",
        { token: getToken() },
      );
      setMessages(data.messages);
      onUnreadChange?.(data.unread);
    } catch {
      setMessages([]);
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

  async function openDetail(msg: UserMessage) {
    setSelected(msg);
    if (!msg.readAt) {
      try {
        const data = await api<{ message: UserMessage }>(
          `/api/messages/${msg.id}/read`,
          { method: "POST", token: getToken() },
        );
        setSelected(data.message);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? data.message : m)),
        );
        const unread = messages.filter((m) => (m.id === msg.id ? false : !m.readAt)).length;
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
            {selected ? selected.subject : "편지함"}
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
              <div className="rounded-xl border border-[var(--pink-border)] bg-[var(--pink-bg-soft)] p-4">
                <p className="text-[11px] text-gray-400">{formatDate(selected.createdAt)}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {selected.body}
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-4xl" aria-hidden>
                📭
              </p>
              <p className="mt-3 text-sm text-gray-500">받은 편지가 없습니다.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {messages.map((msg) => {
                const unread = !msg.readAt;
                return (
                  <li key={msg.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(msg)}
                      className="flex w-full items-start gap-3 py-3 text-left transition hover:bg-[var(--pink-bg-soft)]"
                    >
                      <span className="mt-1 text-lg" aria-hidden>
                        {unread ? "✉️" : "📭"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-gray-900">
                            {msg.subject}
                          </span>
                          {unread ? (
                            <span className="rounded-full bg-[var(--pink-accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                              NEW
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-gray-400">
                          {msg.body.replace(/\s+/g, " ").slice(0, 60)}
                          {msg.body.length > 60 ? "…" : ""}
                        </span>
                        <span className="mt-1 block text-[10px] text-gray-400">
                          {formatDate(msg.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
