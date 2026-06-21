import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const days = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "CANCELLED" },
      },
      include: { items: true },
    });

    const dateLabels: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dateLabels.push(
        d.toLocaleDateString("nl-BE", { weekday: "short", day: "numeric" })
      );
    }

    const dailyRevenue = dateLabels.map((date, i) => {
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter(
        (o) => o.createdAt >= dayStart && o.createdAt <= dayEnd
      );
      return {
        date,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      };
    });

    const ordersPerDay = dateLabels.map((date, i) => {
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = orders.filter(
        (o) => o.createdAt >= dayStart && o.createdAt <= dayEnd
      ).length;
      return { date, orders: count };
    });

    const productCounts: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({ dailyRevenue, ordersPerDay, popularProducts });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
