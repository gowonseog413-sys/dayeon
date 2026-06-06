import { v4 as uuid } from "uuid";

export const HERO_BANNER_MAX = 12;

export const DEFAULT_HERO_BANNERS = [
  {
    id: "hero-summer-sale",
    image: "/banners/banner-summer-sale.png",
    alt: "Summer Sale",
    linkType: "none",
    url: "",
    productId: "",
    openInNewTab: true,
  },
  {
    id: "hero-store-opening",
    image: "/banners/banner-store-opening.png",
    alt: "Store Opening Promo",
    linkType: "none",
    url: "",
    productId: "",
    openInNewTab: true,
  },
  {
    id: "hero-premium-lenses",
    image: "/banners/banner-premium-lenses.png",
    alt: "Premium Lenses",
    linkType: "none",
    url: "",
    productId: "",
    openInNewTab: true,
  },
  {
    id: "hero-bloominc",
    image: "/banners/banner-bloominc-collection.png",
    alt: "Bloominc Collection",
    linkType: "none",
    url: "",
    productId: "",
    openInNewTab: true,
  },
  {
    id: "hero-new-arrival",
    image: "/banners/banner-new-arrival.png",
    alt: "New Arrival",
    linkType: "none",
    url: "",
    productId: "",
    openInNewTab: true,
  },
];

function normalizeLinkType(raw) {
  const t = String(raw || "none").toLowerCase();
  if (t === "url" || t === "product") return t;
  return "none";
}

function normalizeSlide(raw, index) {
  const image = typeof raw?.image === "string" ? raw.image.trim() : "";
  if (!image) return null;
  const linkType = normalizeLinkType(raw?.linkType);
  const url = typeof raw?.url === "string" ? raw.url.trim() : "";
  const productId = typeof raw?.productId === "string" ? raw.productId.trim() : "";
  const id =
    typeof raw?.id === "string" && raw.id.trim()
      ? raw.id.trim()
      : `hero-${index}-${uuid().slice(0, 8)}`;
  return {
    id,
    image,
    alt: typeof raw?.alt === "string" && raw.alt.trim() ? raw.alt.trim().slice(0, 120) : "Banner",
    linkType: linkType === "url" && !url ? "none" : linkType === "product" && !productId ? "none" : linkType,
    url: linkType === "url" ? url : "",
    productId: linkType === "product" ? productId : "",
    openInNewTab: raw?.openInNewTab !== false,
  };
}

export function normalizeHeroBanners(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_HERO_BANNERS.map((s) => ({ ...s }));
  }
  return raw
    .map((item, i) => normalizeSlide(item, i))
    .filter(Boolean)
    .slice(0, HERO_BANNER_MAX);
}

export function getHeroBanners(db) {
  const stored = db.settings?.heroBanners;
  if (!Array.isArray(stored) || stored.length === 0) {
    return DEFAULT_HERO_BANNERS.map((s) => ({ ...s }));
  }
  return normalizeHeroBanners(stored);
}
