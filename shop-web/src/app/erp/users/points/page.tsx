"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { TierBadge } from "@/components/TierBadge";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { TIER_ORDER } from "@/lib/tier";

type PointsSettings = {
  tierSilver: number;
  tierGold: number;
  tierDiamond: number;
  earnRateBronze: number;
  earnRateSilver: number;
  earnRateGold: number;
  earnRateDiamond: number;
};

type SignupBonus = {
  enabled: boolean;
  points: number;
  welcomeMessageEnabled: boolean;
  welcomeMessage: string;
};

const DEFAULT_WELCOME_MESSAGE = `가입해 주셔서 감사합니다.
감사의 마음으로 {points}포인트를 적립해 드렸습니다.
언제든지 현금처럼 사용 가능합니다.`;

type PointsMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  pointsUsed: number;
  tier: string;
  totalPurchaseAmount?: number;
};

const TIER_FIELD: Record<
  string,
  { threshold: keyof PointsSettings; rate: keyof PointsSettings; label: string }
> = {
  silver: { threshold: "tierSilver", rate: "earnRateSilver", label: "실버" },
  gold: { threshold: "tierGold", rate: "earnRateGold", label: "골드" },
  diamond: { threshold: "tierDiamond", rate: "earnRateDiamond", label: "다이아몬드" },
};

const POINTS_TABS = [
  { id: "policy", label: "포인트/적립금" },
  { id: "members", label: "포인트회원" },
] as const;

type PointsTabId = (typeof POINTS_TABS)[number]["id"];

function isPointsTabId(value: string | null): value is PointsTabId {
  return value === "policy" || value === "members";
}

function ErpUsersPointsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: PointsTabId = isPointsTabId(tabParam) ? tabParam : "policy";

  const [settings, setSettings] = useState<PointsSettings>({
    tierSilver: 1000000,
    tierGold: 5000000,
    tierDiamond: 10000000,
    earnRateBronze: 0.5,
    earnRateSilver: 1,
    earnRateGold: 1.5,
    earnRateDiamond: 2,
  });
  const [signupBonus, setSignupBonus] = useState<SignupBonus>({
    enabled: true,
    points: 100,
    welcomeMessageEnabled: true,
    welcomeMessage: DEFAULT_WELCOME_MESSAGE,
  });
  const [members, setMembers] = useState<PointsMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBonus, setSavingBonus] = useState(false);
  const { showSaveSuccess } = useErpSaveSuccess();
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{
        settings: PointsSettings;
        signupBonus: SignupBonus;
        members: PointsMember[];
      }>("/api/admin/settings/points", { token: getToken() });
      setSettings(data.settings);
      setSignupBonus({
        ...data.signupBonus,
        welcomeMessage: data.signupBonus.welcomeMessage || DEFAULT_WELCOME_MESSAGE,
      });
      setMembers(data.members);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setTab(tab: PointsTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "policy") params.delete("tab");
    else params.set("tab", tab);
    const qs = params.toString();
    router.replace(qs ? `/erp/users/points?${qs}` : "/erp/users/points", { scroll: false });
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      const data = await api<{
        settings: PointsSettings;
        signupBonus: SignupBonus;
        members: PointsMember[];
      }>("/api/admin/settings/points", {
        method: "PATCH",
        token: getToken(),
        body: JSON.stringify(settings),
      });
      setSettings(data.settings);
      setMembers(data.members);
      showSaveSuccess({ subMessage: "등급·적립 정책이 반영되었습니다." });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function saveSignupBonus(enabled?: boolean) {
    setSavingBonus(true);
    setErrorMsg("");
    try {
      const next = {
        ...signupBonus,
        enabled: enabled ?? signupBonus.enabled,
      };
      const data = await api<{
        settings: PointsSettings;
        signupBonus: SignupBonus;
        members: PointsMember[];
      }>("/api/admin/settings/points", {
        method: "PATCH",
        token: getToken(),
        body: JSON.stringify({ signupBonus: next }),
      });
      setSignupBonus({
        ...data.signupBonus,
        welcomeMessage: data.signupBonus.welcomeMessage || DEFAULT_WELCOME_MESSAGE,
      });
      const welcomeNote = data.signupBonus.welcomeMessageEnabled
        ? " · 환영 편지 발송 ON"
        : " · 환영 편지 발송 OFF";
      showSaveSuccess({
        subMessage: data.signupBonus.enabled
          ? `가입 포인트 ${data.signupBonus.points.toLocaleString("ko-KR")}P 설정${welcomeNote}`
          : `가입 포인트 지급 중지${welcomeNote}`,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSavingBonus(false);
    }
  }

  async function deleteSignupBonus() {
    if (!confirm("가입 포인트 설정을 초기화(진행안함)할까요?")) return;
    setSavingBonus(true);
    try {
      const data = await api<{ signupBonus: SignupBonus }>(
        "/api/admin/settings/signup-bonus",
        { method: "DELETE", token: getToken() },
      );
      setSignupBonus({
        ...data.signupBonus,
        welcomeMessage: data.signupBonus.welcomeMessage || DEFAULT_WELCOME_MESSAGE,
      });
      showSaveSuccess({ message: "초기화되었습니다", subMessage: "가입 포인트 설정이 기본값으로 돌아갔습니다." });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setSavingBonus(false);
    }
  }

  async function saveMemberPoints(id: string) {
    const points = Math.max(0, Math.floor(Number(editPoints) || 0));
    try {
      const data = await api<{ user: PointsMember }>(`/api/admin/users/${id}/points`, {
        method: "PATCH",
        token: getToken(),
        body: JSON.stringify({ points }),
      });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, points: data.user.points, tier: data.user.tier } : m,
        ),
      );
      setEditingId(null);
      showSaveSuccess({
        subMessage: `${data.user.name}님 적립금 ${formatRp(data.user.points)} 반영`,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "적립금 수정 실패");
    }
  }

  if (loading) {
    return <ErpPageShell title="포인트/적립금">불러오는 중…</ErpPageShell>;
  }

  return (
    <ErpPageShell
      title="포인트/적립금"
      description="구매 등급 기준·등급별 적립률·가입 포인트를 설정하고 회원별 적립금을 관리합니다."
    >
      <ErpContentTabs
        tabs={[...POINTS_TABS]}
        active={activeTab}
        onChange={(id) => setTab(id as PointsTabId)}
        className="mb-2"
      />

      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      {activeTab === "policy" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <form onSubmit={saveSettings} className="rounded-xl border bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-800">등급·적립 정책</p>
            <p className="mb-3 text-xs text-gray-500">
              브론즈(기본) → 실버 → 골드 → 다이아몬드. 등급은 누적 구매금액 기준입니다.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-gray-600">브론즈 구매 적립률 (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={settings.earnRateBronze}
                  onChange={(e) =>
                    setSettings({ ...settings, earnRateBronze: Number(e.target.value) })
                  }
                  className="w-full rounded border px-3 py-2"
                />
              </label>
              {TIER_ORDER.filter((t) => t !== "bronze").map((tier) => {
                const f = TIER_FIELD[tier];
                return (
                  <div key={tier} className="rounded-lg border border-gray-100 p-3 sm:col-span-2">
                    <p className="mb-2 text-xs font-semibold text-gray-700">{f.label} 등급</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-sm">
                        <span className="mb-1 block text-gray-600">누적 구매금액 (Rp 이상)</span>
                        <input
                          type="number"
                          min={0}
                          value={settings[f.threshold] as number}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              [f.threshold]: Number(e.target.value),
                            })
                          }
                          className="w-full rounded border px-3 py-2"
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-gray-600">구매 적립률 (%)</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={settings[f.rate] as number}
                          onChange={(e) =>
                            setSettings({ ...settings, [f.rate]: Number(e.target.value) })
                          }
                          className="w-full rounded border px-3 py-2"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <ErpFormActions className="mt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "저장 중…" : "정책 저장"}
              </button>
            </ErpFormActions>
          </form>

          <div className="rounded-xl border bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-800">가입 포인트</p>
            <p className="mb-3 text-xs text-gray-500">
              신규 회원 가입 시 브론즈 등급으로 시작하며, 설정 시 포인트를 지급합니다.
            </p>
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={signupBonus.enabled}
                onChange={(e) => setSignupBonus({ ...signupBonus, enabled: e.target.checked })}
              />
              가입 포인트 지급 {signupBonus.enabled ? "진행함" : "진행안함"}
            </label>
            <label className="mb-4 block text-sm">
              <span className="mb-1 block text-gray-600">지급 포인트 (P)</span>
              <input
                type="number"
                min={0}
                disabled={!signupBonus.enabled}
                value={signupBonus.points}
                onChange={(e) =>
                  setSignupBonus({ ...signupBonus, points: Number(e.target.value) })
                }
                className="w-full rounded border px-3 py-2 disabled:bg-gray-50"
              />
            </label>
            <div className="mb-4 border-t border-gray-100 pt-4">
              <p className="mb-2 text-sm font-semibold text-gray-800">가입 환영 편지</p>
              <p className="mb-3 text-xs text-gray-500">
                신규 가입 시 회원 편지함으로 자동 발송됩니다. {"{points}"}, {"{name}"} 치환 가능.
              </p>
              <label className="mb-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={signupBonus.welcomeMessageEnabled}
                  onChange={(e) =>
                    setSignupBonus({ ...signupBonus, welcomeMessageEnabled: e.target.checked })
                  }
                />
                가입 환영 편지 발송 {signupBonus.welcomeMessageEnabled ? "진행함" : "진행안함"}
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">편지 내용</span>
                <textarea
                  rows={5}
                  disabled={!signupBonus.welcomeMessageEnabled}
                  value={signupBonus.welcomeMessage}
                  onChange={(e) =>
                    setSignupBonus({ ...signupBonus, welcomeMessage: e.target.value })
                  }
                  placeholder={DEFAULT_WELCOME_MESSAGE}
                  className="w-full resize-y rounded border px-3 py-2 text-sm leading-relaxed disabled:bg-gray-50"
                />
              </label>
            </div>

            <ErpFormActions>
              <button
                type="button"
                disabled={savingBonus}
                onClick={() => saveSignupBonus(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                진행안함
              </button>
              <button
                type="button"
                disabled={savingBonus}
                onClick={deleteSignupBonus}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
              <button
                type="button"
                disabled={savingBonus}
                onClick={() => saveSignupBonus()}
                className="rounded-lg bg-[#1e293b] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {savingBonus ? "저장 중…" : "수정 저장"}
              </button>
            </ErpFormActions>
          </div>
        </div>
      ) : (
        <div className="w-fit max-w-full rounded-xl border bg-white">
          <table className="text-left text-xs">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-2 py-1.5">이름</th>
                <th className="whitespace-nowrap px-2 py-1.5">메일</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-right">누적구매</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-center">등급</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-right">적립금액</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-right">사용금액</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-center">수정</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-4 text-center text-gray-400">
                    등록된 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="whitespace-nowrap px-2 py-1.5 font-medium">{m.name}</td>
                    <td className="max-w-44 truncate px-2 py-1.5" title={m.email}>
                      {m.email}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">
                      {formatRp(m.totalPurchaseAmount || 0)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center">
                      <TierBadge tier={m.tier} size="sm" />
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">
                      {editingId === m.id ? (
                        <input
                          type="number"
                          min={0}
                          value={editPoints}
                          onChange={(e) => setEditPoints(e.target.value)}
                          className="w-24 rounded border px-2 py-1 text-right"
                        />
                      ) : (
                        formatRp(m.points)
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-2 py-1.5 text-right ${
                        (m.pointsUsed || 0) > 0 ? "font-medium text-red-600" : "text-gray-500"
                      }`}
                    >
                      {(m.pointsUsed || 0) > 0
                        ? `-${formatRp(m.pointsUsed)}`
                        : formatRp(0)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center">
                      {editingId === m.id ? (
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => saveMemberPoints(m.id)}
                            className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded border px-2 py-0.5"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(m.id);
                            setEditPoints(String(m.points));
                          }}
                          className="rounded border px-2 py-0.5 text-gray-600 hover:bg-gray-50"
                        >
                          수정
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </ErpPageShell>
  );
}

export default function ErpUsersPointsPage() {
  return (
    <Suspense fallback={<ErpPageShell title="포인트/적립금">불러오는 중…</ErpPageShell>}>
      <ErpUsersPointsContent />
    </Suspense>
  );
}
