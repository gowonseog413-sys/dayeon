/** 렌즈 상품 공통 상세·아코디언·도수 옵션 */

import { resolveProductImages } from "./product-images.js";
import { enrichCatalogMeta } from "./product-catalog-meta.js";

export function generatePowers() {
  const list = ["0.00"];
  for (let v = -0.5; v >= -8.001; v -= 0.25) {
    list.push(v.toFixed(2));
  }
  return list;
}

export const LENS_POWERS = generatePowers();

export const LENS_DESCRIPTION = `직경 : 14.2mm
동공 직경 : 5.9mm
그래픽 직경 : 12.9mm
기저곡률 : 8.6mm
수분 함량 : 48%
수명 : 6개월
재료: 실리콘 하이드로겔 폴리헤마
사용 가능한 정상 눈, -0.50에서 -8.00까지`;

export const LENS_ADDITIONAL_INFO = `케텐투안 가란시:
• Semua produk harus direkam saat unboxing. Tanpa video unboxing, klaim garansi tidak dapat diproses.
• Botol dan blister yang sudah dibuka tidak dapat ditukar atau dikembalikan.
• Produk diskon / flash sale tidak dapat dikembalikan kecuali ada cacat produksi.

Syarat garansi:
• Klaim wajib disertai bukti video unboxing dan foto produk.
• Garansi berlaku untuk kerusakan produksi, bukan kesalahan penggunaan.`;

export const LENS_SHIPPING_INFO = `1. Sicepat
2. JNE
3. Anter Aja
4. JNT

Pengiriman reguler 2–5 hari kerja (area Jabodetabek).`;

export function colorLabelFromName(name) {
  if (/gray|grey/i.test(name)) return "그레이";
  if (/choco|brown/i.test(name)) return "브라운";
  if (/clear/i.test(name)) return "클리어";
  if (/ash/i.test(name)) return "애쉬 브라운";
  return "기본";
}

export function enrichLensProduct(p) {
  const base = enrichCatalogMeta(p);
  if (base.category !== "contact-lenses") {
    return {
      ...base,
      images: resolveProductImages(base),
      colors: base.colors?.length
        ? base.colors
        : [{ id: "default", label: "기본", swatch: base.colorSwatch }],
      powers: base.powers || [],
      detailDescription: base.detailDescription || base.description || "",
      additionalInfo: base.additionalInfo || "",
      shippingInfo: base.shippingInfo || LENS_SHIPPING_INFO,
    };
  }
  const label = colorLabelFromName(base.name);
  return {
    ...base,
    images: resolveProductImages(base),
    colors: base.colors?.length
      ? base.colors
      : [{ id: "default", label, swatch: base.colorSwatch }],
    powers: base.powers?.length ? base.powers : LENS_POWERS,
    detailDescription: base.detailDescription || LENS_DESCRIPTION,
    additionalInfo: base.additionalInfo || LENS_ADDITIONAL_INFO,
    shippingInfo: base.shippingInfo || LENS_SHIPPING_INFO,
  };
}
