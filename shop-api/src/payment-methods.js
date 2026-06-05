/** 인도네시아 + Jubelio 연동 기본 결제 채널 */
export const DEFAULT_PAYMENT_CHANNELS = [
  {
    id: "ch-credit-card",
    type: "credit_card",
    nameKo: "신용카드",
    nameId: "Kartu Kredit",
    descriptionKo: "Visa, Mastercard 등 신용·체크카드 결제 (Midtrans/Jubelio 연동)",
    descriptionId: "Kartu kredit/debit Visa, Mastercard via Midtrans & Jubelio",
    jubelioCode: "CC_MIDTRANS",
    enabled: true,
    sortOrder: 1,
    vaBanks: [],
  },
  {
    id: "ch-gopay",
    type: "gopay",
    nameKo: "GoPay",
    nameId: "GoPay",
    descriptionKo: "충전식 전자지갑 · QR/앱 결제 (Jubelio e-wallet 채널)",
    descriptionId: "Dompet digital prabayar · bayar via aplikasi GoPay",
    jubelioCode: "EW_GOPAY",
    enabled: true,
    sortOrder: 2,
    vaBanks: [],
  },
  {
    id: "ch-virtual-account",
    type: "virtual_account",
    nameKo: "가상계좌 입금",
    nameId: "Transfer Virtual Account",
    descriptionKo: "BCA·Mandiri·BNI·BRI 가상계좌로 입금 후 주문 확정",
    descriptionId: "Transfer ke VA BCA, Mandiri, BNI, BRI — konfirmasi otomatis Jubelio",
    jubelioCode: "VA_TRANSFER",
    enabled: true,
    sortOrder: 3,
    vaBanks: ["BCA", "Mandiri", "BNI", "BRI"],
  },
];

export const VA_BANKS = ["BCA", "Mandiri", "BNI", "BRI", "Permata"];

export function ensurePaymentChannels(db) {
  if (!Array.isArray(db.paymentChannels) || db.paymentChannels.length === 0) {
    db.paymentChannels = DEFAULT_PAYMENT_CHANNELS.map((c) => ({ ...c }));
  }
  if (!Array.isArray(db.paymentProfiles)) db.paymentProfiles = [];
}

export function listEnabledChannels(db) {
  ensurePaymentChannels(db);
  return [...db.paymentChannels]
    .filter((c) => c.enabled)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function maskProfile(profile) {
  const base = {
    id: profile.id,
    userId: profile.userId,
    channelType: profile.channelType,
    label: profile.label,
    isDefault: Boolean(profile.isDefault),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
  if (profile.channelType === "credit_card") {
    return {
      ...base,
      cardBrand: profile.cardBrand || "",
      cardLast4: profile.cardLast4 || "",
      cardHolder: profile.cardHolder || "",
      expiryMonth: profile.expiryMonth || "",
      expiryYear: profile.expiryYear || "",
    };
  }
  if (profile.channelType === "gopay") {
    return { ...base, gopayPhone: profile.gopayPhone || "" };
  }
  if (profile.channelType === "virtual_account") {
    return { ...base, vaBank: profile.vaBank || "" };
  }
  return base;
}
