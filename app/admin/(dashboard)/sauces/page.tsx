"use client";

import { useEffect, useMemo, useState } from "react";
import { Leaf, Pencil, Plus, Trash2, Droplets } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FOOD_IMAGES } from "@/lib/images";
import type { SauceOption } from "@/types";

const emptySauce = {
  name: "",
  description: "",
  kind: "SAUCE" as "SAUCE" | "SEASONING",
  icon: "",
  imageUrl: FOOD_IMAGES.sauceMayo as string,
  available: true,
  sortOrder: "0",
  extraPrice: "0.5",
};

function ExtraRow({
  item,
  variant,
  onEdit,
  onDelete,
}: {
  item: SauceOption;
  variant: "SEASONING" | "SAUCE";
  onEdit: (item: SauceOption) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      {variant === "SAUCE" ? (
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized={item.imageUrl.startsWith("/")}
          />
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Leaf className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.available ? "Zichtbaar" : "Verborgen"} · +€{item.extraPrice.toFixed(2)} · #
          {item.sortOrder}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ExtrasSection({
  title,
  description,
  icon: Icon,
  accentClass,
  items,
  loading,
  onAdd,
  onEdit,
  onDelete,
  variant,
  emptyLabel,
}: {
  title: string;
  description: string;
  icon: typeof Leaf;
  accentClass: string;
  items: SauceOption[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (item: SauceOption) => void;
  onDelete: (id: string) => void;
  variant: "SEASONING" | "SAUCE";
  emptyLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div
        className={cn(
          "flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
          accentClass
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/80">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button onClick={onAdd} variant={variant === "SEASONING" ? "outline" : "default"} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {variant === "SEASONING" ? "Kruid toevoegen" : "Saus toevoegen"}
        </Button>
      </div>

      <div className="space-y-2 p-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <ExtraRow
              key={item.id}
              item={item}
              variant={variant}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function AdminSaucesPage() {
  const [sauces, setSauces] = useState<SauceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySauce);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const seasonings = useMemo(
    () => sauces.filter((s) => s.kind === "SEASONING").sort((a, b) => a.sortOrder - b.sortOrder),
    [sauces]
  );
  const sauceItems = useMemo(
    () => sauces.filter((s) => s.kind !== "SEASONING").sort((a, b) => a.sortOrder - b.sortOrder),
    [sauces]
  );

  const fetchSauces = () => {
    setLoading(true);
    fetch("/api/sauces?all=true")
      .then((r) => r.json())
      .then((data) => setSauces(Array.isArray(data) ? data : []))
      .catch(() => setSauces([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSauces();
  }, []);

  const openCreate = (kind: "SAUCE" | "SEASONING") => {
    setEditingId(null);
    setForm({
      ...emptySauce,
      kind,
      extraPrice: kind === "SEASONING" ? "0" : "0.5",
    });
    setDialogOpen(true);
  };

  const openEdit = (sauce: SauceOption) => {
    setEditingId(sauce.id);
    setForm({
      name: sauce.name,
      description: sauce.description ?? "",
      kind: sauce.kind === "SEASONING" ? "SEASONING" : "SAUCE",
      icon: sauce.icon ?? "",
      imageUrl: sauce.imageUrl,
      available: sauce.available,
      sortOrder: String(sauce.sortOrder),
      extraPrice: String(sauce.extraPrice),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const isSeasoning = form.kind === "SEASONING";
    const payload = {
      name: form.name,
      description: form.description,
      kind: form.kind,
      icon: isSeasoning ? null : form.icon || null,
      imageUrl: isSeasoning ? FOOD_IMAGES.sauceMayo : form.imageUrl,
      available: form.available,
      sortOrder: parseInt(form.sortOrder, 10),
      extraPrice: parseFloat(form.extraPrice),
    };

    const url = editingId ? `/api/sauces/${editingId}` : "/api/sauces";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.ok) {
      toast({
        title: editingId
          ? isSeasoning
            ? "Kruid bijgewerkt"
            : "Saus bijgewerkt"
          : isSeasoning
            ? "Kruid toegevoegd"
            : "Saus toegevoegd",
      });
      setDialogOpen(false);
      fetchSauces();
    } else {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, kind: string) => {
    const label = kind === "SEASONING" ? "kruid" : "saus";
    if (!confirm(`Dit ${label} verwijderen?`)) return;
    const res = await fetch(`/api/sauces/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Verwijderd" });
      fetchSauces();
    }
  };

  const isSeasoningForm = form.kind === "SEASONING";

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Sauzen &amp; kruiden</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beheer kruiden en sauzen apart. Koppel ze per product in Menu.
        </p>
      </div>

      <ExtrasSection
        title="Kruiden"
        description="Checkbox-opties voor klanten (zout, peper, …). Geen foto nodig."
        icon={Leaf}
        accentClass="bg-emerald-500/5"
        items={seasonings}
        loading={loading}
        variant="SEASONING"
        emptyLabel="Nog geen kruiden. Voeg er een toe."
        onAdd={() => openCreate("SEASONING")}
        onEdit={openEdit}
        onDelete={(id) => handleDelete(id, "SEASONING")}
      />

      <ExtrasSection
        title="Sauzen"
        description="Optioneel saus-menu met icoon of foto voor klanten."
        icon={Droplets}
        accentClass="bg-amber-500/5"
        items={sauceItems}
        loading={loading}
        variant="SAUCE"
        emptyLabel="Nog geen sauzen. Voeg er een toe."
        onAdd={() => openCreate("SAUCE")}
        onEdit={openEdit}
        onDelete={(id) => handleDelete(id, "SAUCE")}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? isSeasoningForm
                  ? "Kruid bewerken"
                  : "Saus bewerken"
                : isSeasoningForm
                  ? "Nieuw kruid"
                  : "Nieuwe saus"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                isSeasoningForm
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              )}
            >
              {isSeasoningForm
                ? "Kruid — verschijnt als checkbox bij bestellen"
                : "Saus — verschijnt in het optionele saus-menu"}
            </div>

            <div className="space-y-2">
              <Label>Naam</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {!isSeasoningForm && (
              <>
                <div className="space-y-2">
                  <Label>Icoon (emoji, optioneel)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="🥫"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Afbeelding (pad of URL)</Label>
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Beschrijving (optioneel)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Extra prijs (€)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={form.extraPrice}
                onChange={(e) => setForm({ ...form, extraPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Volgorde</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.available}
                onCheckedChange={(v) => setForm({ ...form, available: v })}
              />
              <Label>Zichtbaar voor klanten</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Opslaan..." : isSeasoningForm ? "Kruid opslaan" : "Saus opslaan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
