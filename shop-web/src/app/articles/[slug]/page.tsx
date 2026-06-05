"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { articleCategoryKey, localizeArticle } from "@/i18n/article-content";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { locale, t } = useI18n();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api<{ article: Article }>(`/api/articles/${slug}`)
      .then((d) => setArticle(d.article))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="py-20 text-center text-gray-500">{t("articles.loading")}</p>;
  }

  if (!article) {
    return <p className="py-20 text-center text-gray-500">{t("articles.notFound")}</p>;
  }

  const copy = localizeArticle(article.slug, locale, {
    title: article.title,
    excerpt: article.excerpt,
  });
  const catKey = articleCategoryKey(article.category);
  const catLabel = catKey ? t(catKey) : article.categoryLabel || article.category;
  const dateLocale = locale === "id" ? "id-ID" : locale === "en" ? "en-US" : "ko-KR";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-gray-50">
        <Image src={article.image} alt={copy.title} fill className="object-cover" />
      </div>
      <p className="text-sm text-[var(--pink-accent)]">{catLabel}</p>
      <h1 className="mt-2 text-3xl font-semibold leading-tight">{copy.title}</h1>
      <p className="mt-2 text-xs text-gray-400">
        {new Date(article.createdAt).toLocaleDateString(dateLocale)}
      </p>
      <div className="prose prose-sm mt-8 max-w-none whitespace-pre-line text-gray-700">
        {locale === "ko" ? article.content || article.excerpt : copy.excerpt}
      </div>
      <Link href="/articles" className="mt-10 inline-block text-sm text-[var(--pink-accent)]">
        ← {t("articles.back")}
      </Link>
    </article>
  );
}
