/**
 * Firebase 배포 사이트(dayeon-shop.web.app)의 공개 API 설정을 로컬 db.json에 반영
 * - 소스코드는 Firebase에서 내려받을 수 없음 (배포는 단방향)
 * - 상품·후기·회원 등 전체 DB는 관리자 API 필요 → 여기서는 공개 settings만 동기화
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "shop-api", "data", "db.json");
const BASE = process.env.PROD_API_URL || "https://dayeon-shop.web.app/api";

const SETTINGS_ENDPOINTS = [
  "settings/theme",
  "settings/partner-banners",
  "settings/hero-banners",
  "settings/index-banner",
  "settings/social-channels",
  "settings/review-reward",
  "settings/member-tiers",
  "settings/referral",
];

async function fetchJson(pathname) {
  const res = await fetch(`${BASE}/${pathname}`);
  if (!res.ok) throw new Error(`${pathname} → HTTP ${res.status}`);
  return res.json();
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    return {
      users: [],
      products: [],
      orders: [],
      settings: {},
    };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function applyPayload(db, data) {
  if (!db.settings) db.settings = {};

  if (data.partnerBanners) db.settings.partnerBanners = data.partnerBanners;
  if (data.heroBanners) db.settings.heroBanners = data.heroBanners;
  if (data.indexBanner) db.settings.indexBanner = data.indexBanner;
  if (data.socialChannels) db.settings.socialChannels = data.socialChannels;
  if (data.theme) db.settings.theme = data.theme;
  if (data.themeMotion) db.settings.themeMotion = data.themeMotion;
  if (data.reviewReward) db.settings.reviewReward = data.reviewReward;
  if (data.settings) db.settings.points = data.settings;
  if (data.signupBonus) {
    db.settings.signupBonus = {
      ...(db.settings.signupBonus || {}),
      ...data.signupBonus,
    };
  }
  if (data.enabled !== undefined && data.refereeReward !== undefined) {
    db.settings.referral = {
      enabled: data.enabled,
      refereeReward: data.refereeReward,
      referrerReward: data.referrerReward,
    };
  }
}

async function main() {
  console.log(`Firebase 설정 동기화: ${BASE}`);
  const db = loadDb();
  let ok = 0;
  let fail = 0;

  for (const ep of SETTINGS_ENDPOINTS) {
    try {
      const data = await fetchJson(ep);
      applyPayload(db, data);
      console.log(`  OK  ${ep}`);
      ok += 1;
    } catch (err) {
      console.log(`  SKIP ${ep} (${err.message})`);
      fail += 1;
    }
  }

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  console.log(`\n저장: ${DB_PATH}`);
  console.log(`완료: ${ok}건 반영, ${fail}건 건너뜀`);
  console.log("※ 전체 DB(후기·회원·주문)는 Firebase에서 자동 pull 불가 — ERP에서 재입력 또는 백업 필요");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
