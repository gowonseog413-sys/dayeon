"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  INQUIRY_PAGE_SIZE,
} from "@/lib/inquiry-labels";
import { publishInquiryReplyUpdated, subscribeInquiryUpdates } from "@/lib/inquiry-sync";
import type { Inquiry } from "@/lib/types";

type InquiryFilter = "all" | "pending" | "answered";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseFilter(raw: string | null): InquiryFilter {
  if (raw === "pending" || raw === "answered") return raw;
  return "all";
}

function ErpInquiriesContent() {
  const { t, tFmt } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const filter = parseFilter(searchParams.get("status"));

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selected?.id ?? null;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api<{ inquiries: Inquiry[] }>(
        `/api/admin/inquiries?_=${Date.now()}`,
        { token: getErpToken(), cache: "no-store" },
      );
      const prev = knownIdsRef.current;
      const incoming = data.inquiries;
      const newIds = incoming.filter((i) => !prev.has(i.id)).map((i) => i.id);

      if (silent && newIds.length > 0 && prev.size > 0) {
        setFlashIds(new Set(newIds));
        window.setTimeout(() => setFlashIds(new Set()), 2800);
        const newest = incoming.find((i) => i.id === newIds[0]);
        if (newest && !selectedIdRef.current) {
          setSelected(newest);
          setReply("");
        }
      }

      knownIdsRef.current = new Set(incoming.map((i) => i.id));
      setInquiries(incoming);

      if (selectedIdRef.current) {
        const fresh = incoming.find((i) => i.id === selectedIdRef.current);
        if (fresh) setSelected(fresh);
      }
    } catch {
      if (!silent) setInquiries([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return subscribeInquiryUpdates(() => {
      void load(true);
    });
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    const poll = () => {
      if (cancelled || document.hidden) return;
      void load(true);
    };
    const id = window.setInterval(poll, 2000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return inquiries;
    return inquiries.filter((i) => i.status === filter);
  }, [inquiries, filter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / INQUIRY_PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * INQUIRY_PAGE_SIZE, page * INQUIRY_PAGE_SIZE),
    [filtered, page],
  );

  const paginationQuery = filter !== "all" ? `status=${filter}` : undefined;

  useEffect(() => {
    if (pageParam > totalPages && totalPages >= 1 && total > 0) {
      const params = new URLSearchParams(searchParams.toString());
      if (totalPages > 1) params.set("page", String(totalPages));
      else params.delete("page");
      router.replace(`/erp/users/inquiries?${params}`);
    }
  }, [pageParam, totalPages, total, router, searchParams]);

  function setFilter(next: InquiryFilter) {
    const params = new URLSearchParams();
    if (next !== "all") params.set("status", next);
    router.replace(
      params.toString() ? `/erp/users/inquiries?${params}` : "/erp/users/inquiries",
    );
  }

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  function categoryLabel(category: Inquiry["category"]) {
    return t(`erp.users.inquiry.category.${category}`);
  }

  function statusLabel(status: Inquiry["status"]) {
    return t(`erp.users.inquiry.status.${status}`);
  }

  async function submitReply() {
    if (!selected || !reply.trim()) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const data = await api<{ inquiry: Inquiry }>(
        `/api/admin/inquiries/${selected.id}/replies`,
        {
          method: "POST",
          token: getErpToken(),
          body: JSON.stringify({ body: reply }),
        },
      );
      setSelected(data.inquiry);
      setReply("");
      showSaveSuccess({
        message: t("erp.common.registeredTitle"),
        subMessage: t("erp.users.inquiries.replyRegisteredMsg"),
      });
      publishInquiryReplyUpdated();
      load(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.users.inquiries.replyFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("erp.users.inquiries.confirmDelete"))) return;
    await api(`/api/admin/inquiries/${id}`, {
      method: "DELETE",
      token: getErpToken(),
    });
    if (selected?.id === id) setSelected(null);
    load(true);
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.usersInquiries"
      descriptionKey="erp.users.inquiries.description"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", labelKey: "erp.users.inquiries.filterAll" },
            { key: "pending", labelKey: "erp.users.inquiries.filterPending" },
            { key: "answered", labelKey: "erp.users.inquiries.filterAnswered" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filter === tab.key
                ? "bg-[#8b5e4b] text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t(tab.labelKey)}
            {tab.key === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
        <span className="text-xs text-gray-400">
          {tFmt("erp.users.inquiries.summary", {
            total,
            pageSize: INQUIRY_PAGE_SIZE,
          })}
        </span>
      </div>

      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-6 text-sm text-gray-400">{t("erp.common.loading")}</p>
            ) : pageItems.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">{t("erp.users.inquiries.noInquiries")}</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">{t("erp.users.col.no")}</th>
                    <th className="px-3 py-2 font-medium">{t("erp.users.inquiries.colReceivedAt")}</th>
                    <th className="px-3 py-2 font-medium">{t("erp.users.col.name")}</th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">{t("erp.users.inquiries.colType")}</th>
                    <th className="px-3 py-2 font-medium">{t("erp.users.inquiries.colSubject")}</th>
                    <th className="px-3 py-2 font-medium">{t("erp.common.status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.map((inq, i) => (
                    <tr
                      key={inq.id}
                      onClick={() => {
                        setSelected(inq);
                        setReply("");
                        setErrorMsg("");
                      }}
                      className={`cursor-pointer transition hover:bg-[var(--pink-bg-soft)] ${
                        selected?.id === inq.id ? "bg-[var(--pink-bg-soft)]" : ""
                      } ${flashIds.has(inq.id) ? "inquiry-row-new" : ""}`}
                    >
                      <td className="px-3 py-2.5 text-gray-400">
                        {total - ((page - 1) * INQUIRY_PAGE_SIZE + i)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500">
                        {formatDate(inq.createdAt)}
                      </td>
                      <td className="px-3 py-2.5">{inq.userName || "-"}</td>
                      <td className="hidden px-3 py-2.5 text-xs sm:table-cell">
                        {categoryLabel(inq.category)}
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-2.5 font-medium">
                        {inq.subject}
                        {flashIds.has(inq.id) ? (
                          <span className="ml-1.5 rounded-full bg-[var(--pink-accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                            NEW
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            inq.status === "answered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {statusLabel(inq.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <NatePagination
            page={page}
            totalPages={totalPages}
            basePath="/erp/users/inquiries"
            query={paginationQuery}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {!selected ? (
            <p className="py-12 text-center text-sm text-gray-400">
              {t("erp.users.inquiries.selectHint")}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{selected.subject}</h3>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(selected.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(selected.id)}
                  className="shrink-0 text-xs text-red-500 hover:underline"
                >
                  {t("erp.common.delete")}
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <dt className="text-gray-400">{t("erp.users.col.name")}</dt>
                  <dd>{selected.userName}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">{t("erp.users.col.phone")}</dt>
                  <dd>{selected.userPhone || "-"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-400">{t("erp.users.col.email")}</dt>
                  <dd>{selected.userEmail}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">{t("erp.users.inquiries.colType")}</dt>
                  <dd>{categoryLabel(selected.category)}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">{t("erp.users.inquiries.colOrderId")}</dt>
                  <dd>{selected.orderId || "-"}</dd>
                </div>
              </dl>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-500">{t("erp.users.inquiries.bodyLabel")}</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{selected.body}</p>
              </div>

              {selected.replies.map((r) => (
                <div key={r.id} className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                  <p className="text-xs font-medium text-sky-700">{t("erp.users.inquiries.adminReply")}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{formatDate(r.createdAt)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {t("erp.users.inquiries.replyLabel")}
                </label>
                <textarea
                  rows={5}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder={t("erp.users.inquiries.replyPlaceholder")}
                />
                <ErpFormActions className="mt-2">
                  <button
                    type="button"
                    disabled={saving || !reply.trim()}
                    onClick={submitReply}
                    className="rounded-lg bg-[#1e293b] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving ? t("erp.common.registering") : t("erp.users.inquiries.submitReply")}
                  </button>
                </ErpFormActions>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErpPageShell>
  );
}

function InquiriesLoadingFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.usersInquiries">{t("erp.common.loading")}</ErpPageShell>
  );
}

export default function ErpInquiriesPage() {
  return (
    <Suspense fallback={<InquiriesLoadingFallback />}>
      <ErpInquiriesContent />
    </Suspense>
  );
}
