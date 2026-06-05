import { redirect } from "next/navigation";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeApiNotice } from "@/components/HomeApiNotice";
import { HomeSections } from "@/components/HomeSections";
import { api, getApiDisplayUrl } from "@/lib/api";
import type { Product } from "@/lib/types";

async function loadProducts(): Promise<{ products: Product[]; apiOk: boolean }> {
  try {
    const data = await api<{ products: Product[] }>("/api/products", {
      cache: "no-store",
    });
    return { products: data.products, apiOk: true };
  } catch {
    return { products: [], apiOk: false };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; section?: string }>;
}) {
  const params = await searchParams;
  const { products: loaded, apiOk } = await loadProducts();
  let products = loaded;

  if (params.q) {
    const term = params.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term),
    );
  }

  if (params.section) {
    const map: Record<string, string> = {
      "contact-lenses": "/catalog?category=contact-lenses",
      accessories: "/catalog?category=accessories",
      "best-seller": "/catalog?section=best-seller",
      bundles: "/catalog?category=bundles",
      bloominc: "/catalog?section=bloominc",
      solutions: "/catalog?category=solutions",
    };
    redirect(map[params.section] ?? `/catalog?section=${params.section}`);
  }

  const showSections = apiOk && products.length > 0;

  return (
    <>
      <HeroCarousel />
      {!apiOk && !params.section && <HomeApiNotice apiUrl={getApiDisplayUrl()} />}
      {params.q && (
        <p className="py-4 text-center text-sm text-gray-600">
          &quot;{params.q}&quot; 검색 결과 {products.length}건
        </p>
      )}
      {showSections && <HomeSections products={products} />}
    </>
  );
}
