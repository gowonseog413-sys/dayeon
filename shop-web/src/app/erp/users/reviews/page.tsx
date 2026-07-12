"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpContentTabs } from "@/components/erp/ErpContentTabs";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { ErpReviewWorkPanel } from "@/components/erp/ErpReviewWorkPanel";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import { productImageFallback } from "@/lib/product-image-fallback";
import {
  DEFAULT_REVIEW_REWARD,
  normalizeReviewReward,
  type ReviewReward,
} from "@/lib/review-reward";
import { publishReviewRewardUpdate } from "@/lib/review-reward-sync";
import type { ProductReview } from "@/lib/types";

export const ERP_REVIEW_PAGE_SIZE = 4;
const ERP_POINT_HISTORY_PAGE_SIZE = 20;
const POLL_MS = 3000;

const REVIEWS_TAB_KEYS = [
  { id: "reviews", labelKey: "erp.users.reviews.tabReviews" },
  { id: "points", labelKey: "erp.users.reviews.tabPoints" },
  { id: "work", labelKey: "erp.users.reviews.tabWork" },
] as const;

type ReviewsTabId = (typeof REVIEWS_TAB_KEYS)[number]["id"];

function isReviewsTabId(value: string | null): value is ReviewsTabId {
  return value === "reviews" || value === "points" || value === "work";
}

type AdminReview = ProductReview & {
  userEmail?: string;
  pointsAwarded?: number;
};

type PointTxRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  label: string;
  amount: number;
  createdAt: string;
};

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(value)}
      <span className="text-gray-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function formatPointAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString("ko-KR");
  return amount >= 0 ? `+${abs}P` : `-${abs}P`;
}

