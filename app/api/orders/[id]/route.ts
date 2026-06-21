import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { authOptions } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/order-status";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const byNumber = searchParams.get("byNumber") === "true";

    const order = await prisma.order.findFirst({
      where: byNumber ? { orderNumber: params.id } : { id: params.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Admins krijgen de volledige order (incl. klantgegevens).
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return NextResponse.json(order);
    }

    // Publiek (bevestigings-/betaalpagina): geen klant-PII teruggeven.
    return NextResponse.json({
      orderNumber: order.orderNumber,
      pickupTime: order.pickupTime,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: order.items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { status } = body;

    if (status && !ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { ...(status && { status }) },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
