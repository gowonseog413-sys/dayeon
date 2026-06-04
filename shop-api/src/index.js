import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3001")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const db = readDb();
  res.json({
    ok: true,
    products: db.products.length,
    users: db.users.length,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

const dbPath = path.join(__dirname, "..", "data", "db.json");
if (!fs.existsSync(dbPath) || readDb().products.length === 0) {
  console.log("DB empty — run: npm run seed");
}

app.listen(PORT, () => {
  console.log(`shop-api http://localhost:${PORT}`);
});
