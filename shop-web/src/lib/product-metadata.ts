import { api, formatRp } from "@/lib/api";
import { absoluteAssetUrl, getSiteOrigin } from "@/lib/site-url";
import type { Metadata } from "next";
import type { Product } from "@/lib/types";

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const data = await api<{ product: Product }>(`/api/products/${id}`, { cache: "no-store" });
    return data.product;
  } catch {
    return null;
  }
}

export function productMetadata(product: Product, path: string): Metadata {
  const origin = getSiteOrigin();
  const title = `${product.brand} ${product.name}`;
  const description =
    product.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${formatRp(product.priceSale)} · dayeon 컬러렌즈`;
  const image = absoluteAssetUrl(product.image, origin);
  const url = `${origin}${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "dayeon",
      locale: "ko_KR",
      type: "website",
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export async function loadProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  const products: Product[] = [];
  for (const id of unique.slice(0, 10)) {
    const product = await fetchProduct(id);
    if (product) products.push(product);
  }
  return products;
}

export function wishlistShareMetadata(products: Product[], ids: string[]): Metadata {
  if (products.length === 0) {
    return { title: "dayeon 위시리스트" };
  }
  if (products.length === 1) {
    return productMetadata(products[0], `/share/wishlist?ids=${ids.join(",")}`);
  }

  const origin = getSiteOrigin();
  const first = products[0];
  const title = `dayeon 위시리스트 ${products.length}개`;
  const description = products
    .map((p) => `${p.brand} ${p.name} · ${formatRp(p.priceSale)}`)
    .join(" | ")
    .slice(0, 200);
  const image = absoluteAssetUrl(first.image, origin);
  const url = `${origin}/share/wishlist?ids=${ids.join(",")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "dayeon",
      locale: "ko_KR",
      type: "website",
      images: [{ url: image, width: 800, height: 800, alt: first.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
