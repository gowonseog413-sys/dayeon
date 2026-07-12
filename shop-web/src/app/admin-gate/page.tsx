"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  getErpStoredUser,
  getErpToken,
  hasErpPortalAccess,
  migrateLegacyErpShopSession,
  saveErpSession,
} from "@/lib/auth-store";
import type { User } from "@/lib/types";

export default function AdminGatePage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    migrateLegacyErpShopSession();
    const user = getErpStoredUser();
    const token = getErpToken();
    if (user?.role === "admin" && token && hasErpPortalAccess()) {
      router.replace("/erp");
      return;
    }
    setChecking(false);
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const id = adminId.trim().toLowerCase();
    if (!id || !password) {
      setError("관리자 ID와 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const data = await api<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: id, password, erpPortal: true }),
      });
      if (data.user.role !== "admin") {
        setError("관리자 권한이 없습니다. 관계자에게 문의하세요.");
        return;
      }
      saveErpSession(data.token, data.user);
      router.replace("/erp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a2423] text-sm text-white/70">
        확인 중…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1a2423] text-white">
      <div
        className="border-b-4 border-amber-400 bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-4 py-4 text-center shadow-lg"
        role="alert"
      >
        <p className="text-lg font-extrabold tracking-[0.2em] text-white sm:text-xl">
          관계자외 출입금지
        </p>
        <p className="mt-1 text-sm font-medium text-red-100 sm:text-base">
          Authorized Personnel Only — 무단 접속 시 법적 조치가 취해질 수 있습니다.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7eb8b3]">
              dayeon ERP
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">관리자 전용 대문</h1>
            <p className="mt-2 text-sm text-white/60">
              승인된 관리자 계정으로만 ERP에 접속할 수 있습니다.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-white/10 bg-[#243332] p-6 shadow-2xl"
          >
            {error ? (
              <p
                className="mb-4 rounded-lg border border-red-400/40 bg-red-950/50 px-3 py-2 text-sm text-red-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <label className="block text-sm font-medium text-white/90">
              관리자 ID
              <input
                type="text"
                required
                autoComplete="username"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="관리자 ID 입력"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#1a2423] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-[#7eb8b3] focus:outline-none focus:ring-1 focus:ring-[#7eb8b3]"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-white/90">
              비밀번호
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#1a2423] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-[#7eb8b3] focus:outline-none focus:ring-1 focus:ring-[#7eb8b3]"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-[#4a6b68] py-3 text-sm font-semibold text-white transition hover:bg-[#5a7d7a] disabled:opacity-60"
            >
              {loading ? "인증 중…" : "ERP 관리자 접속"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            일반 쇼핑몰 로그인과 별도의 관리자 전용 경로입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
