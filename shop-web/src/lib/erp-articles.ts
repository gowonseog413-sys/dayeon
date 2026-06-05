export const ARTICLE_PAGE_SIZE = 15;

export const ARTICLE_CATEGORIES = [
  { id: "beauty-lifestyle", label: "뷰티 및 라이프스타일" },
  { id: "community", label: "커뮤니티" },
  { id: "reviews", label: "리뷰" },
  { id: "tips", label: "팁과 요령" },
] as const;

export function getArticleCategoryLabel(categoryId: string) {
  return ARTICLE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function formatArticleDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export const emptyArticleForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "beauty-lifestyle",
  image: "/articles/placeholder.svg",
  published: true,
};
