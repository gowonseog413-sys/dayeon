import type { CategoryTreeNode } from "@/lib/product-catalog-store";

/** API DEFAULT_CATEGORY_TREE 와 동일 — 오프라인 폴백 */
export const DEFAULT_CATEGORY_TREE: CategoryTreeNode[] = [
  {
    id: "contact-lenses",
    label: "컬러렌즈",
    sortOrder: 1,
    children: [
      { id: "all", label: "전체 렌즈 보기", sortOrder: 1, href: "/catalog?category=contact-lenses", children: [] },
      {
        id: "brand",
        label: "브랜드로 보기",
        sortOrder: 2,
        children: [
          { id: "bloominc", label: "Bloominc", sortOrder: 1, href: "/catalog?category=contact-lenses&brand=Bloominc", children: [] },
          { id: "eyesm", label: "Eyesm", sortOrder: 2, href: "/catalog?category=contact-lenses&brand=Eyesm", children: [] },
          { id: "eos", label: "EOS", sortOrder: 3, href: "/catalog?category=contact-lenses&brand=EOS", children: [] },
          { id: "kitty-kawaii", label: "키티 카와이", sortOrder: 4, href: "/catalog?category=contact-lenses&brand=Kitty%2BKawaii", children: [] },
          { id: "princess", label: "공주", sortOrder: 5, href: "/catalog?category=contact-lenses&brand=Princess", children: [] },
        ],
      },
      {
        id: "look",
        label: "스타일로 보기",
        sortOrder: 3,
        children: [
          { id: "natural", label: "자연스러운 눈빛", sortOrder: 1, href: "/catalog?category=contact-lenses&look=natural", children: [] },
          { id: "no-ring", label: "링 없는 렌즈", sortOrder: 2, href: "/catalog?category=contact-lenses&look=no-ring", children: [] },
          { id: "with-ring", label: "또렷한 링 효과", sortOrder: 3, href: "/catalog?category=contact-lenses&look=with-ring", children: [] },
          { id: "big-eye", label: "또렷한 눈매", sortOrder: 4, href: "/catalog?category=contact-lenses&look=big-eye", children: [] },
          { id: "wedding", label: "웨딩·특별한 날", sortOrder: 5, href: "/catalog?category=contact-lenses&look=wedding", children: [] },
          { id: "bright", label: "환한 눈빛", sortOrder: 6, href: "/catalog?category=contact-lenses&look=bright", children: [] },
          { id: "sensitive", label: "민감한 눈용", sortOrder: 7, href: "/catalog?category=contact-lenses&look=sensitive", children: [] },
        ],
      },
      {
        id: "color",
        label: "컬러로 보기",
        sortOrder: 4,
        children: [
          { id: "almond", label: "아몬드", sortOrder: 1, swatch: "#d4a574", href: "/catalog?category=contact-lenses&color=almond", children: [] },
          { id: "black", label: "검정", sortOrder: 2, swatch: "#1f2937", href: "/catalog?category=contact-lenses&color=black", children: [] },
          { id: "brown", label: "브라운", sortOrder: 3, swatch: "#92400e", href: "/catalog?category=contact-lenses&color=brown", children: [] },
          { id: "choco", label: "초코", sortOrder: 4, swatch: "#78350f", href: "/catalog?category=contact-lenses&color=choco", children: [] },
          { id: "gray", label: "그레이", sortOrder: 5, swatch: "#9ca3af", href: "/catalog?category=contact-lenses&color=gray", children: [] },
          { id: "clear", label: "클리어", sortOrder: 6, swatch: "#e5e7eb", href: "/catalog?category=contact-lenses&color=clear", children: [] },
        ],
      },
      {
        id: "diameter",
        label: "직경으로 보기",
        sortOrder: 5,
        children: [
          { id: "14-0", label: "14.00 mm", sortOrder: 1, href: "/catalog?category=contact-lenses&diameter=14.0", children: [] },
          { id: "14-2", label: "14.20 mm", sortOrder: 2, href: "/catalog?category=contact-lenses&diameter=14.2", children: [] },
          { id: "14-5", label: "14.50 mm", sortOrder: 3, href: "/catalog?category=contact-lenses&diameter=14.5", children: [] },
        ],
      },
    ],
  },
  {
    id: "accessories",
    label: "케어·용품",
    sortOrder: 2,
    children: [
      { id: "drops", label: "인공눈물·안약", sortOrder: 1, href: "/catalog?category=solutions&sub=drops", children: [] },
      { id: "mps", label: "렌즈 세척액", sortOrder: 2, href: "/catalog?category=solutions&sub=mps", children: [] },
      { id: "travel", label: "휴대용 키트", sortOrder: 3, href: "/catalog?category=accessories&sub=travel", children: [] },
      { id: "cleaner", label: "렌즈 세정용품", sortOrder: 4, href: "/catalog?category=accessories&sub=cleaner", children: [] },
    ],
  },
  { id: "new-arrivals", label: "신상품", sortOrder: 3, href: "/catalog?section=best-seller", children: [] },
  { id: "bundles", label: "알뜰 세트", sortOrder: 4, href: "/catalog?category=bundles", children: [] },
  { id: "bloominc", label: "다연 추천", sortOrder: 5, href: "/catalog?section=bloominc", children: [] },
];
