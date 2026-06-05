import { readDb, updateDb } from "./db.js";
import { DEFAULT_SITE_CONTENT } from "./default-site-content.js";

const db = readDb();
if (!db.siteContent?.pages) {
  updateDb((d) => {
    d.siteContent = structuredClone(DEFAULT_SITE_CONTENT);
  });
  console.log("siteContent CMS seeded");
} else {
  console.log("siteContent already exists — skip");
}
