import { Router } from "express";
import { readDb } from "../db.js";
import { normalizeSiteTheme } from "../site-theme.js";

const router = Router();

function getTheme(db) {
  return normalizeSiteTheme(db.settings?.theme);
}

router.get("/theme", (_req, res) => {
  const db = readDb();
  res.json({ theme: getTheme(db) });
});

export default router;
