import type { Locale } from "./messages";

type Section = { heading: string; paragraphs: string[] };
type Page = { title: string; sections: Section[] };

export type StaticPageKey = keyof typeof PAGES;

export function getStaticPage(page: StaticPageKey, locale: Locale): Page {
  const p = PAGES[page][locale];
  return {
    title: p.title,
    sections: p.sections.map((s) => ({
      heading: s.heading,
      paragraphs: [...s.paragraphs],
    })),
  };
}

const PAGES = {
  about: {
    ko: {
      title: "브랜드 스토리",
      sections: [
        {
          heading: "",
          paragraphs: [
            "dayeon은 인도네시아 스타일을 참고한 온라인 렌즈 전문 쇼핑몰입니다.",
            "고객이 자신만의 스타일을 표현하고 자신감 있게 빛날 수 있도록 돕는 것이 우리의 목표입니다.",
          ],
        },
        {
          heading: "당신의 건강을 생각하세요",
          paragraphs: ["눈 건강이 최우선이며, 안전 기준을 충족하는 제품과 케어 정보를 제공합니다."],
        },
        {
          heading: "일상적인 눈동자 색깔에 아름다움을 더해줍니다.",
          paragraphs: ["데일리 렌즈부터 특별한 날을 위한 컬러 렌즈까지 다양한 선택지를 제공합니다."],
        },
      ],
    },
    en: {
      title: "About Us",
      sections: [
        {
          heading: "",
          paragraphs: [
            "dayeon is an online contact lens and lens-care store.",
            "We help customers express their style with confidence.",
          ],
        },
        {
          heading: "Your eye health matters",
          paragraphs: ["Eye health comes first — safe products and care guides."],
        },
        {
          heading: "Beauty for everyday eyes",
          paragraphs: ["From daily lenses to special-day colors, many choices await."],
        },
      ],
    },
    id: {
      title: "Tentang Kami",
      sections: [
        {
          heading: "",
          paragraphs: [
            "dayeon adalah toko lensa kontak dan perawatan lensa online.",
            "Kami membantu pelanggan tampil percaya diri dengan gaya mereka.",
          ],
        },
        {
          heading: "Kesehatan mata Anda penting",
          paragraphs: ["Kesehatan mata prioritas — produk aman dan panduan perawatan."],
        },
        {
          heading: "Kecantikan untuk mata sehari-hari",
          paragraphs: ["Dari lensa harian hingga warna untuk hari spesial."],
        },
      ],
    },
  },
  careers: {
    ko: {
      title: "채용 안내",
      sections: [
        {
          heading: "",
          paragraphs: [
            "dayeon과 함께 성장할 인재를 기다립니다.",
            "CV와 포트폴리오를 help@dayeon.shop 으로 보내 주세요.",
          ],
        },
      ],
    },
    en: {
      title: "Careers",
      sections: [
        {
          heading: "",
          paragraphs: [
            "Join the dayeon team.",
            "Send your CV and portfolio to help@dayeon.shop.",
          ],
        },
      ],
    },
    id: {
      title: "Karier",
      sections: [
        {
          heading: "",
          paragraphs: [
            "Bergabung dengan tim dayeon.",
            "Kirim CV dan portofolio ke help@dayeon.shop.",
          ],
        },
      ],
    },
  },
  terms: {
    ko: {
      title: "이용약관",
      sections: [
        {
          heading: "이용약관",
          paragraphs: [
            "본 약관은 dayeon 쇼핑몰 서비스 이용 조건을 규정합니다.",
            "서비스 이용 시 본 약관에 동의한 것으로 간주됩니다.",
          ],
        },
      ],
    },
    en: {
      title: "Terms of Use",
      sections: [
        {
          heading: "Terms of Use",
          paragraphs: [
            "These terms govern use of the dayeon online store.",
            "By using the service you agree to these terms.",
          ],
        },
      ],
    },
    id: {
      title: "Syarat Penggunaan",
      sections: [
        {
          heading: "Syarat Penggunaan",
          paragraphs: [
            "Syarat ini mengatur penggunaan toko online dayeon.",
            "Dengan menggunakan layanan, Anda dianggap setuju.",
          ],
        },
      ],
    },
  },
  privacy: {
    ko: {
      title: "개인정보처리방침",
      sections: [
        {
          heading: "dayeon 개인정보처리방침",
          paragraphs: ["dayeon은 이용자의 개인정보 보호를 매우 중요하게 생각합니다."],
        },
        {
          heading: "개인정보는 언제 처리되나요?",
          paragraphs: [
            "• 동의 · 계약 이행 · 서비스 개선 · 법적 의무",
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      sections: [
        {
          heading: "dayeon Privacy Policy",
          paragraphs: ["We take your personal data protection seriously."],
        },
        {
          heading: "When we process data",
          paragraphs: ["• Consent · Contract · Legitimate interest · Legal obligation"],
        },
      ],
    },
    id: {
      title: "Kebijakan Privasi",
      sections: [
        {
          heading: "Kebijakan Privasi dayeon",
          paragraphs: ["Kami sangat menjaga privasi data pribadi Anda."],
        },
        {
          heading: "Kapan data diproses",
          paragraphs: ["• Persetujuan · Kontrak · Kepentingan sah · Kewajiban hukum"],
        },
      ],
    },
  },
  eyeCoin: {
    ko: {
      title: "멤버십/적립금 혜택",
      sections: [
        {
          heading: "아이코인 획득 방법",
          paragraphs: [
            "• 주문: IDR 50,000 지출 시 +10 코인",
            "• 뷰티 프로필 완성: +150 코인",
            "• 리뷰 작성: +5 코인",
          ],
        },
        {
          heading: "아이코인 사용 방법",
          paragraphs: [
            "100 코인 = Rp 10,000",
            "1회 최대 1,000코인까지 사용 가능",
          ],
        },
      ],
    },
    en: {
      title: "Eye Coins",
      sections: [
        {
          heading: "How to earn",
          paragraphs: [
            "• Order: +10 coins per IDR 50,000 spent",
            "• Complete beauty profile: +150 coins",
            "• Write a review: +5 coins",
          ],
        },
        {
          heading: "How to use",
          paragraphs: ["100 coins = Rp 10,000", "Max 1,000 coins per order"],
        },
      ],
    },
    id: {
      title: "Eye Coins",
      sections: [
        {
          heading: "Cara mendapatkan",
          paragraphs: [
            "• Belanja: +10 koin per IDR 50.000",
            "• Profil kecantikan lengkap: +150 koin",
            "• Tulis review: +5 koin",
          ],
        },
        {
          heading: "Cara menggunakan",
          paragraphs: ["100 koin = Rp 10.000", "Maks 1.000 koin per pesanan"],
        },
      ],
    },
  },
} as const;
