import Link from "next/link";
import { formatRp } from "@/lib/api";
import { loadProductsByIds, wishlistShareMetadata } from "@/lib/product-metadata";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ ids?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { ids: raw } = await searchParams;
  const ids = (raw || "").split(",").map((s) => s.trim()).filter(Boolean);
  const products = await loadProductsByIds(ids);
  return wishlistShareMetadata(products, ids);
}

export default async function ShareWishlistPage({ searchParams }: Props) {
  const { ids: raw } = await searchParams;
  const ids = (raw || "").split(",").map((s) => s.trim()).filter(Boolean);
  const products = await loadProductsByIds(ids);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-medium text-gray-800">공유된 위시리스트를 찾을 수 없습니다.</p>
        <Link href="/" className="mt-6 inline-block text-[var(--pink-accent)] underline">
          쇼핑몰 홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-center text-sm text-[var(--pink-accent)]">dayeon 위시리스트</p>
      <h1 className="mt-2 text-center text-2xl font-semibold text-[var(--pink-deep)]">
        {products.length === 1 ? "추천 렌즈" : `관심 상품 ${products.length}개`}
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        아래 상품을 확인하고 dayeon에서 만나보세요.
      </p>

      <ul className="mt-8 space-y-4">
        {products.map((product, index) => (
          <li
            key={product.id}
            className="flex gap-4 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-4 shadow-[0_4px_18px_var(--pink-shadow)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt=""
              className="h-24 w-24 shrink-0 rounded-xl border border-[var(--pink-border)] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">No.{index + 1}</p>
              <p className="font-semibold text-gray-900">
                {product.brand} {product.name}
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--pink-accent)]">
                {formatRp(product.priceSale)}
              </p>
              <Link
                href={`/product/${product.id}`}
                className="mt-2 inline-block text-sm text-[var(--pink-accent)] underline"
              >
                상품 보기 →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block rounded-full bg-[var(--pink-accent)] px-8 py-3 text-sm font-medium text-white"
        >
          dayeon 쇼핑몰 가기
        </Link>
      </div>
    </div>
  );
}
