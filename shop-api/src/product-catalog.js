/** 상품 카테고리 트리(대·중·소) + 홈 섹션 */

export const DEFAULT_CATEGORY_TREE = [
  {
    id: "contact-lenses",
    label: "콘택트렌즈",
    sortOrder: 1,
    children: [
      {
        id: "all",
        label: "모든 콘택트렌즈",
        sortOrder: 1,
        href: "/catalog?category=contact-lenses",
        children: [],
      },
      {
        id: "brand",
        label: "브랜드별 쇼핑",
        sortOrder: 2,
        children: [
          { id: "bloominc", label: "블루밍크", sortOrder: 1 },
          { id: "eyesm", label: "Eyesm", sortOrder: 2 },
          { id: "eos", label: "EOS", sortOrder: 3 },
          { id: "kitty-kawaii", label: "키티 카와이", sortOrder: 4 },
          { id: "princess", label: "공주", sortOrder: 5 },
        ],
      },
      {
        id: "look",
        label: "보기로 쇼핑하기",
        sortOrder: 3,
        children: [
          { id: "natural", label: "내추럴 룩", sortOrder: 1 },
          { id: "no-ring", label: "링 렌즈 없음", sortOrder: 2 },
          { id: "with-ring", label: "링 렌즈와 함께", sortOrder: 3 },
          { id: "big-eye", label: "빅 아이 효과", sortOrder: 4 },
          { id: "wedding", label: "웨딩 렌즈", sortOrder: 5 },
          { id: "bright", label: "브라이트 렌즈", sortOrder: 6 },
          { id: "sensitive", label: "민감한 눈", sortOrder: 7 },
        ],
      },
      {
        id: "color",
        label: "색상별 쇼핑",
        sortOrder: 4,
        children: [
          { id: "almond", label: "아몬드", sortOrder: 1, swatch: "#d4a574" },
          { id: "black", label: "검정", sortOrder: 2, swatch: "#1f2937" },
          { id: "brown", label: "브라운", sortOrder: 3, swatch: "#92400e" },
          { id: "choco", label: "초코", sortOrder: 4, swatch: "#78350f" },
          { id: "gray", label: "그레이", sortOrder: 5, swatch: "#9ca3af" },
          { id: "clear", label: "클리어", sortOrder: 6, swatch: "#e5e7eb" },
        ],
      },
      {
        id: "diameter",
        label: "직경별 쇼핑",
        sortOrder: 5,
        children: [
          { id: "14-0", label: "14.00 mm", sortOrder: 1 },
          { id: "14-2", label: "14.20 mm", sortOrder: 2 },
          { id: "14-5", label: "14.50 mm", sortOrder: 3 },
        ],
      },
    ],
  },
  {
    id: "accessories",
    label: "렌즈 액세서리",
    sortOrder: 2,
    children: [
      { id: "drops", label: "안약", sortOrder: 1, href: "/catalog?category=solutions&sub=drops", children: [] },
      { id: "mps", label: "다목적 솔루션", sortOrder: 2, href: "/catalog?category=solutions&sub=mps", children: [] },
      { id: "travel", label: "여행 키트", sortOrder: 3, href: "/catalog?category=accessories&sub=travel", children: [] },
      { id: "cleaner", label: "렌즈 클리너", sortOrder: 4, href: "/catalog?category=accessories&sub=cleaner", children: [] },
    ],
  },
  {
    id: "new-arrivals",
    label: "신규 도착",
    sortOrder: 3,
    href: "/catalog?section=best-seller",
    children: [],
  },
  {
    id: "bundles",
    label: "번들",
    sortOrder: 4,
    href: "/catalog?category=bundles",
    children: [],
  },
  {
    id: "bloominc",
    label: "블루밍크",
    sortOrder: 5,
    href: "/catalog?section=bloominc",
    children: [],
  },
];

