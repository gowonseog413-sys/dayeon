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

export const emptyProductForm = {
  brand: "Bloominc",
  name: "",
  category: "contact-lenses",
  categoryMid: "",
  categorySub: "",
  section: "bloominc",
  priceOriginal: 169000,
  priceSale: 169000,
  stock: 0,
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
  return {
    brand: p.brand,
    name: p.name,
    category: p.category,
    categoryMid: p.categoryMid || "",
    categorySub: p.categorySub || "",
    section: p.section,
    priceOriginal: p.priceSale,
    priceSale: p.priceSale,
    stock: p.stock ?? 0,
    badge: p.badge || "",
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
