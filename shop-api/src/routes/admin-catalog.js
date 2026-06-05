import { Router } from "express";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";
import {
  ensureProductCatalog,
  findMain,
  findMid,
  findSub,
  listCatalog,
  migrateProductCatalogIds,
  productsUsingCatalog,
  productsUsingSection,
  productsUsingFilterCategory,
  getFilterCategories,
  getFilterFields,
  slugFromLabel,
} from "../product-catalog.js";

const router = Router();
router.use(adminRequired);

router.get("/", (_req, res) => {
  res.json(listCatalog(readDb()));
});

router.get("/usage", (req, res) => {
  const level = String(req.query.level || "main");
  const mainId = String(req.query.mainId || "").trim();
  const midId = String(req.query.midId || "").trim();
  const subId = String(req.query.subId || "").trim();
  const type = req.query.type;

  const db = readDb();

  let products = [];
  if (type === "section") {
    const id = String(req.query.id || "").trim();
    products = productsUsingSection(db, id);
  } else if (level === "main" && mainId) {
    products = productsUsingCatalog(db, "main", { mainId });
  } else if (level === "mid" && mainId && midId) {
    products = productsUsingCatalog(db, "mid", { mainId, midId });
  } else if (level === "sub" && mainId && midId && subId) {
    products = productsUsingCatalog(db, "sub", { mainId, midId, subId });
  } else {
    return res.status(400).json({ error: "usage 파라미터가 올바르지 않습니다." });
  }

  res.json({
    count: products.length,
    products: products.map((p) => ({ id: p.id, brand: p.brand, name: p.name })),
  });
});

function usageBlock(level, products, action) {
  const verb = action === "delete" ? "삭제" : "수정";
  const levelLabel = level === "main" ? "대 카테고리" : level === "mid" ? "중 카테고리" : "소 카테고리";
  return {
    error: "IN_USE",
    count: products.length,
    products: products.map((p) => ({ id: p.id, brand: p.brand, name: p.name })),
    message: `현재 ${products.length}개 상품이 이 ${levelLabel}로 등록되어 있습니다. ${verb} 후 상품목록에서 확인해 주세요.`,
  };
}

function makeNode(body, list) {
  const label = String(body?.label || "").trim();
  if (!label) return { error: "LABEL_REQUIRED" };
  let id = String(body?.id || "").trim() || slugFromLabel(label);
  id = id.replace(/\s+/g, "-").toLowerCase();
  if (list.some((c) => c.id === id)) return { error: "DUPLICATE" };
  return {
    node: {
      id,
      label,
      sortOrder: Number(body?.sortOrder) || list.length + 1,
      href: body.href ? String(body.href).trim() : undefined,
      swatch: body.swatch ? String(body.swatch).trim() : undefined,
      children: [],
    },
  };
}

router.post("/tree/main", (req, res) => {
  let created = null;
  try {
    updateDb((d) => {
      ensureProductCatalog(d);
      const r = makeNode(req.body, d.productCatalog.categoryTree);
      if (r.error) throw Object.assign(new Error(r.error), { code: r.error });
      created = r.node;
      d.productCatalog.categoryTree.push(created);
    });
  } catch (e) {
    if (e.code === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
    if (e.code === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });
    throw e;
  }
  res.status(201).json({ item: created, ...listCatalog(readDb()) });
});

router.post("/tree/main/:mainId/mid", (req, res) => {
  let created = null;
  try {
    updateDb((d) => {
      ensureProductCatalog(d);
      const main = findMain(d, req.params.mainId);
      if (!main) throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
      if (!main.children) main.children = [];
      const r = makeNode(req.body, main.children);
      if (r.error) throw Object.assign(new Error(r.error), { code: r.error });
      created = r.node;
      main.children.push(created);
    });
  } catch (e) {
    if (e.code === "NOT_FOUND") return res.status(404).json({ error: "대 카테고리를 찾을 수 없습니다." });
    if (e.code === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
    if (e.code === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });
    throw e;
  }
  res.status(201).json({ item: created, ...listCatalog(readDb()) });
});

router.post("/tree/main/:mainId/mid/:midId/sub", (req, res) => {
  let created = null;
  try {
    updateDb((d) => {
      ensureProductCatalog(d);
      const mid = findMid(d, req.params.mainId, req.params.midId);
      if (!mid) throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
      if (!mid.children) mid.children = [];
      const r = makeNode(req.body, mid.children);
      if (r.error) throw Object.assign(new Error(r.error), { code: r.error });
      created = r.node;
      mid.children.push(created);
    });
  } catch (e) {
    if (e.code === "NOT_FOUND") return res.status(404).json({ error: "중 카테고리를 찾을 수 없습니다." });
    if (e.code === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
    if (e.code === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });
    throw e;
  }
  res.status(201).json({ item: created, ...listCatalog(readDb()) });
});

