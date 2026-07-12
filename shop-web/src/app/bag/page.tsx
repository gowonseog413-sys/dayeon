"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ErpPagination } from "@/components/erp/ErpPagination";
import { StockCheckoutModal } from "@/components/StockCheckoutModal";
import { useStockCheckoutGate } from "@/hooks/useStockCheckoutGate";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { getCart, removeFromCart } from "@/lib/cart-store";
import { formatIndonesiaDateTime } from "@/lib/format-indonesia-datetime";
import { calcCartShippingFee, formatOrderShippingLabel } from "@/lib/shipping-fee";
import type { CartItem, Product } from "@/lib/types";

const PAGE_SIZE = 10;

type BagLine = CartItem & { product: Product };

export default function BagPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [lines, setLines] = useState<BagLine[]>([]);
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const { gate, loading: stockLoading, closeGate, runStockGate, confirmAdjusted } =
    useStockCheckoutGate();

  const load = useCallback(async () => {
    const cart = getCart();
    if (!cart.length) {
      setLines([]);
      return;
    }
    try {
      const { products } = await api<{ products: Product[] }>("/api/products");
      setLines(
        cart
          .map((c) => {
            const product = products.find((p) => p.id === c.productId);
            return product ? { ...c, product } : null;
          })
          .filter(Boolean) as BagLine[],
      );
      setMsg("");
    } catch {
      setMsg("상품 정보를 불러오지 못했습니다. API 서버를 확인하세요.");
      setLines([]);
    }
  }, []);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/bag");
      return;
    }
    if (!user) return;
    load();
    const refresh = () => {
      load();
    };
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, [load, ready, user, router]);

  const total = lines.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageLines = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return lines.slice(start, start + PAGE_SIZE);
  }, [lines, safePage]);

  const pageTotal = pageLines.reduce((s, l) => s + l.product.priceSale * l.quantity, 0);
  const grandTotal = lines.reduce((s, l) => s + l.product.priceSale * l.quantity, 0);
  const shippingFee = calcCartShippingFee(lines);
  const orderTotal = grandTotal + shippingFee;

  function goCheckout() {
    const token = getToken();
    if (!token) {
      window.location.href = "/login?next=/checkout";
      return;
    }
    void runStockGate(() => {
      window.location.href = "/checkout";
    });
  }

  function handleRemove(entryId: string) {
    if (!confirm("장바구니에서 삭제할까요?")) return;
    removeFromCart(entryId);
    load();
  }

  if (!lines.length) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-xl font-medium">My Bag</h1>
        <p className="mt-4 text-gray-500">장바구니가 비어 있습니다.</p>
        <Link href="/" className="mt-6 inline-block text-[var(--pink-accent)]">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-xl font-medium">My Bag ({total})</h1>
      <p className="mb-6 text-xs text-gray-500">저장 시각은 인도네시아(WIB) 기준입니다.</p>

      <ul className="space-y-4">
        {pageLines.map((l, i) => {
          const no = total - ((safePage - 1) * PAGE_SIZE + i);
          return (
            <li
              key={l.id}
              className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0"
            >
              <div className="flex w-8 shrink-0 flex-col items-center pt-1 text-xs text-gray-400">
                <span>No.{no}</span>
              </div>
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-50">
                <Image src={l.product.image} alt={l.product.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">{formatIndonesiaDateTime(l.savedAt)}</p>
                <p className="text-xs text-gray-500">{l.product.brand}</p>
                <p className="font-medium">{l.product.name}</p>
                <p className="text-[var(--pink-accent)]">
                  {formatRp(l.product.priceSale)} × {l.quantity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(l.id)}
                className="shrink-0 self-start text-xs text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-right text-sm text-gray-500">
        이 페이지 합계 {formatRp(pageTotal)}
      </p>
      <p className="text-right text-sm text-gray-500">
        배송비 {formatOrderShippingLabel(shippingFee)}
      </p>
      <p className="text-right text-lg font-semibold">결제 예정 {formatRp(orderTotal)}</p>

      {msg && <p className="mt-2 text-center text-sm text-gray-600">{msg}</p>}

      <ErpPagination page={safePage} totalPages={totalPages} onChange={setPage} />

      <button
        type="button"
        onClick={goCheckout}
        disabled={stockLoading}
        className="mt-6 w-full rounded-full bg-[var(--pink-accent)] py-3 text-white disabled:opacity-60"
      >
        {stockLoading ? "재고 확인 중…" : "결제하기"}
      </button>

      <StockCheckoutModal
        open={gate.open}
        mode={gate.mode}
        result={gate.result}
        loading={stockLoading}
        onConfirm={confirmAdjusted}
        onClose={closeGate}
      />
    </div>
  );
}
