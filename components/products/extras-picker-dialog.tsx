"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { cn, formatPrice } from "@/lib/utils";
import { getExtrasPriceBreakdown, type ExtraItem } from "@/lib/sauces";
import {
  buildSeasoningControls,
  defaultSeasoningSelection,
  setBinarySeasoning,
  toggleSeasoningSelection,
} from "@/lib/seasoning-exclusive";
import type { ProductExtrasResponse, ProductWithCategory, SauceOption } from "@/types";

interface ExtrasPickerDialogProps {
  product: ProductWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    sauces: string[];
    seasonings: string[];
    unitPrice: number;
  }) => void;
}

function toCatalog(items: SauceOption[]): ExtraItem[] {
  return items.map((s) => ({
    name: s.name,
    extraPrice: s.extraPrice,
    kind: (s.kind === "SEASONING" ? "SEASONING" : "SAUCE") as ExtraItem["kind"],
  }));
}

function SeasoningRow({
  on,
  icon,
  label,
  price,
  onChange,
}: {
  on: boolean;
  icon?: string | null;
  label: string;
  price?: number;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
        on
          ? "border-verdec-yellow bg-verdec-yellow/10"
          : "border-border bg-muted/20 hover:bg-muted/40"
      )}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-verdec-yellow"
      />
      {icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-base leading-none">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
      {price !== undefined && price > 0 && (
        <span className="shrink-0 text-xs text-muted-foreground">
          +{formatPrice(price)}
        </span>
      )}
    </label>
  );
}

