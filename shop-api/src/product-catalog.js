/** 상품 카테고리 트리(대·중·소) + 홈 섹션 */

export const DEFAULT_CATEGORY_TREE = [
  {
    id: "contact-lenses",
    label: "컬러렌즈",
    sortOrder: 1,
    children: [
      {
        id: "all",
        label: "전체 렌즈 보기",
        sortOrder: 1,
        href: "/catalog?category=contact-lenses",
        children: [],
      },
      {
        id: "brand",
        label: "브랜드로 보기",
        sortOrder: 2,
        children: [
          { id: "bloominc", label: "Bloominc", sortOrder: 1 },
          { id: "eyesm", label: "Eyesm", sortOrder: 2 },
          { id: "eos", label: "EOS", sortOrder: 3 },
          { id: "kitty-kawaii", label: "키티 카와이", sortOrder: 4 },
          { id: "princess", label: "공주", sortOrder: 5 },
        ],
      },
      {
        id: "look",
        label: "스타일로 보기",
        sortOrder: 3,
        children: [
          { id: "natural", label: "자연스러운 눈빛", sortOrder: 1 },
          { id: "no-ring", label: "링 없는 렌즈", sortOrder: 2 },
          { id: "with-ring", label: "또렷한 링 효과", sortOrder: 3 },
          { id: "big-eye", label: "또렷한 눈매", sortOrder: 4 },
          { id: "wedding", label: "웨딩·특별한 날", sortOrder: 5 },
          { id: "bright", label: "환한 눈빛", sortOrder: 6 },
          { id: "sensitive", label: "민감한 눈용", sortOrder: 7 },
        ],
      },
      {
        id: "color",
        label: "컬러로 보기",
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
        label: "직경으로 보기",
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
    label: "케어·용품",
    sortOrder: 2,
    children: [
      { id: "drops", label: "인공눈물·안약", sortOrder: 1, href: "/catalog?category=solutions&sub=drops", children: [] },
      { id: "mps", label: "렌즈 세척액", sortOrder: 2, href: "/catalog?category=solutions&sub=mps", children: [] },
      { id: "travel", label: "휴대용 키트", sortOrder: 3, href: "/catalog?category=accessories&sub=travel", children: [] },
      { id: "cleaner", label: "렌즈 세정용품", sortOrder: 4, href: "/catalog?category=accessories&sub=cleaner", children: [] },
    ],
  },
  {
    id: "new-arrivals",
    label: "신상품",
    sortOrder: 3,
    href: "/catalog?section=best-seller",
    children: [],
  },
  {
    id: "bundles",
    label: "알뜰 세트",
    sortOrder: 4,
    href: "/catalog?category=bundles",
    children: [],
  },
  {
    id: "bloominc",
    label: "다연 추천",
    sortOrder: 5,
    href: "/catalog?section=bloominc",
    children: [],
  },
];

export const DEFAULT_PRODUCT_SECTIONS = [
  { id: "bloominc", label: "다연 추천", sortOrder: 1 },
  { id: "best-seller", label: "베스트 · 신상", sortOrder: 2 },
  { id: "solutions", label: "렌즈 케어", sortOrder: 3 },
  { id: "accessories", label: "렌즈 용품", sortOrder: 4 },
  { id: "bundles", label: "알뜰 세트", sortOrder: 5 },
];

/** 쇼핑몰 좌측 프레임(프레임왼쪽 카데고리) 필터 카테고리 */
export const DEFAULT_FILTER_CATEGORIES = [
  { id: "contact-lenses", label: "컬러렌즈", sortOrder: 1 },
  { id: "solutions", label: "렌즈 케어", sortOrder: 2 },
  { id: "accessories", label: "렌즈 용품", sortOrder: 3 },
  { id: "bundles", label: "알뜰 세트", sortOrder: 4 },
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

/** 카테고리 외 필터 항목별 드롭다운 옵션 (category는 filterCategories 사용) */
export const FILTER_OPTION_FIELD_IDS = [
  "brand",
  "color",
  "diameter",
  "waterContent",
  "prescription",
  "baseCurve",
  "lifespan",
];

export const DEFAULT_FILTER_FIELD_OPTIONS = {
  brand: [
    { id: "Bio True", label: "Bio True", sortOrder: 1 },
    { id: "Bloominc", label: "Bloominc", sortOrder: 2 },
    { id: "Bundle Accessories", label: "Bundle Accessories", sortOrder: 3 },
    { id: "Clear Care", label: "Clear Care", sortOrder: 4 },
    { id: "Eyesm", label: "Eyesm", sortOrder: 5 },
    { id: "Lens Care", label: "Lens Care", sortOrder: 6 },
    { id: "Opti-Free", label: "Opti-Free", sortOrder: 7 },
    { id: "Renu", label: "Renu", sortOrder: 8 },
    { id: "Rohto", label: "Rohto", sortOrder: 9 },
    { id: "Soft Drops", label: "Soft Drops", sortOrder: 10 },
  ],
  color: [
    { id: "almond", label: "아몬드", sortOrder: 1 },
    { id: "black", label: "검정", sortOrder: 2 },
    { id: "brown", label: "브라운", sortOrder: 3 },
    { id: "choco", label: "초코", sortOrder: 4 },
    { id: "gray", label: "그레이", sortOrder: 5 },
    { id: "clear", label: "클리어", sortOrder: 6 },
  ],
  diameter: [
    { id: "14.0", label: "14.00 mm", sortOrder: 1 },
    { id: "14.2", label: "14.20 mm", sortOrder: 2 },
    { id: "14.5", label: "14.50 mm", sortOrder: 3 },
  ],
  waterContent: [
    { id: "48", label: "48%", sortOrder: 1 },
    { id: "55", label: "55%", sortOrder: 2 },
    { id: "58", label: "58%", sortOrder: 3 },
  ],
  prescription: [
    { id: "normal", label: "일반", sortOrder: 1 },
    { id: "myopia", label: "근시", sortOrder: 2 },
  ],
  baseCurve: [
    { id: "8.6", label: "8.60 mm", sortOrder: 1 },
    { id: "8.7", label: "8.70 mm", sortOrder: 2 },
    { id: "8.8", label: "8.80 mm", sortOrder: 3 },
  ],
  lifespan: [
    { id: "daily", label: "일일", sortOrder: 1 },
    { id: "1month", label: "1개월", sortOrder: 2 },
    { id: "3months", label: "3개월", sortOrder: 3 },
    { id: "6months", label: "6개월", sortOrder: 4 },
    { id: "1year", label: "1년", sortOrder: 5 },
  ],
};

function ensureFilterFieldOptions(db) {
  if (!db.productCatalog.filterFieldOptions || typeof db.productCatalog.filterFieldOptions !== "object") {
    db.productCatalog.filterFieldOptions = {};
  }
  for (const fieldId of FILTER_OPTION_FIELD_IDS) {
    const list = db.productCatalog.filterFieldOptions[fieldId];
    if (!Array.isArray(list) || list.length === 0) {
      db.productCatalog.filterFieldOptions[fieldId] = (DEFAULT_FILTER_FIELD_OPTIONS[fieldId] || []).map(
        (s) => ({ ...s }),
      );
    }
  }
}

function cloneTree(nodes) {
  return nodes.map((n) => ({
    ...n,
    children: Array.isArray(n.children) ? cloneTree(n.children) : [],
  }));
}

function labelMapFromTree(nodes, map = new Map()) {
  for (const n of nodes || []) {
    if (n.id && n.label) map.set(n.id, n.label);
    labelMapFromTree(n.children, map);
  }
  return map;
}

/** 기본 문구 변경 시 기존 DB 라벨도 id 기준으로 동기화 */
function syncDisplayLabels(db) {
  const treeLabels = labelMapFromTree(DEFAULT_CATEGORY_TREE);
  const walk = (nodes) => {
    for (const n of nodes || []) {
      const next = treeLabels.get(n.id);
      if (next) n.label = next;
      walk(n.children);
    }
  };
  walk(db.productCatalog.categoryTree);

  const sectionLabels = new Map(DEFAULT_PRODUCT_SECTIONS.map((s) => [s.id, s.label]));
  for (const s of db.productCatalog.sections || []) {
    const next = sectionLabels.get(s.id);
    if (next) s.label = next;
  }

  const filterLabels = new Map(DEFAULT_FILTER_CATEGORIES.map((c) => [c.id, c.label]));
  for (const c of db.productCatalog.filterCategories || []) {
    const next = filterLabels.get(c.id);
    if (next) c.label = next;
  }
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
  ensureFilterFieldOptions(db);
  syncDisplayLabels(db);
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
  const filterFieldOptions = {};
  for (const fieldId of FILTER_OPTION_FIELD_IDS) {
    filterFieldOptions[fieldId] = [...(db.productCatalog.filterFieldOptions[fieldId] || [])].sort(sort);
  }
  return {
    categoryTree: enrichTreeHrefs(sortTree(db.productCatalog.categoryTree)),
    sections: [...db.productCatalog.sections].sort(sort),
    filterCategories: [...db.productCatalog.filterCategories].sort(sort),
    filterFields: [...db.productCatalog.filterFields].sort(sort),
    filterFieldOptions,
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

export function getFilterFieldOptions(db, fieldId) {
  ensureProductCatalog(db);
  if (!FILTER_OPTION_FIELD_IDS.includes(fieldId)) return null;
  return db.productCatalog.filterFieldOptions[fieldId];
}

export function productsUsingFilterOption(db, fieldId, optionId) {
  return db.products.filter((p) => {
    if (fieldId === "brand") return p.brand === optionId;
    const cat = p.catalog;
    if (!cat) return false;
    if (fieldId === "color") return cat.colorFamily === optionId;
    return cat[fieldId] === optionId;
  });
}

export function migrateFilterOptionId(db, fieldId, oldId, newId, label) {
  db.products.forEach((p) => {
    if (fieldId === "brand") {
      if (p.brand === oldId) p.brand = label || newId;
      return;
    }
    if (!p.catalog) return;
    if (fieldId === "color") {
      if (p.catalog.colorFamily === oldId) p.catalog.colorFamily = newId;
    } else if (p.catalog[fieldId] === oldId) {
      p.catalog[fieldId] = newId;
    }
  });
}

export function countFilterFieldOptions(db, fieldId) {
  ensureProductCatalog(db);
  if (fieldId === "category") return getFilterCategories(db).length;
  if (FILTER_OPTION_FIELD_IDS.includes(fieldId)) {
    return (getFilterFieldOptions(db, fieldId) || []).length;
  }
  return 0;
}

/** 필터 항목(브랜드·카테고리 등)에 연결된 상품 */
export function productsUsingFilterField(db, fieldId) {
  ensureProductCatalog(db);
  const seen = new Set();
  const out = [];

  const push = (list) => {
    for (const p of list) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    }
  };

  if (fieldId === "category") {
    for (const cat of getFilterCategories(db)) {
      push(productsUsingFilterCategory(db, cat.id));
    }
    return out;
  }

  if (FILTER_OPTION_FIELD_IDS.includes(fieldId)) {
    const options = getFilterFieldOptions(db, fieldId) || [];
    for (const opt of options) {
      push(productsUsingFilterOption(db, fieldId, opt.id));
    }
    return out;
  }

  return out;
}

export function deleteFilterFieldCascade(db, fieldId) {
  ensureProductCatalog(db);
  const fields = getFilterFields(db);
  const idx = fields.findIndex((f) => f.id === fieldId);
  if (idx === -1) return { error: "NOT_FOUND" };

  const removedOptions = countFilterFieldOptions(db, fieldId);
  const products = productsUsingFilterField(db, fieldId);
  const removeIds = new Set(products.map((p) => p.id));
  db.products = db.products.filter((p) => !removeIds.has(p.id));

  if (fieldId === "category") {
    db.productCatalog.filterCategories = [];
  } else if (FILTER_OPTION_FIELD_IDS.includes(fieldId)) {
    db.productCatalog.filterFieldOptions[fieldId] = [];
  }

  fields.splice(idx, 1);
  return {
    deleted: fieldId,
    removedProducts: removeIds.size,
    removedOptions,
  };
}
