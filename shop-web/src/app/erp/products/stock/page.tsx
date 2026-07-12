"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getErpToken } from "@/lib/auth-store";
import {
  filterProducts,
  formatProductDate,
  stockStatus,
  STOCK_PAGE_SIZE,
} from "@/lib/erp-products";
import type { Product } from "@/lib/types";

function stockStatusLabel(stock: number, t: (key: string) => string) {
  if (stock <= 0) return t("erp.products.stock.statusOut");
  if (stock < 10) return t("erp.products.stock.statusLow");
  return t("erp.products.stock.statusOk");
}

function ErpProductStockContent() {
  const { t, tFmt } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [stockSaving, setStockSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { showSaveSuccess } = useErpSaveSuccess();

  function load() {
    setLoading(true);
    api<{ products: Product[] }>("/api/admin/products", { token: getErpToken() })
      .then((d) => {
        setProducts(d.products);
        setStockDrafts(
          Object.fromEntries(d.products.map((p) => [p.id, String(p.stock ?? 0)])),
        );
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => filterProducts(products, filter), [products, filter]);
  const sorted = useMemo(() => [...filtered].reverse(), [filtered]);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / STOCK_PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);

  const pageItems = useMemo(
    () => sorted.slice((page - 1) * STOCK_PAGE_SIZE, page * STOCK_PAGE_SIZE),
    [sorted, page],
  );

  useEffect(() => {
    if (pageParam > totalPages && totalPages >= 1) {
      router.replace("/erp/products/stock");
    }
  }, [pageParam, totalPages, router]);

  const stockSummary = useMemo(() => {
    const totalStock = filtered.reduce((s, p) => s + (p.stock ?? 0), 0);
    const outOfStock = filtered.filter((p) => (p.stock ?? 0) <= 0).length;
    const lowStock = filtered.filter((p) => {
      const n = p.stock ?? 0;
      return n > 0 && n < 10;
    }).length;
    return { totalStock, outOfStock, lowStock };
  }, [filtered]);

  async function saveStock(id: string) {
    const raw = stockDrafts[id] ?? "0";
    const stock = Math.max(0, Math.floor(Number(raw) || 0));
    setStockSaving(id);
    setErrorMsg("");
    try {
      await api(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        token: getErpToken(),
        body: JSON.stringify({ stock }),
      });
      setStockDrafts((prev) => ({ ...prev, [id]: String(stock) }));
      load();
      showSaveSuccess({
        subMessage: tFmt("erp.products.stock.savedMsg", {
          stock: stock.toLocaleString("ko-KR"),
        }),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("erp.products.stock.saveFailed"));
    } finally {
      setStockSaving(null);
    }
  }

  return (
    <ErpPageShell
      titleKey="erp.nav.productsStock"
      descriptionKey="erp.products.stock.description"
    >
      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      <input
        placeholder={t("erp.products.stock.searchPlaceholder")}
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          if (page > 1) router.replace("/erp/products/stock");
        }}
        className="mb-3 w-full max-w-xs rounded border px-3 py-1.5 text-sm"
      />

      <p className="mb-2 text-xs text-gray-500">
        {tFmt("erp.products.stock.summary", { total, size: STOCK_PAGE_SIZE })}
      </p>

      <div className="mb-4 grid max-w-lg grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg border bg-white px-2 py-2">
          <p className="text-gray-500">{t("erp.products.stock.totalStock")}</p>
          <p className="text-base font-semibold text-gray-900">
            {stockSummary.totalStock.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50/60 px-2 py-2">
          <p className="text-red-600">{t("erp.products.stock.outOfStockCount")}</p>
          <p className="text-base font-semibold text-red-700">{stockSummary.outOfStock}</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-2 py-2">
          <p className="text-amber-700">{t("erp.products.stock.lowStockCount")}</p>
          <p className="text-base font-semibold text-amber-800">{stockSummary.lowStock}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">{t("erp.common.loading")}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-500">
                <tr>
                  <th className="w-12 px-2 py-1.5">{t("erp.products.col.no")}</th>
                  <th className="w-24 px-2 py-1.5 whitespace-nowrap">{t("erp.products.col.createdAt")}</th>
                  <th className="px-2 py-1.5">{t("erp.products.col.product")}</th>
                  <th className="w-24 px-2 py-1.5">{t("erp.products.col.stock")}</th>
                  <th className="w-20 px-2 py-1.5">{t("erp.common.status")}</th>
                  <th className="w-16 px-2 py-1.5" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p, i) => {
                  const no = total - ((page - 1) * STOCK_PAGE_SIZE + i);
                  const stock = p.stock ?? 0;
                  const status = stockStatus(stock);
                  return (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="px-2 py-1.5 font-medium text-gray-600">{no}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-600">
                        {formatProductDate(p.createdAt)}
                      </td>
                      <td className="px-2 py-1.5">
                        <p className="text-[10px] text-gray-500">{p.brand}</p>
                        <p className="font-medium leading-tight">{p.name}</p>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={stockDrafts[p.id] ?? String(stock)}
                          onChange={(e) =>
                            setStockDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          className="w-full rounded border px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${status.tone}`}
                        >
                          {stockStatusLabel(stock, t)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          disabled={stockSaving === p.id}
                          onClick={() => saveStock(p.id)}
                          className="text-xs text-[var(--pink-accent)] hover:underline disabled:opacity-50"
                        >
                          {stockSaving === p.id ? "…" : t("erp.common.save")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <NatePagination
            page={page}
            totalPages={totalPages}
            basePath="/erp/products/stock"
          />
        </>
      )}
    </ErpPageShell>
  );
}

function ProductsLoadingFallback() {
  const { t } = useI18n();
  return (
    <ErpPageShell titleKey="erp.nav.productsStock">
      <p className="text-sm text-gray-500">{t("erp.common.loading")}</p>
    </ErpPageShell>
  );
}

export default function ErpProductStockPage() {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ErpProductStockContent />
    </Suspense>
  );
}
