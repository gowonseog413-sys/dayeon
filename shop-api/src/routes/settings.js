import { Router } from "express";
import { readDb } from "../db.js";
import { ensureMemberSettings } from "../member-settings.js";
import { getIndexBanner } from "../index-banner.js";
import { getPartnerBanners } from "../partner-banners.js";
import { getSocialChannels } from "../social-channels.js";
import { getHeroBanners } from "../hero-banners.js";
import { isMotionEnabled, normalizeThemeMotion } from "../site-theme-motion.js";
import { normalizeSiteTheme } from "../site-theme.js";

const router = Router();

function getThemeSettings(db) {
  const theme = normalizeSiteTheme(db.settings?.theme);
  const themeMotion = normalizeThemeMotion(db.settings?.themeMotion);
  return {
    theme,
    themeMotion,
    motionEnabled: isMotionEnabled(themeMotion, theme),
  };
}

router.get("/theme", (_req, res) => {
  const db = readDb();
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json(getThemeSettings(db));
});

router.get("/index-banner", (_req, res) => {
  const db = readDb();
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ indexBanner: getIndexBanner(db) });
});

router.get("/partner-banners", (_req, res) => {
  const db = readDb();
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ partnerBanners: getPartnerBanners(db) });
});

router.get("/social-channels", (_req, res) => {
  const db = readDb();
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ socialChannels: getSocialChannels(db) });
});

router.get("/hero-banners", (_req, res) => {
  const db = readDb();
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ heroBanners: getHeroBanners(db) });
});

router.get("/review-reward", (_req, res) => {
  const db = readDb();
  ensureMemberSettings(db);
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ reviewReward: db.settings.reviewReward });
});

router.get("/member-tiers", (_req, res) => {
  const db = readDb();
  ensureMemberSettings(db);
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({
    settings: db.settings.points,
    signupBonus: { enabled: db.settings.signupBonus?.enabled !== false },
  });
});

export default router;
