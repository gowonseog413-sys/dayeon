import { readDb, writeDb } from "./db.js";

const articles = [
  {
    id: "art-1",
    slug: "first-date-dos-and-donts",
    title:
      "첫 데이트 할 것과 하지 말아야 할 것: 작은 노력으로 큰 인상을 남기는 방법!",
    excerpt:
      "첫 만남에서 자연스럽게 매력을 보여주는 방법을 정리했습니다. 렌즈 선택부터 대화 매너까지.",
    content: `첫 데이트는 작은 디테일이 인상을 좌우합니다.\n\n## 렌즈 선택\n자연스러운 그레이·브라운 톤이 데일리로 인기 있습니다.\n\n## 대화 매너\n상대의 눈을 부담 없이 바라보고, 밝은 표정을 유지해 보세요.\n\n## 마무리\n무리한 연출보다 편안한 자신감이 가장 큰 매력입니다.`,
    category: "beauty-lifestyle",
    image: "/articles/article-date-tips.png",
    published: true,
    createdAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: "art-2",
    slug: "eyemin-favorite-picks",
    title: "아이민의 리뷰: '우리의 최애 추천'",
    excerpt:
      "EYESIGHT 팀이 직접 착용해 본 블루밍크·Eyesm 렌즈 베스트 픽을 소개합니다.",
    content: `이번 리뷰에서는 팀원들이 실제로 착용한 렌즈를 공유합니다.\n\n## 1위 Bluebell Gray\n은은한 그레이 톤으로 데일리 메이크업과 잘 어울립니다.\n\n## 2위 Posy Choco\n따뜻한 초코 브라운으로 분위기 있는 룩에 추천합니다.\n\n## 3위 Ocher Brown\n자연광에서도 부담 없는 브라운 컬러입니다.`,
    category: "reviews",
    image: "/articles/article-eyemin-picks.png",
    published: true,
    createdAt: "2026-05-15T10:00:00.000Z",
    updatedAt: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "art-3",
    slug: "lens-care-tips-summer",
    title: "여름철 렌즈 관리 팁: 촉촉함을 오래 유지하는 방법",
    excerpt: "더운 날씨에도 편안한 착용감을 위한 솔루션·드롭 사용 가이드.",
    content: `여름에는 눈의 건조함이 더 쉽게 느껴질 수 있습니다.\n\n- 하루 착용 시간을 지켜 주세요.\n- 공기가 건조한 실내에서는 드롭을 수시로 사용하세요.\n- 렌즈 케이스는 매일 세척·건조하세요.`,
    category: "tips",
    image: "/articles/article-summer-care.png",
    published: true,
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "art-4",
    slug: "community-welcome",
    title: "EYESIGHT 커뮤니티에 오신 것을 환영합니다",
    excerpt: "렌즈 후기와 뷰티 팁을 나누는 커뮤니티 공간을 소개합니다.",
    content: `EYESIGHT 커뮤니티는 렌즈 착용 경험을 나누는 공간입니다.\n\n리뷰, 질문, 팁을 자유롭게 공유해 주세요.`,
    category: "community",
    image: "/articles/article-community.png",
    published: true,
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "art-5",
    slug: "bloominc-daily-lens-guide",
    title: "블루밍크 데일리 렌즈: 처음 착용하는 분을 위한 가이드",
    excerpt: "그레이·브라운 데일리 렌즈 선택부터 착용 시간까지 초보자용 안내.",
    content: `블루밍크 시리즈는 자연스러운 발색으로 인기가 많습니다.\n\n## 첫 착용\n8시간 이내로 시작하고 점차 시간을 늘려 보세요.\n\n## 관리\n전용 솔루션으로 세척·보관하세요.`,
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
    content: `2026년 봄에는 애쉬 그레이와 허니 브라운이 트렌드입니다.\n\n- 데일리: 은은한 그레이\n- 데이트: 따뜻한 브라운\n- 포토: 빅 아이 효과는 과하지 않은 직경 선택`,
    category: "tips",
    image: "/articles/article-eyemin-picks.png",
    published: true,
    createdAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-04-18T10:00:00.000Z",
  },
];

const db = readDb();
if (!db.articles) db.articles = [];
if (db.articles.length === 0) {
  db.articles = articles;
  writeDb(db);
  console.log(`Seeded ${articles.length} articles`);
} else {
  console.log(`Articles already exist (${db.articles.length}), skip seed`);
}
