"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import {
  DEFAULT_ARTICLE_CATEGORIES,
  emptyArticleForm,
  type ArticleCategory,
} from "@/lib/erp-articles";
import { getErpToken } from "@/lib/auth-store";
import type { Article } from "@/lib/types";

function ErpArticlesContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>(DEFAULT_ARTICLE_CATEGORIES);
  const [form, setForm] = useState(emptyArticleForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  function load() {
    const token = getErpToken();
    Promise.all([
      api<{ articles: Article[] }>("/api/admin/articles", { token }),
      api<{ categories: ArticleCategory[] }>("/api/admin/articles/categories", { token }),
    ])
      .then(([articleData, categoryData]) => {
        setArticles(articleData.articles);
        setCategories(categoryData.categories);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!editParam || articles.length === 0) return;
    const article = articles.find((a) => a.id === editParam);
    if (!article) return;
    setEditingId(article.id);
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content || "",
      category: article.category,
      image: article.image,
      published: Boolean(article.published),
    });
  }, [editParam, articles]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const token = getErpToken();
    try {
      if (editingId) {
        await api(`/api/admin/articles/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({ subMessage: t("erp.articles.saveSuccessEditSub") });
      } else {
        await api("/api/admin/articles", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({
          message: t("erp.common.registeredTitle"),
          subMessage: t("erp.articles.saveSuccessRegisterSub"),
        });
      }
      setForm(emptyArticleForm(categories));
      setEditingId(null);
      router.replace("/erp/articles");
      load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyArticleForm(categories));
    router.replace("/erp/articles");
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.articlesRegister"
      descriptionKey="erp.articles.registerDesc"
    >
      <form onSubmit={save} className="space-y-2 rounded-xl border bg-white p-4">
        <p className="text-sm font-medium text-[var(--pink-accent)]">
          {editingId ? t("erp.articles.formEditTitle") : t("erp.articles.formNewTitle")}
        </p>
        {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">{t("erp.articles.fieldTitle")}</span>
          <input
            placeholder={t("erp.articles.fieldTitlePlaceholder")}
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">{t("erp.articles.fieldCategory")}</span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <ErpImageUpload
          label={t("erp.articles.thumbnailLabel")}
          value={form.image}
          onChange={(url) => setForm({ ...form, image: url })}
        />
        <textarea
          placeholder={t("erp.articles.excerptPlaceholder")}
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <textarea
          placeholder={t("erp.articles.contentPlaceholder")}
          rows={8}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          {t("erp.articles.publishedLabel")}
        </label>
        <ErpFormActions>
          {editingId && (
            <button
              type="button"
              className="rounded-full border px-5 py-2 text-sm"
              onClick={cancelEdit}
            >
              {t("erp.common.cancel")}
            </button>
          )}
          <button
            type="submit"
            className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
          >
            {editingId ? t("erp.articles.saveEdit") : t("erp.common.register")}
          </button>
        </ErpFormActions>
      </form>
    </ErpPageShell>
  );
}

function ErpArticlesFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.articlesRegister">{t("erp.common.loading")}</ErpPageShell>
  );
}

export default function ErpArticlesPage() {
  return (
    <Suspense fallback={<ErpArticlesFallback />}>
      <ErpArticlesContent />
    </Suspense>
  );
}
