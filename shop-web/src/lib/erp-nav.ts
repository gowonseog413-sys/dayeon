import { FOOTER_DOC_TABS } from "@/lib/erp-catalog";

export type ErpSubLink = {
  href: string;
  label: string;
  exact?: boolean;
};

export type ErpModule = {
  id: string;
  href: string;
  label: string;
  exact?: boolean;
  subs: ErpSubLink[];
};

export const ERP_MODULES: ErpModule[] = [
  {
    id: "dashboard",
    href: "/erp",
    label: "대시보드",
    exact: true,
    subs: [{ href: "/erp", label: "대시보드", exact: true }],
  },
  {
    id: "users",
    href: "/erp/users",
    label: "회원 관리",
    subs: [
      { href: "/erp/users", label: "회원 목록", exact: true },
      { href: "/erp/users/points", label: "포인트/적립금", exact: true },
      { href: "/erp/users/referral", label: "추천인제도", exact: true },
    ],
  },
  {
    id: "orders",
    href: "/erp/orders",
    label: "주문 관리",
    subs: [{ href: "/erp/orders", label: "주문 목록", exact: true }],
  },
  {
    id: "payments",
    href: "/erp/payments",
    label: "결제수단관리",
    subs: [
      { href: "/erp/payments", label: "결제 채널 설정", exact: true },
      { href: "/erp/payments/profiles", label: "회원 결제수단", exact: true },
    ],
  },
  {
    id: "products",
    href: "/erp/products",
    label: "상품 관리",
    subs: [
      { href: "/erp/products", label: "상품 등록", exact: true },
      { href: "/erp/products/list", label: "상품목록리스트", exact: true },
      { href: "/erp/products/stock", label: "상품재고", exact: true },
      { href: "/erp/products/catalog", label: "카테고리 속성", exact: true },
      { href: "/erp/products/filters", label: "필터 카데고리", exact: true },
    ],
  },
  {
    id: "articles",
    href: "/erp/articles",
    label: "언론 보도",
    subs: [
      { href: "/erp/articles", label: "언론 보도 등록", exact: true },
      { href: "/erp/articles/list", label: "게시물 목록", exact: true },
    ],
  },
  {
    id: "pages",
    href: "/erp/pages/about",
    label: "하단문서관리",
    subs: FOOTER_DOC_TABS.map((t) => ({ href: t.href, label: t.label, exact: true })),
  },
  {
    id: "theme",
    href: "/erp/theme",
    label: "테마변경",
    subs: [{ href: "/erp/theme", label: "테마변경", exact: true }],
  },
];

function linkActive(link: { href: string; exact?: boolean }, path: string) {
  if (link.exact) return path === link.href;
  return path === link.href || path.startsWith(`${link.href}/`);
}

export function getActiveErpModule(path: string): ErpModule {
  if (path.startsWith("/erp/users/theme")) {
    return ERP_MODULES.find((m) => m.id === "theme") ?? ERP_MODULES[0];
  }
  if (path.startsWith("/erp/support") || path.startsWith("/erp/pages")) {
    return ERP_MODULES.find((m) => m.id === "pages") ?? ERP_MODULES[0];
  }
  const found =
    [...ERP_MODULES]
      .reverse()
      .find((m) => linkActive({ href: m.href, exact: m.exact }, path)) ?? ERP_MODULES[0];
  return found;
}

export function isErpSubActive(link: ErpSubLink, path: string) {
  return linkActive(link, path);
}

export function isErpModuleActive(module: ErpModule, path: string) {
  if (module.id === "pages") {
    return path.startsWith("/erp/pages") || path.startsWith("/erp/support");
  }
  return linkActive({ href: module.href, exact: module.exact }, path);
}