export const DEFAULT_PRODUCT_SECTIONS = [
  { id: "bloominc", label: "블루밍크", sortOrder: 1 },
  { id: "best-seller", label: "신규 도착 / 베스트", sortOrder: 2 },
  { id: "solutions", label: "솔루션", sortOrder: 3 },
  { id: "accessories", label: "액세서리", sortOrder: 4 },
  { id: "bundles", label: "번들", sortOrder: 5 },
];

/** 쇼핑몰 좌측 프레임(프레임왼쪽 카데고리) 필터 카테고리 */
export const DEFAULT_FILTER_CATEGORIES = [
  { id: "contact-lenses", label: "소프트렌즈 (콘택트렌즈)", sortOrder: 1 },
  { id: "solutions", label: "솔루션 및 드롭", sortOrder: 2 },
  { id: "accessories", label: "렌즈 액세서리", sortOrder: 3 },
  { id: "bundles", label: "번들", sortOrder: 4 },
];

/** 쇼핑몰 좌측 프레임 필터 항목 라벨 */
export const DEFAULT_FILTER_FIELDS = [
  { id: "category", label: "카테고리", sortOrder: 1 },
  { id: "brand", label: "브랜드", sortOrder: 2 },
  { id: "color", label: "색상", sortOrder: 3 },
  { id: "diameter", label: "직경", sortOrder: 4 },
  { id: "waterContent", label: "수분 함량", sortOrder: 5 },
  { id: "prescription", label: "처방", sortOrder: 6 },
  { id: "baseCurve", label: "베이스 곡선", sortOrder: 7 },
  { id: "lifespan", label: "수명", sortOrder: 8 },
  { id: "price", label: "가격", sortOrder: 9 },
  { id: "saleOnly", label: "매각 (SALE)", sortOrder: 10 },
];

function cloneTree(nodes) {
  return nodes.map((n) => ({
    ...n,
    children: Array.isArray(n.children) ? cloneTree(n.children) : [],
  }));
}

export function ensureProductCatalog(db) {
  if (!db.productCatalog) {
    db.productCatalog = {
      categoryTree: cloneTree(DEFAULT_CATEGORY_TREE),
      sections: DEFAULT_PRODUCT_SECTIONS.map((s) => ({ ...s })),
    };
  }
  if (!Array.isArray(db.productCatalog.categoryTree) || db.productCatalog.categoryTree.length === 0) {
    db.productCatalog.categoryTree = cloneTree(DEFAULT_CATEGORY_TREE);
  }
  if (!Array.isArray(db.productCatalog.sections)) {
    db.productCatalog.sections = [...DEFAULT_PRODUCT_SECTIONS];
  }
  if (!Array.isArray(db.productCatalog.filterCategories) || db.productCatalog.filterCategories.length === 0) {
    db.productCatalog.filterCategories = DEFAULT_FILTER_CATEGORIES.map((s) => ({ ...s }));
  }
  if (!Array.isArray(db.productCatalog.filterFields) || db.productCatalog.filterFields.length === 0) {
    db.productCatalog.filterFields = DEFAULT_FILTER_FIELDS.map((s) => ({ ...s }));
  }
}

const BRAND_QUERY = {
  bloominc: "Bloominc",
  eyesm: "Eyesm",
  eos: "EOS",
  "kitty-kawaii": "Kitty+Kawaii",
  princess: "Princess",
};

const DIAMETER_QUERY = {
  "14-0": "14.0",
  "14-2": "14.2",
  "14-5": "14.5",
};

/** 쇼핑몰 카탈로그 링크 — ERP 트리와 동일 규칙 */
export function resolveCatalogHref(mainId, mid, sub) {
  if (sub && mid) {
    let qv = sub.id;
    if (mid.id === "brand") {
      qv = BRAND_QUERY[sub.id] || String(sub.label || sub.id).replace(/ /g, "+");
    } else if (mid.id === "diameter") {
      qv = DIAMETER_QUERY[sub.id] || String(sub.id).replace("-", ".");
    }
    return `/catalog?category=${mainId}&${mid.id}=${encodeURIComponent(qv)}`;
  }
  if (mid?.href) return mid.href;
  if (mid?.id === "all") return `/catalog?category=${mainId}`;
  if (mid) return `/catalog?category=${mainId}&${mid.id}=${encodeURIComponent(mid.id)}`;
  return `/catalog?category=${mainId}`;
}