function updateNode(list, oldId, body, force, level, catalogIds) {
  const idx = list.findIndex((c) => c.id === oldId);
  if (idx === -1) return { error: "NOT_FOUND" };

  const label = String(body.label ?? list[idx].label).trim();
  const newId = String(body.newId || body.id || oldId).trim().toLowerCase();
  if (!label) return { error: "LABEL_REQUIRED" };
  if (newId !== oldId && list.some((c) => c.id === newId)) return { error: "DUPLICATE" };

  return { idx, label, newId, node: list[idx] };
}

router.put("/tree/main/:id", (req, res) => {
  const force = Boolean(req.body?.force);
  const db = readDb();
  const used = productsUsingCatalog(db, "main", { mainId: req.params.id });
  if (used.length > 0 && !force) {
    return res.status(409).json(usageBlock("main", used, "edit"));
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const r = updateNode(d.productCatalog.categoryTree, req.params.id, req.body, force, "main", {
      mainId: req.params.id,
    });
    if (r.error) {
      result = r;
      return;
    }
    const newId = r.newId;
    if (newId !== req.params.id) migrateProductCatalogIds(d, "main", { mainId: req.params.id }, newId);
    d.productCatalog.categoryTree[r.idx] = {
      ...r.node,
      id: newId,
      label: r.label,
      href: req.body.href !== undefined ? String(req.body.href || "").trim() || undefined : r.node.href,
      sortOrder: Number(req.body.sortOrder) || r.node.sortOrder,
    };
    result = { item: d.productCatalog.categoryTree[r.idx] };
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "대 카테고리를 찾을 수 없습니다." });
  if (result?.error === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
  if (result?.error === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });

  res.json({ ...result, ...listCatalog(readDb()) });
});

router.put("/tree/main/:mainId/mid/:midId", (req, res) => {
  const force = Boolean(req.body?.force);
  const db = readDb();
  const used = productsUsingCatalog(db, "mid", {
    mainId: req.params.mainId,
    midId: req.params.midId,
  });
  if (used.length > 0 && !force) {
    return res.status(409).json(usageBlock("mid", used, "edit"));
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const main = findMain(d, req.params.mainId);
    if (!main?.children) {
      result = { error: "NOT_FOUND" };
      return;
    }
    const r = updateNode(main.children, req.params.midId, req.body, force, "mid", {
      mainId: req.params.mainId,
      midId: req.params.midId,
    });
    if (r.error) {
      result = r;
      return;
    }
    const newId = r.newId;
    if (newId !== req.params.midId) {
      migrateProductCatalogIds(
        d,
        "mid",
        { mainId: req.params.mainId, midId: req.params.midId },
        newId,
      );
    }
    main.children[r.idx] = {
      ...r.node,
      id: newId,
      label: r.label,
      href: req.body.href !== undefined ? String(req.body.href || "").trim() || undefined : r.node.href,
      sortOrder: Number(req.body.sortOrder) || r.node.sortOrder,
    };
    result = { item: main.children[r.idx] };
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "중 카테고리를 찾을 수 없습니다." });
  if (result?.error === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
  if (result?.error === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });

  res.json({ ...result, ...listCatalog(readDb()) });
});

router.put("/tree/main/:mainId/mid/:midId/sub/:subId", (req, res) => {
  const force = Boolean(req.body?.force);
  const db = readDb();
  const used = productsUsingCatalog(db, "sub", {
    mainId: req.params.mainId,
    midId: req.params.midId,
    subId: req.params.subId,
  });
  if (used.length > 0 && !force) {
    return res.status(409).json(usageBlock("sub", used, "edit"));
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const mid = findMid(d, req.params.mainId, req.params.midId);
    if (!mid?.children) {
      result = { error: "NOT_FOUND" };
      return;
    }
    const r = updateNode(mid.children, req.params.subId, req.body, force, "sub", {
      mainId: req.params.mainId,
      midId: req.params.midId,
      subId: req.params.subId,
    });
    if (r.error) {
      result = r;
      return;
    }
    const newId = r.newId;
    if (newId !== req.params.subId) {
      migrateProductCatalogIds(
        d,
        "sub",
        { mainId: req.params.mainId, midId: req.params.midId, subId: req.params.subId },
        newId,
      );
    }
    mid.children[r.idx] = {
      ...r.node,
      id: newId,
      label: r.label,
      swatch: req.body.swatch !== undefined ? String(req.body.swatch || "").trim() || undefined : r.node.swatch,
      sortOrder: Number(req.body.sortOrder) || r.node.sortOrder,
    };
    result = { item: mid.children[r.idx] };
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "소 카테고리를 찾을 수 없습니다." });
  if (result?.error === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
  if (result?.error === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });

  res.json({ ...result, ...listCatalog(readDb()) });
});

