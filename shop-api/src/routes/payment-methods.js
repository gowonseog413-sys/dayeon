import { Router } from "express";
import { readDb } from "../db.js";
import { listEnabledChannels } from "../payment-methods.js";

const router = Router();

router.get("/", (_req, res) => {
  const channels = listEnabledChannels(readDb());
  res.json({ channels });
});

export default router;
