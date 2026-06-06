export const PARTNER_BANNER_MAX = 3;

export type PartnerBannerSlot = {
  image: string;
  url: string;
};

export type PartnerBanners = {
  left: PartnerBannerSlot[];
  right: PartnerBannerSlot[];
};

export const DEFAULT_PARTNER_BANNERS: PartnerBanners = {
  left: [],
  right: [],
};

export const EMPTY_PARTNER_SLOT: PartnerBannerSlot = { image: "", url: "" };

function normalizeSlot(raw: unknown): PartnerBannerSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const image = typeof (raw as PartnerBannerSlot).image === "string"
    ? (raw as PartnerBannerSlot).image.trim()
    : "";
  const url = typeof (raw as PartnerBannerSlot).url === "string"
    ? (raw as PartnerBannerSlot).url.trim()
    : "";
  if (!image) return null;
  return { image, url };
}

function normalizeSide(raw: unknown): PartnerBannerSlot[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSlot).filter(Boolean).slice(0, PARTNER_BANNER_MAX) as PartnerBannerSlot[];
}

export function normalizePartnerBanners(raw: unknown): PartnerBanners {
  const obj = raw && typeof raw === "object" ? (raw as Partial<PartnerBanners>) : {};
  return {
    left: normalizeSide(obj.left),
    right: normalizeSide(obj.right),
  };
}

export function activePartnerBanners(banners: PartnerBanners): PartnerBanners {
  return normalizePartnerBanners(banners);
}

export function hasPartnerBanners(banners: PartnerBanners) {
  const n = normalizePartnerBanners(banners);
  return n.left.length > 0 || n.right.length > 0;
}
