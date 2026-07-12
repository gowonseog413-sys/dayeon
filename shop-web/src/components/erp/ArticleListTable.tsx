"use client";

import { useI18n } from "@/components/I18nProvider";
import { localizeArticle } from "@/i18n/article-content";
import {
  ARTICLE_PAGE_SIZE,
  DEFAULT_ARTICLE_CATEGORIES,
  formatArticleDate,
  getArticleCategoryLabel,
  type ArticleCategory,
} from "@/lib/erp-articles";
import type { Article } from "@/lib/types";

type Props = {
  articles: Article[];
  total: number;
  page: number;
  editingId?: string | null;
  onEdit: (article: Article) => void;
  onRemove: (id: string) => void;
  categories?: ArticleCategory[];
};

export function ArticleListTable({
  articles,
  total,
  page,
  editingId,
  onEdit,
  onRemove,
  categories = DEFAULT_ARTICLE_CATEGORIES,
}: Props) {
  const { t, tFmt, locale } = useI18n();

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
        <p className="text-xs text-gray-500">
          {tFmt("erp.articles.listSummary", { total, pageSize: ARTICLE_PAGE_SIZE })}
        </p>
      </div>
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[5%]" />
          <col className="w-[11%]" />
          <col className="w-[8%]" />
          <col className="w-[18%]" />
          <col className="w-[36%]" />
          <col className="w-[22%]" />
        </colgroup>
        <thead className="border-b bg-gray-50 text-gray-500">
          <tr>
            <th className="px-2 py-1.5 text-center">No</th>
            <th className="px-2 py-1.5">{t("erp.articles.colDate")}</th>
            <th className="px-2 py-1.5">{t("erp.articles.colStatus")}</th>
            <th className="px-2 py-1.5">{t("erp.articles.colCategory")}</th>
            <th className="px-2 py-1.5">{t("erp.articles.colTitle")}</th>
            <th className="px-2 py-1.5" />
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-2 py-6 text-center text-gray-400">
                {t("erp.articles.noArticles")}
              </td>
            </tr>
          ) : (
            articles.map((a, i) => {
              const no = total - ((page - 1) * ARTICLE_PAGE_SIZE + i);
              return (
                <tr
                  key={a.id}
                  className={`border-b border-gray-50 ${
                    editingId === a.id ? "bg-[var(--pink-bg)]/60" : ""
                  }`}
                >
                  <td className="px-2 py-1.5 text-center text-gray-500">{no}</td>
                  <td className="truncate px-2 py-1.5 text-gray-500">
                    {formatArticleDate(a.createdAt)}
                  </td>
                  <td className="truncate px-2 py-1.5">
                    {a.published ? t("erp.articles.statusPublished") : t("erp.articles.statusDraft")}
                  </td>
                  <td className="truncate px-2 py-1.5 text-gray-600" title={a.category}>
                    {getArticleCategoryLabel(a.category, categories, locale)}
                  </td>
                  <td className="truncate px-2 py-1.5" title={a.title}>
                    <a
                      href={`/articles/${a.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--pink-accent)] hover:underline"
                    >
                      {localizeArticle(a.slug, locale, { title: a.title, excerpt: a.excerpt }).title}
                    </a>
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="mr-3 text-gray-600 hover:text-gray-900"
                      onClick={() => onEdit(a)}
                    >
                      {t("erp.common.edit")}
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => onRemove(a.id)}
                    >
                      {t("erp.common.delete")}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
