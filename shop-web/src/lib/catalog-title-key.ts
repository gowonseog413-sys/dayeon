import type { CatalogFilters } from "./catalog-filter";
import { getSectionLabel, type ProductCatalogData } from "./product-catalog-store";

/** i18n message key for catalog page title */
export function catalogTitleKey(f: CatalogFilters): string {
  if (f.look === "big-eye") return "catalog.title.bigEye";
  if (f.look === "natural") return "catalog.title.natural";
  if (f.look === "wedding") return "catalog.title.wedding";
  if (f.look) return "catalog.title.lenses";
  if (f.color) {
    const map: Record<string, string> = {
      almond: "catalog.title.colorAlmond",
      black: "catalog.title.colorBlack",
      brown: "catalog.title.colorBrown",
      choco: "catalog.title.colorChoco",
      gray: "catalog.title.colorGray",
      clear: "catalog.title.colorClear",
    };
    return map[f.color] ?? "catalog.title.byColor";
  }
  if (f.brand) return "catalog.title.brand";
  if (f.category === "solutions") return "home.solutions";
  if (f.category === "accessories") return "nav.accessories";
  if (f.category === "bundles") return "home.bundles";
  if (f.section === "best-seller") return "nav.newArrivals";
  if (f.section === "bloominc") return "nav.bloominc";
  if (f.category === "contact-lenses") return "catalog.title.softLenses";
  return "catalog.title.default";
}

/** When title is brand name, pass brand as interpolation — use separate helper */
export function catalogTitleText(
  f: CatalogFilters,
  t: (key: string) => string,
  catalog?: Pick<ProductCatalogData, "sections" | "filterCategories">,
): string {
  if (f.brand) return f.brand;
  if (f.section) {
    const label = getSectionLabel(catalog?.sections, f.section);
    if (label) return label;
  }
  if (f.category && !f.brand && !f.color && !f.look && catalog?.filterCategories) {
    const label = catalog.filterCategories.find((c) => c.id === f.category)?.label;
    if (label) return label;
  }
  const key = catalogTitleKey(f);
  if (key === "catalog.title.brand") return f.brand ?? t("catalog.title.default");
  const colorKeys = [
    "catalog.title.colorAlmond",
    "catalog.title.colorBlack",
    "catalog.title.colorBrown",
    "catalog.title.colorChoco",
    "catalog.title.colorGray",
    "catalog.title.colorClear",
  ];
  if (colorKeys.includes(key)) return t(key);
  return t(key);
}
