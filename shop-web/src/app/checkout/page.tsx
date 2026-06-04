"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { getCart, saveCart } from "@/lib/cart-store";
import type { CartItem, Order, Product } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [lines, setLines] = useState<(CartItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Jakarta",
    postalCode: "",
    paymentMethod: "bank_transfer",
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?next=/checkout");
      return;
    }
    const cart = getCart();
    if (!cart.length) {
      router.replace("/bag");
      return;
    }
    api<{ products: Product[] }>("/api/products")
      .then(({ products }) => {
        setLines(
          cart
            .map((c) => {
              const product = products.find((p) => p.id === c.productId);
              return product ? { ...c, product } : null;
            })
            .filter(Boolean) as (CartItem & { product: Product })[],
        );
      })
      .catch(() => router.replace("/bag"));
  }, [router]);

  const subtotal = lines.reduce((s, l) => s + l.product.priceSale * l.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 10000;
  const total = subtotal + shippingFee;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ order: Order }>("/api/orders", {
        method: "POST",
        token: getToken(),
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
          shipping: form,
          paymentMethod: form.paymentMethod,
        }),
      });
      saveCart([]);
      router.push(`/order/${data.order.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "주문 실패");
    } finally {
      setLoading(false);
    }
  }

  if (!lines.length) return <p className="py-20 text-center text-sm text-gray-500">불러오는 중...</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-medium">배송 정보</h2>
          {(["name", "phone", "address", "city", "postalCode"] as const).map((key) => (
            <label key={key} className="block text-sm">
              {key === "name"
                ? "수령인*"
                : key === "phone"
                  ? "연락처*"
                  : key === "address"
                    ? "주소*"
                    : key === "city"
                      ? "도시"
                      : "우편번호"}
              <input
                required={key === "name" || key === "phone" || key === "address"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
              />
            </label>
          ))}
          <h2 className="pt-4 font-medium">결제 방법</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={form.paymentMethod === "bank_transfer"}
              onChange={() => setForm({ ...form, paymentMethod: "bank_transfer" })}
            />
            무통장 입금 (입금 확인 후 발송)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={form.paymentMethod === "cod"}
              onChange={() => setForm({ ...form, paymentMethod: "cod" })}
            />
            착불 (COD)
          </label>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
          <h2 className="mb-4 font-medium">주문 요약</h2>
          <ul className="space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-white">
                  <Image src={l.product.image} alt="" fill className="object-cover" />
                </div>
                <div>
                  <p>{l.product.name}</p>
                  <p className="text-gray-500">
                    {formatRp(l.product.priceSale)} × {l.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-1 border-t pt-4 text-sm">
            <p className="flex justify-between">
              <span>소계</span>
              <span>{formatRp(subtotal)}</span>
            </p>
            <p className="flex justify-between text-gray-600">
              <span>배송비</span>
              <span>{shippingFee === 0 ? "무료" : formatRp(shippingFee)}</span>
            </p>
            <p className="flex justify-between text-lg font-semibold">
              <span>합계</span>
              <span className="text-[var(--pink-accent)]">{formatRp(total)}</span>
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[var(--pink-accent)] py-3 text-white"
          >
            {loading ? "주문 처리 중..." : "주문 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}
