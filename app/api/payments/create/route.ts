import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPaymentDemo } from "@/lib/payment";
import { createMolliePayment } from "@/lib/mollie";
import { rateLimit } from "@/lib/rate-limit";

function baseUrl(request: NextRequest): string {
  return process.env.APP_BASE_URL || new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(request, "payment-create", 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer zo dadelijk opnieuw." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let orderId: string;
  try {
    const body = (await request.json()) as { orderId?: string };
    orderId = body.orderId ?? "";
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  if (!orderId) {
    return NextResponse.json({ error: "orderId ontbreekt" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Bestelling niet gevonden" }, { status: 404 });
  }
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ paid: true });
  }

  // Demo-modus: geen echte Mollie-key → front-end toont gesimuleerde checkout.
  if (isPaymentDemo()) {
    return NextResponse.json({ demo: true });
  }

  try {
    const base = baseUrl(request);
    const redirectUrl = `${base}/order-success?orderNumber=${encodeURIComponent(
      order.orderNumber
    )}&pickupTime=${encodeURIComponent(order.pickupTime)}`;
    const payment = await createMolliePayment({
      orderId: order.id,
      amount: order.total,
      description: `Bestelling ${order.orderNumber}`,
      redirectUrl,
      webhookUrl: `${base}/api/payments/webhook`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { molliePaymentId: payment.id },
    });

    return NextResponse.json({ checkoutUrl: payment.checkoutUrl });
  } catch {
    return NextResponse.json(
      { error: "Betaling kon niet gestart worden" },
      { status: 502 }
    );
  }
}
