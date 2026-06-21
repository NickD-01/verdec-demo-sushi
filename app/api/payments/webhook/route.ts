import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMolliePayment } from "@/lib/mollie";

/**
 * Mollie-webhook. Mollie POST't enkel een betaling-id (form-encoded).
 * De status wordt NOOIT uit de body gelezen — we halen de echte status
 * geauthenticeerd op bij Mollie. Zo kan niemand een order vals als
 * "betaald" markeren door de webhook na te bootsen.
 *
 * Mollie verwacht altijd HTTP 200, anders blijft het opnieuw proberen.
 */
export async function POST(request: NextRequest) {
  if (!process.env.MOLLIE_API_KEY) {
    return NextResponse.json({ ignored: true });
  }

  try {
    const form = await request.formData();
    const paymentId = String(form.get("id") ?? "");
    if (!paymentId) return NextResponse.json({ ok: true });

    const payment = await getMolliePayment(paymentId);
    if (!payment.orderId) return NextResponse.json({ ok: true });

    if (payment.isPaid) {
      await prisma.order.updateMany({
        where: { id: payment.orderId, paymentStatus: { not: "PAID" } },
        data: { paymentStatus: "PAID" },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // 200 teruggeven zodat Mollie later opnieuw probeert; nooit details lekken.
    return NextResponse.json({ ok: true });
  }
}