function deleteFromList(list, id) {
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return { error: "NOT_FOUND" };
  list.splice(idx, 1);
  return { deleted: id };
}

router.delete("/tree/main/:id", (req, res) => {
  const force = req.query.force === "1" || req.query.force === "true";
  const db = readDb();
  const used = productsUsingCatalog(db, "main", { mainId: req.params.id });
  if (used.length > 0 && !force) {
    return res.status(409).json(usageBlock("main", used, "delete"));
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    result = deleteFromList(d.productCatalog.categoryTree, req.params.id);
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "대 카테고리를 찾을 수 없습니다." });
  res.json({ ok: true, ...result, ...listCatalog(readDb()) });
});

router.delete("/tree/main/:mainId/mid/:midId", (req, res) => {
  const force = req.query.force === "1" || req.query.force === "true";
  const db = readDb();
  const used = productsUsingCatalog(db, "mid", {
    mainId: req.params.mainId,
    midId: req.params.midId,
  });
  if (used.length > 0 && !force) {
    return res.status(409).json(usageBlock("mid", used, "delete"));
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const main = findMain(d, req.params.mainId);
    if (!main?.children) {
      result = { error: "NOT_FOUND" };
      return;
    }
    result = deleteFromList(main.children, req.params.midId);
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "중 카테고리를 찾을 수 없습니다." });
  res.json({ ok: true, ...result, ...listCatalog(readDb()) });
});

router.delete("/tree/main/:mainId/mid/:midId/sub/:subId", (req, res) => {
  const force = req.query.force === "1" || req.query.force === "true";
  const db = readDb();
  const used = productsUsingCatalog(db, "sub", {
    mainId: req.params.mainId,
    midId: req.params.midId,
    subId: req.params.subId,
  });
  if (used.length > 0 && !force) {
    return res.status(409).json(usageBlock("sub", used, "delete"));
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const mid = findMid(d, req.params.mainId, req.params.midId);
    if (!mid?.children) {
      result = { error: "NOT_FOUND" };
      return;
    }
    result = deleteFromList(mid.children, req.params.subId);
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "소 카테고리를 찾을 수 없습니다." });
  res.json({ ok: true, ...result, ...listCatalog(readDb()) });
});

/* 홈 섹션 (기존) */
function getSections(db) {
  ensureProductCatalog(db);
  return db.productCatalog.sections;
}

router.post("/sections", (req, res) => {
  const label = String(req.body?.label || "").trim();
  if (!label) return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
  let id = String(req.body?.id || "").trim() || slugFromLabel(label);
  id = id.replace(/\s+/g, "-").toLowerCase();

  let created = null;
  try {
    updateDb((d) => {
      ensureProductCatalog(d);
      const list = getSections(d);
      if (list.some((s) => s.id === id)) throw Object.assign(new Error("DUPLICATE"), { code: "DUPLICATE" });
      created = { id, label, sortOrder: Number(req.body?.sortOrder) || list.length + 1 };
      list.push(created);
    });
  } catch (e) {
    if (e.code === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 섹션 코드입니다." });
    throw e;
  }
  res.status(201).json({ item: created, ...listCatalog(readDb()) });
});

router.put("/sections/:id", (req, res) => {
  const force = Boolean(req.body?.force);
  const db = readDb();
  const used = productsUsingSection(db, req.params.id);
  if (used.length > 0 && !force) {
    return res.status(409).json({
      error: "IN_USE",
      count: used.length,
      products: used.map((p) => ({ id: p.id, brand: p.brand, name: p.name })),
      message: `현재 ${used.length}개 상품이 이 홈 섹션으로 등록되어 있습니다. 수정 후 상품목록에서 확인해 주세요.`,
    });
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const list = getSections(d);
    const r = updateNode(list, req.params.id, req.body, force, "section", {});
    if (r.error) {
      result = r;
      return;
    }
    const newId = r.newId;
    if (newId !== req.params.id) {
      d.products.forEach((p) => {
        if (p.section === req.params.id) p.section = newId;
      });
    }
    list[r.idx] = { ...r.node, id: newId, label: r.label };
    result = { item: list[r.idx] };
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "섹션을 찾을 수 없습니다." });
  if (result?.error === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
  if (result?.error === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });

  res.json({ ...result, ...listCatalog(readDb()) });
});

