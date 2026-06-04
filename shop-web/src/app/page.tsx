import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductSection } from "@/components/ProductSection";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

async function loadProducts() {
  try {
    const data = await api<{ products: Product[] }>("/api/products", {
      cache: "no-store",
    });
    return data.products;
  } catch {
    return [] as Product[];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; section?: string }>;
}) {
  const params = await searchParams;
  let products = await loadProducts();

  if (params.q) {
    const term = params.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term),
    );
  }

  const bySection = (s: string) => products.filter((p) => p.section === s);

  if (params.section) {
    const section = params.section;
    const filtered =
      section === "contact-lenses"
        ? products.filter((p) => p.category === "contact-lenses")
        : section === "accessories"
          ? bySection("accessories")
          : bySection(section);
    const titles: Record<string, string> = {
      "contact-lenses": "콘택트렌즈",
      accessories: "부속품",
      "best-seller": "베스트 셀러",
      bundles: "번들 액세서리",
      bloominc: "블루밍크",
      solutions: "솔루션 및 드롭",
    };
    const tall = section === "best-seller" || section === "contact-lenses";
    return (
      <ProductSection
        title={titles[section] ?? section}
        products={filtered}
        variant={tall ? "tall" : "compact"}
        pinkBg={section === "best-seller"}
      />
    );
  }

  return (
    <>
      <HeroCarousel />
      {params.q && (
        <p className="py-4 text-center text-sm text-gray-600">
          &quot;{params.q}&quot; 검색 결과 {products.length}건
        </p>
      )}
      <ProductSection title="블루밍크" products={bySection("bloominc")} />
      <ProductSection
        title="베스트 셀러"
        products={bySection("best-seller")}
        variant="tall"
        pinkBg
      />
      <ProductSection title="솔루션 및 드롭" products={bySection("solutions")} />
      <ProductSection title="부속품" products={bySection("accessories")} />
      <ProductSection title="번들 액세서리" products={bySection("bundles")} />
    </>
  );
}
