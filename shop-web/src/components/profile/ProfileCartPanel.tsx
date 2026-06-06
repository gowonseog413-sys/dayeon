"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NatePagination } from "@/components/NatePagination";
import { StockCheckoutModal } from "@/components/StockCheckoutModal";
import { useStockCheckoutGate } from "@/hooks/useStockCheckoutGate";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { getCart, removeFromCart } from "@/lib/cart-store";
import { formatIndonesiaDateTime } from "@/lib/format-indonesia-datetime";
import { productImageFallback } from "@/lib/product-image-fallback";
import { calcCartShippingFee, formatOrderShippingLabel } from "@/lib/shipping-fee";
import type { CartItem, Product } from "@/lib/types";

const PAGE_SIZE = 5;

type BagLine = CartItem & { product: Product };

type Props = {
  page: number;
  onPageChange: (page: number) => void;
};

export function ProfileCartPanel({ page, onPageChange }: Props) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const { gate, loading: stockLoading, closeGate, runStockGate, confirmAdjusted } =
    useStockCheckoutGate();

  const load = useCallback(async () => {
    setLoading(true);
    const cart = getCart();
    if (!cart.length) {
      setLines([]);
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, [load]);

  const total = lines.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageLines = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return lines.slice(start, start + PAGE_SIZE);
  }, [lines, safePage]);

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

  if (loading) {
    return <p className="text-sm text-gray-500">불러오는 중...</p>;
  }

  if (!lines.length) {
    return (
      <div className="rounded-2xl border-2 border-[var(--pink-border)] bg-white p-8 text-center shadow-[0_4px_18px_var(--pink-shadow)]">
        <p className="text-lg font-medium text-gray-700">장바구니가 비어 있습니다.</p>
        <p className="mt-2 text-sm text-gray-500">관심 상품을 담아 보세요.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border-2 border-[var(--pink-border)] px-6 py-2 text-sm hover:border-[var(--pink-accent)]"
        >
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">저장 시각은 인도네시아(WIB) 기준입니다.</p>
        <p className="text-xs font-medium text-[var(--pink-accent)]">담은 상품 {total}개</p>
      </div>

      <ul className="space-y-4">
        {pageLines.map((l, i) => {
          const no = total - ((safePage - 1) * PAGE_SIZE + i);
          const img = l.product.image || productImageFallback(l.product);
          return (
            <li
              key={l.id}
              className="flex gap-3 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-4 shadow-[0_4px_18px_var(--pink-shadow)] sm:gap-4"
            >
              <span className="mt-1 text-xs font-semibold text-gray-400">No.{no}</span>
              <Link
                href={`/product/${l.product.id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400">{formatIndonesiaDateTime(l.savedAt)}</p>
                <p className="text-xs text-gray-500">{l.product.brand}</p>
                <Link
                  href={`/product/${l.product.id}`}
                  className="font-semibold text-gray-900 hover:text-[var(--pink-accent)]"
                >
                  {l.product.name}
                </Link>
                <p className="mt-1 text-base font-semibold text-[var(--pink-accent)]">
                  {formatRp(l.product.priceSale)} × {l.quantity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(l.id)}
                className="shrink-0 self-start text-xs text-gray-400 hover:text-red-500"
              >
                삭제
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-2xl border-2 border-[var(--pink-border)] bg-[var(--pink-bg-soft)] p-4 text-sm">
        <p className="flex justify-between text-gray-600">
          <span>상품 합계</span>
          <span>{formatRp(grandTotal)}</span>
        </p>
        <p className="mt-1 flex justify-between text-gray-600">
          <span>배송비</span>
          <span>{formatOrderShippingLabel(shippingFee)}</span>
        </p>
        <p className="mt-2 flex justify-between border-t border-[var(--pink-border)] pt-2 text-base font-semibold text-[var(--pink-deep)]">
          <span>결제 예정</span>
          <span>{formatRp(orderTotal)}</span>
        </p>
      </div>

      {msg && <p className="mt-2 text-center text-sm text-gray-600">{msg}</p>}

      <NatePagination
        page={safePage}
        totalPages={totalPages}
        basePath="/profile/wishlist"
        query="tab=cart"
        onPageChange={onPageChange}
        className="mt-6"
      />

      <button
        type="button"
        onClick={goCheckout}
        disabled={stockLoading}
        className="mt-6 w-full rounded-full bg-[var(--pink-accent)] py-3 text-sm font-medium text-white disabled:opacity-60"
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
