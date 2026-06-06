import { Router } from "express";
import { readDb } from "../db.js";
import { isEventPopupActive } from "../event-popup-schedule.js";
import { resolveVisitorTimezone } from "../visitor-timezone.js";

export { isEventPopupActive } from "../event-popup-schedule.js";

const router = Router();

router.get("/", async (req, res) => {
  const { country, timezone } = await resolveVisitorTimezone(req);
  const popups = (readDb().eventPopups || [])
    .filter((p) => p.enabled && isEventPopupActive(p, new Date(), timezone))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ popups, timezone, country });
});

export default router;