router.delete("/sections/:id", (req, res) => {
  const force = req.query.force === "1" || req.query.force === "true";
  const db = readDb();
  const used = productsUsingSection(db, req.params.id);
  if (used.length > 0 && !force) {
    return res.status(409).json({
      error: "IN_USE",
      count: used.length,
      products: used.map((p) => ({ id: p.id, brand: p.brand, name: p.name })),
      message: `현재 ${used.length}개 상품이 이 홈 섹션으로 등록되어 있습니다. 삭제 후 상품목록에서 확인해 주세요.`,
    });
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    result = deleteFromList(getSections(d), req.params.id);
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "섹션을 찾을 수 없습니다." });
  res.json({ ok: true, ...result, ...listCatalog(readDb()) });
});

/* 필터 카데고리 (쇼핑몰 좌측 프레임) */
router.post("/filter-categories", (req, res) => {
  const label = String(req.body?.label || "").trim();
  if (!label) return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
  let id = String(req.body?.id || "").trim() || slugFromLabel(label);
  id = id.replace(/\s+/g, "-").toLowerCase();

  let created = null;
  try {
    updateDb((d) => {
      ensureProductCatalog(d);
      const list = getFilterCategories(d);
      if (list.some((s) => s.id === id)) throw Object.assign(new Error("DUPLICATE"), { code: "DUPLICATE" });
      created = { id, label, sortOrder: Number(req.body?.sortOrder) || list.length + 1 };
      list.push(created);
    });
  } catch (e) {
    if (e.code === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });
    throw e;
  }
  res.status(201).json({ item: created, ...listCatalog(readDb()) });
});

router.put("/filter-categories/:id", (req, res) => {
  const force = Boolean(req.body?.force);
  const db = readDb();
  const used = productsUsingFilterCategory(db, req.params.id);
  if (used.length > 0 && !force) {
    return res.status(409).json({
      error: "IN_USE",
      count: used.length,
      products: used.map((p) => ({ id: p.id, brand: p.brand, name: p.name })),
      message: `현재 ${used.length}개 상품이 이 필터 카테고리로 등록되어 있습니다. 수정 후 상품목록에서 확인해 주세요.`,
    });
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const list = getFilterCategories(d);
    const r = updateNode(list, req.params.id, req.body, force, "filterCategory", {});
    if (r.error) {
      result = r;
      return;
    }
    const newId = r.newId;
    if (newId !== req.params.id) {
      d.products.forEach((p) => {
        if (p.category === req.params.id) p.category = newId;
      });
    }
    list[r.idx] = { ...r.node, id: newId, label: r.label };
    result = { item: list[r.idx] };
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "필터 카테고리를 찾을 수 없습니다." });
  if (result?.error === "LABEL_REQUIRED") return res.status(400).json({ error: "표시 이름을 입력해 주세요." });
  if (result?.error === "DUPLICATE") return res.status(400).json({ error: "이미 사용 중인 코드입니다." });

  res.json({ ...result, ...listCatalog(readDb()) });
});

router.delete("/filter-categories/:id", (req, res) => {
  const force = req.query.force === "1" || req.query.force === "true";
  const db = readDb();
  const used = productsUsingFilterCategory(db, req.params.id);
  if (used.length > 0 && !force) {
    return res.status(409).json({
      error: "IN_USE",
      count: used.length,
      products: used.map((p) => ({ id: p.id, brand: p.brand, name: p.name })),
      message: `현재 ${used.length}개 상품이 이 필터 카테고리로 등록되어 있습니다. 삭제 후 상품목록에서 확인해 주세요.`,
    });
  }

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    result = deleteFromList(getFilterCategories(d), req.params.id);
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "필터 카테고리를 찾을 수 없습니다." });
  res.json({ ok: true, ...result, ...listCatalog(readDb()) });
});

/* 필터 항목 라벨 (코드 고정, 표시명만 수정) */
router.put("/filter-fields/:id", (req, res) => {
  const label = String(req.body?.label || "").trim();
  if (!label) return res.status(400).json({ error: "표시 이름을 입력해 주세요." });

  let result = null;
  updateDb((d) => {
    ensureProductCatalog(d);
    const list = getFilterFields(d);
    const idx = list.findIndex((f) => f.id === req.params.id);
    if (idx === -1) {
      result = { error: "NOT_FOUND" };
      return;
    }
    list[idx] = { ...list[idx], label };
    result = { item: list[idx] };
  });

  if (result?.error === "NOT_FOUND") return res.status(404).json({ error: "필터 항목을 찾을 수 없습니다." });
  res.json({ ...result, ...listCatalog(readDb()) });
});

export default router;
