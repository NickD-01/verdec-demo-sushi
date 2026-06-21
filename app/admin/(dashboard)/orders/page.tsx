"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import {
  ACTIVE_ORDER_STATUSES,
  getNextStatus,
  getQuickActionLabel,
} from "@/lib/order-flow";
import { ORDER_STATUS_LABELS, getStatusVariant } from "@/lib/order-status";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/payment";
import type { OrderWithItems } from "@/types";
import type { OrderStatus } from "@/types/order";

function PaymentBadge({ order }: { order: OrderWithItems }) {
  const method = PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ?? order.paymentMethod;
  const paid = order.paymentStatus === "PAID";
  return (
    <Badge variant={paid ? "success" : "outline"}>
      {method} · {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ?? order.paymentStatus}
    </Badge>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 20000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const advanceOrder = async (id: string, current: OrderStatus) => {
    const next = getNextStatus(current);
    if (!next) return;
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      toast({ title: "Status bijgewerkt" });
      fetchOrders();
    } else {
      toast({ title: "Mislukt", variant: "destructive" });
    }
  };

  const active = orders.filter((o) =>
    ACTIVE_ORDER_STATUSES.includes(o.status as OrderStatus)
  );
  const completed = orders.filter(
    (o) => !ACTIVE_ORDER_STATUSES.includes(o.status as OrderStatus)
  );
  const visible = showCompleted ? completed : active;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Bestellingen</h1>
          <p className="text-sm text-muted-foreground">
            Grote knoppen om snel af te handelen.{" "}
            <Link href="/admin/kitchen" className="text-verdec-yellow hover:underline">
              Keukenweergave →
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showCompleted ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCompleted(false)}
          >
            Actief ({active.length})
          </Button>
          <Button
            variant={showCompleted ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCompleted(true)}
          >
            Afgerond
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          {showCompleted ? "Geen afgeronde orders" : "Geen actieve orders"}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((order) => {
            const status = order.status as OrderStatus;
            const actionLabel = getQuickActionLabel(status);
            const canAdvance = getNextStatus(status) && !showCompleted;
            return (
              <div key={order.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-verdec-yellow">
                      {order.orderNumber}
                    </p>
                    <p className="text-lg font-semibold">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.pickupTime}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <PaymentBadge order={order} />
                    <Badge variant={getStatusVariant(status)}>
                      {ORDER_STATUS_LABELS[status]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ul className="mt-3 space-y-1 text-sm">
                  {order.items.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                  {order.items.length > 4 && (
                    <li className="text-muted-foreground">
                      +{order.items.length - 4} meer...
                    </li>
                  )}
                </ul>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {canAdvance && actionLabel && (
                    <Button
                      className="min-h-11 flex-1 sm:flex-none"
                      onClick={() => advanceOrder(order.id, status)}
                    >
                      {actionLabel}
                    </Button>
                  )}
                  <span className="ml-auto font-bold text-verdec-yellow">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <p>
                <span className="text-muted-foreground">Klant: </span>
                {selectedOrder.customerName} — {selectedOrder.customerPhone}
              </p>
              <p>
                <span className="text-muted-foreground">Afhalen: </span>
                {selectedOrder.pickupTime}
              </p>
              <div>
                <span className="text-muted-foreground">Betaling: </span>
                <PaymentBadge order={selectedOrder} />
              </div>
              <ul className="space-y-1.5">
                {selectedOrder.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              {selectedOrder.notes && (
                <p className="rounded-lg bg-muted px-3 py-2">
                  <span className="font-medium">Opmerking: </span>
                  {selectedOrder.notes}
                </p>
              )}
              <p className="text-right font-bold">
                Totaal {formatPrice(selectedOrder.total)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
