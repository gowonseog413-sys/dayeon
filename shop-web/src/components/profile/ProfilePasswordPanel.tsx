"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { SaveAlertModal } from "@/components/SaveAlertModal";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { fullNameFromUser } from "@/lib/shipping-address";

const labelClass = "block text-xs font-semibold text-[var(--pink-deep)] sm:text-sm";
const inputClass =
  "mt-1.5 w-full rounded-xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--pink-accent)] focus:bg-white";

export function ProfilePasswordPanel() {
  const { user, ready } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    birthDate: "",
  });
  const [useIdentity, setUseIdentity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: fullNameFromUser(user),
      phone: user.phone || "",
      birthDate: user.birthDate || "",
    }));
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !user) return;
    setLoading(true);
    setError("");
    try {
      const body = useIdentity
        ? {
            name: form.name,
            phone: form.phone,
            birthDate: form.birthDate,
            password: form.password,
            passwordConfirm: form.passwordConfirm,
          }
        : {
            currentPassword: form.currentPassword,
            password: form.password,
            passwordConfirm: form.passwordConfirm,
          };
      const data = await api<{ ok: boolean; message: string }>("/api/auth/change-password", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });
      setForm((f) => ({
        ...f,
        currentPassword: "",
        password: "",
        passwordConfirm: "",
      }));
      setSavedOpen(true);
      if (data.message) {
        // message shown in modal
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !user) {
    return <p className="text-sm text-gray-500">로딩 중...</p>;
  }

  if (user.authProvider && user.authProvider !== "local") {
    return (
      <div className="max-w-lg rounded-2xl border-2 border-[var(--pink-border)] bg-white p-6 text-sm text-gray-600">
        <p>
          이 계정은 <strong>{user.authProvider}</strong> 로그인을 사용합니다. 비밀번호는 해당
          서비스에서 관리해 주세요.
        </p>
        <p className="mt-3">
          이메일·비밀번호로 로그인하려면{" "}
          <Link href="/forgot-password" className="text-[var(--pink-accent)] underline">
            비밀번호 찾기
          </Link>
          를 이용하거나 고객센터로 문의해 주세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="max-w-lg space-y-5 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)] sm:p-6"
      >
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <p className="text-sm text-gray-600">
          비밀번호를 모르시면{" "}
          <Link
            href={`/forgot-password?email=${encodeURIComponent(user.email)}`}
            className="font-medium text-[var(--pink-accent)] underline"
          >
            비밀번호 찾기
          </Link>
          에서 이메일·이름·휴대폰·생년월일로 본인 확인 후 재설정할 수 있습니다.
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setUseIdentity(false)}
            className={`rounded-full px-3 py-1.5 transition ${
              !useIdentity
                ? "bg-[var(--pink-accent)] text-white"
                : "border border-[var(--pink-border)] text-gray-600"
            }`}
          >
            현재 비밀번호로 변경
          </button>
          <button
            type="button"
            onClick={() => setUseIdentity(true)}
            className={`rounded-full px-3 py-1.5 transition ${
              useIdentity
                ? "bg-[var(--pink-accent)] text-white"
                : "border border-[var(--pink-border)] text-gray-600"
            }`}
          >
            본인 정보로 변경
          </button>
        </div>

        {!useIdentity ? (
          <label className={labelClass}>
            현재 비밀번호*
            <PasswordInput
              required
              value={form.currentPassword}
              onChange={(v) => setForm({ ...form, currentPassword: v })}
              autoComplete="current-password"
              className={inputClass}
            />
          </label>
        ) : (
          <div className="space-y-4 rounded-xl bg-[var(--pink-bg-soft)]/60 p-4">
            <p className="text-xs text-gray-500">가입 시 등록한 정보와 일치해야 합니다.</p>
            <label className={labelClass}>
              이름*
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                핸드폰*
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </label>
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
            </div>
          </div>
        )}

        <label className={labelClass}>
          새 비밀번호* <span className="font-normal text-gray-400">(6자 이상)</span>
          <PasswordInput
            required
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          새 비밀번호 확인*
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
          className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>

      <SaveAlertModal
        open={savedOpen}
        message="비밀번호가 변경되었습니다. ERP 회원 정보에도 즉시 반영됩니다."
        onClose={() => setSavedOpen(false)}
      />
    </>
  );
}
