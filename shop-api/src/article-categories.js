export const DEFAULT_ARTICLE_CATEGORIES = [
  { id: "beauty-lifestyle", label: "뷰티 및 라이프스타일" },
  { id: "community", label: "커뮤니티" },
  { id: "reviews", label: "리뷰" },
  { id: "tips", label: "팁과 요령" },
];

function slugId(text) {
  return (
    String(text || "")
      .toLowerCase()
      .replace(/[^\w\s-가-힣]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 48) || "category"
  );
}

export function ensureArticleCategories(db) {
  if (!Array.isArray(db.articleCategories) || db.articleCategories.length === 0) {
    db.articleCategories = DEFAULT_ARTICLE_CATEGORIES.map((c, order) => ({ ...c, order }));
  }
}

export function listArticleCategories(db) {
  ensureArticleCategories(db);
  return db.articleCategories
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label, "ko"));
}

export function articleCategoryMap(db) {
  const map = {};
  for (const c of listArticleCategories(db)) map[c.id] = c.label;
  return map;
}

export function countArticlesInCategory(db, categoryId) {
  return (db.articles || []).filter((a) => a.category === categoryId).length;
}

export function createArticleCategory(db, { label, id }) {
  ensureArticleCategories(db);
  const name = String(label || "").trim();
  if (!name) throw new Error("카테고리 이름을 입력해 주세요.");

  let nextId = String(id || "").trim() || slugId(name);
  if (db.articleCategories.some((c) => c.id === nextId)) {
    nextId = `${nextId}-${Date.now().toString(36)}`;
  }

  const item = {
    id: nextId,
    label: name,
    order: db.articleCategories.length,
  };
  db.articleCategories.push(item);
  return item;
}

export function updateArticleCategory(db, id, { label, newId }) {
  ensureArticleCategories(db);
  const item = db.articleCategories.find((c) => c.id === id);
  if (!item) return null;

  if (label !== undefined) {
    const name = String(label || "").trim();
    if (!name) throw new Error("카테고리 이름을 입력해 주세요.");
    item.label = name;
  }

  if (newId && newId !== id) {
    const nextId = String(newId).trim();
    if (!nextId) throw new Error("카테고리 ID가 올바르지 않습니다.");
    if (db.articleCategories.some((c) => c.id === nextId)) {
      throw new Error("이미 사용 중인 카테고리 ID입니다.");
    }
    for (const article of db.articles || []) {
      if (article.category === id) article.category = nextId;
    }
    item.id = nextId;
  }

  return item;
}

export function deleteArticleCategory(db, id, { reassignTo } = {}) {
  ensureArticleCategories(db);
  if (db.articleCategories.length <= 1) {
    throw new Error("마지막 카테고리는 삭제할 수 없습니다.");
  }

  const used = countArticlesInCategory(db, id);
  if (used > 0) {
    const target = String(reassignTo || "").trim();
    if (!target || target === id) {
      const err = new Error("이 카테고리를 사용하는 게시물이 있습니다.");
      err.code = "IN_USE";
      err.count = used;
      throw err;
    }
    if (!db.articleCategories.some((c) => c.id === target)) {
      throw new Error("이동할 카테고리를 찾을 수 없습니다.");
    }
    for (const article of db.articles || []) {
      if (article.category === id) article.category = target;
    }
  }

  const before = db.articleCategories.length;
  db.articleCategories = db.articleCategories.filter((c) => c.id !== id);
  return db.articleCategories.length < before;
}
