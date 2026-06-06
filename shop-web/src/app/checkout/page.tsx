"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatRp } from "@/lib/api";
import { getToken } from "@/lib/auth-store";
import { getCart, saveCart } from "@/lib/cart-store";
import {
  profileSummary,
  type PaymentChannel,
  type PaymentProfile,
} from "@/lib/payment-methods";
import { hasSavedShipping, shippingFromUser } from "@/lib/shipping-address";
import { calcCartShippingFee, formatOrderShippingLabel } from "@/lib/shipping-fee";
import type { CartItem, Order, Product, User } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [lines, setLines] = useState<(CartItem & { product: Product })[]>([]);
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [profiles, setProfiles] = useState<PaymentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Jakarta",
    postalCode: "",
    paymentMethod: "credit_card",
    paymentProfileId: "",
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
    Promise.all([
      api<{ products: Product[] }>("/api/products"),
      api<{ channels: PaymentChannel[] }>("/api/payment-methods"),
      api<{ profiles: PaymentProfile[] }>("/api/payment-profiles", { token }),
      api<{ user: User }>("/api/auth/me", { token }),
    ])
      .then(([productsRes, channelsRes, profilesRes, userRes]) => {
        setLines(
          cart
            .map((c) => {
              const product = productsRes.products.find((p) => p.id === c.productId);
              return product ? { ...c, product } : null;
            })
            .filter(Boolean) as (CartItem & { product: Product })[],
        );
        setChannels(channelsRes.channels);
        setProfiles(profilesRes.profiles);
        const defaultProfile = profilesRes.profiles.find((p) => p.isDefault);
        const firstChannel = channelsRes.channels[0]?.type || "credit_card";
        const ship = shippingFromUser(userRes.user);
        const hasShip = hasSavedShipping(userRes.user);
        setForm((f) => ({
          ...f,
          name: ship.name,
          phone: ship.phone,
          address: ship.address,
          city: ship.city,
          postalCode: ship.postalCode,
          paymentMethod: defaultProfile?.channelType || firstChannel,
          paymentProfileId: defaultProfile?.id || "",
        }));
        setPrefilled(hasShip);
      })
      .catch(() => router.replace("/bag"));
  }, [router]);

  const subtotal = lines.reduce((s, l) => s + l.product.priceSale * l.quantity, 0);
  const shippingFee = calcCartShippingFee(lines);
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
          paymentProfileId: form.paymentProfileId || undefined,
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
          {prefilled && (
            <p className="rounded-lg border border-[var(--pink-border)] bg-[var(--pink-bg-soft)] px-3 py-2 text-xs text-[var(--pink-deep)]">
              저장된 배송 정보가 적용되었습니다. 필요하면 수정할 수 있습니다.
            </p>
          )}
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
          <h2 className="pt-4 font-medium">결제 방법 (Jubelio 연동)</h2>
          <div className="space-y-2">
            {channels.map((ch) => (
              <label
                key={ch.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <input
                  type="radio"
                  className="mt-1"
                  checked={form.paymentMethod === ch.type}
                  onChange={() =>
                    setForm({
                      ...form,
                      paymentMethod: ch.type,
                      paymentProfileId:
                        profiles.find((p) => p.channelType === ch.type && p.isDefault)?.id ||
                        profiles.find((p) => p.channelType === ch.type)?.id ||
                        "",
                    })
                  }
                />
                <span>
                  <span className="font-medium">{ch.nameKo}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{ch.descriptionKo}</span>
                </span>
              </label>
            ))}
          </div>
          {profiles.length > 0 && (
            <label className="mt-3 block text-sm">
              저장된 결제수단
              <select
                value={form.paymentProfileId}
                onChange={(e) => {
                  const p = profiles.find((x) => x.id === e.target.value);
                  setForm({
                    ...form,
                    paymentProfileId: e.target.value,
                    paymentMethod: p?.channelType || form.paymentMethod,
                  });
                }}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2"
              >
                <option value="">직접 선택 (저장 수단 없음)</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — {profileSummary(p)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <p className="text-xs text-gray-400">
            <Link href="/profile?tab=payment" className="text-[var(--pink-accent)] hover:underline">
              결제수단관리
            </Link>
            에서 카드·GoPay·가상계좌를 미리 등록할 수 있습니다.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
          <h2 className="mb-4 font-medium">주문 요약</h2>
          <ul className="space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-3">
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
              <span>{formatOrderShippingLabel(shippingFee)}</span>
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
