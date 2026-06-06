"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  CATALOG_STORAGE_KEY,
  CATALOG_UPDATED_EVENT,
  fallbackCatalog,
  mergeFilterFieldOptions,
  type CategoryTreeNode,
  type ProductCatalogData,
} from "@/lib/product-catalog-store";

const fallback = fallbackCatalog();

export function useShopCatalog() {
  const [catalog, setCatalog] = useState<ProductCatalogData>(fallback);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const data = await api<ProductCatalogData>("/api/catalog", { cache: "no-store" });
      setCatalog({
        categoryTree: data.categoryTree?.length ? data.categoryTree : fallback.categoryTree,
        sections: data.sections?.length ? data.sections : fallback.sections,
        filterCategories: data.filterCategories?.length ? data.filterCategories : fallback.filterCategories,
        filterFields: data.filterFields?.length ? data.filterFields : fallback.filterFields,
        filterFieldOptions: mergeFilterFieldOptions(data.filterFieldOptions),
      });
    } catch {
      setCatalog(fallbackCatalog());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener(CATALOG_UPDATED_EVENT, onUpdate);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CATALOG_STORAGE_KEY) reload();
    };
    window.addEventListener("storage", onStorage);
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(CATALOG_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [reload]);

  return { catalog, loading, reload };
}

export function treeMainToMegaItems(main: CategoryTreeNode) {
  return (main.children || []).map((mid) => ({
    id: mid.id,
    label: mid.label,
    href: mid.children?.length ? undefined : mid.href,
    children: mid.children?.map((sub) => ({
      label: sub.label,
      href: sub.href || "#",
      swatch: sub.swatch,
    })),
  }));
}

export function treeMainToSimpleItems(main: CategoryTreeNode) {
  return (main.children || []).map((mid) => ({
    id: mid.id,
    label: mid.label,
    href: mid.href || "#",
  }));
}

export function isMegaMenuMain(main: CategoryTreeNode) {
  return (main.children || []).some((c) => (c.children || []).length > 0);
}
