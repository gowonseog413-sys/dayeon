import type { Locale } from "@/i18n/messages";

/** 시드 리뷰 본문 — 한국어 원문 → en/id */
const SEED_REVIEW_BODIES: Record<string, { en: string; id: string }> = {
  "색감이 자연스럽고 데일리로 쓰기 좋아요.": {
    en: "Natural color — great for daily wear.",
    id: "Warna natural — cocok untuk pemakaian harian.",
  },
  "착용감이 편해요. 하루 종일 촉촉합니다.": {
    en: "Comfortable fit — stays moist all day.",
    id: "Nyaman dipakai — tetap lembap seharian.",
  },
  "배송은 빨랐는데 도수 선택을 다시 확인할게요.": {
    en: "Fast delivery — I'll double-check my prescription next time.",
    id: "Pengiriman cepat — akan cek lagi pilihan daya lensa.",
  },
  "눈이 시원해지는 느낌이에요. 재구매 예정!": {
    en: "Refreshing feel — will buy again!",
    id: "Mata terasa segar — akan beli lagi!",
  },
  "용량 대비 가성비 좋습니다.": {
    en: "Good value for the size.",
    id: "Nilai bagus untuk ukurannya.",
  },
  "포장 상태 좋았어요. 사용법 안내도 도움됐습니다.": {
    en: "Well packed — usage guide was helpful.",
    id: "Kemasan rapi — panduan pemakaian membantu.",
  },
  "디자인이 귀엽고 실용적이에요.": {
    en: "Cute design and practical.",
    id: "Desain lucu dan praktis.",
  },
  "여행용으로 딱 좋아요. 튼튼합니다.": {
    en: "Perfect for travel — sturdy too.",
    id: "Pas untuk perjalanan — juga kokoh.",
  },
  "가격 대비 만족해요. 선물용으로도 괜찮아요.": {
    en: "Happy with the price — nice as a gift too.",
    id: "Puas dengan harganya — cocok juga untuk hadiah.",
  },
  "번들 구성이 알차서 한 번에 샀어요.": {
    en: "Great bundle — bought everything at once.",
    id: "Paket lengkap — beli sekaligus.",
  },
  "개별 구매보다 저렴해서 추천합니다.": {
    en: "Cheaper than buying separately — recommended.",
    id: "Lebih murah dari beli terpisah — direkomendasikan.",
  },
  "구성품 설명이 더 있었으면 좋겠어요.": {
    en: "Wish there were more details about what's included.",
    id: "Semoga ada penjelasan isi paket yang lebih lengkap.",
  },
};

export function localizeReviewContent(content: string, locale: Locale): string {
  if (locale === "ko") return content;

  const colon = content.indexOf(": ");
  const body = colon >= 0 ? content.slice(colon + 2) : content;
  const translated = SEED_REVIEW_BODIES[body]?.[locale];
  if (!translated) return content;
  return colon >= 0 ? `${content.slice(0, colon + 2)}${translated}` : translated;
}
