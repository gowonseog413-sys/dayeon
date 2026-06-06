"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ErpPageShell } from "@/components/erp/ErpPageShell";
import { useErpSaveSuccess } from "@/components/erp/ErpSaveSuccessProvider";
import { NatePagination } from "@/components/NatePagination";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import {
  filterProducts,
  formatProductDate,
  stockStatus,
  STOCK_PAGE_SIZE,
} from "@/lib/erp-products";
import type { Product } from "@/lib/types";

function ErpProductStockContent() {
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
    api<{ products: Product[] }>("/api/admin/products", { token: getToken() })
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
        token: getToken(),
        body: JSON.stringify({ stock }),
      });
      setStockDrafts((prev) => ({ ...prev, [id]: String(stock) }));
      load();
      showSaveSuccess({ subMessage: `재고 ${stock.toLocaleString("ko-KR")}개로 반영되었습니다.` });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "재고 저장 실패");
    } finally {
      setStockSaving(null);
    }
  }

  return (
    <ErpPageShell
      title="상품재고"
      description="쇼핑몰 고객에게는 재고가 표시되지 않습니다. Jubelio 연동 전 ERP 내부 재고 관리용입니다."
    >
      {errorMsg ? <p className="mb-2 text-sm text-red-600">{errorMsg}</p> : null}

      <input
        placeholder="상품명·브랜드 검색"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          if (page > 1) router.replace("/erp/products/stock");
        }}
        className="mb-3 w-full max-w-xs rounded border px-3 py-1.5 text-sm"
      />

      <p className="mb-2 text-xs text-gray-500">
        총 {total}건 · {STOCK_PAGE_SIZE}개씩 · No. 역순 (최신이 큰 번호)
      </p>

      <div className="mb-4 grid max-w-lg grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg border bg-white px-2 py-2">
          <p className="text-gray-500">총 재고</p>
          <p className="text-base font-semibold text-gray-900">
            {stockSummary.totalStock.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50/60 px-2 py-2">
          <p className="text-red-600">품절</p>
          <p className="text-base font-semibold text-red-700">{stockSummary.outOfStock}</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-2 py-2">
          <p className="text-amber-700">부족(&lt;10)</p>
          <p className="text-base font-semibold text-amber-800">{stockSummary.lowStock}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-500">
                <tr>
                  <th className="w-12 px-2 py-1.5">No.</th>
                  <th className="w-24 px-2 py-1.5 whitespace-nowrap">등록날짜</th>
                  <th className="px-2 py-1.5">상품</th>
                  <th className="w-24 px-2 py-1.5">재고</th>
                  <th className="w-20 px-2 py-1.5">상태</th>
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
                          {status.label}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          disabled={stockSaving === p.id}
                          onClick={() => saveStock(p.id)}
                          className="text-xs text-[var(--pink-accent)] hover:underline disabled:opacity-50"
                        >
                          {stockSaving === p.id ? "…" : "저장"}
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

export default function ErpProductStockPage() {
  return (
    <Suspense fallback={<ErpPageShell title="상품재고">불러오는 중…</ErpPageShell>}>
      <ErpProductStockContent />
    </Suspense>
  );
}
