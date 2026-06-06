import type { Product } from "./types";

export type CatalogFilters = {
  category?: string;
  section?: string;
  brand?: string;
  look?: string;
  color?: string;
  diameter?: string;
  waterContent?: string;
  prescription?: string;
  baseCurve?: string;
  lifespan?: string;
  sub?: string;
  minPrice?: string;
  maxPrice?: string;
  saleOnly?: string;
  q?: string;
  sort?: string;
};

export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const keys = [
    "category",
    "section",
    "brand",
    "look",
    "color",
    "diameter",
    "waterContent",
    "prescription",
    "baseCurve",
    "lifespan",
    "sub",
    "minPrice",
    "maxPrice",
    "saleOnly",
    "q",
    "sort",
  ] as const;
  const out: CatalogFilters = {};
  for (const k of keys) {
    const v = params.get(k);
    if (v) out[k] = v;
  }
  return out;
}

export function filtersToQuery(f: CatalogFilters): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function filterProducts(products: Product[], f: CatalogFilters): Product[] {
  let list = [...products];

  if (f.category === "bundles") {
    list = list.filter((p) => p.category === "bundles" || p.section === "bundles");
  } else if (f.category) {
    list = list.filter((p) => p.category === f.category);
  }
  if (f.section) list = list.filter((p) => p.section === f.section);
  if (f.brand) list = list.filter((p) => p.brand === f.brand);
  if (f.q) {
    const term = f.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term),
    );
  }

  const c = (p: Product) => p.catalog;
  if (f.look) list = list.filter((p) => c(p)?.look === f.look);
  if (f.color) list = list.filter((p) => c(p)?.colorFamily === f.color);
  if (f.diameter) list = list.filter((p) => c(p)?.diameter === f.diameter);
  if (f.waterContent) list = list.filter((p) => c(p)?.waterContent === f.waterContent);
  if (f.prescription) list = list.filter((p) => c(p)?.prescription === f.prescription);
  if (f.baseCurve) list = list.filter((p) => c(p)?.baseCurve === f.baseCurve);
  if (f.lifespan) list = list.filter((p) => c(p)?.lifespan === f.lifespan);
  if (f.sub) list = list.filter((p) => c(p)?.sub === f.sub);

  if (f.minPrice) {
    const min = Number(f.minPrice);
    if (Number.isFinite(min)) list = list.filter((p) => p.priceSale >= min);
  }
  if (f.maxPrice) {
    const max = Number(f.maxPrice);
    if (Number.isFinite(max)) list = list.filter((p) => p.priceSale <= max);
  }
  if (f.saleOnly === "1") list = list.filter((p) => Boolean(p.badge));

  if (f.sort === "price-asc") list.sort((a, b) => a.priceSale - b.priceSale);
  else if (f.sort === "price-desc") list.sort((a, b) => b.priceSale - a.priceSale);
  else if (f.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

export function catalogTitle(f: CatalogFilters): string {
  if (f.look === "big-eye") return "또렷한 눈매";
  if (f.look === "natural") return "자연스러운 눈빛";
  if (f.look === "wedding") return "웨딩·특별한 날";
  if (f.look) return "컬러렌즈";
  if (f.color) {
    const labels: Record<string, string> = {
      almond: "아몬드",
      black: "검정",
      brown: "브라운",
      choco: "초코",
      gray: "그레이",
      clear: "클리어",
    };
    return labels[f.color] ? `${labels[f.color]} 렌즈` : "컬러로 보기";
  }
  if (f.brand) return f.brand;
  if (f.category === "solutions") return "렌즈 케어";
  if (f.category === "accessories") return "렌즈 용품";
  if (f.category === "bundles") return "알뜰 세트";
  if (f.section === "best-seller") return "베스트 · 신상";
  if (f.section === "bloominc") return "다연 추천";
  if (f.category === "contact-lenses") return "컬러렌즈";
  return "상품 목록";
}
