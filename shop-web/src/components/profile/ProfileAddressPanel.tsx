"use client";

import { useEffect, useState } from "react";
import { SaveAlertModal } from "@/components/SaveAlertModal";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getToken, saveSession } from "@/lib/auth-store";
import { fullNameFromUser, hasSavedShipping, shippingFromUser } from "@/lib/shipping-address";
import type { User } from "@/lib/types";

const labelClass = "block text-xs font-semibold text-[var(--pink-deep)] sm:text-sm";
const inputClass =
  "mt-1.5 w-full rounded-xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--pink-accent)] focus:bg-white";

export function ProfileAddressPanel() {
  const { user, ready } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [error, setError] = useState("");

  function fillFromUser(u: User) {
    const ship = shippingFromUser(u);
    setForm({
      name: ship.name || fullNameFromUser(u),
      phone: ship.phone || u.phone || "",
      email: u.email || "",
      address: ship.address || "",
    });
  }

  useEffect(() => {
    if (!user) return;
    fillFromUser(user);
  }, [user]);

  function resetForm() {
    if (!user) return;
    fillFromUser(user);
    setError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !user) return;
    setLoading(true);
    setError("");
    const prevShip = shippingFromUser(user);
    try {
      const data = await api<{ user: User }>("/api/auth/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          email: form.email,
          shippingAddress: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: prevShip.city || "Jakarta",
            postalCode: prevShip.postalCode || "",
          },
        }),
      });
      saveSession(token, data.user);
      fillFromUser(data.user);
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

  const saved = hasSavedShipping(user);

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg space-y-5 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)] sm:p-6"
      >
        <p className="text-sm text-gray-600">
          배송 정보를 미리 저장해 두면 결제 시 자동으로 채워집니다.
        </p>
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <label className={labelClass}>
          수령인*
          <input
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder={fullNameFromUser(user)}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            연락처*
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

          <label className={labelClass}>
            이메일*
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
        </div>

        <label className={labelClass}>
          주소*
          <textarea
            rows={3}
            required
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={`${inputClass} resize-y min-h-[5rem]`}
            placeholder="도로명 주소, 상세 주소"
          />
        </label>

        <div className="flex gap-2 pt-1">
          {saved && (
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 rounded-full border-2 border-[var(--pink-border)] py-2.5 text-sm"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full bg-[var(--pink-accent)] py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "저장 중..." : "배송 주소 저장"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-400">
        저장된 배송 정보는 결제 페이지에 자동으로 채워집니다.
      </p>

      <SaveAlertModal
        open={savedOpen}
        message="배송 주소가 저장되었습니다. 결제 페이지에 자동 적용됩니다."
        onClose={() => setSavedOpen(false)}
      />
    </>
  );
}
