"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { NatePagination } from "@/components/NatePagination";
import { useI18n } from "@/components/I18nProvider";
import { articleCategoryKey, localizeArticle } from "@/i18n/article-content";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";

const FILTER_IDS = ["all", "beauty-lifestyle", "community", "reviews", "tips"] as const;

type Pagination = { page: number; limit: number; total: number; totalPages: number };

function buildQuery(category: string) {
  const p = new URLSearchParams();
  if (category !== "all") p.set("category", category);
  const s = p.toString();
  return s || undefined;
}

function ArticlesList() {
  const { locale, t, tFmt } = useI18n();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });

  const filters = useMemo(
    () =>
      FILTER_IDS.map((id) => ({
        id,
        label: t(articleCategoryKey(id) ?? "articles.cat.all"),
      })),
    [t],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "6");
    if (category !== "all") params.set("category", category);

    api<{ articles: Article[]; pagination: Pagination }>(`/api/articles?${params}`)
      .then((d) => {
        setArticles(d.articles);
        setPagination(d.pagination ?? { page: 1, limit: 6, total: d.articles.length, totalPages: 1 });
      })
      .catch(() => {
        setArticles([]);
        setPagination({ page: 1, limit: 6, total: 0, totalPages: 1 });
      });
  }, [category, page]);

  const query = buildQuery(category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-8">
        {filters.map((f) => (
          <Link
            key={f.id}
            href={f.id === "all" ? "/articles" : `/articles?category=${f.id}`}
            className={`rounded-full border px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm ${
              category === f.id
                ? "border-[var(--pink-accent)] bg-[var(--pink-accent)] text-white"
                : "border-[var(--pink-accent)] text-[var(--pink-accent)] hover:bg-[var(--pink-bg)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <p className="mb-4 text-center text-xs text-gray-500 sm:text-sm">
        {tFmt("articles.summary", {
          total: pagination.total,
          page: pagination.page,
          totalPages: pagination.totalPages,
        })}
      </p>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
        {articles.map((a) => {
          const copy = localizeArticle(a.slug, locale, {
            title: a.title,
            excerpt: a.excerpt,
          });
          const catKey = articleCategoryKey(a.category);
          const catLabel = catKey ? t(catKey) : a.categoryLabel || a.category;
          return (
            <article
              key={a.id}
              className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
            >
              <Link href={`/articles/${a.slug}`} className="relative block aspect-[16/10] bg-gray-50">
                <Image src={a.image} alt={copy.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
              </Link>
              <div className="p-4 sm:p-5">
                <p className="text-xs font-medium text-[var(--pink-accent)]">{catLabel}</p>
                <h2 className="mt-2 text-base font-semibold leading-snug sm:text-lg">
                  <Link href={`/articles/${a.slug}`} className="hover:text-[var(--pink-accent)]">
                    {copy.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{copy.excerpt}</p>
                <div className="mt-4 text-right">
                  <Link
                    href={`/articles/${a.slug}`}
                    className="text-sm text-gray-400 hover:text-[var(--pink-accent)]"
                  >
                    {t("articles.readMore")}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {articles.length === 0 && (
        <p className="py-20 text-center text-gray-500">{t("articles.empty")}</p>
      )}

      <NatePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        basePath="/articles"
        query={query}
      />
    </div>
  );
}

export default function ArticlesPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<p className="py-20 text-center">{t("common.loading")}</p>}>
      <ArticlesList />
    </Suspense>
  );
}
