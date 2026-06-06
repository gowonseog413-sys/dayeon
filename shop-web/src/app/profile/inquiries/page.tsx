"use client";

import { useEffect, useState } from "react";
import { InquirySuccessModal } from "@/components/InquirySuccessModal";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { INQUIRY_CATEGORIES } from "@/lib/inquiry-labels";
import { publishInquiryCreated } from "@/lib/inquiry-sync";
import { fullNameFromUser } from "@/lib/shipping-address";
import type { Inquiry, InquiryCategory } from "@/lib/types";

const labelClass = "block text-xs font-semibold text-[var(--pink-deep)] sm:text-sm";
const inputClass =
  "mt-1.5 w-full rounded-xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--pink-accent)] focus:bg-white";
const requiredMark = <span className="text-red-500">*</span>;

export default function ProfileInquiriesPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    category: "order" as InquiryCategory,
    subject: "",
    body: "",
    orderId: "",
    userName: "",
    userEmail: "",
    userPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      userName: fullNameFromUser(user),
      userEmail: user.email || "",
      userPhone: user.phone || "",
    }));
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ inquiry: Inquiry }>("/api/inquiries", {
        method: "POST",
        token: getToken(),
        body: JSON.stringify(form),
      });
      setForm((f) => ({
        ...f,
        subject: "",
        body: "",
        orderId: "",
      }));
      publishInquiryCreated(data.inquiry);
      setSuccessOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "문의 접수에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">1:1 문의하기</h1>
        <p className="mt-2 text-sm text-gray-500">
          주문·배송·상품 관련 궁금한 점을 남겨 주시면 고객센터에서 순차적으로 답변드립니다.
        </p>
      </header>

      <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)] sm:p-8">
        <h2 className="text-base font-semibold text-[var(--pink-deep)]">문의 작성</h2>
        <p className="mt-1 text-xs text-gray-500">
          <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다.
        </p>

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              이름 {requiredMark}
              <input
                required
                className={inputClass}
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                placeholder="이름을 입력해 주세요"
              />
            </label>
            <label className={labelClass}>
              연락처
              <input
                className={inputClass}
                value={form.userPhone}
                onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
                placeholder="010-0000-0000"
              />
            </label>
          </div>

          <label className={labelClass}>
            이메일 {requiredMark}
            <input
              required
              type="email"
              className={inputClass}
              value={form.userEmail}
              onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
              placeholder="help@dayeon.shop"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              문의 유형 {requiredMark}
              <select
                required
                className={inputClass}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as InquiryCategory })
                }
              >
                {INQUIRY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              주문번호 (선택)
              <input
                className={inputClass}
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                placeholder="주문 관련 문의 시 입력"
              />
            </label>
          </div>

          <label className={labelClass}>
            제목 {requiredMark}
            <input
              required
              maxLength={120}
              className={inputClass}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="문의 제목을 입력해 주세요"
            />
          </label>

          <label className={labelClass}>
            문의 내용 {requiredMark}
            <textarea
              required
              rows={8}
              maxLength={5000}
              className={`${inputClass} resize-y`}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="문의하실 내용을 자세히 적어 주세요."
            />
          </label>

          <div className="flex flex-col items-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="min-w-[10rem] rounded-full bg-[#1e293b] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0f172a] disabled:opacity-50"
            >
              {loading ? "접수 중…" : "문의 접수하기"}
            </button>
            <p className="w-full whitespace-nowrap text-right text-[10px] text-gray-400 sm:text-[11px]">
              접수된 문의는 영업일 기준 1~2일 내 답변드립니다. 답변은 프로필 상단 편지함에서 확인할 수 있습니다.
            </p>
          </div>
        </form>
      </div>

      <InquirySuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}