export function enrichTreeHrefs(tree) {
  return tree.map((main) => {
    const children = (main.children || []).map((mid) => {
      const subs = (mid.children || []).map((sub) => ({
        ...sub,
        href: sub.href || resolveCatalogHref(main.id, mid, sub),
        children: [],
      }));
      const midHref =
        mid.href ||
        (mid.id === "all" ? `/catalog?category=${main.id}` : subs.length ? undefined : resolveCatalogHref(main.id, mid, null));
      return {
        ...mid,
        href: midHref,
        children: subs,
      };
    });
    const mainHref =
      main.href ||
      (children.length === 0 ? `/catalog?category=${main.id}` : undefined);
    return {
      ...main,
      href: mainHref,
      children,
    };
  });
}

export function listCatalog(db) {
  ensureProductCatalog(db);
  const sort = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0);
  const sortTree = (nodes) =>
    [...nodes]
      .sort(sort)
      .map((n) => ({
        ...n,
        children: n.children ? sortTree(n.children) : [],
      }));
  return {
    categoryTree: enrichTreeHrefs(sortTree(db.productCatalog.categoryTree)),
    sections: [...db.productCatalog.sections].sort(sort),
    filterCategories: [...db.productCatalog.filterCategories].sort(sort),
    filterFields: [...db.productCatalog.filterFields].sort(sort),
  };
}

export function slugFromLabel(label) {
  return (
    String(label || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9가-힣-]/g, "")
      .slice(0, 48) || `item-${Date.now()}`
  );
}

export function findMain(db, mainId) {
  ensureProductCatalog(db);
  return db.productCatalog.categoryTree.find((m) => m.id === mainId) || null;
}

export function findMid(db, mainId, midId) {
  const main = findMain(db, mainId);
  if (!main?.children) return null;
  return main.children.find((m) => m.id === midId) || null;
}

export function findSub(db, mainId, midId, subId) {
  const mid = findMid(db, mainId, midId);
  if (!mid?.children) return null;
  return mid.children.find((s) => s.id === subId) || null;
}

export function productsUsingCatalog(db, level, ids) {
  const { mainId, midId, subId } = ids;
  return db.products.filter((p) => {
    if (level === "main") return p.category === mainId;
    if (level === "mid") return p.category === mainId && p.categoryMid === midId;
    if (level === "sub") {
      return p.category === mainId && p.categoryMid === midId && p.categorySub === subId;
    }
    return false;
  });
}

export function migrateProductCatalogIds(db, level, ids, newId) {
  const { mainId, midId, subId } = ids;
  db.products.forEach((p) => {
    if (level === "main" && p.category === mainId) p.category = newId;
    if (level === "mid" && p.category === mainId && p.categoryMid === midId) {
      p.categoryMid = newId;
    }
    if (
      level === "sub" &&
      p.category === mainId &&
      p.categoryMid === midId &&
      p.categorySub === subId
    ) {
      p.categorySub = newId;
    }
  });
}

export function catalogField(type) {
  return type === "section" ? "section" : "category";
}

export function productsUsingSection(db, id) {
  return db.products.filter((p) => p.section === id);
}

export function productsUsingFilterCategory(db, id) {
  return db.products.filter((p) => p.category === id);
}

export function getFilterCategories(db) {
  ensureProductCatalog(db);
  return db.productCatalog.filterCategories;
}

export function getFilterFields(db) {
  ensureProductCatalog(db);
  return db.productCatalog.filterFields;
}
