"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getToken, saveSession } from "@/lib/auth-store";
import { SaveAlertModal } from "@/components/SaveAlertModal";
import { useTheme } from "@/components/ThemeProvider";
import type { User } from "@/lib/types";

function fullName(user: User | null) {
  if (!user) return "";
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
}

const labelClass = "block text-xs font-semibold text-[var(--pink-deep)] sm:text-sm";
const inputClass =
  "mt-1.5 w-full rounded-xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--pink-accent)] focus:bg-white";

export default function ProfilePage() {
  const { user, ready } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: fullName(user),
      birthDate: user.birthDate || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
    });
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api<{ user: User }>("/api/auth/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate || null,
          phone: form.phone || null,
          email: form.email,
          address: form.address || null,
        }),
      });
      saveSession(token, data.user);
      setForm({
        name: fullName(data.user),
        birthDate: data.user.birthDate || "",
        phone: data.user.phone || "",
        email: data.user.email || "",
        address: data.user.address || "",
      });
      setSavedOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !user) {
    return <p className="text-sm text-gray-500">로딩 중...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--pink-deep)]">내 프로필</h1>

      <div className="grid gap-8 md:grid-cols-[minmax(0,26rem)_1fr] md:items-start md:gap-10 lg:gap-12">
        <form
          onSubmit={onSubmit}
          className="w-full space-y-5 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)] sm:p-6"
        >
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <label className={labelClass}>
          이름
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
          생년월일
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          핸드폰
          <input
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="010-0000-0000"
          />
        </label>

        <label className={labelClass}>
          이메일
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
            rows={3}
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={`${inputClass} resize-y min-h-[5rem]`}
            placeholder="도로명 주소, 상세 주소"
          />
        </label>

        <p className="text-xs text-gray-400">
          로그인 방식: {user.authProvider || "local"}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
        </form>

        {theme !== "clean" && (
          <aside
            className="pointer-events-none hidden select-none md:flex md:items-center md:justify-center md:pt-4"
            aria-hidden
          >
            <Image
              src="/brand/dayeon-profile-mascot.png"
              alt=""
              width={512}
              height={512}
              unoptimized
              priority
              className="h-auto w-full max-w-[min(100%,22rem)] object-contain opacity-40 mix-blend-multiply lg:max-w-[26rem]"
              style={{ maxHeight: 420 }}
            />
          </aside>
        )}
      </div>

      <SaveAlertModal
        open={savedOpen}
        message="프로필이 저장되었습니다."
        onClose={() => setSavedOpen(false)}
      />
    </div>
  );
}
