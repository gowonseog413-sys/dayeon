"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth-store";
import type { User } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(data.token, data.user);
      router.push(
        data.user.role === "admin" && !nextUrl.startsWith("/checkout")
          ? "/erp"
          : nextUrl,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-100 p-6 shadow-sm">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="block text-sm">
          Email*
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password*
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white"
        >
          {loading ? "로그인 중..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요? <Link href="/register" className="text-[var(--pink-accent)]">회원가입</Link>
      </p>
      <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
        ERP 테스트: admin@eyesight.local / admin1234<br />
        고객 테스트: demo@eyesight.local / demo1234
      </p>
    </>
  );
}
