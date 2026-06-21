import type { Product, Category, Order, OrderItem, Settings, Sauce } from "@prisma/client";
export type { OrderStatus } from "./order";
export type { SauceKind } from "@/lib/sauces";

export type ProductWithCategory = Product & {
  category: Category;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product })[];
};

export type SauceOption = Sauce;

export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  basePrice: number;
  price: number;
  imageUrl: string;
  quantity: number;
  sauces: string[];
  seasonings: string[];
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "lineId">) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export type SettingsData = Settings;

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface AnalyticsData {
  dailyRevenue: { date: string; revenue: number }[];
  ordersPerDay: { date: string; orders: number }[];
  popularProducts: { name: string; count: number }[];
}

export interface ProductExtrasResponse {
  seasonings: SauceOption[];
  sauces: SauceOption[];
}
