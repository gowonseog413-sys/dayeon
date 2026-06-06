"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { UserMailboxModal } from "@/components/UserMailboxModal";
import { api } from "@/lib/api";
import { clearSession, getToken } from "@/lib/auth-store";
import { subscribeMessagesUpdates } from "@/lib/message-sync";
import { useAuth } from "@/hooks/useAuth";
import { TierBadge } from "@/components/TierBadge";
import { honorificName, userPoints, userTierId } from "@/lib/user-display";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await api<{ unread: number }>("/api/messages/mine", {
        token: getToken(),
      });
      setUnread(data.unread);
    } catch {
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    refreshUnread();
    return subscribeMessagesUpdates(() => {
      void refreshUnread();
    });
  }, [user, refreshUnread]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const poll = () => {
      if (cancelled || document.hidden) return;
      void refreshUnread();
    };
    const id = window.setInterval(poll, 2000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [user, refreshUnread]);

  if (!ready) {
    return <p className="py-20 text-center text-sm text-gray-500">로딩 중...</p>;
  }

  if (!user) return null;

  const name = honorificName(user);
  const tierId = userTierId(user);
  const points = userPoints(user);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:gap-10">
      <ProfileSidebar />
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-4 py-3 shadow-[0_4px_18px_var(--pink-shadow)]">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-[var(--pink-deep)]">
            <span>
              {name}은 현재 <TierBadge tier={tierId} size="sm" /> 등급
            </span>
            <span className="font-semibold">{points.toLocaleString("ko-KR")}</span>
            <span>포인트 입니다.</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="편지함 — 1:1 문의 답변"
              className={`relative flex items-center gap-1.5 rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)] ${
                unread > 0 ? "mailbox-btn--unread text-[var(--pink-deep)]" : ""
              }`}
              onClick={() => setMailboxOpen(true)}
            >
              {unread > 0 ? (
                <>
                  <span className="mailbox-sparkle mailbox-sparkle--1" aria-hidden>
                    ✦
                  </span>
                  <span className="mailbox-sparkle mailbox-sparkle--2" aria-hidden>
                    ✨
                  </span>
                  <span className="mailbox-sparkle mailbox-sparkle--3" aria-hidden>
                    ✦
                  </span>
                </>
              ) : null}
              <span className="mailbox-icon" aria-hidden>
                ✉️
              </span>
              <span className="hidden sm:inline">편지함</span>
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-[var(--pink-accent)] px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(233,30,140,0.6)]">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="rounded-full border-2 border-[var(--pink-border)] bg-white px-4 py-1.5 text-sm text-gray-600 transition hover:border-[var(--pink-accent)] hover:text-[var(--pink-accent)]"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
        {children}
      </div>
      <UserMailboxModal
        open={mailboxOpen}
        onClose={() => {
          setMailboxOpen(false);
          refreshUnread();
        }}
        onUnreadChange={setUnread}
      />
    </div>
  );
}
