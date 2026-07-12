import { FOOTER_DOC_TAB_ORDER } from "@/lib/erp-catalog";
import { FOOTER_DOC_LABEL_KEYS } from "@/i18n/erp-messages";

export type ErpSubLink = {
  href: string;
  labelKey: string;
  exact?: boolean;
};

export type ErpModule = {
  id: string;
  href: string;
  labelKey: string;
  exact?: boolean;
  subs: ErpSubLink[];
};

export const ERP_MODULES: ErpModule[] = [
  {
    id: "dashboard",
    href: "/erp",
    labelKey: "erp.nav.dashboard",
    exact: true,
    subs: [
      { href: "/erp", labelKey: "erp.nav.dashboard", exact: true },
      { href: "/erp/stats", labelKey: "erp.nav.stats", exact: true },
      { href: "/erp/counter", labelKey: "erp.nav.counter", exact: true },
    ],
  },
  {
    id: "users",
    href: "/erp/users",
    labelKey: "erp.nav.users",
    subs: [
      { href: "/erp/users", labelKey: "erp.nav.usersList", exact: true },
      { href: "/erp/users/points", labelKey: "erp.nav.usersPoints", exact: true },
      { href: "/erp/users/reviews", labelKey: "erp.nav.usersReviews", exact: true },
      { href: "/erp/users/referral", labelKey: "erp.nav.usersReferral", exact: true },
    ],
  },
  {
    id: "orders",
    href: "/erp/orders",
    labelKey: "erp.nav.orders",
    subs: [
      { href: "/erp/orders", labelKey: "erp.nav.ordersList", exact: true },
      { href: "/erp/orders/shipping", labelKey: "erp.nav.ordersShipping", exact: true },
      { href: "/erp/orders/returns", labelKey: "erp.nav.ordersReturns", exact: true },
      { href: "/erp/orders/closed", labelKey: "erp.nav.ordersClosed", exact: true },
      { href: "/erp/orders/stats", labelKey: "erp.nav.ordersStats", exact: true },
    ],
  },
  {
    id: "payments",
    href: "/erp/payments",
    labelKey: "erp.nav.payments",
    subs: [
      { href: "/erp/payments", labelKey: "erp.nav.paymentsChannels", exact: true },
      { href: "/erp/payments/profiles", labelKey: "erp.nav.paymentsProfiles", exact: true },
    ],
  },
  {
    id: "products",
    href: "/erp/products",
    labelKey: "erp.nav.products",
    subs: [
      { href: "/erp/products", labelKey: "erp.nav.productsRegister", exact: true },
      { href: "/erp/products/list", labelKey: "erp.nav.productsList", exact: true },
      { href: "/erp/products/stock", labelKey: "erp.nav.productsStock", exact: true },
      { href: "/erp/products/catalog", labelKey: "erp.nav.productsCatalog", exact: true },
      { href: "/erp/products/filters", labelKey: "erp.nav.productsFilters", exact: true },
    ],
  },
  {
    id: "articles",
    href: "/erp/articles",
    labelKey: "erp.nav.articles",
    subs: [
      { href: "/erp/articles", labelKey: "erp.nav.articlesRegister", exact: true },
      { href: "/erp/articles/list", labelKey: "erp.nav.articlesList", exact: true },
      { href: "/erp/articles/categories", labelKey: "erp.nav.articlesCategories", exact: true },
    ],
  },
  {
    id: "pages",
    href: "/erp/pages/about",
    labelKey: "erp.nav.pages",
    subs: FOOTER_DOC_TAB_ORDER.map((key) => ({
      href: `/erp/pages/${key}`,
      labelKey: FOOTER_DOC_LABEL_KEYS[key] ?? key,
      exact: true,
    })),
  },
  {
    id: "theme",
    href: "/erp/theme",
    labelKey: "erp.nav.theme",
    subs: [
      { href: "/erp/theme", labelKey: "erp.nav.theme", exact: true },
      { href: "/erp/theme/hero", labelKey: "erp.nav.themeHero", exact: true },
      { href: "/erp/theme/popups", labelKey: "erp.nav.themePopups", exact: true },
      { href: "/erp/theme/banner", labelKey: "erp.nav.themeBanner", exact: true },
      { href: "/erp/theme/partners", labelKey: "erp.nav.themePartners", exact: true },
      { href: "/erp/theme/channels", labelKey: "erp.nav.themeChannels", exact: true },
    ],
  },
  {
    id: "settings",
    href: "/erp/settings",
    labelKey: "erp.nav.settings",
    subs: [
      { href: "/erp/settings", labelKey: "erp.nav.settings", exact: true },
      { href: "/erp/settings/permissions", labelKey: "erp.nav.permissions", exact: true },
    ],
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
  if (module.id === "dashboard") {
    return (
      path === "/erp" ||
      path.startsWith("/erp/stats") ||
      path.startsWith("/erp/counter")
    );
  }
  if (module.id === "orders") {
    return path === "/erp/orders" || path.startsWith("/erp/orders/");
  }
  if (module.id === "settings") {
    return path === "/erp/settings" || path.startsWith("/erp/settings/");
  }
  return linkActive({ href: module.href, exact: module.exact }, path);
}

/** ERP 전체 경로 — 마운트 시 프리페치용 */
export function allErpHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const m of ERP_MODULES) {
    hrefs.add(m.href);
    for (const sub of m.subs) hrefs.add(sub.href);
  }
  return [...hrefs];
}
