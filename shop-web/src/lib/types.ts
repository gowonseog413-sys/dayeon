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
  stock?: number;
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
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type ReviewSummary = { average: number; count: number };

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
  points?: number;
  tier?: string;
};

export type AdminMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  address: string;
  role: "admin" | "customer";
  authProvider?: string;
  avatarUrl?: string | null;
  tier?: string;
  createdAt: string | null;
  points: number;
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

export type Order = {
  id: string;
  orderNumber?: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    brand: string;
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
  createdAt: string;
  user?: User;
};
