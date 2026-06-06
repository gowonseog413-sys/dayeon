export type NavChild = { label: string; href: string; swatch?: string };

export type NavItem = {
  id: string;
  label: string;
  labelKey?: string;
  href?: string;
  children?: NavChild[];
};

/** 컬러렌즈: 중분류 + 소분류 flyout */
export const CONTACT_LENS_MENU: NavItem[] = [
  {
    id: "all",
    label: "전체 컬러렌즈",
    href: "/catalog?category=contact-lenses",
  },
  {
    id: "brand",
    label: "브랜드별",
    children: [
      { label: "다연 추천", href: "/catalog?category=contact-lenses&brand=Bloominc" },
      { label: "Eyesm", href: "/catalog?category=contact-lenses&brand=Eyesm" },
      { label: "EOS", href: "/catalog?category=contact-lenses&brand=EOS" },
      { label: "키티 카와이", href: "/catalog?category=contact-lenses&brand=Kitty+Kawaii" },
      { label: "공주", href: "/catalog?category=contact-lenses&brand=Princess" },
    ],
  },
  {
    id: "look",
    label: "스타일별",
    children: [
      { label: "일상 · 내추럴", href: "/catalog?category=contact-lenses&look=natural" },
      { label: "노링 스타일", href: "/catalog?category=contact-lenses&look=no-ring" },
      { label: "선명한 링라인", href: "/catalog?category=contact-lenses&look=with-ring" },
      { label: "또렷한 눈매", href: "/catalog?category=contact-lenses&look=big-eye" },
      { label: "웨딩 & 기념일", href: "/catalog?category=contact-lenses&look=wedding" },
      { label: "화사한 눈빛", href: "/catalog?category=contact-lenses&look=bright" },
      { label: "민감 눈 맞춤", href: "/catalog?category=contact-lenses&look=sensitive" },
    ],
  },
  {
    id: "color",
    label: "컬러별",
    children: [
      { label: "아몬드", href: "/catalog?category=contact-lenses&color=almond", swatch: "#d4a574" },
      { label: "검정", href: "/catalog?category=contact-lenses&color=black", swatch: "#1f2937" },
      { label: "브라운", href: "/catalog?category=contact-lenses&color=brown", swatch: "#92400e" },
      { label: "초코", href: "/catalog?category=contact-lenses&color=choco", swatch: "#78350f" },
      { label: "그레이", href: "/catalog?category=contact-lenses&color=gray", swatch: "#9ca3af" },
      { label: "클리어", href: "/catalog?category=contact-lenses&color=clear", swatch: "#e5e7eb" },
    ],
  },
  {
    id: "diameter",
    label: "직경별",
    children: [
      { label: "14.00 mm", href: "/catalog?category=contact-lenses&diameter=14.0" },
      { label: "14.20 mm", href: "/catalog?category=contact-lenses&diameter=14.2" },
      { label: "14.50 mm", href: "/catalog?category=contact-lenses&diameter=14.5" },
    ],
  },
];

export const ACCESSORIES_MENU: NavItem[] = [
  { id: "drops", label: "인공눈물 · 점안액", href: "/catalog?category=solutions&sub=drops" },
  { id: "mps", label: "렌즈 관리용액", href: "/catalog?category=solutions&sub=mps" },
  { id: "travel", label: "휴대용 케어 키트", href: "/catalog?category=accessories&sub=travel" },
  { id: "cleaner", label: "케이스 · 세정 도구", href: "/catalog?category=accessories&sub=cleaner" },
];

export const SIMPLE_NAV = [
  { href: "/catalog?section=best-seller", label: "신상품" },
  { href: "/catalog?category=bundles", label: "알뜰 세트" },
  { href: "/catalog?section=bloominc", label: "다연 추천" },
  { href: "/articles", label: "렌즈 매거진" },
];
