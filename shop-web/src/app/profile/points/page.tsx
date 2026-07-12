"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { NatePagination } from "@/components/NatePagination";
import { TierBadge } from "@/components/TierBadge";
import { useAuth } from "@/hooks/useAuth";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { TIER_ORDER, type TierId } from "@/lib/tier";
import { honorificName, userPoints, userTierId } from "@/lib/user-display";

type TierSettings = {
  tierSilver: number;
  tierGold: number;
  tierDiamond: number;
  earnRateBronze: number;
  earnRateSilver: number;
  earnRateGold: number;
  earnRateDiamond: number;
};

type PointHistoryItem = {
  id: string;
  type: string;
  label: string;
  amount: number;
  createdAt: string;
};

type ReferralRow = {
  id: string;
  name: string;
  email: string;
  referredAt: string | null;
  reward: number;
};

type ReferralSettings = {
  enabled: boolean;
  referrerReward: number;
  refereeReward: number;
  description: string;
};

const PROFILE_POINTS_PAGE_SIZE = 5;
const POLL_MS = 3000;

const POINTS_TAB_IDS = ["status", "guide", "referrals"] as const;

type PointsTabId = (typeof POINTS_TAB_IDS)[number];

function isPointsTabId(value: string | null): value is PointsTabId {
  return value === "status" || value === "guide" || value === "referrals";
}

const TIER_DESC: Record<TierId, string> = {
  bronze: "가입 즉시 적용되는 기본 등급입니다.",
  silver: "누적 구매금액이 기준에 도달하면 실버로 승급됩니다.",
  gold: "누적 구매금액이 기준에 도달하면 골드로 승급됩니다.",
  diamond: "최고 등급! 누적 구매금액이 기준에 도달하면 다이아몬드로 승급됩니다.",
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
}

function thresholdFor(tier: TierId, settings: TierSettings | null): number {
  if (!settings) return 0;
  if (tier === "silver") return settings.tierSilver;
  if (tier === "gold") return settings.tierGold;
  if (tier === "diamond") return settings.tierDiamond;
  return 0;
}

function earnRateFor(tier: TierId, settings: TierSettings | null): number {
  if (!settings) return 0;
  const map: Record<TierId, number> = {
    bronze: settings.earnRateBronze,
    silver: settings.earnRateSilver,
    gold: settings.earnRateGold,
    diamond: settings.earnRateDiamond,
  };
  return map[tier];
}

function formatPointAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString("ko-KR");
  return amount >= 0 ? `+${abs}P` : `-${abs}P`;
}

function ProfilePointsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, tFmt, locale } = useI18n();
  const tabParam = searchParams.get("tab");
  const activeTab: PointsTabId = isPointsTabId(tabParam) ? tabParam : "status";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const { user, ready, refresh } = useAuth();
  const [settings, setSettings] = useState<TierSettings | null>(null);
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [referralSettings, setReferralSettings] = useState<ReferralSettings | null>(null);
  const [referralsTotalPages, setReferralsTotalPages] = useState(1);
  const [referralsLoading, setReferralsLoading] = useState(true);

  const loadTierSettings = useCallback(() => {
    api<{ settings: TierSettings }>("/api/settings/member-tiers")
      .then((d) => setSettings(d.settings))
      .catch(() => setSettings(null));
  }, []);

  const loadHistory = useCallback((silent = false) => {
    const token = getToken();
    if (!token) return;
    if (!silent) setHistoryLoading(true);
    api<{
      items: PointHistoryItem[];
      totalPages: number;
    }>(
      `/api/points/history?page=${pageParam}&pageSize=${PROFILE_POINTS_PAGE_SIZE}`,
      { token },
    )
      .then((d) => {
        setHistory(d.items);
        setHistoryTotalPages(d.totalPages);
      })
      .catch(() => {
        setHistory([]);
        setHistoryTotalPages(1);
      })
      .finally(() => {
        if (!silent) setHistoryLoading(false);
      });
  }, [pageParam]);

  const loadReferrals = useCallback((silent = false) => {
    const token = getToken();
    if (!token) return;
    if (!silent) setReferralsLoading(true);
    api<{
      items: ReferralRow[];
      totalPages: number;
      referralCode: string;
      settings: ReferralSettings;
    }>(
      `/api/points/referrals?page=${pageParam}&pageSize=${PROFILE_POINTS_PAGE_SIZE}`,
      { token },
    )
      .then((d) => {
        setReferrals(d.items);
        setReferralsTotalPages(d.totalPages);
        setReferralCode(d.referralCode);
        setReferralSettings(d.settings);
      })
      .catch(() => {
        setReferrals([]);
        setReferralsTotalPages(1);
        setReferralCode("");
        setReferralSettings(null);
      })
      .finally(() => {
        if (!silent) setReferralsLoading(false);
      });
  }, [pageParam]);

  useEffect(() => {
    loadTierSettings();
  }, [loadTierSettings]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "status") loadHistory();
    if (activeTab === "referrals") loadReferrals();
  }, [activeTab, user, loadHistory, loadReferrals]);

  useEffect(() => {
    if (!user) return;

    const poll = () => {
      if (document.hidden) return;
      void refresh();
      loadTierSettings();
      if (activeTab === "status") loadHistory(true);
      if (activeTab === "referrals") loadReferrals(true);
    };

    const id = window.setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [user, activeTab, refresh, loadTierSettings, loadHistory, loadReferrals]);

  const paginationQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    return params.toString();
  }, [activeTab]);

  const totalPages = activeTab === "referrals" ? referralsTotalPages : historyTotalPages;

  useEffect(() => {
    if (activeTab === "guide") return;
    if (pageParam > totalPages && totalPages >= 1) {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      router.replace("/profile/points?" + params.toString());
    }
  }, [activeTab, pageParam, totalPages, router]);

  const setTab = (id: string) => {
    router.push(`/profile/points?tab=${id}`);
  };

  if (!ready || !user) {
    return <p className="text-sm text-gray-500">{t("common.loading")}</p>;
  }

  const name = honorificName(user, locale);
  const tierId = userTierId(user);
  const points = userPoints(user);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--pink-deep)]">{t("profile.title.points")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("profile.desc.points")}</p>

      <ErpContentTabs
        className="mt-5"
        tabs={POINTS_TAB_IDS.map((id) => ({
          id,
          label: t(`profile.points.tab.${id}`),
        }))}
        active={activeTab}
        onChange={setTab}
      />

      {activeTab === "status" ? (
        <div className="mt-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
              <p className="text-xs font-semibold text-gray-500">{t("profile.points.currentTier")}</p>
              <div className="mt-2">
                <TierBadge tier={tierId} size="md" />
              </div>
              <p className="mt-2 text-sm text-gray-600">{name}</p>
            </div>
            <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
              <p className="text-xs font-semibold text-gray-500">{t("profile.points.balance")}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--pink-deep)]">
                {points.toLocaleString(locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR")}P
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {t("profile.points.converted")} {formatRp(points)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--pink-deep)]">
              {t("profile.points.history")}
            </h2>
            {historyLoading ? (
              <p className="text-sm text-gray-500">{t("common.loading")}</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-500">{t("profile.points.historyEmpty")}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        item.amount >= 0 ? "text-[var(--pink-deep)]" : "text-red-600"
                      }`}
                    >
                      {formatPointAmount(item.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <NatePagination
              page={pageParam}
              totalPages={historyTotalPages}
              basePath="/profile/points"
              query={paginationQuery}
              className="mt-6"
            />
          </div>
        </div>
      ) : null}

      {activeTab === "guide" ? (
        <div className="mt-6 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
          <h2 className="mb-3 text-sm font-semibold text-[var(--pink-deep)]">
            {t("profile.points.guideTitle")}
          </h2>
          <p className="mb-4 text-xs text-gray-500">{t("profile.points.guideDesc")}</p>
          <ul className="space-y-3 text-sm text-gray-600">
            {TIER_ORDER.map((tier) => (
              <li
                key={tier}
                className={`rounded-xl border px-3 py-3 ${
                  tier === tierId ? "border-gray-900 bg-gray-50" : "border-gray-100"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <TierBadge tier={tier} size="sm" />
                  <span className="text-xs text-gray-500">
                    {thresholdFor(tier, settings) > 0
                      ? tFmt("profile.points.purchaseOver", {
                          amount: formatRp(thresholdFor(tier, settings)),
                        })
                      : t("profile.points.defaultTier")}
                    {settings
                      ? ` · ${tFmt("profile.points.earnRate", { rate: String(earnRateFor(tier, settings)) })}`
                      : ""}
                  </span>
                </div>
                <p className="mt-1 text-xs">{TIER_DESC[tier]}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {activeTab === "referrals" ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
            <h2 className="mb-2 text-sm font-semibold text-[var(--pink-deep)]">내 추천코드</h2>
            {referralSettings && !referralSettings.enabled ? (
              <p className="text-sm text-gray-500">현재 추천인 제도가 비활성화되어 있습니다.</p>
            ) : (
              <>
                <p className="font-mono text-lg font-bold tracking-wide text-gray-900">
                  {referralCode || "—"}
                </p>
                {referralSettings ? (
                  <p className="mt-2 text-xs text-gray-500">
                    추천 가입 시 추천인 {formatRp(referralSettings.referrerReward)} · 피추천인{" "}
                    {formatRp(referralSettings.refereeReward)} (가입 시 자동 지급)
                  </p>
                ) : null}
                {referralSettings?.description ? (
                  <p className="mt-1 text-xs text-gray-400">{referralSettings.description}</p>
                ) : null}
              </>
            )}
          </div>

          <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-5 shadow-[0_4px_18px_var(--pink-shadow)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--pink-deep)]">추천 가입 현황</h2>
            {referralsLoading ? (
              <p className="text-sm text-gray-500">불러오는 중...</p>
            ) : referrals.length === 0 ? (
              <p className="text-sm text-gray-500">아직 추천코드로 가입한 회원이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="whitespace-nowrap py-2 pr-3 font-medium">가입일</th>
                      <th className="whitespace-nowrap py-2 pr-3 font-medium">피추천인</th>
                      <th className="whitespace-nowrap py-2 font-medium">적립 포인트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((row) => (
                      <tr key={row.id} className="border-b border-gray-50 last:border-0">
                        <td className="whitespace-nowrap py-3 pr-3 text-xs text-gray-500">
                          {formatDate(row.referredAt)}
                        </td>
                        <td className="py-3 pr-3">
                          <span className="font-medium text-gray-800">{row.name}</span>
                          <span className="ml-1 text-xs text-gray-400">{row.email}</span>
                        </td>
                        <td className="whitespace-nowrap py-3 font-semibold text-[var(--pink-deep)]">
                          +{row.reward.toLocaleString("ko-KR")}P
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <NatePagination
              page={pageParam}
              totalPages={referralsTotalPages}
              basePath="/profile/points"
              query={paginationQuery}
              className="mt-6"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfilePointsFallback() {
  const { t } = useI18n();
  return <p className="text-sm text-gray-500">{t("common.loading")}</p>;
}

export default function ProfilePointsPage() {
  return (
    <Suspense fallback={<ProfilePointsFallback />}>
      <ProfilePointsContent />
    </Suspense>
  );
}
