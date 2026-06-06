/** 모바일 햄버거 메뉴 — 푸터 링크와 동일 경로 */
export const MOBILE_MENU_MAIN = [
  { href: "/about", labelKey: "footer.about" },
  { href: "/careers", labelKey: "footer.careers" },
  { href: "/terms", labelKey: "footer.terms" },
  { href: "/eye-coin", labelKey: "footer.eyeCoin" },
  { href: "/privacy", labelKey: "footer.privacy" },
  { href: "/articles", labelKey: "footer.articles" },
] as const;

export const MOBILE_MENU_SUPPORT = [
  { href: "/support/faq", labelKey: "footer.faq" },
  { href: "/support/shipping", labelKey: "footer.shipping" },
  { href: "/support/returns", labelKey: "footer.returns" },
  { href: "/profile/inquiries", labelKey: "footer.contact" },
] as const;
