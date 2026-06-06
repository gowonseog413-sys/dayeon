"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import type { ArticleCategory } from "@/lib/erp-articles";
import { getToken } from "@/lib/auth-store";

type FormState = { label: string; id: string };

const EMPTY_FORM: FormState = { label: "", id: "" };

function ErpArticleCategoriesContent() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errorMsg, setErrorMsg] = useState("");
  const [reassignTarget, setReassignTarget] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ categories: ArticleCategory[] }>("/api/admin/articles/categories", {
        token: getToken(),
      });
      setCategories(data.categories);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setReassignTarget("");
  }

  function startEdit(item: ArticleCategory) {
    setEditingId(item.id);
    setForm({ label: item.label, id: item.id });
    setReassignTarget("");
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) {
      setErrorMsg("카테고리 이름을 입력해 주세요.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      if (editingId) {
        await api(`/api/admin/articles/categories/${editingId}`, {
          method: "PUT",
          token: getToken(),
          body: JSON.stringify({
            label: form.label.trim(),
            ...(form.id.trim() && form.id.trim() !== editingId ? { newId: form.id.trim() } : {}),
          }),
        });
        showSaveSuccess({
          message: "수정되었습니다",
          subMessage: "언론 보도 등록·목록의 카테고리에 반영됩니다.",
        });
      } else {
        await api("/api/admin/articles/categories", {
          method: "POST",
          token: getToken(),
          body: JSON.stringify({
            label: form.label.trim(),
            ...(form.id.trim() ? { id: form.id.trim() } : {}),
          }),
        });
        showSaveSuccess({
          message: "등록되었습니다",
          subMessage: "새 카테고리가 추가되었습니다.",
        });
      }
      resetForm();
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(id: string) {
    const item = categories.find((c) => c.id === id);
    if (!item) return;

    const used = item.articleCount ?? 0;
    if (used > 0 && !reassignTarget) {
      setErrorMsg(
        `「${item.label}」에 게시물 ${used}건이 있습니다. 아래에서 이동할 카테고리를 선택한 뒤 삭제해 주세요.`,
      );
      const fallback = categories.find((c) => c.id !== id)?.id || "";
      if (fallback) setReassignTarget(fallback);
      return;
    }
    if (used > 0 && reassignTarget === id) {
      setErrorMsg("이동할 카테고리는 삭제 대상과 달라야 합니다.");
      return;
    }
    if (!confirm(`「${item.label}」 카테고리를 삭제할까요?`)) return;

    setDeletingId(id);
    setErrorMsg("");
    try {
      const qs =
        used > 0 && reassignTarget ? `?reassignTo=${encodeURIComponent(reassignTarget)}` : "";
      await api(`/api/admin/articles/categories/${id}${qs}`, {
        method: "DELETE",
        token: getToken(),
      });
      if (editingId === id) resetForm();
      setReassignTarget("");
      showSaveSuccess({ message: "삭제되었습니다", subMessage: "카테고리가 제거되었습니다." });
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <ErpPageShell title="언론보도 카테고리">
        <p className="text-sm text-gray-500">불러오는 중…</p>
      </ErpPageShell>
    );
  }

  return (
    <ErpPageShell
      title="언론보도 카테고리"
      description="등록·수정·삭제한 카테고리는 언론 보도 등록 폼과 쇼핑몰 언론 보도 필터에 바로 반영됩니다."
    >
      {errorMsg ? (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      ) : null}

      <form onSubmit={submitForm} className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {editingId ? "카테고리 수정" : "카테고리 추가"}
          </h3>
          {editingId ? (
            <button type="button" onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-800">
              수정 취소
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">표시 이름 *</span>
            <input
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="예: 뷰티 및 라이프스타일"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">카테고리 ID (선택)</span>
            <input
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              placeholder="비우면 이름에서 자동 생성"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono"
            />
            <span className="mt-1 block text-xs text-gray-400">
              URL·필터에 사용됩니다. 수정 시 연결된 게시물도 함께 변경됩니다.
            </span>
          </label>
        </div>

        <ErpFormActions className="mt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "저장 중…" : editingId ? "수정 저장" : "카테고리 추가"}
          </button>
        </ErpFormActions>
      </form>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">표시 이름</th>
              <th className="px-4 py-3 font-medium">카테고리 ID</th>
              <th className="px-4 py-3 font-medium text-center">게시물</th>
              <th className="px-4 py-3 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b last:border-b-0 ${editingId === c.id ? "bg-amber-50/50" : ""}`}
              >
                <td className="px-4 py-3 text-gray-400">{categories.length - i}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.label}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.id}</td>
                <td className="px-4 py-3 text-center text-gray-600">{c.articleCount ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === c.id || categories.length <= 1}
                      onClick={() => removeCategory(c.id)}
                      className="text-xs text-red-500 hover:underline disabled:opacity-40"
                    >
                      {deletingId === c.id ? "삭제 중…" : "삭제"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <p className="font-medium text-gray-900">게시물이 있는 카테고리 삭제</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          삭제 전 게시물을 다른 카테고리로 옮길 수 있습니다.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-xs text-gray-600">이동할 카테고리</label>
          <select
            value={reassignTarget}
            onChange={(e) => setReassignTarget(e.target.value)}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">선택 안 함</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ErpPageShell>
  );
}

export default function ErpArticleCategoriesPage() {
  return (
    <Suspense
      fallback={
        <ErpPageShell title="언론보도 카테고리">
          <p className="text-sm text-gray-500">불러오는 중…</p>
        </ErpPageShell>
      }
    >
      <ErpArticleCategoriesContent />
    </Suspense>
  );
}