function SeasoningsCheckboxSection({
  items,
  selectedIds,
  onChange,
  open,
  onOpenChange,
}: {
  items: SauceOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const controls = buildSeasoningControls(items);

  return (
    <section>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/40"
      >
        <span>
          Kruiden{" "}
          <span className="font-normal text-muted-foreground">(kies wat je wilt)</span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {controls.map((control) => {
            if (control.kind === "toggle") {
              const icon = items.find((s) => s.id === control.metId)?.icon;
              return (
                <SeasoningRow
                  key={control.group}
                  on={selectedIds.includes(control.metId)}
                  icon={icon}
                  label={control.label}
                  onChange={(checked) =>
                    onChange(
                      setBinarySeasoning(
                        selectedIds,
                        control.metId,
                        control.zonderId,
                        checked
                      )
                    )
                  }
                />
              );
            }
            const item = items.find((s) => s.id === control.item.id);
            if (!item) return null;
            return (
              <SeasoningRow
                key={item.id}
                on={selectedIds.includes(item.id)}
                icon={item.icon}
                label={item.name}
                price={item.extraPrice}
                onChange={() =>
                  onChange(toggleSeasoningSelection(items, selectedIds, item.id))
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function SaucesGridSection({
  items,
  selectedIds,
  onToggle,
  open,
  onOpenChange,
}: {
  items: SauceOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const count = selectedIds.length;

  return (
    <section>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/40"
      >
        <span>
          Sauzen <span className="font-normal text-muted-foreground">(optioneel)</span>
          {count > 0 && (
            <span className="ml-1 text-verdec-yellow">· {count} gekozen</span>
          )}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {items.map((item) => {
            const on = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                title={item.name}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all",
                  on
                    ? "border-verdec-yellow bg-verdec-yellow/10 ring-1 ring-verdec-yellow"
                    : "border-border bg-muted/20 hover:border-verdec-yellow/40"
                )}
              >
                {on && (
                  <span className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-verdec-yellow text-verdec-black">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  {item.icon ? (
                    <span className="flex h-full w-full items-center justify-center bg-muted text-2xl">
                      {item.icon}
                    </span>
                  ) : (
                    <ProductImage src={item.imageUrl} alt={item.name} sizes="120px" />
                  )}
                </div>
                <span className="line-clamp-2 text-xs font-medium leading-tight">
                  {item.name}
                </span>
                {item.extraPrice > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{formatPrice(item.extraPrice)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ExtrasPickerDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: ExtrasPickerDialogProps) {
  const [seasonings, setSeasonings] = useState<SauceOption[]>([]);
  const [sauces, setSauces] = useState<SauceOption[]>([]);
  const [selectedSeasonings, setSelectedSeasonings] = useState<string[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [seasoningsOpen, setSeasoningsOpen] = useState(true);
  const [saucesOpen, setSaucesOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !product) {
      setSelectedSeasonings([]);
      setSelectedSauces([]);
      setSeasoningsOpen(true);
      setSaucesOpen(true);
      return;
    }
    setLoading(true);
    fetch(`/api/sauces?productId=${product.id}`)
      .then((r) => r.json())
      .then((data: ProductExtrasResponse | SauceOption[]) => {
        const seasoningList = Array.isArray(data)
          ? data.filter((s) => s.kind === "SEASONING")
          : Array.isArray(data.seasonings)
            ? data.seasonings
            : [];
        const sauceList = Array.isArray(data)
          ? data.filter((s) => s.kind !== "SEASONING")
          : Array.isArray(data.sauces)
            ? data.sauces
            : [];
        setSeasonings(seasoningList);
        setSauces(sauceList);
        setSelectedSeasonings(defaultSeasoningSelection(seasoningList));
      })
      .catch(() => {
        setSeasonings([]);
        setSauces([]);
      })
      .finally(() => setLoading(false));
  }, [open, product]);

  const catalog = toCatalog([...seasonings, ...sauces]);
  const seasoningNames = seasonings
    .filter((s) => selectedSeasonings.includes(s.id))
    .map((s) => s.name);
  const sauceNames = sauces
    .filter((s) => selectedSauces.includes(s.id))
    .map((s) => s.name);

  const breakdown = product
    ? getExtrasPriceBreakdown(product.price, catalog, sauceNames, seasoningNames)
    : {
        basePrice: 0,
        sauceExtra: 0,
        seasoningExtra: 0,
        extrasTotal: 0,
        unitPrice: 0,
        sauceCount: 0,
        seasoningCount: 0,
      };

  const handleConfirm = () => {
    if (!product) return;
    onConfirm({
      sauces: sauceNames,
      seasonings: seasoningNames,
      unitPrice: breakdown.unitPrice,
    });
    onOpenChange(false);
  };

  if (!product) return null;

  const hasSeasonings = seasonings.length > 0;
  const hasSauces = sauces.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,640px)] w-[calc(100vw-1.5rem)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <div className="shrink-0 border-b px-4 py-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>Kruiden en optioneel saus</DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Laden...</p>
          ) : !hasSeasonings && !hasSauces ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Geen extra&apos;s geconfigureerd.
            </p>
          ) : (
            <div className="space-y-4">
              {hasSeasonings && (
                <SeasoningsCheckboxSection
                  items={seasonings}
                  selectedIds={selectedSeasonings}
                  onChange={setSelectedSeasonings}
                  open={seasoningsOpen}
                  onOpenChange={setSeasoningsOpen}
                />
              )}
              {hasSauces && (
                <SaucesGridSection
                  items={sauces}
                  selectedIds={selectedSauces}
                  onToggle={(id) =>
                    setSelectedSauces((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                    )
                  }
                  open={saucesOpen}
                  onOpenChange={setSaucesOpen}
                />
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t bg-background px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span>Basisprijs</span>
              <span>{formatPrice(breakdown.basePrice)}</span>
            </div>
            {breakdown.extrasTotal > 0 && (
              <div className="mt-1 flex justify-between text-muted-foreground">
                <span>Extra&apos;s</span>
                <span>+{formatPrice(breakdown.extrasTotal)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t pt-2 font-bold">
              <span>Totaal</span>
              <span className="text-verdec-yellow">{formatPrice(breakdown.unitPrice)}</span>
            </div>
          </div>
          <Button type="button" size="lg" className="w-full gap-2" onClick={handleConfirm}>
            In winkelwagen · {formatPrice(breakdown.unitPrice)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
