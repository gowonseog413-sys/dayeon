import { Suspense } from "react";
import { CatalogView } from "@/components/CatalogView";
import { HomeApiNotice } from "@/components/HomeApiNotice";
import { api, getApiDisplayUrl } from "@/lib/api";
import type { Product } from "@/lib/types";

async function loadProducts() {
  try {
    const data = await api<{ products: Product[] }>("/api/products", {
      cache: "no-store",
    });
    return { products: data.products, apiOk: true };
  } catch {
    return { products: [] as Product[], apiOk: false };
  }
}

export default async function CatalogPage() {
  const { products, apiOk } = await loadProducts();

  if (!apiOk) {
    return <HomeApiNotice apiUrl={getApiDisplayUrl()} />;
  }

  return (
    <Suspense fallback={<p className="py-20 text-center text-sm">로딩...</p>}>
      <CatalogView products={products} />
    </Suspense>
  );
}
