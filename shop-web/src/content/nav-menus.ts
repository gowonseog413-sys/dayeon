export type NavChild = { label: string; href: string; swatch?: string };

export type NavItem = {
  id: string;
  label: string;
  labelKey?: string;
  href?: string;
  children?: NavChild[];
};

/** 콘택트렌즈: 중분류 4개 + 소분류 flyout */
export const CONTACT_LENS_MENU: NavItem[] = [
  {
    id: "all",
    label: "모든 콘택트렌즈",
    href: "/catalog?category=contact-lenses",
  },
  {
    id: "brand",
    label: "브랜드별 쇼핑",
    children: [
      { label: "블루밍크", href: "/catalog?category=contact-lenses&brand=Bloominc" },
      { label: "Eyesm", href: "/catalog?category=contact-lenses&brand=Eyesm" },
      { label: "EOS", href: "/catalog?category=contact-lenses&brand=EOS" },
      { label: "키티 카와이", href: "/catalog?category=contact-lenses&brand=Kitty+Kawaii" },
      { label: "공주", href: "/catalog?category=contact-lenses&brand=Princess" },
    ],
  },
  {
    id: "look",
    label: "보기로 쇼핑하기",
    children: [
      { label: "내추럴 룩", href: "/catalog?category=contact-lenses&look=natural" },
      { label: "링 렌즈 없음", href: "/catalog?category=contact-lenses&look=no-ring" },
      { label: "링 렌즈와 함께", href: "/catalog?category=contact-lenses&look=with-ring" },
      { label: "빅 아이 효과", href: "/catalog?category=contact-lenses&look=big-eye" },
      { label: "웨딩 렌즈", href: "/catalog?category=contact-lenses&look=wedding" },
      { label: "브라이트 렌즈", href: "/catalog?category=contact-lenses&look=bright" },
      { label: "민감한 눈", href: "/catalog?category=contact-lenses&look=sensitive" },
    ],
  },
  {
    id: "color",
    label: "색상별 쇼핑",
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
    label: "직경별 쇼핑",
    children: [
      { label: "14.00 mm", href: "/catalog?category=contact-lenses&diameter=14.0" },
      { label: "14.20 mm", href: "/catalog?category=contact-lenses&diameter=14.2" },
      { label: "14.50 mm", href: "/catalog?category=contact-lenses&diameter=14.5" },
    ],
  },
];

export const ACCESSORIES_MENU: NavItem[] = [
  { id: "drops", label: "안약", href: "/catalog?category=solutions&sub=drops" },
  { id: "mps", label: "다목적 솔루션", href: "/catalog?category=solutions&sub=mps" },
  { id: "travel", label: "여행 키트", href: "/catalog?category=accessories&sub=travel" },
  { id: "cleaner", label: "렌즈 클리너", href: "/catalog?category=accessories&sub=cleaner" },
];

export const SIMPLE_NAV = [
  { href: "/catalog?section=best-seller", label: "신규 도착" },
  { href: "/catalog?category=bundles", label: "번들" },
  { href: "/catalog?section=bloominc", label: "블루밍크" },
  { href: "/articles", label: "언론 보도" },
];
