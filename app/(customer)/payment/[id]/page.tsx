"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

type OrderInfo = {
  orderNumber: string;
  total: number;
  pickupTime: string;
  paymentStatus: string;
};

function FakeQrCode() {
  // Decoratieve QR-weergave voor de demo. In productie verloopt de betaling
  // via de gehoste Mollie-checkout (Bancontact, Payconiq, kaart).
  const cells = Array.from({ length: 25 * 25 }, (_, i) => {
    const seed = (i * 1103515245 + 12345) & 0x7fffffff;
    return seed % 7 < 3;
  });
  return (
    <div
      className="grid rounded-lg bg-white p-3"
      style={{ gridTemplateColumns: "repeat(25, 1fr)", width: 200, height: 200 }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-[#0a2540]" : "bg-transparent"} />
      ))}
    </div>
  );
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [demo, setDemo] = useState(false);
  const startedRef = useRef(false);

  const goToSuccess = useCallback(
    (info: OrderInfo) => {
      router.push(
        `/order-success?orderNumber=${info.orderNumber}&pickupTime=${encodeURIComponent(
          info.pickupTime
        )}`
      );
    },
    [router]
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const orderRes = await fetch(`/api/orders/${params.id}`).catch(() => null);
      const info: OrderInfo | null = orderRes?.ok ? await orderRes.json() : null;
      setOrder(info);

      if (!info) {
        setLoading(false);
        return;
      }
      if (info.paymentStatus === "PAID") {
        goToSuccess(info);
        return;
      }

      // Start de betaling. Bij echte Mollie-key → redirect naar de checkout.
      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: params.id }),
      }).catch(() => null);
      const payData = payRes?.ok ? await payRes.json() : null;

      if (payData?.checkoutUrl) {
        window.location.href = payData.checkoutUrl;
        return;
      }
      if (payData?.paid) {
        goToSuccess(info);
        return;
      }
      // Demo-modus: toon gesimuleerde checkout.
      setDemo(true);
      setLoading(false);
    })();
  }, [params.id, goToSuccess]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/pay`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({
          title: "Betaling mislukt",
          description: typeof data.error === "string" ? data.error : "Probeer opnieuw.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Betaling geslaagd" });
      goToSuccess(order);
    } catch {
      toast({
        title: "Betaling mislukt",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex max-w-md items-center justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-muted-foreground">Bestelling niet gevonden.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8 sm:py-12">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between bg-[#0a2540] px-5 py-4 text-white">
          <span className="text-lg font-bold tracking-tight">Online betalen</span>
          {demo && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium uppercase">
              Demo
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-5 px-6 py-7">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Te betalen</p>
            <p className="text-3xl font-bold">{formatPrice(order.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Bestelling {order.orderNumber}
            </p>
          </div>

          <FakeQrCode />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            Bancontact, Payconiq, KBC/CBC of kaart
          </div>

          <Button
            onClick={handlePay}
            disabled={paying}
            size="lg"
            className="w-full"
          >
            {paying ? "Bezig met betalen..." : "Betaling simuleren (demo)"}
          </Button>

          <button
            type="button"
            onClick={() => goToSuccess(order)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Toch cash betalen bij afhaling
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Beveiligde betaling — demonstratie zonder echte transactie
          </div>
        </div>
      </div>
    </div>
  );
}
