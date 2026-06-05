export type PaymentChannelType = "credit_card" | "gopay" | "virtual_account";

export type PaymentChannel = {
  id: string;
  type: PaymentChannelType;
  nameKo: string;
  nameId: string;
  descriptionKo: string;
  descriptionId: string;
  jubelioCode: string;
  enabled: boolean;
  sortOrder: number;
  vaBanks: string[];
};

export type PaymentProfile = {
  id: string;
  userId: string;
  channelType: PaymentChannelType;
  label: string;
  isDefault: boolean;
  cardBrand?: string;
  cardLast4?: string;
  cardHolder?: string;
  expiryMonth?: string;
  expiryYear?: string;
  gopayPhone?: string;
  vaBank?: string;
  createdAt: string;
  updatedAt: string;
};

export const CHANNEL_TYPE_LABEL: Record<PaymentChannelType, string> = {
  credit_card: "신용카드",
  gopay: "GoPay",
  virtual_account: "가상계좌",
};

export const CARD_BRANDS = [
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
  { id: "jcb", label: "JCB" },
];

export const VA_BANKS = ["BCA", "Mandiri", "BNI", "BRI", "Permata"];

export function profileSummary(p: PaymentProfile) {
  if (p.channelType === "credit_card") {
    const brand = p.cardBrand?.toUpperCase() || "CARD";
    return `${brand} ·••• ${p.cardLast4} (${p.cardHolder})`;
  }
  if (p.channelType === "gopay") return `GoPay ${p.gopayPhone}`;
  if (p.channelType === "virtual_account") return `VA ${p.vaBank}`;
  return p.label;
}

const LEGACY_PAYMENT_LABEL: Record<string, string> = {
  bank_transfer: "무통장 입금",
  cod: "착불 (COD)",
};

export function orderPaymentLabel(method?: string) {
  if (!method) return "결제수단 미지정";
  if (method in CHANNEL_TYPE_LABEL) {
    return CHANNEL_TYPE_LABEL[method as PaymentChannelType];
  }
  return LEGACY_PAYMENT_LABEL[method] || method;
}
