"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import {
  type CatalogFilters as CatalogFiltersState,
  filtersToQuery,
} from "@/lib/catalog-filter";
import { getFilterFieldLabel, mergeFilterFieldOptions } from "@/lib/product-catalog-store";
import { useLocalizedShopCatalog } from "@/lib/use-shop-catalog";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  filters: CatalogFiltersState;
  className?: string;
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

export function CatalogFilters({ products, filters, className = "" }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const { catalog } = useLocalizedShopCatalog();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<CatalogFiltersState>({ ...filters });
  const filterFieldOptions = useMemo(
    () => mergeFilterFieldOptions(catalog.filterFieldOptions),
    [catalog.filterFieldOptions],
  );

  const fieldLabel = (id: string) => {
    const i18nKey = FIELD_I18N[id];
    if (i18nKey) return t(i18nKey);
    return getFilterFieldLabel(catalog.filterFields, id) ?? id;
  };

  const categoryOptions = useMemo(() => {
    const sorted = [...(catalog.filterCategories || [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    return [
      { value: "", label: t("catalog.select") },
      ...sorted.map((c) => ({ value: c.id, label: c.label })),
    ];
  }, [catalog.filterCategories, t]);

  const brandOptions = useFilterSelectOptions(filterFieldOptions.brand, t("catalog.selectBrand"));
  const colorOptions = useFilterSelectOptions(filterFieldOptions.color, t("catalog.selectColor"));
  const diameterOptions = useFilterSelectOptions(
    filterFieldOptions.diameter,
    t("catalog.selectDiameter"),
  );
  const waterOptions = useFilterSelectOptions(
    filterFieldOptions.waterContent,
    t("catalog.selectWater"),
  );
  const prescriptionOptions = useFilterSelectOptions(
    filterFieldOptions.prescription,
    t("catalog.selectRx"),
  );
  const baseCurveOptions = useFilterSelectOptions(
    filterFieldOptions.baseCurve,
    t("catalog.selectBc"),
  );
  const lifespanOptions = useFilterSelectOptions(
    filterFieldOptions.lifespan,
    t("catalog.selectLifespan"),
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

  const filterBody = (
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
          options={brandOptions}
        />
        {isLens && (
          <>
            <FilterSelect
              label={fieldLabel("color")}
              value={draft.color ?? ""}
              onChange={(v) => set("color", v)}
              options={colorOptions}
            />
            <FilterSelect
              label={fieldLabel("diameter")}
              value={draft.diameter ?? ""}
              onChange={(v) => set("diameter", v)}
              options={diameterOptions}
            />
            <FilterSelect
              label={fieldLabel("waterContent")}
              value={draft.waterContent ?? ""}
              onChange={(v) => set("waterContent", v)}
              options={waterOptions}
            />
            <FilterSelect
              label={fieldLabel("prescription")}
              value={draft.prescription ?? ""}
              onChange={(v) => set("prescription", v)}
              options={prescriptionOptions}
            />
            <FilterSelect
              label={fieldLabel("baseCurve")}
              value={draft.baseCurve ?? ""}
              onChange={(v) => set("baseCurve", v)}
              options={baseCurveOptions}
            />
            <FilterSelect
              label={fieldLabel("lifespan")}
              value={draft.lifespan ?? ""}
              onChange={(v) => set("lifespan", v)}
              options={lifespanOptions}
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
  );

  return (
    <aside className={`w-full shrink-0 lg:w-56 ${className}`.trim()}>
      <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white/90 shadow-sm lg:p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--pink-deep)] lg:hidden"
          aria-expanded={expanded}
        >
          {t("catalog.filter")}
          <span className="text-xs text-gray-400">
            {expanded ? t("catalog.filterCollapse") : t("catalog.filterExpand")}
          </span>
        </button>
        <p className="mb-4 hidden text-sm font-semibold text-[var(--pink-deep)] lg:block">
          {t("catalog.filter")}
        </p>
        <div className={`${expanded ? "block" : "hidden"} px-4 pb-4 lg:block lg:px-0 lg:pb-0`}>
          {filterBody}
        </div>
      </div>
    </aside>
  );
}

function useFilterSelectOptions(
  items: { id: string; label: string; sortOrder?: number }[] | undefined,
  placeholder: string,
) {
  return useMemo(() => {
    const sorted = [...(items || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return [
      { value: "", label: placeholder },
      ...sorted.map((o) => ({ value: o.id, label: o.label })),
    ];
  }, [items, placeholder]);
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
