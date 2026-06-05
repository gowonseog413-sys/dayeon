import type { Locale } from "./messages";

type ArticleCopy = { title: string; excerpt: string };

export const ARTICLE_COPY: Record<string, Record<Locale, ArticleCopy>> = {
  "first-date-dos-and-donts": {
    ko: {
      title: "첫 데이트 할 것과 하지 말아야 할 것: 작은 노력으로 큰 인상을 남기는 방법!",
      excerpt: "첫 만남에서 자연스럽게 매력을 보여주는 방법을 정리했습니다. 렌즈 선택부터 대화 매너까지.",
    },
    en: {
      title: "First date dos and don'ts: Make a big impression with small efforts!",
      excerpt: "Tips for a natural, charming first meeting — from lens choice to conversation manners.",
    },
    id: {
      title: "Tips kencan pertama: Kesan besar dengan usaha kecil!",
      excerpt: "Cara tampil natural saat pertama ketemu — dari pilihan lensa sampai etika ngobrol.",
    },
  },
  "eyemin-favorite-picks": {
    ko: {
      title: "아이민의 리뷰: '우리의 최애 추천'",
      excerpt: "dayeon 팀이 직접 착용해 본 블루밍크·Eyesm 렌즈 베스트 픽을 소개합니다.",
    },
    en: {
      title: "Eyemin's review: Our favorite picks",
      excerpt: "Best Bloominc & Eyesm lenses tested by the dayeon team.",
    },
    id: {
      title: "Review Eyemin: Rekomendasi favorit kami",
      excerpt: "Pilihan lensa Bloominc & Eyesm yang sudah dicoba tim dayeon.",
    },
  },
  "lens-care-tips-summer": {
    ko: {
      title: "여름철 렌즈 관리 팁: 촉촉함을 오래 유지하는 방법",
      excerpt: "더운 날씨에도 편안한 착용감을 위한 솔루션·드롭 사용 가이드.",
    },
    en: {
      title: "Summer lens care: Keep your eyes comfortable",
      excerpt: "Solution and drop guide for hot weather wear.",
    },
    id: {
      title: "Tips perawatan lensa musim panas",
      excerpt: "Panduan larutan & tetes untuk cuaca panas.",
    },
  },
  "community-welcome": {
    ko: {
      title: "dayeon 커뮤니티에 오신 것을 환영합니다",
      excerpt: "렌즈 후기와 뷰티 팁을 나누는 커뮤니티 공간을 소개합니다.",
    },
    en: {
      title: "Welcome to the dayeon community",
      excerpt: "A space to share lens reviews and beauty tips.",
    },
    id: {
      title: "Selamat datang di komunitas dayeon",
      excerpt: "Ruang berbagi review lensa dan tips kecantikan.",
    },
  },
  "bloominc-daily-lens-guide": {
    ko: {
      title: "블루밍크 데일리 렌즈: 처음 착용하는 분을 위한 가이드",
      excerpt: "그레이·브라운 데일리 렌즈 선택부터 착용 시간까지 초보자용 안내.",
    },
    en: {
      title: "Bloominc daily lenses: Beginner's guide",
      excerpt: "From gray/brown daily picks to safe wearing hours.",
    },
    id: {
      title: "Lensa harian Bloominc: Panduan pemula",
      excerpt: "Pilih gray/brown daily dan jam pemakaian aman.",
    },
  },
  "spring-2026-lens-trends": {
    ko: {
      title: "2026 봄 렌즈 트렌드: 부드러운 브라운 & 애쉬 그레이",
      excerpt: "올봄 눈에 띄는 컬러 트렌드와 메이크업 매칭 팁을 정리했습니다.",
    },
    en: {
      title: "Spring 2026 lens trends: Soft brown & ash gray",
      excerpt: "This season's colors and makeup pairing tips.",
    },
    id: {
      title: "Tren lensa musim semi 2026: Coklat lembut & abu-abu",
      excerpt: "Warna musim ini dan tips paduan makeup.",
    },
  },
};

export function localizeArticle(
  slug: string,
  locale: Locale,
  fallback: { title: string; excerpt: string },
) {
  return ARTICLE_COPY[slug]?.[locale] ?? fallback;
}

const CATEGORY_KEYS: Record<string, string> = {
  all: "articles.cat.all",
  "beauty-lifestyle": "articles.cat.beauty",
  community: "articles.cat.community",
  reviews: "articles.cat.reviews",
  tips: "articles.cat.tips",
};

export function articleCategoryKey(category: string): string | null {
  return CATEGORY_KEYS[category] ?? null;
}