function ErpReviewsContent() {
  const { t, tFmt } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: ReviewsTabId = isReviewsTabId(tabParam) ? tabParam : "reviews";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewReward, setReviewReward] = useState<ReviewReward>(DEFAULT_REVIEW_REWARD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  const [pointHistory, setPointHistory] = useState<PointTxRow[]>([]);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsTotalPages, setPointsTotalPages] = useState(1);
  const [pointsLoading, setPointsLoading] = useState(true);

  const reviewsTabs = REVIEWS_TAB_KEYS.map((tab) => ({
    id: tab.id,
    label: t(tab.labelKey),
  }));
  const statusLabel = (on: boolean) =>
    on ? t("erp.users.points.statusOn") : t("erp.users.points.statusOff");

  const loadReviews = useCallback(async () => {
    try {
      const [reviewData, rewardData] = await Promise.all([
        api<{ reviews: AdminReview[] }>("/api/admin/reviews?scope=member", { token: getErpToken() }),
        api<{ reviewReward: ReviewReward }>("/api/admin/settings/review-reward", {
          token: getErpToken(),
        }),
      ]);
      setReviews(reviewData.reviews);
      setReviewReward(normalizeReviewReward(rewardData.reviewReward));
    } catch {
      setReviews([]);
    }
  }, []);

  const loadPointHistory = useCallback(
    async (silent = false) => {
      if (!silent) setPointsLoading(true);
      try {
        const qs = new URLSearchParams({
          page: String(pageParam),
          pageSize: String(ERP_POINT_HISTORY_PAGE_SIZE),
        });
        const data = await api<{
          items: PointTxRow[];
          total: number;
          totalPages: number;
          page: number;
        }>(`/api/admin/point-transactions?${qs}`, { token: getErpToken() });
        setPointHistory(data.items);
        setPointsTotal(data.total);
        setPointsTotalPages(data.totalPages);
      } catch {
        if (!silent) {
          setPointHistory([]);
          setPointsTotal(0);
          setPointsTotalPages(1);
        }
      } finally {
        if (!silent) setPointsLoading(false);
      }
    },
    [pageParam],
  );

  const load = useCallback(async () => {
    if (activeTab !== "reviews") return;
    setLoading(true);
    await loadReviews();
    setLoading(false);
  }, [loadReviews, activeTab]);

  useEffect(() => {
    if (activeTab === "reviews") load();
  }, [load, activeTab]);

  useEffect(() => {
    if (activeTab !== "points") return;
    loadPointHistory();
  }, [activeTab, loadPointHistory]);

  useEffect(() => {
    if (activeTab !== "points") return;
    const timer = window.setInterval(() => loadPointHistory(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeTab, loadPointHistory]);

  const reviewTotal = reviews.length;
  const reviewTotalPages = Math.max(1, Math.ceil(reviewTotal / ERP_REVIEW_PAGE_SIZE));
  const reviewPage = Math.min(pageParam, reviewTotalPages);

  const pageReviews = useMemo(
    () => reviews.slice((reviewPage - 1) * ERP_REVIEW_PAGE_SIZE, reviewPage * ERP_REVIEW_PAGE_SIZE),
    [reviews, reviewPage],
  );

  const pointsPage = Math.min(pageParam, pointsTotalPages);

  useEffect(() => {
    if (activeTab === "reviews" && pageParam > reviewTotalPages && reviewTotalPages >= 1 && reviewTotal > 0) {
      router.replace("/erp/users/reviews");
    }
    if (activeTab === "points" && pageParam > pointsTotalPages && pointsTotalPages >= 1 && pointsTotal > 0) {
      router.replace("/erp/users/reviews?tab=points");
    }
  }, [activeTab, pageParam, reviewTotalPages, pointsTotalPages, reviewTotal, pointsTotal, router]);

  function goWorkPage(next: number) {
    const params = new URLSearchParams({ tab: "work" });
    if (next > 1) params.set("page", String(next));
    router.push(`/erp/users/reviews?${params}`);
  }

  function switchTab(id: ReviewsTabId) {
    const params = new URLSearchParams();
    if (id !== "reviews") params.set("tab", id);
    const qs = params.toString();
    router.push(qs ? `/erp/users/reviews?${qs}` : "/erp/users/reviews");
  }

  async function removeReview(id: string) {
    if (!confirm(t("erp.users.reviews.confirmDelete"))) return;
    setDeletingId(id);
    setErrorMsg("");
    try {
      await api(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        token: getErpToken(),
      });
      showSaveSuccess({
        message: t("erp.common.deletedTitle"),
        subMessage: t("erp.users.reviews.deletedMsg"),
      });
      await loadReviews();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  async function saveReward() {
    setSaving(true);
    setErrorMsg("");
    try {
      const data = await api<{ reviewReward: ReviewReward }>(
        "/api/admin/settings/review-reward",
        {
          method: "PATCH",
          token: getErpToken(),
          body: JSON.stringify({ reviewReward }),
        },
      );
      const next = normalizeReviewReward(data.reviewReward);
      setReviewReward(next);
      publishReviewRewardUpdate(next);
      showSaveSuccess({
        subMessage: next.enabled
          ? tFmt("erp.users.reviews.rewardSavedEnabled", {
              points: next.points.toLocaleString("ko-KR"),
            })
          : t("erp.users.reviews.rewardSavedDisabled"),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading && activeTab === "reviews") {
    return (
      <ErpPageShell titleKey="erp.nav.usersReviews">
        <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
      </ErpPageShell>
    );
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.usersReviews"
      descriptionKey="erp.users.reviews.description"
    >
      <ErpContentTabs
        tabs={reviewsTabs}
        active={activeTab}
        onChange={(id) => switchTab(id as ReviewsTabId)}
        className="mb-4"
      />

      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      {activeTab === "reviews" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <p className="mb-3 text-xs text-gray-500">
              {tFmt("erp.users.reviews.summary", {
                total: reviewTotal,
                pageSize: ERP_REVIEW_PAGE_SIZE,
              })}
            </p>

            {reviews.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-gray-500">
                {t("erp.users.reviews.noReviews")}
              </p>
            ) : (
              <>
                <ul className="space-y-3">
                  {pageReviews.map((r, i) => {
                    const no = reviewTotal - ((reviewPage - 1) * ERP_REVIEW_PAGE_SIZE + i);
                    return (
                      <li key={r.id} className="rounded-xl border bg-white p-4 text-sm">
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                          <p className="text-xs text-gray-400">No. {no}</p>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">
                              {new Date(r.createdAt).toLocaleString("ko-KR")}
                            </p>
                            <button
                              type="button"
                              disabled={deletingId === r.id}
                              onClick={() => removeReview(r.id)}
                              className="mt-1 text-xs text-red-500 hover:underline disabled:opacity-50"
                            >
                              {deletingId === r.id ? t("erp.common.deleting") : t("erp.common.delete")}
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                            <Image
                              src={
                                r.productImage ||
                                productImageFallback({
                                  category: "",
                                  image: r.productImage || "",
                                })
                              }
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">
                              {r.productBrand} {r.productName}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {r.userName}
                              {r.userEmail ? ` · ${r.userEmail}` : ""}
                            </p>
                            <div className="mt-1">
                              <Stars value={r.rating} />
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-gray-700">{r.content}</p>
                            {r.pointsAwarded ? (
                              <p className="mt-1 text-xs text-emerald-600">
                                {tFmt("erp.users.reviews.pointsAwarded", {
                                  points: r.pointsAwarded.toLocaleString("ko-KR"),
                                })}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <NatePagination
                  page={reviewPage}
                  totalPages={reviewTotalPages}
                  basePath="/erp/users/reviews"
                />
              </>
            )}
          </div>

          <div className="h-fit rounded-xl border bg-white p-4 lg:sticky lg:top-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">{t("erp.users.reviews.rewardTitle")}</p>
            <p className="mb-3 text-xs text-gray-500">{t("erp.users.reviews.rewardDesc")}</p>
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={reviewReward.enabled}
                onChange={(e) =>
                  setReviewReward({ ...reviewReward, enabled: e.target.checked })
                }
              />
              {tFmt("erp.users.reviews.rewardEnabled", { status: statusLabel(reviewReward.enabled) })}
            </label>
            <label className="mb-4 block text-sm">
              <span className="mb-1 block text-gray-600">{t("erp.users.reviews.rewardPoints")}</span>
              <input
                type="number"
                min={0}
                disabled={!reviewReward.enabled}
                value={reviewReward.points}
                onChange={(e) =>
                  setReviewReward({ ...reviewReward, points: Number(e.target.value) })
                }
                className="w-full rounded border px-3 py-2 disabled:bg-gray-50"
              />
            </label>
            <ErpFormActions>
              <button
                type="button"
                disabled={saving}
                onClick={saveReward}
                className="rounded-lg bg-[#1e293b] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? t("erp.common.saving") : t("erp.users.points.saveChanges")}
              </button>
            </ErpFormActions>
          </div>
        </div>
      ) : activeTab === "work" ? (
        <ErpReviewWorkPanel
          page={pageParam}
          onPageChange={goWorkPage}
          onError={setErrorMsg}
        />
      ) : pointsLoading ? (
        <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
      ) : (
        <div>
          <p className="mb-3 text-xs text-gray-500">
            {tFmt("erp.users.reviews.pointsSummary", {
              total: pointsTotal,
              pageSize: ERP_POINT_HISTORY_PAGE_SIZE,
            })}
          </p>

          {pointHistory.length === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-gray-500">
              {t("erp.users.reviews.noPointHistory")}
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {pointHistory.map((tx, i) => {
                  const no = pointsTotal - ((pointsPage - 1) * ERP_POINT_HISTORY_PAGE_SIZE + i);
                  return (
                    <li key={tx.id} className="rounded-xl border bg-white p-4 text-sm">
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <p className="text-xs text-gray-400">No. {no}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{tx.label}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {tx.userName}
                            {tx.userEmail ? ` · ${tx.userEmail}` : ""}
                          </p>
                        </div>
                        <p
                          className={`shrink-0 text-lg font-semibold ${
                            tx.amount >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {formatPointAmount(tx.amount)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <NatePagination
                page={pointsPage}
                totalPages={pointsTotalPages}
                basePath="/erp/users/reviews"
                query="tab=points"
              />
            </>
          )}
        </div>
      )}
    </ErpPageShell>
  );
}

function ReviewsLoadingFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.usersReviews">
      <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
    </ErpPageShell>
  );
}

export default function ErpUsersReviewsPage() {
  return (
    <Suspense fallback={<ReviewsLoadingFallback />}>
      <ErpReviewsContent />
    </Suspense>
  );
}
