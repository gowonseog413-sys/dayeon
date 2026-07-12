"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { getArticleCategoryLabel, type ArticleCategory } from "@/lib/erp-articles";
import { getErpToken } from "@/lib/auth-store";

type FormState = { label: string; id: string };

const EMPTY_FORM: FormState = { label: "", id: "" };

function ErpArticleCategoriesContent() {
  const { t, tFmt, locale } = useI18n();
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
        token: getErpToken(),
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
      setErrorMsg(t("erp.articles.categoryNameRequired"));
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      if (editingId) {
        await api(`/api/admin/articles/categories/${editingId}`, {
          method: "PUT",
          token: getErpToken(),
          body: JSON.stringify({
            label: form.label.trim(),
            ...(form.id.trim() && form.id.trim() !== editingId ? { newId: form.id.trim() } : {}),
          }),
        });
        showSaveSuccess({
          message: t("erp.common.updatedTitle"),
          subMessage: t("erp.articles.categorySaveEditSub"),
        });
      } else {
        await api("/api/admin/articles/categories", {
          method: "POST",
          token: getErpToken(),
          body: JSON.stringify({
            label: form.label.trim(),
            ...(form.id.trim() ? { id: form.id.trim() } : {}),
          }),
        });
        showSaveSuccess({
          message: t("erp.common.registeredTitle"),
          subMessage: t("erp.articles.categorySaveAddSub"),
        });
      }
      resetForm();
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
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
        tFmt("erp.articles.categoryReassignRequired", { label: item.label, count: used }),
      );
      const fallback = categories.find((c) => c.id !== id)?.id || "";
      if (fallback) setReassignTarget(fallback);
      return;
    }
    if (used > 0 && reassignTarget === id) {
      setErrorMsg(t("erp.articles.categoryReassignDifferent"));
      return;
    }
    if (!confirm(tFmt("erp.articles.categoryDeleteConfirm", { label: item.label }))) return;

    setDeletingId(id);
    setErrorMsg("");
    try {
      const qs =
        used > 0 && reassignTarget ? `?reassignTo=${encodeURIComponent(reassignTarget)}` : "";
      await api(`/api/admin/articles/categories/${id}${qs}`, {
        method: "DELETE",
        token: getErpToken(),
      });
      if (editingId === id) resetForm();
      setReassignTarget("");
      showSaveSuccess({
        message: t("erp.common.deletedTitle"),
        subMessage: t("erp.articles.categoryDeletedSub"),
      });
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <ErpPageShell titleKey="erp.nav.articlesCategories">
        <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
      </ErpPageShell>
    );
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.articlesCategories"
      descriptionKey="erp.articles.categoriesDesc"
    >
      {errorMsg ? (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      ) : null}

      <form onSubmit={submitForm} className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {editingId ? t("erp.articles.formEditCategory") : t("erp.articles.formAddCategory")}
          </h3>
          {editingId ? (
            <button type="button" onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-800">
              {t("erp.articles.cancelEditCategory")}
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.articles.displayName")}</span>
            <input
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder={t("erp.articles.displayNamePlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.articles.categoryIdOptional")}</span>
            <input
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              placeholder={t("erp.articles.categoryIdPlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono"
            />
            <span className="mt-1 block text-xs text-gray-400">{t("erp.articles.categoryIdHint")}</span>
          </label>
        </div>

        <ErpFormActions className="mt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? t("erp.common.saving")
              : editingId
                ? t("erp.articles.saveEdit")
                : t("erp.articles.addCategory")}
          </button>
        </ErpFormActions>
      </form>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">{t("erp.articles.colDisplayName")}</th>
              <th className="px-4 py-3 font-medium">{t("erp.articles.colCategoryId")}</th>
              <th className="px-4 py-3 font-medium text-center">{t("erp.articles.colArticleCount")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("erp.articles.colManage")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b last:border-b-0 ${editingId === c.id ? "bg-amber-50/50" : ""}`}
              >
                <td className="px-4 py-3 text-gray-400">{categories.length - i}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {getArticleCategoryLabel(c.id, categories, locale)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.id}</td>
                <td className="px-4 py-3 text-center text-gray-600">{c.articleCount ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      {t("erp.common.edit")}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === c.id || categories.length <= 1}
                      onClick={() => removeCategory(c.id)}
                      className="text-xs text-red-500 hover:underline disabled:opacity-40"
                    >
                      {deletingId === c.id ? t("erp.common.deleting") : t("erp.common.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{t("erp.articles.deleteCategoryTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{t("erp.articles.deleteCategoryDesc")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-xs text-gray-600">{t("erp.articles.reassignTarget")}</label>
          <select
            value={reassignTarget}
            onChange={(e) => setReassignTarget(e.target.value)}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">{t("erp.articles.reassignNone")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getArticleCategoryLabel(c.id, categories, locale)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ErpPageShell>
  );
}

function ErpArticleCategoriesFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.articlesCategories">
      <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
    </ErpPageShell>
  );
}

export default function ErpArticleCategoriesPage() {
  return (
    <Suspense fallback={<ErpArticleCategoriesFallback />}>
      <ErpArticleCategoriesContent />
    </Suspense>
  );
}
