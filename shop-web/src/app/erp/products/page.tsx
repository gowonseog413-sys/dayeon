"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpFormActions } from "@/components/erp/ErpFormActions";
import { ErpImageUpload } from "@/components/erp/ErpImageUpload";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { getErpToken } from "@/lib/auth-store";
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
  const { t, tFmt } = useI18n();
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
    api<{ products: Product[] }>("/api/admin/products", { token: getErpToken() })
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
    const token = getErpToken();
    const galleryImages: ProductImage[] = form.thumbImages
      .map((url, i) =>
        url.trim() ? { url: url.trim(), alt: tFmt("erp.products.register.thumbAlt", { n: i + 2 }) } : null,
      )
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
        showSaveSuccess({ subMessage: t("erp.products.register.updatedMsg") });
      } else {
        await api("/api/admin/products", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        });
        showSaveSuccess({
          message: t("erp.common.registeredTitle"),
          subMessage: t("erp.products.register.createdSubMsg"),
        });
      }
      setForm(emptyProductForm);
      setEditingId(null);
      router.replace("/erp/products");
      load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.common.saveFailed"));
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyProductForm);
    router.replace("/erp/products");
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.productsRegister"
      descriptionKey="erp.products.register.description"
    >
      <form onSubmit={save} className="mx-auto max-w-6xl rounded-xl border bg-white p-4">
        <p className="mb-3 text-sm font-medium text-[var(--pink-accent)]">
          {editingId ? t("erp.products.register.editHeading") : t("erp.products.register.newHeading")}
        </p>
        {errorMsg ? <p className="mb-3 text-sm text-red-600">{errorMsg}</p> : null}

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4 rounded-lg border border-pink-100 bg-pink-50/40 p-4 lg:sticky lg:top-4">
            <p className="text-sm font-semibold text-gray-800">{t("erp.products.register.imagesTitle")}</p>
            <ErpImageUpload
              variant="main"
              label={t("erp.products.register.mainImageLabel")}
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: PRODUCT_THUMB_COUNT }, (_, i) => (
                <ErpImageUpload
                  key={i}
                  variant="thumb"
                  label={tFmt("erp.products.register.thumbImageLabel", { n: i + 1 })}
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
                {t("erp.products.register.basicInfo")}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label={t("erp.products.register.brand")}>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className={productInputClass}
                    placeholder={t("erp.products.register.brandPlaceholder")}
                  />
                </ProductField>
                <ProductField label={t("erp.products.register.name")}>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={productInputClass}
                    placeholder={t("erp.products.register.namePlaceholder")}
                  />
                </ProductField>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t("erp.products.register.category")}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label={t("erp.products.register.categoryMain")} className="sm:col-span-2">
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
                  <ProductField label={t("erp.products.register.categoryMid")}>
                    <select
                      value={form.categoryMid}
                      onChange={(e) =>
                        setForm({ ...form, categoryMid: e.target.value, categorySub: "" })
                      }
                      className={productInputClass}
                    >
                      <option value="">{t("erp.products.register.noSelection")}</option>
                      {midOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </ProductField>
                ) : null}
                <ProductField
                  label={t("erp.products.register.homeSection")}
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
                <ProductField label={t("erp.products.register.categorySub")} className="sm:col-span-2">
                  <select
                    value={form.categorySub}
                    onChange={(e) => setForm({ ...form, categorySub: e.target.value })}
                    className={productInputClass}
                  >
                    <option value="">{t("erp.products.register.noSelection")}</option>
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
                {t("erp.products.register.priceShipping")}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label={t("erp.products.register.salePrice")} className="sm:col-span-2">
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
                <ProductField label={t("erp.products.register.shipping")}>
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
                      <span className="text-gray-700">{t("erp.products.register.shippingFee")}</span>
                      {!form.shippingFeeCharged ? (
                        <span className="text-xs text-green-600">{t("erp.products.register.freeShipping")}</span>
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
                        placeholder={t("erp.products.register.shippingFeePlaceholder")}
                      />
                    ) : null}
                  </div>
                </ProductField>
                <ProductField label={t("erp.products.register.discount")}>
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
                      {tFmt("erp.products.register.discountHint", {
                        original: formatRp(calcOriginalFromSale(form.priceSale, form.discountPercent)),
                        sale: formatRp(form.priceSale),
                      })}
                    </p>
                  ) : null}
                </ProductField>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t("erp.products.register.stockPoints")}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ProductField label={t("erp.products.register.stock")}>
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
                <ProductField label={t("erp.products.register.points")}>
                  <label className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.pointsEnabled}
                      onChange={(e) => setForm({ ...form, pointsEnabled: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-gray-700">
                      {t("erp.products.register.pointsEnabled")}
                      <span className="mt-0.5 block text-[10px] font-normal text-gray-500">
                        {t("erp.products.register.pointsHint")}
                      </span>
                    </span>
                  </label>
                </ProductField>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t("erp.products.register.displayOptions")}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {form.discountPercent > 0 ? (
                  <ProductField label={t("erp.products.register.badgeAuto")}>
                    <div className="flex min-h-[42px] items-center rounded-lg border border-pink-100 bg-pink-50/50 px-3 text-sm">
                      <span className="font-semibold text-[var(--pink-accent)]">
                        {saleBadgeFromDiscount(form.discountPercent)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {t("erp.products.register.badgeAutoHint")}
                      </span>
                    </div>
                  </ProductField>
                ) : (
                  <ProductField label={t("erp.products.register.badgeManual")}>
                    <input
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className={productInputClass}
                      placeholder={t("erp.products.register.badgePlaceholder")}
                    />
                  </ProductField>
                )}
                <ProductField label={t("erp.products.register.colorSwatch")}>
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

            <ProductField label={t("erp.products.register.detailDescription")}>
              <textarea
                rows={4}
                value={form.detailDescription}
                onChange={(e) => setForm({ ...form, detailDescription: e.target.value })}
                className={`${productInputClass} resize-y`}
                placeholder={t("erp.products.register.detailPlaceholder")}
              />
            </ProductField>

            <ErpFormActions className="border-t border-gray-100 pt-4">
              {editingId && (
                <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={cancelEdit}>
                  {t("erp.common.cancel")}
                </button>
              )}
              <button
                type="submit"
                className="rounded-full bg-[var(--pink-accent)] px-5 py-2 text-sm text-white"
              >
                {editingId ? t("erp.products.register.saveEdit") : t("erp.products.register.submit")}
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

function ProductsLoadingFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.productsRegister">
      <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
    </ErpPageShell>
  );
}

export default function ErpProductRegisterPage() {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ErpProductRegisterContent />
    </Suspense>
  );
}
