import { readDb, writeDb } from "./db.js";

const TEMPLATES = [
  { suffix: "a", userName: "Rina", rating: 5, daysAgo: 30 },
  { suffix: "b", userName: "Dewi", rating: 4, daysAgo: 14 },
  { suffix: "c", userName: "Maya", rating: 3, daysAgo: 5 },
];

const CONTENTS = {
  "contact-lenses": [
    "색감이 자연스럽고 데일리로 쓰기 좋아요.",
    "착용감이 편해요. 하루 종일 촉촉합니다.",
    "배송은 빨랐는데 도수 선택을 다시 확인할게요.",
  ],
  solutions: [
    "눈이 시원해지는 느낌이에요. 재구매 예정!",
    "용량 대비 가성비 좋습니다.",
    "포장 상태 좋았어요. 사용법 안내도 도움됐습니다.",
  ],
  accessories: [
    "디자인이 귀엽고 실용적이에요.",
    "여행용으로 딱 좋아요. 튼튼합니다.",
    "가격 대비 만족해요. 선물용으로도 괜찮아요.",
  ],
  bundles: [
    "번들 구성이 알차서 한 번에 샀어요.",
    "개별 구매보다 저렴해서 추천합니다.",
    "구성품 설명이 더 있었으면 좋겠어요.",
  ],
};

function reviewTexts(category) {
  return CONTENTS[category] || CONTENTS.accessories;
}

const db = readDb();
if (!db.reviews) db.reviews = [];
db.reviews = db.reviews.filter((r) => !["rev-1", "rev-2"].includes(r.id));

let added = 0;
for (const product of db.products) {
  const texts = reviewTexts(product.category);
  for (let i = 0; i < 3; i++) {
    const t = TEMPLATES[i];
    const id = `rev-${product.id}-${t.suffix}`;
    if (db.reviews.some((r) => r.id === id)) continue;
    const d = new Date();
    d.setDate(d.getDate() - t.daysAgo - i);
    db.reviews.push({
      id,
      productId: product.id,
      userId: "seed",
      userName: t.userName,
      rating: t.rating,
      content: `${product.name}: ${texts[i]}`,
      createdAt: d.toISOString(),
    });
    added++;
  }
}

writeDb(db);
console.log(`Reviews seeded: ${added} added, total ${db.reviews.length}`);
