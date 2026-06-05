import type { NavItem } from "@/content/nav-menus";

/** labelKey → i18n messages 키 */
export const CONTACT_LENS_MENU_I18N: NavItem[] = [
  { id: "all", label: "", labelKey: "nav.allLenses", href: "/catalog?category=contact-lenses" },
  {
    id: "brand",
    label: "",
    labelKey: "nav.byBrand",
    children: [
      { label: "Bloominc", href: "/catalog?category=contact-lenses&brand=Bloominc" },
      { label: "Eyesm", href: "/catalog?category=contact-lenses&brand=Eyesm" },
      { label: "EOS", href: "/catalog?category=contact-lenses&brand=EOS" },
      { label: "Kitty Kawaii", href: "/catalog?category=contact-lenses&brand=Kitty+Kawaii" },
      { label: "Princess", href: "/catalog?category=contact-lenses&brand=Princess" },
    ],
  },
  {
    id: "look",
    label: "",
    labelKey: "nav.byLook",
    children: [
      { label: "Natural", href: "/catalog?category=contact-lenses&look=natural" },
      { label: "No Ring", href: "/catalog?category=contact-lenses&look=no-ring" },
      { label: "With Ring", href: "/catalog?category=contact-lenses&look=with-ring" },
      { label: "Big Eye", href: "/catalog?category=contact-lenses&look=big-eye" },
      { label: "Wedding", href: "/catalog?category=contact-lenses&look=wedding" },
      { label: "Bright", href: "/catalog?category=contact-lenses&look=bright" },
      { label: "Sensitive", href: "/catalog?category=contact-lenses&look=sensitive" },
    ],
  },
  {
    id: "color",
    label: "",
    labelKey: "nav.byColor",
    children: [
      { label: "Almond", href: "/catalog?category=contact-lenses&color=almond", swatch: "#d4a574" },
      { label: "Black", href: "/catalog?category=contact-lenses&color=black", swatch: "#1f2937" },
      { label: "Brown", href: "/catalog?category=contact-lenses&color=brown", swatch: "#92400e" },
      { label: "Choco", href: "/catalog?category=contact-lenses&color=choco", swatch: "#78350f" },
      { label: "Gray", href: "/catalog?category=contact-lenses&color=gray", swatch: "#9ca3af" },
      { label: "Clear", href: "/catalog?category=contact-lenses&color=clear", swatch: "#e5e7eb" },
    ],
  },
  {
    id: "diameter",
    label: "",
    labelKey: "nav.byDiameter",
    children: [
      { label: "14.00 mm", href: "/catalog?category=contact-lenses&diameter=14.0" },
      { label: "14.20 mm", href: "/catalog?category=contact-lenses&diameter=14.2" },
      { label: "14.50 mm", href: "/catalog?category=contact-lenses&diameter=14.5" },
    ],
  },
];

export const ACCESSORIES_MENU_I18N: NavItem[] = [
  { id: "drops", label: "", labelKey: "nav.acc.drops", href: "/catalog?category=solutions&sub=drops" },
  { id: "mps", label: "", labelKey: "nav.acc.mps", href: "/catalog?category=solutions&sub=mps" },
  { id: "travel", label: "", labelKey: "nav.acc.travel", href: "/catalog?category=accessories&sub=travel" },
  { id: "cleaner", label: "", labelKey: "nav.acc.cleaner", href: "/catalog?category=accessories&sub=cleaner" },
];

export const SIMPLE_NAV_I18N = [
  { href: "/catalog?section=best-seller", labelKey: "nav.newArrivals" },
  { href: "/catalog?category=bundles", labelKey: "nav.bundles" },
  { href: "/catalog?section=bloominc", labelKey: "nav.bloominc" },
  { href: "/articles", labelKey: "nav.articles" },
];
