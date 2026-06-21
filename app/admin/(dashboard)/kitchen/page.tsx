"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ACTIVE_ORDER_STATUSES, getNextStatus, getQuickActionLabel } from "@/lib/order-flow";
import { ORDER_STATUS_LABELS, getStatusVariant } from "@/lib/order-status";
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/lib/payment";
import { formatPrice } from "@/lib/utils";
import type { OrderWithItems } from "@/types";
import type { OrderStatus } from "@/types/order";

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOrders(
          list.filter((o: OrderWithItems) =>
            ACTIVE_ORDER_STATUSES.includes(o.status as OrderStatus)
          )
        );
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 15000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const advance = async (id: string, status: OrderStatus) => {
    const next = getNextStatus(status);
    if (!next) return;
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) fetchOrders();
  };

  const printTicket = (orderId: string) => {
    window.open(`/admin/kitchen/print/${orderId}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Keuken — tickets</h1>
          <p className="text-sm text-muted-foreground">
            Open op een tablet in de zaak. Vernieuwt elke 15 seconden.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Vernieuw
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">Alle orders</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Geen actieve bestellingen
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.status as OrderStatus;
            const action = getQuickActionLabel(status);
            return (
              <article
                key={order.id}
                className="rounded-xl border-2 border-verdec-yellow/30 bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                  <div>
                    <p className="font-mono text-lg font-bold">{order.orderNumber}</p>
                    <p className="text-lg font-semibold">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <Badge variant={getStatusVariant(status)}>
                      {ORDER_STATUS_LABELS[status]}
                    </Badge>
                    <Badge variant={order.paymentStatus === "PAID" ? "success" : "outline"}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ??
                        order.paymentStatus}
                    </Badge>
                    <p className="text-sm font-medium">{order.pickupTime}</p>
                  </div>
                </div>

                <ul className="my-3 space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-2 text-base">
                      <span>
                        <strong>{item.quantity}×</strong> {item.name}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-sm">
                    <span className="font-medium">Opmerking: </span>
                    {order.notes}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {action && (
                    <Button
                      className="min-h-11 flex-1 sm:flex-none"
                      onClick={() => advance(order.id, status)}
                    >
                      {action}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="min-h-11 gap-2"
                    onClick={() => printTicket(order.id)}
                  >
                    <Printer className="h-4 w-4" />
                    Ticket
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
