import type { Locale } from "./messages";

type SectionIn = { heading: string; paragraphs: readonly string[] };
type Section = { heading: string; paragraphs: string[] };
type Page = { title: string; sections: Section[]; email?: string };

export type StaticPageKey = keyof typeof PAGES;
export type StaticSupportKey = keyof typeof SUPPORT_PAGES;

function clonePage(p: { title: string; sections: readonly SectionIn[]; email?: string }): Page {
  return {
    title: p.title,
    email: p.email,
    sections: p.sections.map((s) => ({
      heading: s.heading,
      paragraphs: [...s.paragraphs],
    })),
  };
}

export function getStaticPage(page: StaticPageKey, locale: Locale): Page {
  return clonePage(PAGES[page][locale]);
}

export function getStaticSupport(page: StaticSupportKey, locale: Locale): Page {
  return clonePage(SUPPORT_PAGES[page][locale]);
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

const SUPPORT_PAGES = {
  faq: {
    ko: {
      title: "자주 묻는 질문 (FAQ)",
      sections: [
        {
          heading: "렌즈 착용 팁",
          paragraphs: [
            "손을 깨끗이 씻은 뒤 렌즈를 착용하세요.",
            "하루 착용 시간을 지키고, 불편하면 즉시 착용을 중단하세요.",
          ],
        },
        {
          heading: "솔루션 사용",
          paragraphs: ["다목적 솔루션으로 충분히 세척·보관하세요.", "개봉 후 사용 기한을 확인하세요."],
        },
      ],
    },
    en: {
      title: "FAQ",
      sections: [
        {
          heading: "Lens wearing tips",
          paragraphs: [
            "Wash your hands before handling lenses.",
            "Follow daily wear time limits and stop if you feel discomfort.",
          ],
        },
        {
          heading: "Using solution",
          paragraphs: [
            "Clean and store lenses with multipurpose solution.",
            "Check the expiry date after opening.",
          ],
        },
      ],
    },
    id: {
      title: "FAQ",
      sections: [
        {
          heading: "Tips pemakaian lensa",
          paragraphs: [
            "Cuci tangan sebelum memasang lensa.",
            "Patuhi batas waktu pemakaian harian; hentikan jika tidak nyaman.",
          ],
        },
        {
          heading: "Penggunaan cairan",
          paragraphs: [
            "Bersihkan dan simpan lensa dengan cairan multipurpose.",
            "Periksa tanggal kedaluwarsa setelah dibuka.",
          ],
        },
      ],
    },
  },
  shipping: {
    ko: {
      title: "배송 정보",
      sections: [
        {
          heading: "배송 업체",
          paragraphs: ["Sicepat · JNE · Anter Aja · JNT"],
        },
        {
          heading: "배송 기간",
          paragraphs: [
            "자카르타 권역: 영업일 기준 2–5일",
            "기타 지역: 3–7일 (지역에 따라 상이)",
          ],
        },
      ],
    },
    en: {
      title: "Shipping Info",
      sections: [
        {
          heading: "Carriers",
          paragraphs: ["Sicepat · JNE · Anter Aja · JNT"],
        },
        {
          heading: "Delivery time",
          paragraphs: [
            "Jakarta area: 2–5 business days",
            "Other regions: 3–7 days (varies by location)",
          ],
        },
      ],
    },
    id: {
      title: "Info Pengiriman",
      sections: [
        {
          heading: "Kurir",
          paragraphs: ["Sicepat · JNE · Anter Aja · JNT"],
        },
        {
          heading: "Estimasi waktu",
          paragraphs: [
            "Area Jakarta: 2–5 hari kerja",
            "Wilayah lain: 3–7 hari (tergantung lokasi)",
          ],
        },
      ],
    },
  },
  returns: {
    ko: {
      title: "교환/반품 안내",
      sections: [
        {
          heading: "교환·환불 안내",
          paragraphs: [
            "미개봉 제품에 한해 수령 후 7일 이내 교환·환불이 가능합니다.",
            "개봉된 렌즈·솔루션은 위생상 교환·환불이 불가합니다.",
          ],
        },
        {
          heading: "제조 결함",
          paragraphs: ["제조 결함이 확인되면 개봉 영상과 함께 고객센터로 문의해 주세요."],
        },
      ],
    },
    en: {
      title: "Returns & Exchanges",
      sections: [
        {
          heading: "Exchange & refund",
          paragraphs: [
            "Unopened items may be exchanged or refunded within 7 days of delivery.",
            "Opened lenses and solutions cannot be returned for hygiene reasons.",
          ],
        },
        {
          heading: "Manufacturing defects",
          paragraphs: [
            "If a defect is confirmed, contact customer service with an unboxing video.",
          ],
        },
      ],
    },
    id: {
      title: "Tukar & Retur",
      sections: [
        {
          heading: "Penukaran & refund",
          paragraphs: [
            "Produk belum dibuka dapat ditukar/direfund dalam 7 hari setelah diterima.",
            "Lensa/cairan yang sudah dibuka tidak dapat ditukar karena alasan higienis.",
          ],
        },
        {
          heading: "Cacat produksi",
          paragraphs: [
            "Jika cacat produksi terkonfirmasi, hubungi CS dengan video unboxing.",
          ],
        },
      ],
    },
  },
  contact: {
    ko: {
      title: "1:1 문의하기",
      email: "help@dayeon.shop",
      sections: [
        {
          heading: "고객센터",
          paragraphs: [
            "이메일: help@dayeon.shop",
            "운영 시간: 평일 09:00–18:00 (WIB)",
            "주말·공휴일 문의는 순차적으로 답변드립니다.",
          ],
        },
      ],
    },
    en: {
      title: "Contact Us",
      email: "help@dayeon.shop",
      sections: [
        {
          heading: "Customer service",
          paragraphs: [
            "Email: help@dayeon.shop",
            "Hours: Mon–Fri 09:00–18:00 (WIB)",
            "Weekend and holiday inquiries are answered in order.",
          ],
        },
      ],
    },
    id: {
      title: "Hubungi Kami",
      email: "help@dayeon.shop",
      sections: [
        {
          heading: "Layanan pelanggan",
          paragraphs: [
            "Email: help@dayeon.shop",
            "Jam operasional: Sen–Jum 09:00–18:00 (WIB)",
            "Pertanyaan akhir pekan/libur dijawab secara berurutan.",
          ],
        },
      ],
    },
  },
} as const;
