"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { ReferralSignupHint } from "@/components/ReferralSignupHint";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { api } from "@/lib/api";
import { mergeCartOnLogin } from "@/lib/cart-store";
import { mergeWishlistOnLogin } from "@/lib/wishlist-store";
import { saveSession } from "@/lib/auth-store";
import type { User } from "@/lib/types";

const labelClass = "block text-sm font-medium text-gray-800";
const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--pink-accent)]";

function RegisterForm() {
  const searchParams = useSearchParams();
  const presetReferral = searchParams.get("ref") || searchParams.get("referral") || "";
  const [form, setForm] = useState({
    name: "",
    referralCode: presetReferral,
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api<{ token: string; user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession(data.token, data.user);
      await mergeCartOnLogin(data.token);
      await mergeWishlistOnLogin(data.token);
      window.location.href = "/profile";
    } catch (err) {
      setError(err instanceof Error ? err.message : "가입 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          이름*
          <input
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="홍길동"
          />
        </label>
        <label className={labelClass}>
          추천인
          <input
            type="text"
            value={form.referralCode}
            onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
            className={inputClass}
            placeholder="추천 코드 (선택)"
          />
        </label>
      </div>
      <ReferralSignupHint />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          생년월일*
          <input
            type="date"
            required
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          핸드폰*
          <input
            type="tel"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="010-0000-0000"
          />
        </label>
      </div>

      <label className={labelClass}>
        Email*
        <input
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
          placeholder="you@example.com"
        />
      </label>

      <label className={labelClass}>
        주소
        <textarea
          rows={2}
          autoComplete="street-address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className={`${inputClass} resize-y`}
          placeholder="도로명 주소, 상세 주소"
        />
      </label>

      <label className={labelClass}>
        Password* <span className="text-xs font-normal text-gray-400">(6자 이상)</span>
        <PasswordInput
          required
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Password 확인*
        <PasswordInput
          required
          value={form.passwordConfirm}
          onChange={(v) => setForm({ ...form, passwordConfirm: v })}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "가입 중..." : "Create an Account"}
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-serif-logo text-3xl">Create an Account</h1>
      <SocialLoginButtons nextPath="/" />
      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        또는 이메일로 가입
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <Suspense fallback={<p className="text-center text-sm text-gray-500">로딩…</p>}>
        <RegisterForm />
      </Suspense>
      <p className="mt-6 text-center text-sm">
        이미 계정이 있나요? <Link href="/login" className="text-[var(--pink-accent)]">Sign In</Link>
      </p>
    </div>
  );
}
