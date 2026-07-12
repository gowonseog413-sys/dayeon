"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { api } from "@/lib/api";
import { OAUTH_ERRORS } from "@/lib/oauth";
import { mergeCartOnLogin } from "@/lib/cart-store";
import { mergeWishlistOnLogin } from "@/lib/wishlist-store";
import { saveSession } from "@/lib/auth-store";
import { resolveShopOAuthDest } from "@/lib/oauth-redirect";
import type { User } from "@/lib/types";

export function LoginForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/";
  const nextUrl =
    rawNext.startsWith("/erp") || rawNext.startsWith("/admin-gate") ? "/" : rawNext;
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const oauthError = searchParams.get("error");
  const oauthMessage = oauthError ? OAUTH_ERRORS[oauthError] || oauthError : "";

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
      await mergeCartOnLogin(data.token);
      await mergeWishlistOnLogin(data.token);
      window.location.href = resolveShopOAuthDest(nextUrl, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SocialLoginButtons nextPath={nextUrl} />
      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        또는 이메일로 로그인
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-100 p-6 shadow-sm">
        {(error || oauthMessage) && (
          <p className="text-sm text-red-600">{error || oauthMessage}</p>
        )}
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
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm">Password*</span>
            <Link
              href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"}
              className="text-xs font-medium text-[var(--pink-accent)] hover:underline"
            >
              비밀번호 찾기
            </Link>
          </div>
          <PasswordInput
            required
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white"
        >
          {loading ? "로그인 중..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{" "}
        <Link href="/register" className="font-medium text-[var(--pink-accent)]">
          회원가입
        </Link>
        <span className="mx-2 text-gray-300">|</span>
        <Link href="/forgot-password" className="font-medium text-[var(--pink-accent)]">
          비밀번호 찾기
        </Link>
      </p>
    </>
  );
}
