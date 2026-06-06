import type { Product } from "@/lib/types";

export const PRODUCT_PAGE_SIZE = 10;
export const STOCK_PAGE_SIZE = 10;
export const PRODUCT_THUMB_COUNT = 6;

export function emptyThumbImages(): string[] {
  return Array(PRODUCT_THUMB_COUNT).fill("");
}

export function formatProductDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 할인 % 기준 역산: 판매가 = 원가 × (1 − 할인%) → 원가 = 판매가 ÷ (1 − 할인%) */
export function calcOriginalFromSale(salePrice: number, discountPercent: number) {
  const sale = Math.max(0, Math.floor(salePrice) || 0);
  const pct = Math.min(99, Math.max(0, Math.floor(discountPercent) || 0));
  if (pct <= 0) return sale;
  return Math.round(sale / (1 - pct / 100));
}

export function discountPercentFromPrices(original: number, sale: number) {
  const o = Math.max(0, Math.floor(original) || 0);
  const s = Math.max(0, Math.floor(sale) || 0);
  if (o <= 0 || s >= o) return 0;
  return Math.round((1 - s / o) * 100);
}

export function parseDiscountFromBadge(badge: string | null | undefined) {
  const m = badge?.trim().match(/^SALE\s+(\d+)\s*%?$/i);
  return m ? Number(m[1]) : null;
}

export function saleBadgeFromDiscount(discountPercent: number) {
  const pct = Math.min(99, Math.max(0, Math.floor(discountPercent) || 0));
  return pct > 0 ? `SALE ${pct}%` : "";
}

export function getProductDisplayBadge(p: {
  badge: string | null;
  priceOriginal: number;
  priceSale: number;
  discountPercent?: number;
}) {
  const pct =
    p.discountPercent ??
    parseDiscountFromBadge(p.badge) ??
    discountPercentFromPrices(p.priceOriginal, p.priceSale);
  const auto = saleBadgeFromDiscount(pct);
  if (auto) return auto;
  return p.badge;
}

export function buildProductPricing(form: {
  priceSale: number;
  discountPercent: number;
  badge: string;
}) {
  const priceSale = Math.max(0, Math.floor(form.priceSale) || 0);
  const discountPercent = Math.min(99, Math.max(0, Math.floor(form.discountPercent) || 0));
  const priceOriginal = calcOriginalFromSale(priceSale, discountPercent);
  const autoBadge = saleBadgeFromDiscount(discountPercent);
  const badge = autoBadge || form.badge.trim() || null;
  return { priceSale, priceOriginal, discountPercent, badge };
}

export const emptyProductForm = {
  brand: "Bloominc",
  name: "",
  category: "contact-lenses",
  categoryMid: "",
  categorySub: "",
  section: "bloominc",
  priceSale: 129000,
  discountPercent: 0,
  stock: 0,
  pointsEnabled: true,
  shippingFeeCharged: false,
  shippingFeeAmount: 10000,
  badge: "",
  image: "/placeholders/lens-gray.svg",
  thumbImages: emptyThumbImages(),
  colorSwatch: "#e91e8c",
  detailDescription: "",
  additionalInfo: "",
  shippingInfo: "",
};

export type ProductFormState = typeof emptyProductForm;

export function thumbsFromProduct(p: Product): string[] {
  const urls = (p.images || [])
    .map((i) => i.url)
    .filter((u) => u && u !== p.image);
  const slots = emptyThumbImages();
  for (let i = 0; i < Math.min(urls.length, PRODUCT_THUMB_COUNT); i++) {
    slots[i] = urls[i];
  }
  return slots;
}

export function productToForm(p: Product): ProductFormState {
  const discountPercent =
    p.discountPercent ??
    parseDiscountFromBadge(p.badge) ??
    discountPercentFromPrices(p.priceOriginal, p.priceSale);
  const hasAutoSale = discountPercent > 0;
  return {
    brand: p.brand,
    name: p.name,
    category: p.category,
    categoryMid: p.categoryMid || "",
    categorySub: p.categorySub || "",
    section: p.section,
    priceSale: p.priceSale,
    discountPercent,
    stock: p.stock ?? 0,
    pointsEnabled: p.pointsEnabled !== false,
    shippingFeeCharged: Boolean(p.shippingFeeCharged),
    shippingFeeAmount: p.shippingFeeCharged ? (p.shippingFeeAmount ?? 10000) : 0,
    badge: hasAutoSale ? "" : p.badge || "",
    image: p.image,
    thumbImages: thumbsFromProduct(p),
    colorSwatch: p.colorSwatch,
    detailDescription: p.detailDescription || "",
    additionalInfo: p.additionalInfo || "",
    shippingInfo: p.shippingInfo || "",
  };
}

export function stockStatus(stock: number) {
  if (stock <= 0) return { label: "품절", tone: "text-red-700 bg-red-50" };
  if (stock < 10) return { label: "부족", tone: "text-amber-800 bg-amber-50" };
  return { label: "정상", tone: "text-green-700 bg-green-50" };
}

export function filterProducts(products: Product[], filter: string) {
  if (!filter) return products;
  const term = filter.toLowerCase();
  return products.filter(
    (p) => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term),
  );
}
