import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { api, formatRp } from "@/lib/api";
import type { Product } from "@/lib/types";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: Product;
  try {
    const data = await api<{ product: Product }>(`/api/products/${id}`, {
      cache: "no-store",
    });
    product = data.product;
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
        <Image src={product.image} alt={product.name} fill className="object-cover" priority />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-[var(--pink-accent)] px-3 py-1 text-xs font-bold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500">{product.brand}</p>
        <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-gray-400 line-through">{formatRp(product.priceOriginal)}</span>
          <span className="text-2xl font-semibold text-[var(--pink-accent)]">
            {formatRp(product.priceSale)}
          </span>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-gray-600">
          {product.description ||
            "프리미엄 컬러 렌즈 · 14.2mm 직경 · 민감한 눈에도 편안한 착용감 (초안 설명)"}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span>컬러</span>
          <span
            className="h-6 w-6 rounded-full border border-gray-200"
            style={{ background: product.colorSwatch }}
          />
        </div>
        <div className="mt-8 flex gap-3">
          <AddToCartButton productId={product.id} className="flex-1" />
          <Link
            href="/bag"
            className="rounded-full border border-[var(--pink-accent)] px-6 py-3 text-sm text-[var(--pink-accent)]"
          >
            장바구니
          </Link>
        </div>
        <Link href="/" className="mt-8 inline-block text-sm text-gray-500 hover:text-[var(--pink-accent)]">
          ← 쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
