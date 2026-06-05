export const PRODUCT_CATEGORIES = [
  { id: "contact-lenses", label: "소프트렌즈 (콘택트렌즈)" },
  { id: "solutions", label: "솔루션 및 드롭" },
  { id: "accessories", label: "렌즈 액세서리" },
  { id: "bundles", label: "번들" },
] as const;

export const PRODUCT_SECTIONS = [
  { id: "bloominc", label: "블루밍크" },
  { id: "best-seller", label: "신규 도착 / 베스트" },
  { id: "solutions", label: "솔루션" },
  { id: "accessories", label: "액세서리" },
  { id: "bundles", label: "번들" },
] as const;

/** ERP에서 섹션 편집 가능 — API CMS와 쇼핑몰 연동 */
export const CMS_PAGE_LABELS: Record<string, string> = {
  about: "브랜드 스토리",
  careers: "채용 안내",
  eyeCoin: "멤버십/적립금 혜택",
};

/** ERP에서 법적 문구 편집 — API legal + 쇼핑몰 /terms · /privacy 연동 */
export const LEGAL_PAGE_LABELS: Record<string, string> = {
  terms: "이용약관",
  privacy: "개인정보처리방침",
};

export const SUPPORT_LABELS: Record<string, string> = {
  faq: "자주 묻는 질문 (FAQ)",
  shipping: "배송 정보",
  returns: "교환/반품 안내",
  contact: "1:1 문의하기",
};

export const PAGE_LABELS = {
  ...CMS_PAGE_LABELS,
  ...LEGAL_PAGE_LABELS,
  ...SUPPORT_LABELS,
};

/** 하단문서관리 — 오른쪽 상단 서브 탭 (쇼핑몰 푸터 연결 페이지) */
export const FOOTER_DOC_TAB_ORDER = [
  "about",
  "careers",
  "eyeCoin",
  "terms",
  "privacy",
  "faq",
  "shipping",
  "returns",
  "contact",
] as const;

export type FooterDocTabKey = (typeof FOOTER_DOC_TAB_ORDER)[number];

export const FOOTER_DOC_TABS: { key: FooterDocTabKey; label: string; href: string }[] =
  FOOTER_DOC_TAB_ORDER.map((key) => ({
    key,
    label: PAGE_LABELS[key],
    href: `/erp/pages/${key}`,
  }));

export function isFooterDocTabKey(key: string): key is FooterDocTabKey {
  return (FOOTER_DOC_TAB_ORDER as readonly string[]).includes(key);
}
