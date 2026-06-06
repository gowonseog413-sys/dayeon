export type AnalyticsBoard = {
  periodDays: number;
  range: { from: string; to: string };
  overview: {
    revenue: number;
    orders: number;
    avgOrderValue: number;
    products: number;
    members: number;
    newMembers: number;
    todayRevenue: number;
    todayOrders: number;
    monthRevenue: number;
    monthOrders: number;
  };
  dailySales: { date: string; orders: number; revenue: number }[];
  ordersByStatus: {
    pending: number;
    shipped: number;
    completed: number;
    cancelled: number;
  };
  topProducts: {
    productId?: string;
    name: string;
    brand: string;
    quantity: number;
    revenue: number;
  }[];
  categorySales: { category: string; amount: number }[];
  recentOrders: {
    id: string;
    orderNumber?: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
};

export type CounterReport = {
  range: { from: string; to: string };
  summary: {
    orders: number;
    cancelled: number;
    revenue: number;
    itemQty: number;
    avgOrderValue: number;
    monthRevenue: number;
    monthOrders: number;
  };
  hourly: { hour: number; label: string; orders: number; revenue: number }[];
  dailyBreakdown: {
    date: string;
    orders: number;
    revenue: number;
    cancelled: number;
    itemQty: number;
  }[];
  orders: {
    id: string;
    orderNumber?: string;
    total: number;
    status: string;
    paymentStatus?: string;
    itemQty: number;
    createdAt: string;
    customerName: string;
  }[];
};

export const CATEGORY_LABELS: Record<string, string> = {
  "contact-lenses": "컬러렌즈",
  accessories: "렌즈 용품",
  bundles: "번들",
  solutions: "솔루션",
};
