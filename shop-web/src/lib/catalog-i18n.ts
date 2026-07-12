import { translate, type Locale } from "@/i18n/messages";
import type { CatalogItem, CategoryTreeNode, FilterFieldOptionsMap } from "@/lib/product-catalog-store";

type LocalizableItem = Pick<CatalogItem, "id" | "label" | "labels">;

/** 카탈로그 노드 id → messages 키 (네비·트리) */
const LABEL_KEYS: Record<string, string> = {
  "contact-lenses": "nav.contactLenses",
  accessories: "nav.accessories",
  "new-arrivals": "nav.newArrivals",
  bundles: "nav.bundles",
  bloominc: "nav.bloominc",
  all: "nav.allLenses",
  brand: "nav.byBrand",
  look: "nav.byLook",
  color: "nav.byColor",
  diameter: "nav.byDiameter",
  drops: "nav.acc.drops",
  mps: "nav.acc.mps",
  travel: "nav.acc.travel",
  cleaner: "nav.acc.cleaner",
  natural: "catalog.title.natural",
  "no-ring": "nav.look.noRing",
  "with-ring": "nav.look.withRing",
  "big-eye": "catalog.title.bigEye",
  wedding: "catalog.title.wedding",
  bright: "nav.look.bright",
  sensitive: "nav.look.sensitive",
  almond: "catalog.color.almond",
  black: "catalog.color.black",
  brown: "catalog.color.brown",
  choco: "catalog.color.choco",
  gray: "catalog.color.gray",
  clear: "catalog.color.clear",
  "kitty-kawaii": "nav.brand.kittyKawaii",
  princess: "nav.brand.princess",
};

const FILTER_CATEGORY_KEYS: Record<string, string> = {
  "contact-lenses": "catalog.cat.contactLenses",
  solutions: "catalog.cat.solutions",
  accessories: "catalog.cat.accessories",
  bundles: "catalog.cat.bundles",
};

const FILTER_OPTION_KEYS: Record<string, Record<string, string>> = {
  prescription: {
    normal: "catalog.rx.normal",
    myopia: "catalog.rx.myopia",
  },
  lifespan: {
    daily: "catalog.lifespan.daily",
    "1month": "catalog.lifespan.1m",
    "3months": "catalog.lifespan.3m",
    "6months": "catalog.lifespan.6m",
    "1year": "catalog.lifespan.1y",
  },
  color: {
    almond: "catalog.color.almond",
    black: "catalog.color.black",
    brown: "catalog.color.brown",
    choco: "catalog.color.choco",
    gray: "catalog.color.gray",
    clear: "catalog.color.clear",
  },
};

const FILTER_FIELD_KEYS: Record<string, string> = {
  category: "catalog.category",
  brand: "catalog.brand",
  color: "catalog.color",
  diameter: "catalog.diameter",
  waterContent: "catalog.waterContent",
  prescription: "catalog.prescription",
  baseCurve: "catalog.baseCurve",
  lifespan: "catalog.lifespan",
  price: "catalog.price",
  saleOnly: "catalog.saleOnly",
};

const SECTION_LABEL_KEYS: Record<string, string> = {
  bloominc: "home.bloominc",
  "best-seller": "home.bestSeller",
  solutions: "home.solutions",
  accessories: "home.accessories",
  bundles: "home.bundles",
};

function i18nKeyForItem(
  item: LocalizableItem,
  locale: Locale,
  context?: { kind?: "filterCategory" | "filterOption" | "section"; fieldId?: string },
): string | undefined {
  if (context?.kind === "filterCategory") {
    return FILTER_CATEGORY_KEYS[item.id];
  }
  if (context?.kind === "section") {
    return SECTION_LABEL_KEYS[item.id];
  }
  if (context?.kind === "filterOption" && context.fieldId) {
    return FILTER_OPTION_KEYS[context.fieldId]?.[item.id];
  }
  if (context?.kind === "filterOption" && context.fieldId === "color") {
    return FILTER_OPTION_KEYS.color?.[item.id];
  }
  return LABEL_KEYS[item.id];
}

/** ERP labels → id 기반 번역 → 한국어 label */
export function resolveCatalogItemLabel(
  item: LocalizableItem,
  locale: Locale,
  context?: { kind?: "filterCategory" | "filterOption" | "section"; fieldId?: string },
): string {
  const stored = item.labels?.[locale];
  if (stored?.trim()) return stored.trim();
  if (locale === "ko") return item.label;
  const key = i18nKeyForItem(item, locale, context);
  if (key) return translate(locale, key);
  return item.label;
}

export function localizeCatalogLabel(locale: Locale, id: string, fallback: string): string {
  return resolveCatalogItemLabel({ id, label: fallback }, locale);
}

export function resolveFilterFieldLabel(item: LocalizableItem, locale: Locale): string {
  const stored = item.labels?.[locale];
  if (stored?.trim()) return stored.trim();
  if (locale === "ko") return item.label;
  const key = FILTER_FIELD_KEYS[item.id];
  if (key) return translate(locale, key);
  return item.label;
}

function localizeNode(node: CategoryTreeNode, locale: Locale): CategoryTreeNode {
  return {
    ...node,
    label: resolveCatalogItemLabel(node, locale),
    children: node.children?.map((c) => localizeNode(c, locale)),
  };
}

export function localizeCategoryTree(
  tree: CategoryTreeNode[],
  locale: Locale,
): CategoryTreeNode[] {
  if (locale === "ko") return tree;
  return tree.map((n) => localizeNode(n, locale));
}

export function localizeSections(sections: CatalogItem[], locale: Locale): CatalogItem[] {
  if (locale === "ko") return sections;
  return sections.map((s) => ({
    ...s,
    label: resolveCatalogItemLabel(s, locale, { kind: "section" }),
  }));
}

export function localizeFilterCategories(
  categories: CatalogItem[],
  locale: Locale,
): CatalogItem[] {
  if (locale === "ko") return categories;
  return categories.map((c) => ({
    ...c,
    label: resolveCatalogItemLabel(c, locale, { kind: "filterCategory" }),
  }));
}

export function localizeFilterFieldOptions(
  options: FilterFieldOptionsMap,
  locale: Locale,
): FilterFieldOptionsMap {
  if (locale === "ko") return options;
  const out = { ...options };
  for (const fieldId of Object.keys(options) as (keyof FilterFieldOptionsMap)[]) {
    const list = options[fieldId];
    if (!list?.length) continue;
    out[fieldId] = list.map((item) => ({
      ...item,
      label:
        fieldId === "brand" || fieldId === "diameter" || fieldId === "waterContent" || fieldId === "baseCurve"
          ? item.label
          : resolveCatalogItemLabel(item, locale, { kind: "filterOption", fieldId }),
    }));
  }
  return out;
}
