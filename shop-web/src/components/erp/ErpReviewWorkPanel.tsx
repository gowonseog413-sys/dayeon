"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
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

function StarsInput({
  value,
  onChange,
  t,
  tFmt,
}: {
  value: number;
  onChange: (n: number) => void;
  t: (key: string) => string;
  tFmt: (key: string, vars: Record<string, string | number>) => string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={t("erp.users.reviewWork.ratingAria")}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-xl transition ${n <= value ? "text-amber-500" : "text-gray-300 hover:text-amber-300"}`}
          aria-label={tFmt("erp.users.reviewWork.ratingPoints", { n })}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{tFmt("erp.users.reviewWork.ratingPoints", { n: value })}</span>
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
  const { t, tFmt } = useI18n();
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
        api<{ products: Product[] }>("/api/admin/products", { token: getErpToken() }),
        api<{ reviews: AdminReview[] }>("/api/admin/reviews?scope=managed", { token: getErpToken() }),
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
      onError(t("erp.users.reviewWork.errorSelectProduct"));
      return;
    }
    if (!form.content.trim()) {
      onError(t("erp.users.reviewWork.errorContent"));
      return;
    }

    setSaving(true);
    onError("");
    const payload = {
      productId: form.productId,
      userName: form.userName.trim() || t("erp.users.reviewWork.defaultAuthor"),
      userEmail: form.userEmail.trim(),
      rating: form.rating,
      content: form.content.trim(),
      ...(form.createdAt ? { createdAt: new Date(form.createdAt).toISOString() } : {}),
    };

    try {
      if (editingId) {
        await api(`/api/admin/reviews/${editingId}/managed`, {
          method: "PATCH",
          token: getErpToken(),
          body: JSON.stringify(payload),
        });
        showSaveSuccess({
          message: t("erp.common.updatedTitle"),
          subMessage: t("erp.users.reviewWork.updatedMsg"),
        });
      } else {
        await api("/api/admin/reviews/managed", {
          method: "POST",
          token: getErpToken(),
          body: JSON.stringify(payload),
        });
        showSaveSuccess({
          message: t("erp.common.registeredTitle"),
          subMessage: t("erp.users.reviewWork.registeredMsg"),
        });
      }
      resetForm();
      await load();
      onPageChange(1);
    } catch (err) {
      onError(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function removeReview(id: string) {
    if (!confirm(t("erp.users.reviewWork.confirmDelete"))) return;
    setDeletingId(id);
    onError("");
    try {
      await api(`/api/admin/reviews/${id}`, { method: "DELETE", token: getErpToken() });
      if (editingId === id) resetForm();
      showSaveSuccess({
        message: t("erp.common.deletedTitle"),
        subMessage: t("erp.users.reviewWork.deletedMsg"),
      });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : t("erp.common.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">{t("erp.users.reviewWork.title")}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-900/80">{t("erp.users.reviewWork.desc")}</p>
      </div>

      <form
        onSubmit={submitForm}
        className="rounded-xl border bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {editingId ? t("erp.users.reviewWork.editTitle") : t("erp.users.reviewWork.newTitle")}
          </h3>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              {t("erp.users.reviewWork.cancelEdit")}
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.users.reviewWork.product")}</span>
            <select
              required
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="">{t("erp.users.reviewWork.selectProduct")}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.users.reviewWork.authorName")}</span>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              placeholder={t("erp.users.reviewWork.authorPlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.users.reviewWork.emailOptional")}</span>
            <input
              type="email"
              value={form.userEmail}
              onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
              placeholder={t("erp.users.reviewWork.emailHint")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </label>

          <div className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.users.reviewWork.rating")}</span>
            <StarsInput
              value={form.rating}
              onChange={(rating) => setForm({ ...form, rating })}
              t={t}
              tFmt={tFmt}
            />
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.users.reviewWork.createdAt")}</span>
            <input
              type="datetime-local"
              value={form.createdAt}
              onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
            <span className="mt-1 block text-xs text-gray-400">{t("erp.users.reviewWork.createdAtHint")}</span>
          </label>

          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">{t("erp.users.reviewWork.content")}</span>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={t("erp.users.reviewWork.contentPlaceholder")}
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
            {saving
              ? t("erp.common.saving")
              : editingId
                ? t("erp.users.points.saveChanges")
                : t("erp.users.reviewWork.submitNew")}
          </button>
        </ErpFormActions>
      </form>

      <div>
        <p className="mb-3 text-xs text-gray-500">
          {tFmt("erp.users.reviewWork.summary", { total, pageSize: WORK_PAGE_SIZE })}
        </p>

        {pageReviews.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-gray-500">
            {t("erp.users.reviewWork.noReviews")}
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
                          {t("erp.users.reviewWork.adminBadge")}
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
                            {t("erp.common.edit")}
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === r.id}
                            onClick={() => removeReview(r.id)}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            {deletingId === r.id ? t("erp.common.deleting") : t("erp.common.delete")}
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
