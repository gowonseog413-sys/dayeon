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

export const FILTER_OPTION_FIELD_IDS = [
  "brand",
  "color",
  "diameter",
  "waterContent",
  "prescription",
  "baseCurve",
  "lifespan",
] as const;

export type FilterOptionFieldId = (typeof FILTER_OPTION_FIELD_IDS)[number];

export const FILTER_FIELDS_WITH_OPTIONS = new Set<string>(["category", ...FILTER_OPTION_FIELD_IDS]);

export const DEFAULT_FILTER_FIELD_OPTIONS: Record<FilterOptionFieldId, CatalogItem[]> = {
  brand: [
    { id: "Bio True", label: "Bio True", sortOrder: 1 },
    { id: "Bloominc", label: "Bloominc", sortOrder: 2 },
    { id: "Bundle Accessories", label: "Bundle Accessories", sortOrder: 3 },
    { id: "Clear Care", label: "Clear Care", sortOrder: 4 },
    { id: "Eyesm", label: "Eyesm", sortOrder: 5 },
    { id: "Lens Care", label: "Lens Care", sortOrder: 6 },
    { id: "Opti-Free", label: "Opti-Free", sortOrder: 7 },
    { id: "Renu", label: "Renu", sortOrder: 8 },
    { id: "Rohto", label: "Rohto", sortOrder: 9 },
    { id: "Soft Drops", label: "Soft Drops", sortOrder: 10 },
  ],
  color: [
    { id: "almond", label: "아몬드", sortOrder: 1 },
    { id: "black", label: "검정", sortOrder: 2 },
    { id: "brown", label: "브라운", sortOrder: 3 },
    { id: "choco", label: "초코", sortOrder: 4 },
    { id: "gray", label: "그레이", sortOrder: 5 },
    { id: "clear", label: "클리어", sortOrder: 6 },
  ],
  diameter: [
    { id: "14.0", label: "14.00 mm", sortOrder: 1 },
    { id: "14.2", label: "14.20 mm", sortOrder: 2 },
    { id: "14.5", label: "14.50 mm", sortOrder: 3 },
  ],
  waterContent: [
    { id: "48", label: "48%", sortOrder: 1 },
    { id: "55", label: "55%", sortOrder: 2 },
    { id: "58", label: "58%", sortOrder: 3 },
  ],
  prescription: [
    { id: "normal", label: "일반", sortOrder: 1 },
    { id: "myopia", label: "근시", sortOrder: 2 },
  ],
  baseCurve: [
    { id: "8.6", label: "8.60 mm", sortOrder: 1 },
    { id: "8.7", label: "8.70 mm", sortOrder: 2 },
    { id: "8.8", label: "8.80 mm", sortOrder: 3 },
  ],
  lifespan: [
    { id: "daily", label: "일일", sortOrder: 1 },
    { id: "1month", label: "1개월", sortOrder: 2 },
    { id: "3months", label: "3개월", sortOrder: 3 },
    { id: "6months", label: "6개월", sortOrder: 4 },
    { id: "1year", label: "1년", sortOrder: 5 },
  ],
};
