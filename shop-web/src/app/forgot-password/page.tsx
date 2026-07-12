"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { DayeonLogo } from "@/components/DayeonLogo";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { PasswordInput } from "@/components/PasswordInput";
import { api } from "@/lib/api";

const FORGOT_TABS = [
  { id: "reset", label: "비밀번호 찾기" },
  { id: "inquiry", label: "1:1 문의하기" },
] as const;

type ForgotTabId = (typeof FORGOT_TABS)[number]["id"];

function isForgotTabId(value: string | null): value is ForgotTabId {
  return value === "reset" || value === "inquiry";
}

function ForgotPasswordForm({ onGoInquiry }: { onGoInquiry: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") || "";
  const [form, setForm] = useState({
    email: presetEmail,
    name: "",
    phone: "",
    birthDate: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifyLoading(true);
    setError("");
    setSuccess("");
    setVerified(false);
    try {
      const data = await api<{ ok: boolean; message: string }>("/api/auth/verify-identity", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          birthDate: form.birthDate,
        }),
      });
      setVerified(true);
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "본인 확인에 실패했습니다.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!verified) {
      setError("먼저 본인 확인을 완료해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api<{ ok: boolean; message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(data.message);
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(form.email.trim())}`);
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onVerify}
        className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        {error && !verified ? <p className="text-sm text-red-600">{error}</p> : null}

        <p className="text-sm leading-relaxed text-gray-600">
          가입 시 등록한 <strong>이메일·이름·휴대폰·생년월일</strong>로 본인 확인 후 새 비밀번호를
          설정할 수 있습니다.
        </p>

        <label className="block text-sm">
          Email*
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => {
              setVerified(false);
              setForm({ ...form, email: e.target.value });
            }}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            placeholder="가입한 이메일"
          />
        </label>

        <label className="block text-sm">
          이름*
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => {
              setVerified(false);
              setForm({ ...form, name: e.target.value });
            }}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            placeholder="가입 시 등록한 이름"
          />
        </label>

        <label className="block text-sm">
          휴대폰 번호*
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => {
              setVerified(false);
              setForm({ ...form, phone: e.target.value });
            }}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
            placeholder="010-0000-0000"
            autoComplete="tel"
          />
        </label>

        <label className="block text-sm">
          생년월일*
          <input
            type="date"
            required
            value={form.birthDate}
            onChange={(e) => {
              setVerified(false);
              setForm({ ...form, birthDate: e.target.value });
            }}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={verifyLoading || verified}
          className="w-full rounded-full border border-[var(--pink-accent)] bg-white py-3 text-sm font-medium text-[var(--pink-accent)] disabled:opacity-60"
        >
          {verifyLoading ? "확인 중…" : verified ? "본인 확인 완료" : "본인 확인"}
        </button>
      </form>

      {verified ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>
          ) : null}

          <p className="text-sm text-gray-600">
            본인 확인이 완료되었습니다. 새 비밀번호를 입력해 주세요.
          </p>

          <label className="block text-sm">
            새 비밀번호* <span className="text-xs text-gray-400">(6자 이상)</span>
            <PasswordInput
              required
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              autoComplete="new-password"
            />
          </label>

          <label className="block text-sm">
            새 비밀번호 확인*
            <PasswordInput
              required
              value={form.passwordConfirm}
              onChange={(v) => setForm({ ...form, passwordConfirm: v })}
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "변경 중…" : "비밀번호 변경"}
          </button>
        </form>
      ) : null}

      <div className="rounded-xl border border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-4 py-4">
        <p className="text-sm font-medium text-[var(--pink-deep)]">본인 확인 정보가 기억나지 않으세요?</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          가입 정보를 떠올리기 어려우시면{" "}
          <strong className="font-medium text-gray-800">1:1 문의하기</strong>에 연락처를 남겨 주세요.
          관리자가 회원 정보를 확인한 뒤 등록하신 연락처로 안내드립니다.
        </p>
        <button
          type="button"
          onClick={onGoInquiry}
          className="mt-3 w-full rounded-full border-2 border-[var(--pink-accent)] bg-white py-2.5 text-sm font-medium text-[var(--pink-accent)] transition hover:bg-white/80"
        >
          1:1 문의하기로 이동
        </button>
      </div>
    </div>
  );
}

function GuestInquiryForm() {
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") || "";
  const [form, setForm] = useState({
    userName: "",
    userEmail: presetEmail,
    userPhone: "",
    body: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await api<{ message: string }>("/api/inquiries/guest", {
        method: "POST",
        body: JSON.stringify({
          subject: "비밀번호/계정 문의",
          ...form,
        }),
      });
      setSuccess(data.message);
      setForm((f) => ({ ...f, body: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "문의 접수에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>
      ) : null}

      <p className="text-sm leading-relaxed text-gray-600">
        본인 확인이 어려운 경우, 아래에 <strong>연락 가능한 정보</strong>와 문의 내용을 남겨 주시면
        관리자가 확인 후 연락드립니다.
      </p>

      <label className="block text-sm">
        이름*
        <input
          type="text"
          required
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
          className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
          placeholder="홍길동"
        />
      </label>

      <label className="block text-sm">
        Email*
        <input
          type="email"
          required
          value={form.userEmail}
          onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
          className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
          placeholder="답변 받을 이메일"
        />
      </label>

      <label className="block text-sm">
        휴대폰 번호*
        <input
          type="tel"
          required
          value={form.userPhone}
          onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
          className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
          placeholder="010-0000-0000"
        />
      </label>

      <label className="block text-sm">
        문의 내용*
        <textarea
          required
          rows={4}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="mt-1 w-full resize-y rounded border border-gray-200 px-3 py-2"
          placeholder="가입 이메일, 기억나는 정보, 문의 사유 등을 적어 주세요."
        />
      </label>

      <button
        type="submit"
        disabled={loading || Boolean(success)}
        className="w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "접수 중…" : "문의 접수하기"}
      </button>

      <p className="text-center text-xs text-gray-400">
        로그인 회원이시면{" "}
        <Link href="/profile/inquiries" className="text-[var(--pink-accent)] underline">
          마이페이지 1:1 문의
        </Link>
        를 이용하셔도 됩니다.
      </p>
    </form>
  );
}

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: ForgotTabId = isForgotTabId(tabParam) ? tabParam : "reset";

  const setTab = (id: ForgotTabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "reset") params.delete("tab");
    else params.set("tab", id);
    const qs = params.toString();
    router.replace(qs ? `/forgot-password?${qs}` : "/forgot-password", { scroll: false });
  };

  return (
    <>
      <ErpContentTabs
        className="mb-6"
        tabs={[...FORGOT_TABS]}
        active={activeTab}
        onChange={(id) => setTab(isForgotTabId(id) ? id : "reset")}
      />

      {activeTab === "reset" ? (
        <ForgotPasswordForm onGoInquiry={() => setTab("inquiry")} />
      ) : (
        <GuestInquiryForm />
      )}
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 flex justify-center">
        <DayeonLogo variant="compact" href="/" />
      </div>
      <h1 className="mb-2 text-center text-3xl font-semibold">비밀번호 찾기</h1>
      <p className="mb-6 text-center text-sm text-gray-500">본인 확인 후 새 비밀번호를 설정합니다</p>
      <Suspense fallback={<p className="text-center text-sm text-gray-500">로딩…</p>}>
        <ForgotPasswordContent />
      </Suspense>
      <p className="mt-6 text-center text-sm text-gray-600">
        비밀번호가 기억나셨나요?{" "}
        <Link href="/login" className="font-medium text-[var(--pink-accent)]">
          로그인
        </Link>
      </p>
    </div>
  );
}
