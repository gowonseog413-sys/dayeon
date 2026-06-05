import { readDb, writeDb } from "./db.js";

const extra = [
  {
    id: "art-5",
    slug: "bloominc-daily-lens-guide",
    title: "블루밍크 데일리 렌즈: 처음 착용하는 분을 위한 가이드",
    excerpt: "그레이·브라운 데일리 렌즈 선택부터 착용 시간까지 초보자용 안내.",
    content: `블루밍크 시리즈는 자연스러운 발색으로 인기가 많습니다.`,
    category: "beauty-lifestyle",
    image: "/articles/article-date-tips.png",
    published: true,
    createdAt: "2026-04-25T10:00:00.000Z",
    updatedAt: "2026-04-25T10:00:00.000Z",
  },
  {
    id: "art-6",
    slug: "spring-2026-lens-trends",
    title: "2026 봄 렌즈 트렌드: 부드러운 브라운 & 애쉬 그레이",
    excerpt: "올봄 눈에 띄는 컬러 트렌드와 메이크업 매칭 팁을 정리했습니다.",
    content: `2026년 봄에는 애쉬 그레이와 허니 브라운이 트렌드입니다.`,
    category: "tips",
    image: "/articles/article-eyemin-picks.png",
    published: true,
    createdAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-04-18T10:00:00.000Z",
  },
];

const db = readDb();
if (!db.articles) db.articles = [];
let added = 0;
for (const a of extra) {
  if (!db.articles.some((x) => x.id === a.id)) {
    db.articles.push(a);
    added++;
  }
}
writeDb(db);
console.log(`Articles extra: +${added}, total ${db.articles.length}`);
