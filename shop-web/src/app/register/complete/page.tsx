"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DayeonLogo } from "@/components/DayeonLogo";
import { ReferralSignupHint } from "@/components/ReferralSignupHint";
import { api } from "@/lib/api";
import { getToken, saveSession } from "@/lib/auth-store";
import { isProfileComplete } from "@/lib/profile-complete";
import { fullNameFromUser } from "@/lib/shipping-address";
import type { User } from "@/lib/types";

const labelClass = "block text-sm font-medium text-gray-800";
const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--pink-accent)]";

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetReferral = searchParams.get("ref") || searchParams.get("referral") || "";
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    referralCode: presetReferral,
    birthDate: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?next=/register/complete");
      return;
    }
    api<{ user: User }>("/api/auth/me", { token })
      .then((data) => {
        if (isProfileComplete(data.user)) {
          router.replace("/profile");
          return;
        }
        setUser(data.user);
        setForm((f) => ({
          ...f,
          name: fullNameFromUser(data.user) || f.name,
          birthDate: data.user.birthDate || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
        }));
      })
      .catch(() => {
        router.replace("/login?next=/register/complete");
      })
      .finally(() => setBooting(false));
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api<{ user: User; message: string }>("/api/auth/complete-profile", {
        method: "POST",
        token,
        body: JSON.stringify(form),
      });
      saveSession(token, data.user);
      window.location.href = "/profile";
    } catch (err) {
      setError(err instanceof Error ? err.message : "가입 완료에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return <p className="text-center text-sm text-gray-500">로딩…</p>;
  }

  if (!user) return null;

  const providerLabel =
    user.authProvider === "google"
      ? "Google"
      : user.authProvider === "facebook"
        ? "Facebook"
        : "소셜";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="rounded-lg bg-[var(--pink-bg-soft)] px-3 py-2 text-sm text-gray-700">
        <strong>{providerLabel}</strong> 로그인으로 접속하셨습니다. 쇼핑·포인트·주문 이용을 위해
        정회원 정보를 입력해 주세요.
      </p>

      <label className={labelClass}>
        Email
        <input
          type="email"
          readOnly
          value={user.email}
          className={`${inputClass} bg-gray-50 text-gray-600`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          이름*
          <input
            type="text"
            required
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
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="010-0000-0000"
          />
        </label>
      </div>

      <label className={labelClass}>
        주소
        <textarea
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className={`${inputClass} resize-y`}
          placeholder="도로명 주소, 상세 주소"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "저장 중..." : "정회원 가입 완료"}
      </button>
    </form>
  );
}

export default function CompleteProfilePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 flex justify-center">
        <DayeonLogo variant="compact" href="/" />
      </div>
      <h1 className="mb-2 text-center text-3xl font-semibold">정회원 가입</h1>
      <p className="mb-8 text-center text-sm text-gray-500">
        소셜 로그인 후 추가 정보를 입력합니다
      </p>
      <Suspense fallback={<p className="text-center text-sm text-gray-500">로딩…</p>}>
        <CompleteProfileForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/" className="text-[var(--pink-accent)]">
          나중에 하기 (쇼핑몰 홈)
        </Link>
      </p>
    </div>
  );
}
