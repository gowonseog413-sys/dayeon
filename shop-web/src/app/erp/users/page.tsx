"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { ErpPagination } from "@/components/erp/ErpPagination";
import { MemberDetailModal } from "@/components/erp/MemberDetailModal";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { downloadMembersCsv } from "@/lib/export-members-csv";
import type { AdminMember, AdminUsersPage } from "@/lib/types";
import { userTier } from "@/lib/user-display";

const PAGE_SIZE = 10;

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
}

function formatDateTime(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** 목록 테이블용 — 한 줄에 들어가도록 짧게 표시 */
function formatLastLogin(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${h}:${min}`;
}

export default function ErpUsersPage() {
  const [users, setUsers] = useState<AdminMember[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailMember, setDetailMember] = useState<AdminMember | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await api<AdminUsersPage>(
        `/api/admin/users?page=${p}&pageSize=${PAGE_SIZE}`,
        { token: getToken() },
      );
      setUsers(data.users);
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelectedIds(new Set());
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const pageIds = useMemo(() => users.map((u) => u.id), [users]);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const selectedCount = selectedIds.size;

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePageAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function deleteSelected() {
    if (selectedCount === 0) {
      setActionMsg("삭제할 회원을 선택해 주세요.");
      return;
    }
    if (!confirm(`선택한 ${selectedCount}명의 회원을 삭제할까요?`)) return;

    setDeleting(true);
    setActionMsg("");
    try {
      const result = await api<{ deleted: number; skippedAdmin: number }>(
        "/api/admin/users/bulk-delete",
        {
          method: "POST",
          token: getToken(),
          body: JSON.stringify({ ids: [...selectedIds] }),
        },
      );
      let msg = `${result.deleted}명 삭제되었습니다.`;
      if (result.skippedAdmin > 0) {
        msg += ` (관리자 ${result.skippedAdmin}명은 제외)`;
      }
      setActionMsg(msg);
      await load(page);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  async function exportExcel() {
    setExporting(true);
    setActionMsg("");
    try {
      const data = await api<{ users: AdminMember[] }>("/api/admin/users/export", {
        token: getToken(),
      });
      downloadMembersCsv(data.users);
      setActionMsg(`회원 ${data.users.length}명 엑셀(CSV) 다운로드를 시작했습니다.`);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "다운로드에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <ErpPageShell title="회원 관리">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={deleteSelected}
          disabled={deleting || selectedCount === 0}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "삭제 중…" : `선택 삭제${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
        </button>
        <button
          type="button"
          onClick={exportExcel}
          disabled={exporting}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? "다운로드 중…" : "엑셀(회원목록) 다운"}
        </button>
        <span className="text-xs text-gray-500">총 {total}명 · 행 클릭 시 상세 정보</span>
      </div>

      {actionMsg ? <p className="mb-2 text-sm text-gray-600">{actionMsg}</p> : null}

      <div className="w-fit max-w-full rounded-xl border bg-white">
        <table className="text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="whitespace-nowrap px-2 py-1.5 text-center">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={togglePageAll}
                  aria-label="현재 페이지 전체 선택"
                />
              </th>
              <th className="whitespace-nowrap px-2 py-1.5">No</th>
              <th className="whitespace-nowrap px-2 py-1.5">가입일</th>
              <th className="whitespace-nowrap px-2 py-1.5">이름</th>
              <th className="whitespace-nowrap px-2 py-1.5">연락처</th>
              <th className="px-2 py-1.5">주소</th>
              <th className="px-2 py-1.5">메일</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-right">총구매금액</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-right">구매건수</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-center">등급</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-right">적립금액</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-center">장바구니</th>
              <th className="whitespace-nowrap px-2 py-1.5">최근로그인</th>
              <th className="whitespace-nowrap px-2 py-1.5 text-right">접속횟수</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={14} className="px-2 py-4 text-center text-gray-400">
                  불러오는 중…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-2 py-4 text-center text-gray-400">
                  등록된 회원이 없습니다.
                </td>
              </tr>
            ) : (
              users.map((u, i) => {
                const no = total - ((page - 1) * PAGE_SIZE + i);
                const checked = selectedIds.has(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`cursor-pointer border-b border-gray-50 transition hover:bg-gray-50 ${
                      checked ? "bg-blue-50/60" : ""
                    }`}
                    onClick={() => setDetailMember(u)}
                  >
                    <td
                      className="whitespace-nowrap px-2 py-1.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(u.id)}
                        aria-label={`${u.name} 선택`}
                      />
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-gray-500">{no}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-gray-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 font-medium">{u.name}</td>
                    <td className="whitespace-nowrap px-2 py-1.5">{u.phone || "-"}</td>
                    <td
                      className="max-w-40 truncate px-2 py-1.5"
                      title={u.address || undefined}
                    >
                      {u.address || "-"}
                    </td>
                    <td className="max-w-44 truncate px-2 py-1.5" title={u.email}>
                      {u.email}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">
                      {formatRp(u.totalPurchaseAmount)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">{u.purchaseCount}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center font-medium text-gray-700">
                      {userTier(u)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">
                      {formatRp(u.points)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center text-gray-600">
                      {u.cartCount > 0 ? `(${u.cartCount})` : "-"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-gray-500">
                      {formatLastLogin(u.lastLoginAt)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">{u.loginCount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ErpPagination page={page} totalPages={totalPages} onChange={setPage} />

      <MemberDetailModal member={detailMember} onClose={() => setDetailMember(null)} />
    </ErpPageShell>
  );
}
