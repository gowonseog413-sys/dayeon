"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { api } from "@/lib/api";
import { ARTICLE_CATEGORIES, emptyArticleForm } from "@/lib/erp-articles";
import { getToken } from "@/lib/auth-store";
import type { Article } from "@/lib/types";

function ErpArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");

  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState(emptyArticleForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  function load() {
    api<{ articles: Article[] }>("/api/admin/articles", { token: getToken() })
      .then((d) => setArticles(d.articles))
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
    const token = getToken();
    try {
      if (editingId) {
        await api(`/api/admin/articles/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({ subMessage: "게시물이 수정되었습니다." });
      } else {
        await api("/api/admin/articles", {
          method: "POST",
          token,
          body: JSON.stringify(form),
        });
        showSaveSuccess({ message: "등록되었습니다", subMessage: "언론 보도가 등록되었습니다." });
      }
      setForm(emptyArticleForm);
      setEditingId(null);
      router.replace("/erp/articles");
      load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장 실패");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyArticleForm);
    router.replace("/erp/articles");
  }

  return (
    <ErpPageShell
      title="언론 보도 등록"
      description="제목·요약·본문을 등록하면 쇼핑몰 언론 보도 메뉴와 푸터에 노출됩니다."
    >
      <form onSubmit={save} className="space-y-2 rounded-xl border bg-white p-4">
        <p className="text-sm font-medium text-[var(--pink-accent)]">
          {editingId ? "게시물 수정" : "새 게시물 등록"}
        </p>
        {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">제목*</span>
          <input
            placeholder="게시물 제목"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">카테고리</span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <ErpImageUpload
          label="썸네일 이미지"
          value={form.image}
          onChange={(url) => setForm({ ...form, image: url })}
        />
        <textarea
          placeholder="요약 (목록에 표시)"
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <textarea
          placeholder="본문 (상세 페이지)"
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
          게시 (체크 시 쇼핑몰에 공개)
        </label>
        <ErpFormActions>
          {editingId && (
            <button
              type="button"
              className="rounded-full border px-5 py-2 text-sm"
              onClick={cancelEdit}
            >
              취소
            </button>
          )}
          <button
            type="submit"
            className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
          >
            {editingId ? "수정 저장" : "등록"}
          </button>
        </ErpFormActions>
      </form>
    </ErpPageShell>
  );
}

export default function ErpArticlesPage() {
  return (
    <Suspense fallback={<ErpPageShell title="기사 등록">불러오는 중…</ErpPageShell>}>
      <ErpArticlesContent />
    </Suspense>
  );
}
