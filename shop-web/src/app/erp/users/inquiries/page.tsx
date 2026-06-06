"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  INQUIRY_PAGE_SIZE,
  inquiryCategoryLabel,
  inquiryStatusLabel,
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
        { token: getToken(), cache: "no-store" },
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

  async function submitReply() {
    if (!selected || !reply.trim()) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const data = await api<{ inquiry: Inquiry }>(
        `/api/admin/inquiries/${selected.id}/replies`,
        {
          method: "POST",
          token: getToken(),
          body: JSON.stringify({ body: reply }),
        },
      );
      setSelected(data.inquiry);
      setReply("");
      showSaveSuccess({ message: "등록되었습니다", subMessage: "답변이 등록되었습니다." });
      publishInquiryReplyUpdated();
      load(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "답변 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("이 문의를 삭제할까요?")) return;
    await api(`/api/admin/inquiries/${id}`, {
      method: "DELETE",
      token: getToken(),
    });
    if (selected?.id === id) setSelected(null);
    load(true);
  }

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <ErpPageShell
      title="1:1 문의"
      description="회원이 남긴 1:1 문의를 확인하고 답변할 수 있습니다. 새 문의는 실시간으로 반영됩니다."
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", label: "전체" },
            { key: "pending", label: "답변 대기" },
            { key: "answered", label: "답변 완료" },
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
            {tab.label}
            {tab.key === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
        <span className="text-xs text-gray-400">
          · 총 {total}건 · {INQUIRY_PAGE_SIZE}개씩 · 2초마다 자동 갱신
        </span>
      </div>

      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-6 text-sm text-gray-400">불러오는 중…</p>
            ) : pageItems.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">등록된 문의가 없습니다.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">No</th>
                    <th className="px-3 py-2 font-medium">접수일</th>
                    <th className="px-3 py-2 font-medium">이름</th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">유형</th>
                    <th className="px-3 py-2 font-medium">제목</th>
                    <th className="px-3 py-2 font-medium">상태</th>
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
                        {inquiryCategoryLabel(inq.category)}
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
                          {inquiryStatusLabel(inq.status)}
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
              왼쪽 목록에서 문의를 선택하세요.
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
                  삭제
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <dt className="text-gray-400">이름</dt>
                  <dd>{selected.userName}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">연락처</dt>
                  <dd>{selected.userPhone || "-"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-400">이메일</dt>
                  <dd>{selected.userEmail}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">유형</dt>
                  <dd>{inquiryCategoryLabel(selected.category)}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">주문번호</dt>
                  <dd>{selected.orderId || "-"}</dd>
                </div>
              </dl>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-500">문의 내용</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{selected.body}</p>
              </div>

              {selected.replies.map((r) => (
                <div key={r.id} className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                  <p className="text-xs font-medium text-sky-700">관리자 답변</p>
                  <p className="mt-1 text-[11px] text-gray-400">{formatDate(r.createdAt)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  답변 작성
                </label>
                <textarea
                  rows={5}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="고객에게 전달할 답변을 입력하세요."
                />
                <ErpFormActions className="mt-2">
                  <button
                    type="button"
                    disabled={saving || !reply.trim()}
                    onClick={submitReply}
                    className="rounded-lg bg-[#1e293b] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving ? "등록 중…" : "답변 등록"}
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

export default function ErpInquiriesPage() {
  return (
    <Suspense fallback={<ErpPageShell title="1:1 문의">불러오는 중…</ErpPageShell>}>
      <ErpInquiriesContent />
    </Suspense>
  );
}
