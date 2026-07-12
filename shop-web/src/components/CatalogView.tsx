"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CatalogFilters } from "@/components/CatalogFilters";
import { ErpPagination } from "@/components/erp/ErpPagination";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/components/I18nProvider";
import { catalogTitleText } from "@/lib/catalog-title-key";
import { useLocalizedShopCatalog } from "@/lib/use-shop-catalog";
import {
  filterProducts,
  parseCatalogFilters,
} from "@/lib/catalog-filter";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 16;

type Props = {
  products: Product[];
};

export function CatalogView({ products }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, tFmt } = useI18n();
  const { catalog } = useLocalizedShopCatalog();
  const filters = parseCatalogFilters(searchParams);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const filtered = useMemo(
    () => filterProducts(products, filters),
    [products, searchParams.toString()],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) {
      const p = new URLSearchParams(searchParams.toString());
      p.delete("page");
      router.replace(`/catalog?${p.toString()}`);
    }
  }, [page, totalPages, searchParams, router]);

  function setPage(next: number) {
    const p = new URLSearchParams(searchParams.toString());
    if (next <= 1) p.delete("page");
    else p.set("page", String(next));
    router.push(`/catalog?${p.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const title = catalogTitleText(filters, t, catalog);
  const tall =
    filters.category === "contact-lenses" ||
    filters.section === "best-seller" ||
    Boolean(filters.look);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-10">
      <CatalogFilters products={products} filters={filters} className="order-2 lg:order-1" />
      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--pink-deep)]">
            <span className="text-[var(--pink-accent)]" aria-hidden>
              ✿
            </span>
            {title}
            <span className="text-[var(--pink-accent)]" aria-hidden>
              ✿
            </span>
          </h1>
          <select
            value={filters.sort ?? ""}
            onChange={(e) => {
              const p = new URLSearchParams(searchParams.toString());
              if (e.target.value) p.set("sort", e.target.value);
              else p.delete("sort");
              p.delete("page");
              router.push(`/catalog?${p.toString()}`);
            }}
            className="rounded-full border-2 border-[var(--pink-border)] bg-white px-3 py-1.5 text-sm"
          >
            <option value="">{t("catalog.sort")}</option>
            <option value="name">{t("catalog.sort.name")}</option>
            <option value="price-asc">{t("catalog.sort.priceAsc")}</option>
            <option value="price-desc">{t("catalog.sort.priceDesc")}</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-gray-500">{t("catalog.empty")}</p>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-500">
              {tFmt("catalog.pageInfo", { total: String(filtered.length), size: String(PAGE_SIZE) })}
            </p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} variant={tall ? "tall" : "compact"} />
              ))}
            </div>
            <ErpPagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
