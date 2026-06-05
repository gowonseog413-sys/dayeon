import { Router } from "express";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";
import { DEFAULT_LEGAL, LEGAL_DOCS, LEGAL_LOCALES } from "../default-legal-content.js";
import {
  DEFAULT_SITE_CONTENT,
  PAGE_KEYS,
  SUPPORT_KEYS,
} from "../default-site-content.js";
import { ensureSiteContent, getSiteContent } from "../site-content.js";

function normalizeLegalSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.map((s) => ({
    heading: String(s.heading || "").trim(),
    paragraphs: Array.isArray(s.paragraphs)
      ? s.paragraphs.map((p) => String(p).trim()).filter(Boolean)
      : [],
    list: Array.isArray(s.list) ? s.list.map((p) => String(p).trim()).filter(Boolean) : undefined,
  }));
}

const router = Router();
router.use(adminRequired);

router.get("/", (_req, res) => {
  ensureSiteContent();
  res.json({ siteContent: getSiteContent() });
});

router.put("/pages/:key", (req, res) => {
  if (!PAGE_KEYS.includes(req.params.key)) {
    return res.status(400).json({ error: "잘못된 페이지 키" });
  }
  const { title, sections, html } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: "제목을 입력해 주세요." });
  }
  updateDb((d) => {
    if (!d.siteContent) d.siteContent = structuredClone(DEFAULT_SITE_CONTENT);
    const prev = d.siteContent.pages[req.params.key] || {};
    d.siteContent.pages[req.params.key] = {
      ...prev,
      title: title.trim(),
      ...(html !== undefined
        ? { html: String(html), sections: [] }
        : { sections: Array.isArray(sections) ? sections : prev.sections || [] }),
    };
  });
  res.json({ page: getSiteContent().pages[req.params.key] });
});

router.put("/legal/:doc/:locale", (req, res) => {
  const { doc, locale } = req.params;
  if (!LEGAL_DOCS.includes(doc) || !LEGAL_LOCALES.includes(locale)) {
    return res.status(400).json({ error: "잘못된 법적 문서 또는 언어" });
  }
  const { sections, html } = req.body;
  updateDb((d) => {
    if (!d.siteContent) d.siteContent = structuredClone(DEFAULT_SITE_CONTENT);
    if (!d.siteContent.legal) d.siteContent.legal = structuredClone(DEFAULT_LEGAL);
    if (!d.siteContent.legal[doc]) d.siteContent.legal[doc] = structuredClone(DEFAULT_LEGAL[doc]);
    const prev = d.siteContent.legal[doc][locale] || {};
    d.siteContent.legal[doc][locale] = {
      ...prev,
      ...(html !== undefined
        ? { html: String(html), sections: [] }
        : { sections: normalizeLegalSections(sections) }),
    };
  });
  const saved = getSiteContent().legal[doc][locale];
  res.json({ doc, locale, html: saved.html, sections: saved.sections });
});

router.put("/support/:key", (req, res) => {
  if (!SUPPORT_KEYS.includes(req.params.key)) {
    return res.status(400).json({ error: "잘못된 지원 페이지 키" });
  }
  const { title, sections, html, email } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: "제목을 입력해 주세요." });
  }
  updateDb((d) => {
    if (!d.siteContent) d.siteContent = structuredClone(DEFAULT_SITE_CONTENT);
    const prev = d.siteContent.support[req.params.key] || {};
    d.siteContent.support[req.params.key] = {
      ...prev,
      title: title.trim(),
      ...(html !== undefined
        ? { html: String(html), sections: [] }
        : { sections: Array.isArray(sections) ? sections : prev.sections || [] }),
      ...(req.params.key === "contact" && email !== undefined ? { email: String(email).trim() } : {}),
    };
  });
  res.json({ page: getSiteContent().support[req.params.key] });
});

router.post("/reset", (_req, res) => {
  updateDb((d) => {
    d.siteContent = structuredClone(DEFAULT_SITE_CONTENT);
  });
  res.json({ siteContent: getSiteContent() });
});

export default router;
