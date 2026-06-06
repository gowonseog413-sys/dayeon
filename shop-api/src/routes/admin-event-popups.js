import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readDb, updateDb } from "../db.js";
import { adminRequired } from "../middleware/auth.js";
import {
  formatEventSchedule,
  getEventPopupStatus,
  isEventPopupActive,
  normalizeEventTime,
} from "../event-popup-schedule.js";

const router = Router();
router.use(adminRequired);

function parseDate(raw, fallback) {
  const v = (raw || "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return fallback;
  return v;
}

router.get("/", (_req, res) => {
  const popups = (readDb().eventPopups || []).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  res.json({ popups });
});

router.post("/", (req, res) => {
  const title = req.body?.title?.trim();
  const content = req.body?.content?.trim();
  if (!title) return res.status(400).json({ error: "제목을 입력해 주세요." });
  if (!content) return res.status(400).json({ error: "안내 내용을 입력해 주세요." });

  const today = new Date().toISOString().slice(0, 10);
  const popup = {
    id: uuid(),
    title,
    content,
    startDate: parseDate(req.body.startDate, today),
    startTime: normalizeEventTime(req.body.startTime, "00:00"),
    endDate: parseDate(req.body.endDate, today),
    endTime: normalizeEventTime(req.body.endTime, "23:59"),
    enabled: req.body.enabled !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updateDb((d) => {
    if (!d.eventPopups) d.eventPopups = [];
    d.eventPopups.push(popup);
  });

  res.status(201).json({ popup });
});

router.put("/:id", (req, res) => {
  let updated = null;
  updateDb((d) => {
    if (!d.eventPopups) d.eventPopups = [];
    const idx = d.eventPopups.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return;
    const prev = d.eventPopups[idx];
    d.eventPopups[idx] = {
      ...prev,
      title: req.body.title?.trim() ?? prev.title,
      content: req.body.content?.trim() ?? prev.content,
      startDate:
        req.body.startDate !== undefined
          ? parseDate(req.body.startDate, prev.startDate)
          : prev.startDate,
      startTime:
        req.body.startTime !== undefined
          ? normalizeEventTime(req.body.startTime, prev.startTime || "00:00")
          : prev.startTime || "00:00",
      endDate:
        req.body.endDate !== undefined
          ? parseDate(req.body.endDate, prev.endDate)
          : prev.endDate,
      endTime:
        req.body.endTime !== undefined
          ? normalizeEventTime(req.body.endTime, prev.endTime || "23:59")
          : prev.endTime || "23:59",
      enabled:
        req.body.enabled !== undefined ? Boolean(req.body.enabled) : prev.enabled,
      updatedAt: new Date().toISOString(),
    };
    updated = d.eventPopups[idx];
  });
  if (!updated) return res.status(404).json({ error: "팝업 없음" });
  res.json({ popup: updated });
});

router.delete("/:id", (req, res) => {
  let found = false;
  updateDb((d) => {
    if (!d.eventPopups) d.eventPopups = [];
    const before = d.eventPopups.length;
    d.eventPopups = d.eventPopups.filter((p) => p.id !== req.params.id);
    found = d.eventPopups.length < before;
  });
  if (!found) return res.status(404).json({ error: "팝업 없음" });
  res.json({ ok: true });
});

router.get("/:id/status", (req, res) => {
  const popup = (readDb().eventPopups || []).find((p) => p.id === req.params.id);
  if (!popup) return res.status(404).json({ error: "팝업 없음" });
  res.json({
    active: isEventPopupActive(popup),
    status: getEventPopupStatus(popup),
    schedule: formatEventSchedule(popup),
  });
});

export default router;
