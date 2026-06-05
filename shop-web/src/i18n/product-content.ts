import type { Locale } from "./messages";

export const PRODUCT_COPY: Record<
  Locale,
  { description: string; additional: string; shipping: string }
> = {
  ko: {
    description: `직경 : 14.2mm
동공 직경 : 5.9mm
그래픽 직경 : 12.9mm
기저곡률 : 8.6mm
수분 함량 : 48%
수명 : 6개월
재료: 실리콘 하이드로겔 폴리헤마
사용 가능한 정상 눈, -0.50에서 -8.00까지`,
    additional: `케텐투안 가란시:
• 개봉 영상 없이는 보증/교환 처리가 어렵습니다.
• 개봉된 보틀·블리스터는 교환/환불이 불가합니다.
• 할인/플래시 세일 상품은 제조 결함 시에만 교환 가능합니다.

보증 신청 시 개봉 영상과 제품 사진이 필요합니다.`,
    shipping: `1. Sicepat
2. JNE
3. Anter Aja
4. JNT

일반 배송 2–5 영업일 (자카르타 권역 기준).`,
  },
  en: {
    description: `Diameter: 14.2mm
Pupil diameter: 5.9mm
Graphic diameter: 12.9mm
Base curve: 8.6mm
Water content: 48%
Lifespan: 6 months
Material: Silicone hydrogel polyHEMA
Available for normal eyes, -0.50 to -8.00`,
    additional: `Terms & warranty:
• Unboxing video is required for warranty claims.
• Opened bottles or blisters cannot be returned.
• Sale items can only be exchanged for manufacturing defects.

Please include unboxing video and product photos when filing a claim.`,
    shipping: `1. Sicepat
2. JNE
3. Anter Aja
4. JNT

Regular delivery 2–5 business days (Greater Jakarta area).`,
  },
  id: {
    description: `Diameter: 14,2mm
Diameter pupil: 5,9mm
Diameter grafis: 12,9mm
Base curve: 8,6mm
Kadar air: 48%
Masa pakai: 6 bulan
Bahan: Silicone hydrogel polyHEMA
Untuk mata normal, -0,50 hingga -8,00`,
    additional: `Ketentuan garansi:
• Video unboxing wajib untuk klaim garansi.
• Botol/blister yang sudah dibuka tidak dapat ditukar.
• Produk diskon hanya dapat ditukar jika ada cacat produksi.

Sertakan video unboxing dan foto produk saat klaim.`,
    shipping: `1. Sicepat
2. JNE
3. Anter Aja
4. JNT

Pengiriman reguler 2–5 hari kerja (area Jabodetabek).`,
  },
};

export const PRODUCT_COPY_GENERIC: Record<
  Locale,
  { description: string; additional: string; shipping: string }
> = {
  ko: {
    description: "제품 상세 정보는 패키지 라벨을 참고해 주세요.",
    additional: "개봉 후 교환/환불 규정은 이용 약관을 확인해 주세요.",
    shipping: "1. Sicepat\n2. JNE\n3. Anter Aja\n4. JNT",
  },
  en: {
    description: "See package label for full product details.",
    additional: "Return policy applies after opening — see Terms of Use.",
    shipping: "1. Sicepat\n2. JNE\n3. Anter Aja\n4. JNT",
  },
  id: {
    description: "Lihat label kemasan untuk detail produk.",
    additional: "Kebijakan retur berlaku setelah dibuka — lihat Syarat Penggunaan.",
    shipping: "1. Sicepat\n2. JNE\n3. Anter Aja\n4. JNT",
  },
};
