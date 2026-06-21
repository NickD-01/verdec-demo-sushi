import type { OrderStatus } from "@/types/order";

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
];

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case "PENDING":
    case "ACCEPTED":
      return "PREPARING";
    case "PREPARING":
      return "READY";
    case "READY":
      return "COMPLETED";
    default:
      return null;
  }
}

export function getQuickActionLabel(status: OrderStatus): string {
  const next = getNextStatus(status);
  if (next === "PREPARING") return "Starten";
  if (next === "READY") return "Klaar";
  if (next === "COMPLETED") return "Afgehaald";
  return "";
}
