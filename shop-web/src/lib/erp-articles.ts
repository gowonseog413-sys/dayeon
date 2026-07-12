export const ARTICLE_PAGE_SIZE = 15;

export type ArticleCategory = {
  id: string;
  label: string;
  order?: number;
  articleCount?: number;
};

import { translate, type Locale } from "@/i18n/messages";
import { articleCategoryKey } from "@/i18n/article-content";

export const DEFAULT_ARTICLE_CATEGORIES: ArticleCategory[] = [
  { id: "beauty-lifestyle", label: "뷰티 및 라이프스타일" },
  { id: "community", label: "커뮤니티" },
  { id: "reviews", label: "리뷰" },
  { id: "tips", label: "팁과 요령" },
];

/** @deprecated DEFAULT_ARTICLE_CATEGORIES 사용 */
export const ARTICLE_CATEGORIES = DEFAULT_ARTICLE_CATEGORIES;

export function getArticleCategoryLabel(
  categoryId: string,
  categories: ArticleCategory[] = DEFAULT_ARTICLE_CATEGORIES,
  locale: Locale = "ko",
) {
  const key = articleCategoryKey(categoryId);
  if (key && locale !== "ko") return translate(locale, key);
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function formatArticleDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function emptyArticleForm(categories: ArticleCategory[] = DEFAULT_ARTICLE_CATEGORIES) {
  return {
    title: "",
    excerpt: "",
    content: "",
    category: categories[0]?.id || "beauty-lifestyle",
    image: "/articles/placeholder.svg",
    published: true,
  };
}
