"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  CARD_BRANDS,
  CHANNEL_TYPE_LABEL,
  profileSummary,
  VA_BANKS,
  type PaymentChannel,
  type PaymentChannelType,
  type PaymentProfile,
} from "@/lib/payment-methods";

const inputClass =
  "mt-1 w-full rounded-xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-3 py-2.5 text-sm outline-none focus:border-[var(--pink-accent)] focus:bg-white";

const emptyForm = {
  channelType: "credit_card" as PaymentChannelType,
  label: "",
  cardBrand: "visa",
  cardLast4: "",
  cardHolder: "",
  expiryMonth: "",
  expiryYear: "",
  gopayPhone: "",
  vaBank: "BCA",
  isDefault: false,
};

export default function ProfilePaymentPage() {
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [profiles, setProfiles] = useState<PaymentProfile[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ profiles: PaymentProfile[]; channels: PaymentChannel[] }>(
        "/api/payment-profiles",
        { token: getToken() },
      );
      setProfiles(data.profiles);
      setChannels(data.channels);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      await api("/api/payment-profiles", {
        method: "POST",
        token: getToken(),
        body: JSON.stringify(form),
      });
      setForm({ ...emptyForm, channelType: form.channelType });
      setMsg("결제수단이 저장되었습니다.");
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string) {
    await api(`/api/payment-profiles/${id}/default`, {
      method: "PATCH",
      token: getToken(),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("이 결제수단을 삭제할까요?")) return;
    await api(`/api/payment-profiles/${id}`, { method: "DELETE", token: getToken() });
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">로딩 중...</p>;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-[var(--pink-deep)]">결제수단관리</h1>
      <p className="mb-6 text-sm text-gray-500">
        인도네시아에서 많이 쓰는 신용카드, GoPay(충전식), 가상계좌 입금을 등록할 수 있습니다.
        Jubelio 재고·주문 시스템과 연동된 채널로 결제됩니다.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-4 shadow-[0_4px_18px_var(--pink-shadow)]"
          >
            <p className="text-xs font-semibold text-[var(--pink-accent)]">
              {CHANNEL_TYPE_LABEL[ch.type]}
            </p>
            <p className="mt-1 font-medium text-[var(--pink-deep)]">{ch.nameKo}</p>
            <p className="mt-1 text-xs text-gray-500">{ch.descriptionKo}</p>
            <p className="mt-2 text-[10px] text-gray-400">Jubelio: {ch.jubelioCode}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
        <h2 className="mb-4 text-sm font-semibold text-[var(--pink-deep)]">등록된 결제수단</h2>
        {profiles.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 결제수단이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {profiles.map((p) => (
              <li
                key={p.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-3 ${
                  p.isDefault ? "border-[var(--pink-accent)] bg-[var(--pink-bg)]/40" : "border-gray-100"
                }`}
              >
                <div>
                  <p className="text-xs text-gray-500">{CHANNEL_TYPE_LABEL[p.channelType]}</p>
                  <p className="font-medium text-gray-900">{p.label}</p>
                  <p className="text-sm text-gray-600">{profileSummary(p)}</p>
                  {p.isDefault ? (
                    <span className="mt-1 inline-block rounded-full bg-[var(--pink-accent)] px-2 py-0.5 text-[10px] text-white">
                      기본
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2 text-xs">
                  {!p.isDefault && (
                    <button
                      type="button"
                      className="text-gray-600 hover:text-[var(--pink-accent)]"
                      onClick={() => setDefault(p.id)}
                    >
                      기본 설정
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => remove(p.id)}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={save}
        className="space-y-4 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]"
      >
        <h2 className="text-sm font-semibold text-[var(--pink-deep)]">결제수단 추가</h2>
        {msg && <p className="text-sm text-green-600">{msg}</p>}
        {err && <p className="text-sm text-red-500">{err}</p>}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">결제 유형</span>
          <select
            value={form.channelType}
            onChange={(e) =>
              setForm({ ...emptyForm, channelType: e.target.value as PaymentChannelType })
            }
            className={inputClass}
          >
            {channels.map((c) => (
              <option key={c.id} value={c.type}>
                {c.nameKo}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">표시 이름</span>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="예: 회사 카드, 개인 GoPay"
            className={inputClass}
          />
        </label>

        {form.channelType === "credit_card" && (
          <>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">카드 브랜드</span>
              <select
                value={form.cardBrand}
                onChange={(e) => setForm({ ...form, cardBrand: e.target.value })}
                className={inputClass}
              >
                {CARD_BRANDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">카드 번호 (끝 4자리만 저장)</span>
              <input
                required
                maxLength={4}
                value={form.cardLast4}
                onChange={(e) =>
                  setForm({ ...form, cardLast4: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                placeholder="1234"
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">카드 소유자명</span>
              <input
                required
                value={form.cardHolder}
                onChange={(e) => setForm({ ...form, cardHolder: e.target.value })}
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">만료 월 (MM)</span>
                <input
                  required
                  maxLength={2}
                  value={form.expiryMonth}
                  onChange={(e) => setForm({ ...form, expiryMonth: e.target.value })}
                  placeholder="09"
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">만료 연도 (YY)</span>
                <input
                  required
                  maxLength={2}
                  value={form.expiryYear}
                  onChange={(e) => setForm({ ...form, expiryYear: e.target.value })}
                  placeholder="28"
                  className={inputClass}
                />
              </label>
            </div>
          </>
        )}

        {form.channelType === "gopay" && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">GoPay 연동 휴대폰</span>
            <input
              required
              value={form.gopayPhone}
              onChange={(e) => setForm({ ...form, gopayPhone: e.target.value })}
              placeholder="08123456789"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">충전식 전자지갑 · 앱에서 QR/링크 결제</p>
          </label>
        )}

        {form.channelType === "virtual_account" && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">가상계좌 은행</span>
            <select
              value={form.vaBank}
              onChange={(e) => setForm({ ...form, vaBank: e.target.value })}
              className={inputClass}
            >
              {VA_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">입금 확인 후 Jubelio에서 주문이 확정됩니다.</p>
          </label>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          기본 결제수단으로 설정
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "저장 중..." : "결제수단 저장"}
        </button>
      </form>
    </div>
  );
}
