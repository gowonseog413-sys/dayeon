"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArticleListTable } from "@/components/erp/ArticleListTable";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { ARTICLE_PAGE_SIZE } from "@/lib/erp-articles";
import { getToken } from "@/lib/auth-store";
import type { Article } from "@/lib/types";

export default function ErpArticlesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api<{ articles: Article[] }>("/api/admin/articles", { token: getToken() })
      .then((d) => setArticles(d.articles))
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
    if (!confirm("삭제할까요?")) return;
    await api(`/api/admin/articles/${id}`, { method: "DELETE", token: getToken() });
    load();
  }

  return (
    <ErpPageShell title="게시물 목록" description="등록된 언론 보도 게시물을 확인·수정·삭제할 수 있습니다.">
      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : (
        <>
          <ArticleListTable
            articles={pageArticles}
            total={total}
            page={page}
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
