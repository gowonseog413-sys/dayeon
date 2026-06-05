/** ERP·쇼핑몰 기본 문구 (db.siteContent 비어 있을 때 사용) */
export const DEFAULT_SITE_CONTENT = {
  pages: {
    about: {
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
    careers: {
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
    eyeCoin: {
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
          paragraphs: ["100 코인 = Rp 10,000", "1회 최대 1,000코인까지 사용 가능"],
        },
      ],
    },
  },
  support: {
    faq: {
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
    shipping: {
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
    returns: {
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
    contact: {
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
  },
};

export const PAGE_KEYS = ["about", "careers", "eyeCoin"];
export const SUPPORT_KEYS = ["faq", "shipping", "returns", "contact"];
