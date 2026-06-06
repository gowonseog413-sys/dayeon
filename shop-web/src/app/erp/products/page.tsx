"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { getToken } from "@/lib/auth-store";
import { findMainNode, findMidNode, useProductCatalog } from "@/lib/product-catalog-store";
import { api, formatRp } from "@/lib/api";
import {
  buildProductPricing,
  calcOriginalFromSale,
  emptyProductForm,
  PRODUCT_THUMB_COUNT,
  productToForm,
  saleBadgeFromDiscount,
  type ProductFormState,
} from "@/lib/erp-products";
import type { Product, ProductImage } from "@/lib/types";

function ErpProductRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();
  const { catalog } = useProductCatalog();

  function load() {
    api<{ products: Product[] }>("/api/admin/products", { token: getToken() })
      .then((d) => setProducts(d.products))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  const selectedMain = findMainNode(catalog.categoryTree, form.category);
  const midOptions = selectedMain?.children ?? [];
  const selectedMid = findMidNode(catalog.categoryTree, form.category, form.categoryMid);
  const subOptions = selectedMid?.children ?? [];

  useEffect(() => {
    const mainIds = catalog.categoryTree.map((c) => c.id);
    const secIds = catalog.sections.map((s) => s.id);
    setForm((f) => {
      const category = mainIds.includes(f.category) ? f.category : mainIds[0] || f.category;
      const main = findMainNode(catalog.categoryTree, category);
      const mids = main?.children?.map((m) => m.id) ?? [];
      const categoryMid = mids.includes(f.categoryMid) ? f.categoryMid : "";
      const mid = findMidNode(catalog.categoryTree, category, categoryMid);
      const subs = mid?.children?.map((s) => s.id) ?? [];
      const categorySub = subs.includes(f.categorySub) ? f.categorySub : "";
      return {
        ...f,
        category,
        categoryMid,
        categorySub,
        section: secIds.includes(f.section) ? f.section : secIds[0] || f.section,
      };
    });
  }, [catalog.categoryTree, catalog.sections]);

  useEffect(() => {
    if (!editParam || !products.length) return;
    const target = products.find((p) => p.id === editParam);
    if (!target) return;
    setEditingId(target.id);
    setForm(productToForm(target));
  }, [editParam, products]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const token = getToken();
    const galleryImages: ProductImage[] = form.thumbImages
      .map((url, i) => (url.trim() ? { url: url.trim(), alt: `썸네일 ${i + 2}` } : null))
      .filter(Boolean) as ProductImage[];

    const { thumbImages: _t, ...rest } = form;
    const pricing = buildProductPricing(form);
    const body = {
      ...rest,
      badge: pricing.badge,
      discountPercent: pricing.discountPercent,
      priceOriginal: pricing.priceOriginal,
      priceSale: pricing.priceSale,
      images: galleryImages,
      categoryMid: form.categoryMid || undefined,
      categorySub: form.categorySub || undefined,
    };

    try {
      if (editingId) {
        await api(`/api/admin/products/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(body),
        });
        showSaveSuccess({ subMessage: "상품이 수정되었습니다." });
      } else {
        await api("/api/admin/products", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        });
        showSaveSuccess({ message: "등록되었습니다", subMessage: "상품이 등록되었습니다." });
      }
      setForm(emptyProductForm);
      setEditingId(null);
      router.replace("/erp/products");
      load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "저장 실패");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyProductForm);
    router.replace("/erp/products");
  }

  return (
    <ErpPageShell
      title="상품 등록"
      description="왼쪽: ① 메인 이미지 → ② 작은 썸네일 6장(드래그·WebP) / 오른쪽: 상품 정보 입력"
    >
      <form onSubmit={save} className="mx-auto max-w-6xl rounded-xl border bg-white p-4">
        <p className="mb-3 text-sm font-medium text-[var(--pink-accent)]">
          {editingId ? "상품 수정" : "새 상품 등록"}
        </p>
        {errorMsg ? <p className="mb-3 text-sm text-red-600">{errorMsg}</p> : null}

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4 rounded-lg border border-pink-100 bg-pink-50/40 p-4 lg:sticky lg:top-4">
            <p className="text-sm font-semibold text-gray-800">이미지 (위에서부터 순서대로)</p>
            <ErpImageUpload
              variant="main"
              label="① 메인 이미지 — 쇼핑몰 카드·상세 큰 화면"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: PRODUCT_THUMB_COUNT }, (_, i) => (
                <ErpImageUpload
                  key={i}
                  variant="thumb"
                  label={`② 작은 이미지 ${i + 1}`}
                  value={form.thumbImages[i] ?? ""}
                  onChange={(url) => {
                    const next = [...form.thumbImages];
                    next[i] = url;
                    setForm({ ...form, thumbImages: next });
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                기본 정보
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label="브랜드*">
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className={productInputClass}
                    placeholder="예: Bloominc"
                  />
                </ProductField>
                <ProductField label="상품명*">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={productInputClass}
                    placeholder="상품명 입력"
                  />
                </ProductField>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                카테고리
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label="대 카테고리" className="sm:col-span-2">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value, categoryMid: "", categorySub: "" })
                    }
                    className={productInputClass}
                  >
                    {catalog.categoryTree.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </ProductField>
                {midOptions.length > 0 ? (
                  <ProductField label="중 카테고리">
                    <select
                      value={form.categoryMid}
                      onChange={(e) =>
                        setForm({ ...form, categoryMid: e.target.value, categorySub: "" })
                      }
                      className={productInputClass}
                    >
                      <option value="">선택 안 함</option>
                      {midOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </ProductField>
                ) : null}
                <ProductField
                  label="홈 섹션 (캐러셀 위치)"
                  className={midOptions.length > 0 ? undefined : "sm:col-span-2"}
                >
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className={productInputClass}
                  >
                    {catalog.sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </ProductField>
                <ProductField label="소 카테고리" className="sm:col-span-2">
                  <select
                    value={form.categorySub}
                    onChange={(e) => setForm({ ...form, categorySub: e.target.value })}
                    className={productInputClass}
                  >
                    <option value="">선택 안 함</option>
                    {subOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </ProductField>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                가격 · 배송
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label="판매금액 (청구서 · 실제 판매가)" className="sm:col-span-2">
                  <input
                    type="number"
                    min={0}
                    value={form.priceSale}
                    onChange={(e) =>
                      setForm({ ...form, priceSale: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className={productInputClass}
                  />
                </ProductField>
                <ProductField label="배송">
                  <div className="flex min-h-[42px] flex-col justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.shippingFeeCharged}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            shippingFeeCharged: e.target.checked,
                            shippingFeeAmount: e.target.checked
                              ? form.shippingFeeAmount || 10000
                              : 0,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-gray-700">배송비 부과</span>
                      {!form.shippingFeeCharged ? (
                        <span className="text-xs text-green-600">무료배송</span>
                      ) : null}
                    </label>
                    {form.shippingFeeCharged ? (
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={form.shippingFeeAmount}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            shippingFeeAmount: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className={productInputClass}
                        placeholder="배송비 금액 (Rp)"
                      />
                    ) : null}
                  </div>
                </ProductField>
                <ProductField label="할인혜택 (%)">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountPercent: Math.min(99, Math.max(0, Number(e.target.value) || 0)),
                      })
                    }
                    className={productInputClass}
                    placeholder="0"
                  />
                  {form.discountPercent > 0 ? (
                    <p className="mt-1 text-xs text-gray-500">
                      추천 {formatRp(calcOriginalFromSale(form.priceSale, form.discountPercent))}
                      {" → "}청구서 {formatRp(form.priceSale)}
                    </p>
                  ) : null}
                </ProductField>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                재고 · 적립
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label="재고 수량 (고객 비공개)">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className={productInputClass}
                  />
                </ProductField>
                <ProductField label="포인트 적립">
                  <label className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.pointsEnabled}
                      onChange={(e) => setForm({ ...form, pointsEnabled: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-gray-700">
                      포인트 적립 사용
                      <span className="mt-0.5 block text-[10px] font-normal text-gray-500">
                        체크 시 구매자 등급별 적립률 적용
                      </span>
                    </span>
                  </label>
                </ProductField>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                표시 옵션
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {form.discountPercent > 0 ? (
                  <ProductField label="뱃지 (자동)">
                    <div className="flex min-h-[42px] items-center rounded-lg border border-pink-100 bg-pink-50/50 px-3 text-sm">
                      <span className="font-semibold text-[var(--pink-accent)]">
                        {saleBadgeFromDiscount(form.discountPercent)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">할인 %에 따라 자동 표기</span>
                    </div>
                  </ProductField>
                ) : (
                  <ProductField label="뱃지 (NEW 등 · 비우면 없음)">
                    <input
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className={productInputClass}
                      placeholder="선택 입력"
                    />
                  </ProductField>
                )}
                <ProductField label="색상 스와치">
                  <div className="flex min-h-[42px] items-center gap-3 rounded-lg border border-gray-200 px-3">
                    <input
                      type="color"
                      value={form.colorSwatch}
                      onChange={(e) => setForm({ ...form, colorSwatch: e.target.value })}
                      className="h-9 w-14 cursor-pointer rounded border border-gray-200"
                    />
                    <span className="font-mono text-xs text-gray-500">{form.colorSwatch}</span>
                  </div>
                </ProductField>
              </div>
            </fieldset>

            <ProductField label="상품 설명 (상세 아코디언)">
              <textarea
                rows={4}
                value={form.detailDescription}
                onChange={(e) => setForm({ ...form, detailDescription: e.target.value })}
                className={`${productInputClass} resize-y`}
                placeholder="상세 페이지 아코디언에 표시될 설명"
              />
            </ProductField>

            <ErpFormActions className="border-t border-gray-100 pt-4">
          {editingId && (
            <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={cancelEdit}>
              취소
            </button>
          )}
          <button
            type="submit"
            className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
          >
            {editingId ? "수정 저장" : "상품 등록"}
          </button>
            </ErpFormActions>
          </div>
        </div>
      </form>
    </ErpPageShell>
  );
}

const productInputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--pink-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--pink-accent)]/30";

function ProductField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export default function ErpProductRegisterPage() {
  return (
    <Suspense fallback={<ErpPageShell title="상품 등록">불러오는 중…</ErpPageShell>}>
      <ErpProductRegisterContent />
    </Suspense>
  );
}
