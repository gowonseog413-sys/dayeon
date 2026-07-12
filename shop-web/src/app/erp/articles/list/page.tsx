"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ArticleListTable } from "@/components/erp/ArticleListTable";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { ARTICLE_PAGE_SIZE, DEFAULT_ARTICLE_CATEGORIES, type ArticleCategory } from "@/lib/erp-articles";
import { getErpToken } from "@/lib/auth-store";
import type { Article } from "@/lib/types";

function ErpArticlesListContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>(DEFAULT_ARTICLE_CATEGORIES);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const token = getErpToken();
    Promise.all([
      api<{ articles: Article[] }>("/api/admin/articles", { token }),
      api<{ categories: ArticleCategory[] }>("/api/admin/articles/categories", { token }),
    ])
      .then(([articleData, categoryData]) => {
        setArticles(articleData.articles);
        setCategories(categoryData.categories);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const total = articles.length;
  const totalPages = Math.max(1, Math.ceil(total / ARTICLE_PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);

  const pageArticles = useMemo(() => {
    const start = (page - 1) * ARTICLE_PAGE_SIZE;
    return articles.slice(start, start + ARTICLE_PAGE_SIZE);
  }, [articles, page]);

  function startEdit(article: Article) {
    router.push(`/erp/articles?edit=${article.id}`);
  }

  async function remove(id: string) {
    if (!confirm(t("erp.articles.confirmDelete"))) return;
    await api(`/api/admin/articles/${id}`, { method: "DELETE", token: getErpToken() });
    load();
  }

  return (
    <ErpPageShell titleKey="erp.nav.articlesList" descriptionKey="erp.articles.listDesc">
      {loading ? (
        <p className="text-sm text-gray-400">{t("erp.common.loading")}</p>
      ) : (
        <>
          <ArticleListTable
            articles={pageArticles}
            total={total}
            page={page}
            categories={categories}
            onEdit={startEdit}
            onRemove={remove}
          />
          <NatePagination
            page={page}
            totalPages={totalPages}
            basePath="/erp/articles/list"
          />
        </>
      )}
    </ErpPageShell>
  );
}

function ErpArticlesListFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.articlesList">{t("erp.common.loading")}</ErpPageShell>
  );
}

export default function ErpArticlesListPage() {
  return (
    <Suspense fallback={<ErpArticlesListFallback />}>
      <ErpArticlesListContent />
    </Suspense>
  );
}
