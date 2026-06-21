"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { OrderWithItems } from "@/types";

export default function PrintTicketPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setOrder(data);
      })
      .catch(() => setOrder(null));
  }, [params.id]);

  useEffect(() => {
    if (order) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [order]);

  if (!order) {
    return <p className="p-8 text-center">Ticket laden...</p>;
  }

  return (
    <div className="mx-auto max-w-sm p-6 font-sans text-black">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
      <h1 className="text-center text-xl font-bold">VERDEC</h1>
      <p className="text-center font-mono text-2xl font-bold">{order.orderNumber}</p>
      <p className="mt-2 text-center text-sm">{order.pickupTime}</p>
      <hr className="my-4 border-black" />
      <p className="font-semibold">{order.customerName}</p>
      <p className="text-sm">{order.customerPhone}</p>
      <ul className="mt-4 space-y-2 text-lg">
        {order.items.map((item) => (
          <li key={item.id}>
            <strong>{item.quantity}×</strong> {item.name}
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-4 rounded border border-black p-2 text-sm">
          Note: {order.notes}
        </p>
      )}
      <p className="mt-6 text-right text-xl font-bold">{formatPrice(order.total)}</p>
      <p className="mt-8 text-center text-xs text-gray-600">
        {new Date(order.createdAt).toLocaleString("nl-BE")}
      </p>
    </div>
  );
}
