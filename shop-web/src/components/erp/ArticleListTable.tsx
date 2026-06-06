"use client";

import {
  ARTICLE_PAGE_SIZE,
  formatArticleDate,
  getArticleCategoryLabel,
} from "@/lib/erp-articles";
import type { Article } from "@/lib/types";

type Props = {
  articles: Article[];
  total: number;
  page: number;
  editingId?: string | null;
  onEdit: (article: Article) => void;
  onRemove: (id: string) => void;
};

export function ArticleListTable({
  articles,
  total,
  page,
  editingId,
  onEdit,
  onRemove,
}: Props) {
  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
        <p className="text-xs text-gray-500">
          전체 {total}건 · 페이지당 {ARTICLE_PAGE_SIZE}건
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
            <th className="px-2 py-1.5">등록일</th>
            <th className="px-2 py-1.5">상태</th>
            <th className="px-2 py-1.5">카테고리</th>
            <th className="px-2 py-1.5">제목</th>
            <th className="px-2 py-1.5" />
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-2 py-6 text-center text-gray-400">
                등록된 게시물이 없습니다.
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
                  <td className="truncate px-2 py-1.5">{a.published ? "게시" : "임시"}</td>
                  <td className="truncate px-2 py-1.5 text-gray-600" title={a.category}>
                    {getArticleCategoryLabel(a.category)}
                  </td>
                  <td className="truncate px-2 py-1.5" title={a.title}>
                    <a
                      href={`/articles/${a.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--pink-accent)] hover:underline"
                    >
                      {a.title}
                    </a>
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="mr-3 text-gray-600 hover:text-gray-900"
                      onClick={() => onEdit(a)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => onRemove(a.id)}
                    >
                      삭제
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
