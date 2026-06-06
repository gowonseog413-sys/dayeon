"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { productImageFallback } from "@/lib/product-image-fallback";
import type { Product, ProductReview } from "@/lib/types";

const WORK_PAGE_SIZE = 8;

type AdminReview = ProductReview & { userEmail?: string };

type FormState = {
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  content: string;
  createdAt: string;
};

const EMPTY_FORM: FormState = {
  productId: "",
  userName: "",
  userEmail: "",
  rating: 5,
  content: "",
  createdAt: "",
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StarsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="별점">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-xl transition ${n <= value ? "text-amber-500" : "text-gray-300 hover:text-amber-300"}`}
          aria-label={`${n}점`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{value}점</span>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(value)}
      <span className="text-gray-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

type Props = {
  page: number;
  onPageChange: (page: number) => void;
  onError: (msg: string) => void;
};

export function ErpReviewWorkPanel({ page, onPageChange, onError }: Props) {
  const { showSaveSuccess } = useErpSaveSuccess();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productData, reviewData] = await Promise.all([
        api<{ products: Product[] }>("/api/admin/products", { token: getToken() }),
        api<{ reviews: AdminReview[] }>("/api/admin/reviews?scope=managed", { token: getToken() }),
      ]);
      setProducts(productData.products);
      setReviews(reviewData.reviews);
    } catch {
      setProducts([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = reviews.length;
  const totalPages = Math.max(1, Math.ceil(total / WORK_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageReviews = useMemo(
    () => reviews.slice((safePage - 1) * WORK_PAGE_SIZE, safePage * WORK_PAGE_SIZE),
    [reviews, safePage],
  );

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(review: AdminReview) {
    setEditingId(review.id);
    setForm({
      productId: review.productId,
      userName: review.userName,
      userEmail: review.userEmail || "",
      rating: review.rating,
      content: review.content,
      createdAt: toDatetimeLocal(review.createdAt),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId) {
      onError("상품을 선택해 주세요.");
      return;
    }
    if (!form.content.trim()) {
      onError("리뷰 내용을 입력해 주세요.");
      return;
    }

    setSaving(true);
    onError("");
    const payload = {
      productId: form.productId,
      userName: form.userName.trim() || "고객",
      userEmail: form.userEmail.trim(),
      rating: form.rating,
      content: form.content.trim(),
      ...(form.createdAt ? { createdAt: new Date(form.createdAt).toISOString() } : {}),
    };

    try {
      if (editingId) {
        await api(`/api/admin/reviews/${editingId}/managed`, {
          method: "PATCH",
          token: getToken(),
          body: JSON.stringify(payload),
        });
        showSaveSuccess({ message: "수정되었습니다", subMessage: "관리자 리뷰가 쇼핑몰에 반영됩니다." });
      } else {
        await api("/api/admin/reviews/managed", {
          method: "POST",
          token: getToken(),
          body: JSON.stringify(payload),
        });
        showSaveSuccess({ message: "등록되었습니다", subMessage: "관리자 리뷰가 상품 페이지에 표시됩니다." });
      }
      resetForm();
      await load();
      onPageChange(1);
    } catch (err) {
      onError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function removeReview(id: string) {
    if (!confirm("이 관리자 리뷰를 삭제할까요?")) return;
    setDeletingId(id);
    onError("");
    try {
      await api(`/api/admin/reviews/${id}`, { method: "DELETE", token: getToken() });
      if (editingId === id) resetForm();
      showSaveSuccess({ message: "삭제되었습니다", subMessage: "리뷰가 제거되었습니다." });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">불러오는 중…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">관리자 리뷰 작업</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
          회원 주문과 무관하게 리뷰를 등록·수정할 수 있습니다. 포인트는 지급되지 않으며, 상품 상세
          페이지에 일반 리뷰와 동일하게 노출됩니다.
        </p>
      </div>

      <form
        onSubmit={submitForm}
        className="rounded-xl border bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {editingId ? "리뷰 수정" : "새 리뷰 등록"}
          </h3>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              수정 취소
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">상품 *</span>
            <select
              required
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="">상품을 선택하세요</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">작성자 이름</span>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              placeholder="예: 김다연"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">이메일 (선택)</span>
            <input
              type="email"
              value={form.userEmail}
              onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
              placeholder="표시용 · 실제 회원과 연결되지 않음"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </label>

          <div className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">별점 *</span>
            <StarsInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">등록일 (선택)</span>
            <input
              type="datetime-local"
              value={form.createdAt}
              onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
            <span className="mt-1 block text-xs text-gray-400">비우면 저장 시점으로 등록됩니다.</span>
          </label>

          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">리뷰 내용 *</span>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="상품 리뷰 문구를 입력하세요."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-relaxed"
            />
          </label>
        </div>

        <ErpFormActions className="mt-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "저장 중…" : editingId ? "수정 저장" : "리뷰 등록"}
          </button>
        </ErpFormActions>
      </form>

      <div>
        <p className="mb-3 text-xs text-gray-500">
          관리자 리뷰 {total}건 · 등록일 역순 · {WORK_PAGE_SIZE}건씩
        </p>

        {pageReviews.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-gray-500">
            등록된 관리자 리뷰가 없습니다.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {pageReviews.map((r, i) => {
                const no = total - ((safePage - 1) * WORK_PAGE_SIZE + i);
                return (
                  <li
                    key={r.id}
                    className={`rounded-xl border bg-white p-4 text-sm ${
                      editingId === r.id ? "border-amber-400 ring-1 ring-amber-200" : ""
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-gray-400">No. {no}</p>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          관리자 작성
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleString("ko-KR")}
                        </p>
                        <div className="mt-1 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            className="text-xs text-gray-600 hover:underline"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === r.id}
                            onClick={() => removeReview(r.id)}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            {deletingId === r.id ? "삭제 중…" : "삭제"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                        <Image
                          src={
                            r.productImage ||
                            productImageFallback({ category: "", image: r.productImage || "" })
                          }
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">
                          {r.productBrand} {r.productName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {r.userName}
                          {r.userEmail ? ` · ${r.userEmail}` : ""}
                        </p>
                        <div className="mt-1">
                          <Stars value={r.rating} />
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-gray-700">{r.content}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <NatePagination
              page={safePage}
              totalPages={totalPages}
              basePath="/erp/users/reviews"
              query="tab=work"
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
