import { formatRp } from "@/lib/api";
import { getPublicSiteOrigin } from "@/lib/site-url";
import type { Product } from "@/lib/types";

export function buildWishlistShareText(
  items: { product: Product }[],
  siteOrigin = getPublicSiteOrigin(),
): string {
  const lines = ["🎁 dayeon 위시리스트 — 나중에 사고 싶은 렌즈"];
  items.forEach((item, i) => {
    const p = item.product;
    lines.push(
      `${i + 1}. ${p.brand} ${p.name} · ${formatRp(p.priceSale)}`,
      `   ${siteOrigin}/product/${p.id}`,
    );
  });
  lines.push("", "선물 힌트로도 공유해 보세요 💕");
  return lines.join("\n");
}

export function shareWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

export function buildFacebookShareUrl(
  items: { product: Product }[],
  siteOrigin = getPublicSiteOrigin(),
): string {
  const ids = items.map((item) => item.product.id).filter(Boolean);
  if (ids.length === 1) {
    return `${siteOrigin}/product/${ids[0]}`;
  }
  return `${siteOrigin}/share/wishlist?ids=${ids.join(",")}`;
}

export function shareFacebook(url: string) {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&display=popup`,
    "facebook-share",
    "width=640,height=680,noopener,noreferrer",
  );
}

export function shareLine(text: string) {
  window.open(
    `https://line.me/R/msg/text/?${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export function shareTelegram(url: string, text: string) {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function nativeShare(title: string, text: string, url: string) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}
