"use client";

import { ProductCarousel } from "@/components/ProductCarousel";
import { useLocalizedShopCatalog } from "@/lib/use-shop-catalog";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
};

const CAROUSEL_CONFIG: Record<
  string,
  { variant?: "tall"; pinkBg?: boolean; visibleCount: number }
> = {
  bloominc: { visibleCount: 4 },
  "best-seller": { variant: "tall", pinkBg: true, visibleCount: 4 },
  solutions: { visibleCount: 3 },
  accessories: { visibleCount: 3 },
  bundles: { visibleCount: 3 },
};

export function HomeSections({ products }: Props) {
  const { catalog } = useLocalizedShopCatalog();
  const bySection = (s: string) => products.filter((p) => p.section === s);

  const sections = [...catalog.sections].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  return (
    <>
      {sections.map((section) => {
        const cfg = CAROUSEL_CONFIG[section.id] ?? { visibleCount: 4 };
        return (
          <ProductCarousel
            key={section.id}
            title={section.label}
            products={bySection(section.id)}
            variant={cfg.variant}
            pinkBg={cfg.pinkBg}
            visibleCount={cfg.visibleCount}
          />
        );
      })}
    </>
  );
}
