"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";

type ReferralSettings = {
  enabled: boolean;
  referrerReward: number;
  refereeReward: number;
  description: string;
};

type ReferralRow = {
  id: string;
  refereeName: string;
  refereeEmail: string;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  referredAt: string | null;
};

type ReferralCodeRow = {
  userId: string;
  name: string;
  email: string;
  code: string;
  referralCount: number;
};

const REFERRAL_TABS = [
  { id: "settings", label: "추천인제도" },
  { id: "referrals", label: "추천현황" },
  { id: "codes", label: "회원별 추천코드" },
] as const;

type ReferralTabId = (typeof REFERRAL_TABS)[number]["id"];

function isReferralTabId(value: string | null): value is ReferralTabId {
  return value === "settings" || value === "referrals" || value === "codes";
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
}

function ErpUsersReferralContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: ReferralTabId = isReferralTabId(tabParam) ? tabParam : "settings";

  const [settings, setSettings] = useState<ReferralSettings>({
    enabled: true,
    referrerReward: 5000,
    refereeReward: 3000,
    description: "",
  });
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [codes, setCodes] = useState<ReferralCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{
        settings: ReferralSettings;
        referrals: ReferralRow[];
        codes: ReferralCodeRow[];
      }>("/api/admin/settings/referral", { token: getToken() });
      setSettings(data.settings);
      setReferrals(data.referrals);
      setCodes(data.codes);
    } catch {
      setReferrals([]);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setTab(tab: ReferralTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "settings") params.delete("tab");
    else params.set("tab", tab);
    const qs = params.toString();
    router.replace(qs ? `/erp/users/referral?${qs}` : "/erp/users/referral", { scroll: false });
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      const data = await api<{ settings: ReferralSettings; referrals: ReferralRow[] }>(
        "/api/admin/settings/referral",
        {
          method: "PATCH",
          token: getToken(),
          body: JSON.stringify(settings),
        },
      );
      setSettings(data.settings);
      setReferrals(data.referrals);
      showSaveSuccess({ subMessage: "추천인 제도 설정이 반영되었습니다." });
      load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ErpPageShell title="추천인제도">불러오는 중…</ErpPageShell>;
  }

  return (
    <ErpPageShell
      title="추천인제도"
      description="추천 코드 가입 시 지급 포인트와 추천 현황을 관리합니다."
    >
      <ErpContentTabs
        tabs={[...REFERRAL_TABS]}
        active={activeTab}
        onChange={(id) => setTab(id as ReferralTabId)}
        className="mb-2"
      />

      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      {activeTab === "settings" ? (
        <form onSubmit={saveSettings} className="max-w-3xl rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">추천인 제도 설정</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              />
              제도 사용
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">추천인 적립 (P)</span>
              <input
                type="number"
                min={0}
                value={settings.referrerReward}
                onChange={(e) =>
                  setSettings({ ...settings, referrerReward: Number(e.target.value) })
                }
                className="w-full rounded border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">피추천인 가입 적립 (P)</span>
              <input
                type="number"
                min={0}
                value={settings.refereeReward}
                onChange={(e) =>
                  setSettings({ ...settings, refereeReward: Number(e.target.value) })
                }
                className="w-full rounded border px-3 py-2"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-gray-600">안내 문구</span>
              <textarea
                rows={2}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            추천인 {formatRp(settings.referrerReward)} · 피추천인{" "}
            {formatRp(settings.refereeReward)} (가입 시 자동 지급)
          </p>
          <ErpFormActions className="mt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "저장 중…" : "설정 저장"}
            </button>
          </ErpFormActions>
        </form>
      ) : null}

      {activeTab === "referrals" ? (
        <div className="w-fit max-w-full rounded-xl border bg-white">
          <table className="text-left text-xs">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-2 py-1.5">가입일</th>
                <th className="whitespace-nowrap px-2 py-1.5">피추천인</th>
                <th className="whitespace-nowrap px-2 py-1.5">추천인</th>
                <th className="whitespace-nowrap px-2 py-1.5">추천코드</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-gray-400">
                    아직 추천 가입 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="whitespace-nowrap px-2 py-1.5 text-gray-500">
                      {formatDate(r.referredAt)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5">
                      <span className="font-medium">{r.refereeName}</span>
                      <span className="ml-1 text-gray-400">{r.refereeEmail}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5">
                      <span className="font-medium">{r.referrerName}</span>
                      <span className="ml-1 text-gray-400">{r.referrerEmail}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-gray-700">
                      {r.referralCode}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === "codes" ? (
        <div className="w-fit max-w-full rounded-xl border bg-white">
          <table className="text-left text-xs">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-2 py-1.5">이름</th>
                <th className="whitespace-nowrap px-2 py-1.5">메일</th>
                <th className="whitespace-nowrap px-2 py-1.5">추천코드</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-right">추천 수</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-gray-400">
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.userId} className="border-b border-gray-50">
                    <td className="whitespace-nowrap px-2 py-1.5 font-medium">{c.name}</td>
                    <td className="max-w-44 truncate px-2 py-1.5" title={c.email}>
                      {c.email}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 font-mono text-gray-700">
                      {c.code}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">{c.referralCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </ErpPageShell>
  );
}

export default function ErpUsersReferralPage() {
  return (
    <Suspense fallback={<ErpPageShell title="추천인제도">불러오는 중…</ErpPageShell>}>
      <ErpUsersReferralContent />
    </Suspense>
  );
}
