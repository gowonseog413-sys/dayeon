import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
import { adminRequired } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "shop-web", "public", "uploads");

const router = Router();
router.use(adminRequired);

router.post("/", (req, res) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl || typeof dataUrl !== "string") {
    return res.status(400).json({ error: "이미지 데이터가 없습니다." });
  }
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: "PNG/JPG/WebP 이미지만 업로드할 수 있습니다." });
  }
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const buf = Buffer.from(match[2], "base64");
  if (buf.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: "파일 크기는 5MB 이하여야 합니다." });
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const safe =
    (filename || "upload")
      .replace(/[^a-zA-Z0-9._-가-힣]/g, "-")
      .slice(0, 40) || "upload";
  const name = `${safe}-${Date.now().toString(36)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, name);
  fs.writeFileSync(filePath, buf);

  res.status(201).json({ url: `/uploads/${name}` });
});

export default router;
