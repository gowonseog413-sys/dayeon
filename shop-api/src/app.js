import express from "express";
import cors from "cors";
import { readDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import articleRoutes from "./routes/articles.js";
import adminArticleRoutes from "./routes/admin-articles.js";
import adminContentRoutes from "./routes/admin-content.js";
import adminUploadRoutes from "./routes/admin-upload.js";
import contentRoutes from "./routes/content.js";
import settingsRoutes from "./routes/settings.js";
import cartRoutes from "./routes/cart.js";
import paymentMethodsRoutes from "./routes/payment-methods.js";
import paymentProfilesRoutes from "./routes/payment-profiles.js";
import adminPaymentsRoutes from "./routes/admin-payments.js";
import adminCatalogRoutes from "./routes/admin-catalog.js";
import catalogRoutes from "./routes/catalog.js";

export function createApp() {
  const app = express();
  const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3600")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || corsOrigins.includes(origin)) cb(null, true);
        else cb(null, corsOrigins[0]);
      },
    }),
  );
  app.use(express.json({ limit: "8mb" }));

  app.get("/api/health", (_req, res) => {
    const db = readDb();
    res.json({
      ok: true,
      products: db.products.length,
      users: db.users.length,
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/catalog", catalogRoutes);
  app.use("/api/payment-methods", paymentMethodsRoutes);
  app.use("/api/payment-profiles", paymentProfilesRoutes);
  app.use("/api/admin/payments", adminPaymentsRoutes);
  app.use("/api/admin/catalog", adminCatalogRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/articles", articleRoutes);
  app.use("/api/admin/articles", adminArticleRoutes);
  app.use("/api/admin/content", adminContentRoutes);
  app.use("/api/admin/upload", adminUploadRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/settings", settingsRoutes);

  return app;
}
