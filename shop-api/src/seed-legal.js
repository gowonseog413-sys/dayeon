import { readDb, updateDb } from "./db.js";
import { DEFAULT_LEGAL } from "./default-legal-content.js";

const db = readDb();
if (!db.siteContent?.legal?.terms?.ko?.sections?.length) {
  updateDb((d) => {
    if (!d.siteContent) d.siteContent = {};
    d.siteContent.legal = structuredClone(DEFAULT_LEGAL);
  });
  console.log("siteContent.legal seeded from i18n defaults");
} else {
  console.log("siteContent.legal already exists — skip");
}
