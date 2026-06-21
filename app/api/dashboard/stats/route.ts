import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, pendingOrders, completedOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
      }),
      prisma.order.count({
        where: {
          status: { in: ["PENDING", "ACCEPTED", "PREPARING", "READY"] },
        },
      }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
    ]);

    const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      ordersToday: ordersToday.length,
      revenueToday,
      pendingOrders,
      completedOrders,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
