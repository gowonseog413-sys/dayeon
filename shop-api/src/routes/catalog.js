import { Router } from "express";
import { readDb } from "../db.js";
import { listCatalog } from "../product-catalog.js";

const router = Router();

/** 쇼핑몰 헤더·필터 — ERP 카테고리 트리와 동일 */
router.get("/", (_req, res) => {
  res.json(listCatalog(readDb()));
});

export default router;
