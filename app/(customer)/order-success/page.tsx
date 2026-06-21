"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, CreditCard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const pickupTime = searchParams.get("pickupTime");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    fetch(`/api/orders/${orderNumber}?byNumber=true`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPaid(data?.paymentStatus === "PAID"))
      .catch(() => setPaid(false));
  }, [orderNumber]);

  if (!orderNumber) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Geen bestelinformatie gevonden.</p>
        <Link href="/" className="mt-4 inline-block">
          <Button>Naar home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold">Bestelling bevestigd!</h1>
      <p className="mt-2 text-muted-foreground">
        Bedankt voor je bestelling. We bereiden je eten nu.
      </p>

      <div className="mt-8 space-y-4 rounded-xl border p-6 text-left">
        <div>
          <p className="text-sm text-muted-foreground">Bestelnummer</p>
          <p className="text-xl font-bold text-verdec-yellow">{orderNumber}</p>
        </div>
        {pickupTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Afhaaltijd</p>
              <p className="font-semibold">{decodeURIComponent(pickupTime)}</p>
            </div>
          </div>
        )}
        {paid && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Betaling</p>
              <p className="font-semibold text-green-600">Online betaald</p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Toon je bestelnummer bij afhaling.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/menu">
          <Button variant="outline">Meer bestellen</Button>
        </Link>
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Terug naar home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center">Laden...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
