import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "./app.js";
import { bootstrapDb } from "./bootstrap.js";

let app;
let booted = false;

async function getApp() {
  if (!booted) {
    await bootstrapDb();
    app = createApp();
    booted = true;
  }
  return app;
}

/** Firebase Cloud Functions — Hosting /api/** rewrite 대상 */
export const shopApi = onRequest(
  {
    region: "asia-northeast3",
    memory: "512MiB",
    timeoutSeconds: 60,
    invoker: "public",
  },
  async (req, res) => {
    const expressApp = await getApp();
    return expressApp(req, res);
  },
);
