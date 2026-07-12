import { Router } from "express";
import { getCmsPageLocale } from "../cms-locales.js";
import { LEGAL_DOCS, LEGAL_LOCALES } from "../default-legal-content.js";
import { getSiteContent } from "../site-content.js";
import { PAGE_KEYS, SUPPORT_KEYS } from "../default-site-content.js";

const router = Router();

router.get("/legal/:doc", (req, res) => {
  const doc = req.params.doc;
  const locale = String(req.query.locale || "ko");
  if (!LEGAL_DOCS.includes(doc) || !LEGAL_LOCALES.includes(locale)) {
    return res.status(400).json({ error: "잘못된 요청" });
  }
  const content = getSiteContent();
  const entry = content.legal?.[doc]?.[locale];
  if (!entry?.html && !entry?.sections?.length) {
    return res.status(404).json({ error: "법적 문구 없음" });
  }
  res.json({ doc, locale, html: entry.html, sections: entry.sections });
});

router.get("/pages/:key", (req, res) => {
  const locale = String(req.query.locale || "ko");
  const content = getSiteContent();
  const key = req.params.key;
  if (!PAGE_KEYS.includes(key)) {
    return res.status(404).json({ error: "페이지 없음" });
  }
  const page = getCmsPageLocale(content.pages?.[key], locale);
  if (!page?.title) {
    return res.status(404).json({ error: "페이지 없음" });
  }
  res.json({ page, locale });
});

router.get("/support/:key", (req, res) => {
  const locale = String(req.query.locale || "ko");
  const content = getSiteContent();
  const key = req.params.key;
  if (!SUPPORT_KEYS.includes(key)) {
    return res.status(404).json({ error: "페이지 없음" });
  }
  const page = getCmsPageLocale(content.support?.[key], locale);
  if (!page?.title) {
    return res.status(404).json({ error: "페이지 없음" });
  }
  res.json({ page, locale });
});

export default router;
