"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Plus, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PickupSlot } from "@/lib/pickup-slots";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [minLead, setMinLead] = useState(30);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    pickupSlot: "",
    notes: "",
    paymentMethod: "CASH" as "CASH" | "ONLINE",
  });

  const loadSlots = () => {
    setSlotsLoading(true);
    fetch("/api/pickup-slots")
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setMinLead(data.settings?.minLeadTimeMinutes ?? 30);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickupSlot) {
      setErrors({ pickupSlot: "Selecteer een afhaaltijd" });
      return;
    }
    setLoading(true);
    setErrors({});

    const selectedSlot = slots.find((s) => s.value === form.pickupSlot);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            ...form,
            pickupTime: selectedSlot?.label ?? form.pickupSlot,
          },
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            sauces: i.sauces,
            seasonings: i.seasonings,
            unitPrice: i.price,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.error).forEach(([key, val]) => {
            fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
          });
          setErrors(fieldErrors);
        } else {
          const msg =
            typeof data.error === "string"
              ? data.error
              : "Probeer opnieuw";
          toast({
            title: "Bestelling mislukt",
            description: msg,
            variant: "destructive",
          });
          if (Array.isArray(data.unavailable) && data.unavailable.length > 0) {
            loadSlots();
          }
        }
        return;
      }

      clearCart();
      if (form.paymentMethod === "ONLINE") {
        router.push(`/payment/${data.id}`);
      } else {
        router.push(
          `/order-success?orderNumber=${data.orderNumber}&pickupTime=${encodeURIComponent(data.pickupTime)}`
        );
      }
    } catch {
      toast({
        title: "Bestelling mislukt",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12 sm:py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Je winkelwagen is leeg"
          description="Bekijk ons menu en voeg verse sushi en Japanse gerechten toe!"
          action={
            <Link href="/menu">
              <Button size="lg">Menu bekijken</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Je winkelwagen</h1>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div className="space-y-3 lg:sticky lg:top-20">
          {items.map((item) => (
            <div
              key={item.lineId}
              className="flex gap-3 rounded-xl border bg-card p-3 sm:gap-4 sm:p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
                <ProductImage src={item.imageUrl} alt={item.name} sizes="80px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-snug sm:text-base">
                    {item.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive"
                    onClick={() => removeItem(item.lineId)}
                    aria-label="Verwijderen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-medium text-verdec-yellow">
                  {formatPrice(item.price)} per stuk
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm font-bold sm:text-base">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <span className="font-semibold">Totaal</span>
            <span className="text-xl font-bold text-verdec-yellow">{formatPrice(total)}</span>
          </div>
        </div>

        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-4 sm:p-6 lg:sticky lg:top-20"
        >
          <h2 className="text-lg font-bold sm:text-xl">Afrekenen</h2>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="customerName">Je naam *</Label>
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Jan Janssen"
              className="h-11"
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Telefoon *</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              placeholder="+32 470 00 00 00"
              className="h-11"
            />
            {errors.customerPhone && (
              <p className="text-sm text-destructive">{errors.customerPhone}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Afhaaltijd *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={loadSlots}
                disabled={slotsLoading}
              >
                <RefreshCw className={cn("h-3 w-3", slotsLoading && "animate-spin")} />
                Vernieuwen
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimaal {minLead} min bereiding. Drukke tijden raken vol â€” kies een beschikbaar moment.
            </p>
            {slotsLoading ? (
              <p className="text-sm text-muted-foreground">Tijden laden...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-destructive">
                Geen tijden beschikbaar vandaag. Bel het restaurant.
              </p>
            ) : (
              <div className="grid max-h-48 gap-2 overflow-y-auto pr-1 sm:max-h-56">
                {slots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setForm({ ...form, pickupSlot: slot.value })}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      form.pickupSlot === slot.value
                        ? "border-verdec-yellow bg-verdec-yellow/10 font-medium"
                        : slot.available
                          ? "border-border hover:border-verdec-yellow/50"
                          : "cursor-not-allowed border-border/50 opacity-50"
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
            {errors.pickupSlot && (
              <p className="text-sm text-destructive">{errors.pickupSlot}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Opmerkingen (optioneel)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="AllergieÃ«n, extra wensen..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Betaling *</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "CASH", label: "Cash bij afhaling" },
                  { value: "ONLINE", label: "Online betalen" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: opt.value })}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    form.paymentMethod === opt.value
                      ? "border-verdec-yellow bg-verdec-yellow/10"
                      : "border-border hover:border-verdec-yellow/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {form.paymentMethod === "ONLINE" && (
              <p className="text-xs text-muted-foreground">
                Bancontact, Payconiq, KBC/CBC of kaart.
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="hidden h-12 w-full text-base lg:flex"
            disabled={loading || slots.length === 0}
          >
            {loading
              ? "Bestelling plaatsen..."
              : form.paymentMethod === "ONLINE"
                ? `Naar betaling â€” ${formatPrice(total)}`
                : `Bestellen â€” ${formatPrice(total)}`}
          </Button>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur lg:hidden pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          type="submit"
          form="checkout-form"
          className="h-12 w-full text-base"
          disabled={loading || slots.length === 0}
        >
          {loading
            ? "Bestelling plaatsen..."
            : form.paymentMethod === "ONLINE"
              ? `Naar betaling â€” ${formatPrice(total)}`
              : `Afrekenen â€” ${formatPrice(total)}`}
        </Button>
      </div>

      <div className="h-24 lg:hidden" aria-hidden />
    </div>
  );
}
