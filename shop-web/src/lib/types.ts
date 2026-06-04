export type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  section: string;
  priceOriginal: number;
  priceSale: number;
  badge: string | null;
  image: string;
  colorSwatch: string;
  description?: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "customer";
};

export type CartItem = {
  productId: string;
  quantity: number;
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
  paymentStatus?: string;
  status: string;
  createdAt: string;
  user?: User;
};
