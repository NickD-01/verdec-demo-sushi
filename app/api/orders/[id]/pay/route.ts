import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPaymentDemo } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Demo-betaling: simuleert een geslaagde online betaling.
 * Werkt UITSLUITEND in demo-modus (geen MOLLIE_API_KEY). Met een echte
 * Mollie-key wordt de order pas PAID via de geverifieerde Mollie-webhook,
 * zodat niemand een betaling kan vervalsen.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const limit = rateLimit(request, "order-pay", 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer zo dadelijk opnieuw." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  if (!isPaymentDemo()) {
    return NextResponse.json(
      { error: "Echte betalingen verlopen via Mollie, niet via deze route." },
      { status: 403 }
    );
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) {
      return NextResponse.json({ error: "Bestelling niet gevonden" }, { status: 404 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(order);
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { paymentStatus: "PAID" },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Betaling mislukt" }, { status: 500 });
  }
}
