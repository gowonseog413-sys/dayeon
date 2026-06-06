"use client";

import { useCallback, useEffect, useState } from "react";
import { api, getApiBase } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { DEFAULT_CATEGORY_TREE } from "@/lib/default-category-tree";
import {
  DEFAULT_FILTER_CATEGORIES,
  DEFAULT_FILTER_FIELD_OPTIONS,
  DEFAULT_FILTER_FIELDS,
  type FilterOptionFieldId,
} from "@/lib/default-filter-catalog";
import { PRODUCT_SECTIONS } from "@/lib/erp-catalog";

export type CategoryTreeNode = {
  id: string;
  label: string;
  sortOrder?: number;
  href?: string;
  swatch?: string;
  children?: CategoryTreeNode[];
};

export type CatalogItem = {
  id: string;
  label: string;
  sortOrder?: number;
};

export type FilterFieldOptionsMap = Record<FilterOptionFieldId, CatalogItem[]>;

export type ProductCatalogData = {
  categoryTree: CategoryTreeNode[];
  sections: CatalogItem[];
  filterCategories: CatalogItem[];
  filterFields: CatalogItem[];
  filterFieldOptions: FilterFieldOptionsMap;
};

export function getSectionLabel(
  sections: CatalogItem[] | undefined,
  id: string,
): string | undefined {
  return sections?.find((s) => s.id === id)?.label;
}

export const CATALOG_UPDATED_EVENT = "product-catalog-updated";

export const fallbackCatalog = (): ProductCatalogData => ({
  categoryTree: DEFAULT_CATEGORY_TREE,
  sections: PRODUCT_SECTIONS.map((s, i) => ({ ...s, sortOrder: i + 1 })),
  filterCategories: DEFAULT_FILTER_CATEGORIES,
  filterFields: DEFAULT_FILTER_FIELDS,
  filterFieldOptions: { ...DEFAULT_FILTER_FIELD_OPTIONS },
});

export function mergeFilterFieldOptions(
  incoming?: Partial<FilterFieldOptionsMap>,
): FilterFieldOptionsMap {
  const fb = DEFAULT_FILTER_FIELD_OPTIONS;
  return {
    brand: incoming?.brand?.length ? incoming.brand : fb.brand,
    color: incoming?.color?.length ? incoming.color : fb.color,
    diameter: incoming?.diameter?.length ? incoming.diameter : fb.diameter,
    waterContent: incoming?.waterContent?.length ? incoming.waterContent : fb.waterContent,
    prescription: incoming?.prescription?.length ? incoming.prescription : fb.prescription,
    baseCurve: incoming?.baseCurve?.length ? incoming.baseCurve : fb.baseCurve,
    lifespan: incoming?.lifespan?.length ? incoming.lifespan : fb.lifespan,
  };
}

export function getFilterFieldLabel(
  fields: CatalogItem[] | undefined,
  id: string,
): string | undefined {
  return fields?.find((f) => f.id === id)?.label;
}

export const CATALOG_STORAGE_KEY = "dayeon-catalog-version";

export function notifyCatalogUpdated() {
  if (typeof window !== "undefined") {
    localStorage.setItem(CATALOG_STORAGE_KEY, String(Date.now()));
    window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
  }
}

export async function fetchProductCatalog(): Promise<ProductCatalogData> {
  try {
    const data = await api<ProductCatalogData>("/api/admin/catalog", { token: getToken() });
    const fb = fallbackCatalog();
    return {
      categoryTree: data.categoryTree?.length ? data.categoryTree : fb.categoryTree,
      sections: data.sections?.length ? data.sections : fb.sections,
      filterCategories: data.filterCategories?.length ? data.filterCategories : fb.filterCategories,
      filterFields: data.filterFields?.length ? data.filterFields : fb.filterFields,
      filterFieldOptions: mergeFilterFieldOptions(data.filterFieldOptions),
    };
  } catch {
    return fallbackCatalog();
  }
}

export function useProductCatalog() {
  const [catalog, setCatalog] = useState<ProductCatalogData>(fallbackCatalog);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchProductCatalog();
    setCatalog(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener(CATALOG_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, onUpdate);
  }, [reload]);

  return { catalog, loading, reload };
}

export type CatalogUsageProduct = {
  id: string;
  brand: string;
  name: string;
};

export type InUseError = {
  error: "IN_USE";
  count: number;
  products: CatalogUsageProduct[];
  message: string;
};

type ApiErr = Error & {
  status?: number;
  data?: InUseError & { error?: string; message?: string };
};

export function isInUseError(err: unknown): err is ApiErr & { data: InUseError } {
  return err instanceof Error && (err as ApiErr).data?.error === "IN_USE";
}

export async function catalogApi<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const token = options.token ?? getToken();
  const { token: _t, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBase()}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || res.statusText) as ApiErr;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export function findMainNode(tree: CategoryTreeNode[], mainId: string) {
  return tree.find((m) => m.id === mainId) ?? null;
}

export function findMidNode(tree: CategoryTreeNode[], mainId: string, midId: string) {
  const main = findMainNode(tree, mainId);
  return main?.children?.find((m) => m.id === midId) ?? null;
}
