import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "In afwachting",
  ACCEPTED: "Geaccepteerd",
  PREPARING: "In bereiding",
  READY: "Klaar",
  COMPLETED: "Afgerond",
  CANCELLED: "Geannuleerd",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export function getStatusVariant(
  status: string
): "default" | "secondary" | "warning" | "success" | "destructive" | "outline" {
  const s = status as OrderStatus;
  switch (s) {
    case "PENDING":
      return "warning";
    case "ACCEPTED":
    case "PREPARING":
      return "secondary";
    case "READY":
      return "default";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}
