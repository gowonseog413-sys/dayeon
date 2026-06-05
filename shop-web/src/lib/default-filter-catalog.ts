import type { CatalogItem } from "@/lib/product-catalog-store";
import { PRODUCT_CATEGORIES } from "@/lib/erp-catalog";

export const DEFAULT_FILTER_CATEGORIES: CatalogItem[] = PRODUCT_CATEGORIES.map((c, i) => ({
  ...c,
  sortOrder: i + 1,
}));

export const DEFAULT_FILTER_FIELDS: CatalogItem[] = [
  { id: "category", label: "카테고리", sortOrder: 1 },
  { id: "brand", label: "브랜드", sortOrder: 2 },
  { id: "color", label: "색상", sortOrder: 3 },
  { id: "diameter", label: "직경", sortOrder: 4 },
  { id: "waterContent", label: "수분 함량", sortOrder: 5 },
  { id: "prescription", label: "처방", sortOrder: 6 },
  { id: "baseCurve", label: "베이스 곡선", sortOrder: 7 },
  { id: "lifespan", label: "수명", sortOrder: 8 },
  { id: "price", label: "가격", sortOrder: 9 },
  { id: "saleOnly", label: "매각 (SALE)", sortOrder: 10 },
];
