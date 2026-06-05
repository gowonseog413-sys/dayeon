"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { findMainNode, findMidNode, useProductCatalog } from "@/lib/product-catalog-store";
import {
  emptyProductForm,
  PRODUCT_THUMB_COUNT,
  productToForm,
  type ProductFormState,
} from "@/lib/erp-products";
import type { Product, ProductImage } from "@/lib/types";

export default function ErpProductRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
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
    setMsg("");
    const token = getToken();
    const galleryImages: ProductImage[] = form.thumbImages
      .map((url, i) => (url.trim() ? { url: url.trim(), alt: `썸네일 ${i + 2}` } : null))
      .filter(Boolean) as ProductImage[];

    const { thumbImages: _t, ...rest } = form;
    const body = {
      ...rest,
      badge: form.badge || null,
      images: galleryImages,
      categoryMid: form.categoryMid || undefined,
      categorySub: form.categorySub || undefined,
      priceOriginal: form.priceSale,
      priceSale: form.priceSale,
    };

    try {
      if (editingId) {
        await api(`/api/admin/products/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(body),
        });
        setMsg("상품이 수정되었습니다.");
      } else {
        await api("/api/admin/products", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        });
        setMsg("상품이 등록되었습니다.");
      }
      setForm(emptyProductForm);
      setEditingId(null);
      router.replace("/erp/products");
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장 실패");
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
        {msg && <p className="mb-3 text-sm text-green-600">{msg}</p>}

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

          <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="브랜드*"
            required
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder="상품명*"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-gray-600">대 카테고리</span>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value, categoryMid: "", categorySub: "" })
              }
              className="w-full rounded border px-3 py-2"
            >
              {catalog.categoryTree.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          {midOptions.length > 0 && (
            <label className="block text-sm">
              <span className="mb-1 block text-gray-600">중 카테고리</span>
              <select
                value={form.categoryMid}
                onChange={(e) =>
                  setForm({ ...form, categoryMid: e.target.value, categorySub: "" })
                }
                className="w-full rounded border px-3 py-2"
              >
                <option value="">선택 안 함</option>
                {midOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">홈 섹션 (캐러셀 위치)</span>
            <select
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="w-full rounded border px-3 py-2"
            >
              {catalog.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">소 카테고리</span>
            <select
              value={form.categorySub}
              onChange={(e) => setForm({ ...form, categorySub: e.target.value })}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">선택 안 함</option>
              {subOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">판매금액</span>
            <input
              type="number"
              min={0}
              value={form.priceSale}
              onChange={(e) => setForm({ ...form, priceSale: Number(e.target.value) })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-gray-600">재고 수량 (고객 비공개)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <input
            placeholder="뱃지 (SALE, NEW, 25% … 비우면 없음)"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            색상 스와치
            <input
              type="color"
              value={form.colorSwatch}
              onChange={(e) => setForm({ ...form, colorSwatch: e.target.value })}
              className="h-9 w-14 cursor-pointer rounded border"
            />
          </label>
        </div>

        <textarea
          placeholder="상품 설명 (상세 아코디언)"
          rows={4}
          value={form.detailDescription}
          onChange={(e) => setForm({ ...form, detailDescription: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
          >
            {editingId ? "수정 저장" : "상품 등록"}
          </button>
          {editingId && (
            <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={cancelEdit}>
              취소
            </button>
          )}
        </div>
          </div>
        </div>
      </form>
    </ErpPageShell>
  );
}
