import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { api } from "@/lib/api";
import { fetchProduct, productMetadata } from "@/lib/product-metadata";
import type { Metadata } from "next";
import type { Product, ReviewSummary } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: "상품" };
  return productMetadata(product, `/product/${id}`);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: Product;
  let reviewSummary: ReviewSummary = { average: 0, count: 0 };
  try {
    const data = await api<{
      product: Product;
      reviewSummary: ReviewSummary;
    }>(`/api/products/${id}`, { cache: "no-store" });
    product = data.product;
    reviewSummary = data.reviewSummary ?? { average: 0, count: 0 };
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} initialSummary={reviewSummary} />;
}
