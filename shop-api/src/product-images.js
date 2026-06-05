import { getProductGallery } from "./product-galleries.js";

const THUMB_LABELS = ["메인", "썸네일 2", "썸네일 3", "썸네일 4", "썸네일 5", "썸네일 6", "썸네일 7"];

function normalizeEntry(img, i) {
  if (typeof img === "string") {
    return { url: img, alt: THUMB_LABELS[i] || `뷰 ${i + 1}` };
  }
  if (img?.url) {
    return { url: img.url, alt: img.alt || THUMB_LABELS[i] || `뷰 ${i + 1}` };
  }
  return null;
}

/** ERP: image=메인, images=작은 썸네일(최대 3). 상세·카드는 image, 갤러리는 메인+썸네일 */
export function resolveProductImages(product) {
  const main = product.image || "/placeholders/lens-gray.svg";
  const stored = (product.images || [])
    .map((img, i) => normalizeEntry(img, i + 1))
    .filter(Boolean);

  if (stored.length) {
    const gallery = [{ url: main, alt: THUMB_LABELS[0] }, ...stored].slice(0, 7);
    const seen = new Set();
    return gallery.filter((g) => {
      if (seen.has(g.url)) return false;
      seen.add(g.url);
      return true;
    });
  }

  return getProductGallery(product);
}
