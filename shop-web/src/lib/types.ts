export type ProductImage = { url: string; alt: string };

export type ProductColor = { id: string; label: string; swatch: string };

export type ProductCatalogMeta = {
  colorFamily?: string;
  look?: string;
  diameter?: string;
  waterContent?: string;
  baseCurve?: string;
  lifespan?: string;
  prescription?: string;
  sub?: string;
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  categoryMid?: string;
  categorySub?: string;
  section: string;
  priceOriginal: number;
  priceSale: number;
  /** ERP 할인혜택 % — 판매가는 할인 적용 후 금액(청구서) */
  discountPercent?: number;
  stock?: number;
  /** false = 구매 시 포인트 미적립 (기본 true) */
  pointsEnabled?: boolean;
  /** true = 배송비 부과, false = 무료배송 */
  shippingFeeCharged?: boolean;
  shippingFeeAmount?: number;
  badge: string | null;
  image: string;
  colorSwatch: string;
  description?: string;
  images?: ProductImage[];
  colors?: ProductColor[];
  powers?: string[];
  detailDescription?: string;
  additionalInfo?: string;
  shippingInfo?: string;
  catalog?: ProductCatalogMeta;
  createdAt?: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  orderId?: string | null;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
  productName?: string;
  productBrand?: string;
  productImage?: string | null;
  pointsAwarded?: number;
  pointsAwardedAt?: string;
  userEmail?: string;
  adminManaged?: boolean;
};

export type ReviewableItem = {
  productId: string;
  name: string;
  brand: string;
  image?: string | null;
  orderId: string;
  orderNumber?: string;
  deliveredAt: string;
};

export type ReviewSummary = { average: number; count: number };

export type ShippingAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "customer";
  authProvider?: "local" | "google" | "facebook";
  avatarUrl?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  address?: string | null;
  shippingAddress?: ShippingAddress | null;
  addressSameAsShipping?: boolean;
  points?: number;
  tier?: "bronze" | "silver" | "gold" | "diamond" | string;
  profileComplete?: boolean;
};

export type AdminMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  birthDate?: string | null;
  address: string;
  role: "admin" | "customer";
  authProvider?: string;
  avatarUrl?: string | null;
  tier?: string;
  createdAt: string | null;
  points: number;
  pointsUsed: number;
  lastLoginAt: string | null;
  loginCount: number;
  totalPurchaseAmount: number;
  purchaseCount: number;
  cartCount: number;
  paymentProfileCount: number;
};

export type AdminUsersPage = {
  users: AdminMember[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type AdminCartProduct = Pick<
  Product,
  "id" | "brand" | "name" | "image" | "priceSale"
>;

export type AdminCartLine = {
  id?: string;
  productId: string;
  quantity: number;
  savedAt?: string | null;
  product: AdminCartProduct | null;
};

export type AdminUserCart = {
  items: AdminCartLine[];
  total: number;
  updatedAt: string | null;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  categoryLabel?: string;
  image: string;
  published?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  savedAt: string;
  product?: Product;
};

export type WishlistItem = {
  id: string;
  productId: string;
  savedAt: string;
  product?: Product;
};

export type Order = {
  id: string;
  orderNumber?: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    brand: string;
    image?: string | null;
    priceSale: number;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal?: number;
  shippingFee?: number;
  total: number;
  shipping?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod?: string;
  paymentProfileId?: string;
  paymentLabel?: string;
  jubelioCode?: string;
  paymentStatus?: string;
  status: string;
  shippedAt?: string | null;
  completedAt?: string | null;
  autoCompleted?: boolean;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  returnStatus?: "requested" | "approved" | "completed" | "rejected" | null;
  returnReason?: string | null;
  returnRequestedAt?: string | null;
  returnApprovedAt?: string | null;
  returnCompletedAt?: string | null;
  returnRejectedAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: "user" | "admin" | null;
  createdAt: string;
  user?: User;
};

export type EventPopup = {
  id: string;
  title: string;
  content: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InquiryCategory = "order" | "delivery" | "return" | "product" | "other";

export type InquiryStatus = "pending" | "answered";

export type InquiryReply = {
  id: string;
  authorRole: "customer" | "admin";
  body: string;
  createdAt: string;
};

export type Inquiry = {
  id: string;
  userId: string;
  category: InquiryCategory;
  subject: string;
  body: string;
  status: InquiryStatus;
  orderId?: string | null;
  userName: string;
  userEmail: string;
  userPhone: string;
  createdAt: string;
  updatedAt: string;
  userReadAt?: string | null;
  replies: InquiryReply[];
};
