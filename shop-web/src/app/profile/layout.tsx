"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { clearSession } from "@/lib/auth-store";
import { useAuth } from "@/hooks/useAuth";
import { honorificName, userPoints, userTier } from "@/lib/user-display";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    }
  }, [ready, user, router]);

  if (!ready) {
    return <p className="py-20 text-center text-sm text-gray-500">로딩 중...</p>;
  }

  if (!user) return null;

  const name = honorificName(user);
  const tier = userTier(user);
  const points = userPoints(user);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:gap-10">
      <ProfileSidebar />
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-4 py-3 shadow-[0_4px_18px_var(--pink-shadow)]">
          <p className="text-sm font-medium text-[var(--pink-deep)]">
            {name}은 현재 <span className="font-semibold">{tier}</span> 등급{" "}
            <span className="font-semibold">{points.toLocaleString("ko-KR")}</span> 포인트
            입니다.
          </p>
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
        {children}
      </div>
    </div>
  );
}
