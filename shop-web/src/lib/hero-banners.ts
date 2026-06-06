export const HERO_BANNER_MAX = 12;

export type HeroBannerLinkType = "none" | "url" | "product";

export type HeroBannerSlide = {
  id: string;
  image: string;
  alt: string;
  linkType: HeroBannerLinkType;
  url: string;
  productId: string;
  openInNewTab: boolean;
};

export const DEFAULT_HERO_BANNERS: HeroBannerSlide[] = [
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

function normalizeLinkType(raw: unknown): HeroBannerLinkType {
  const t = String(raw || "none").toLowerCase();
  if (t === "url" || t === "product") return t;
  return "none";
}

function normalizeSlide(raw: unknown, index: number): HeroBannerSlide | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<HeroBannerSlide>;
  const image = typeof o.image === "string" ? o.image.trim() : "";
  if (!image) return null;
  let linkType = normalizeLinkType(o.linkType);
  const url = typeof o.url === "string" ? o.url.trim() : "";
  const productId = typeof o.productId === "string" ? o.productId.trim() : "";
  if (linkType === "url" && !url) linkType = "none";
  if (linkType === "product" && !productId) linkType = "none";
  return {
    id: typeof o.id === "string" && o.id.trim() ? o.id.trim() : `hero-${index}`,
    image,
    alt: typeof o.alt === "string" && o.alt.trim() ? o.alt.trim().slice(0, 120) : "Banner",
    linkType,
    url: linkType === "url" ? url : "",
    productId: linkType === "product" ? productId : "",
    openInNewTab: o.openInNewTab !== false,
  };
}

export function normalizeHeroBanners(raw: unknown): HeroBannerSlide[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_HERO_BANNERS.map((s) => ({ ...s }));
  }
  const slides = raw
    .map((item, i) => normalizeSlide(item, i))
    .filter(Boolean) as HeroBannerSlide[];
  return slides.length > 0 ? slides.slice(0, HERO_BANNER_MAX) : DEFAULT_HERO_BANNERS.map((s) => ({ ...s }));
}

export function emptyHeroSlide(): HeroBannerSlide {
  return {
    id: `new-${Date.now()}`,
    image: "",
    alt: "",
    linkType: "none",
    url: "",
    productId: "",
    openInNewTab: true,
  };
}

export type HeroSlideTarget =
  | { kind: "url"; href: string; newTab: boolean }
  | { kind: "product"; href: string };

export function heroSlideTarget(slide: HeroBannerSlide): HeroSlideTarget | null {
  if (slide.linkType === "url" && slide.url.trim()) {
    const raw = slide.url.trim();
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return { kind: "url", href, newTab: slide.openInNewTab };
  }
  if (slide.linkType === "product" && slide.productId.trim()) {
    return { kind: "product", href: `/product/${slide.productId.trim()}` };
  }
  return null;
}
