"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import {
  type CatalogFilters as CatalogFiltersState,
  filtersToQuery,
} from "@/lib/catalog-filter";
import { getFilterFieldLabel } from "@/lib/product-catalog-store";
import { useShopCatalog } from "@/lib/use-shop-catalog";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  filters: CatalogFiltersState;
};

const FIELD_I18N: Record<string, string> = {
  category: "catalog.category",
  brand: "catalog.brand",
  color: "catalog.color",
  diameter: "catalog.diameter",
  waterContent: "catalog.waterContent",
  prescription: "catalog.prescription",
  baseCurve: "catalog.baseCurve",
  lifespan: "catalog.lifespan",
  price: "catalog.price",
  saleOnly: "catalog.saleOnly",
};

export function CatalogFilters({ products, filters }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const { catalog } = useShopCatalog();
  const [draft, setDraft] = useState<CatalogFiltersState>({ ...filters });

  const fieldLabel = (id: string) =>
    getFilterFieldLabel(catalog.filterFields, id) ?? t(FIELD_I18N[id] ?? id);

  const categoryOptions = useMemo(() => {
    const sorted = [...catalog.filterCategories].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    return [
      { value: "", label: t("catalog.select") },
      ...sorted.map((c) => ({ value: c.id, label: c.label })),
    ];
  }, [catalog.filterCategories, t]);

  const lifespanOpts = useMemo(
    () => [
      { value: "", label: t("catalog.selectLifespan") },
      { value: "daily", label: t("catalog.lifespan.daily") },
      { value: "1month", label: t("catalog.lifespan.1m") },
      { value: "3months", label: t("catalog.lifespan.3m") },
      { value: "6months", label: t("catalog.lifespan.6m") },
      { value: "1year", label: t("catalog.lifespan.1y") },
    ],
    [t],
  );

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))].sort(),
    [products],
  );

  function set(key: keyof CatalogFiltersState, value: string) {
    setDraft((d) => ({ ...d, [key]: value || undefined }));
  }

  function apply() {
    router.push(`/catalog${filtersToQuery(draft)}`);
  }

  function reset() {
    const base: CatalogFiltersState = {};
    if (filters.category) base.category = filters.category;
    if (filters.section) base.section = filters.section;
    setDraft(base);
    router.push(`/catalog${filtersToQuery(base)}`);
  }

  const isLens = filters.category === "contact-lenses" || !filters.category;

  return (
    <aside className="w-full shrink-0 rounded-2xl border-2 border-[var(--pink-border)] bg-white/90 p-4 shadow-sm lg:w-56">
      <p className="mb-4 text-sm font-semibold text-[var(--pink-deep)]">{t("catalog.filter")}</p>
      <div className="space-y-4 text-sm">
        <FilterSelect
          label={fieldLabel("category")}
          value={draft.category ?? ""}
          onChange={(v) => set("category", v)}
          options={categoryOptions}
        />
        <FilterSelect
          label={fieldLabel("brand")}
          value={draft.brand ?? ""}
          onChange={(v) => set("brand", v)}
          options={[
            { value: "", label: t("catalog.selectBrand") },
            ...brands.map((b) => ({ value: b, label: b })),
          ]}
        />
        {isLens && (
          <>
            <FilterSelect
              label={fieldLabel("color")}
              value={draft.color ?? ""}
              onChange={(v) => set("color", v)}
              options={[
                { value: "", label: t("catalog.selectColor") },
                { value: "almond", label: t("catalog.color.almond") },
                { value: "black", label: t("catalog.color.black") },
                { value: "brown", label: t("catalog.color.brown") },
                { value: "choco", label: t("catalog.color.choco") },
                { value: "gray", label: t("catalog.color.gray") },
                { value: "clear", label: t("catalog.color.clear") },
              ]}
            />
            <FilterSelect
              label={fieldLabel("diameter")}
              value={draft.diameter ?? ""}
              onChange={(v) => set("diameter", v)}
              options={[
                { value: "", label: t("catalog.selectDiameter") },
                { value: "14.0", label: "14.00 mm" },
                { value: "14.2", label: "14.20 mm" },
                { value: "14.5", label: "14.50 mm" },
              ]}
            />
            <FilterSelect
              label={fieldLabel("waterContent")}
              value={draft.waterContent ?? ""}
              onChange={(v) => set("waterContent", v)}
              options={[
                { value: "", label: t("catalog.selectWater") },
                { value: "48", label: "48%" },
                { value: "55", label: "55%" },
                { value: "58", label: "58%" },
              ]}
            />
            <FilterSelect
              label={fieldLabel("prescription")}
              value={draft.prescription ?? ""}
              onChange={(v) => set("prescription", v)}
              options={[
                { value: "", label: t("catalog.selectRx") },
                { value: "normal", label: t("catalog.rx.normal") },
                { value: "myopia", label: t("catalog.rx.myopia") },
              ]}
            />
            <FilterSelect
              label={fieldLabel("baseCurve")}
              value={draft.baseCurve ?? ""}
              onChange={(v) => set("baseCurve", v)}
              options={[
                { value: "", label: t("catalog.selectBc") },
                { value: "8.6", label: "8.60 mm" },
                { value: "8.7", label: "8.70 mm" },
                { value: "8.8", label: "8.80 mm" },
              ]}
            />
            <FilterSelect
              label={fieldLabel("lifespan")}
              value={draft.lifespan ?? ""}
              onChange={(v) => set("lifespan", v)}
              options={lifespanOpts}
            />
          </>
        )}

        <div>
          <p className="mb-1 font-medium">{fieldLabel("price")}</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={t("catalog.minPrice")}
              value={draft.minPrice ?? ""}
              onChange={(e) => set("minPrice", e.target.value)}
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs"
            />
            <input
              type="number"
              placeholder={t("catalog.maxPrice")}
              value={draft.maxPrice ?? ""}
              onChange={(e) => set("maxPrice", e.target.value)}
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.saleOnly === "1"}
            onChange={(e) => set("saleOnly", e.target.checked ? "1" : "")}
          />
          {fieldLabel("saleOnly")}
        </label>

        <button
          type="button"
          onClick={apply}
          className="w-full rounded-full bg-[var(--pink-accent)] py-2.5 text-sm font-medium text-white"
        >
          {t("catalog.apply")}
        </button>
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-full border border-gray-300 py-2 text-sm"
        >
          {t("catalog.reset")}
        </button>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-200 bg-white px-2 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value || "x"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
