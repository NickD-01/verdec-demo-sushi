"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { formatPrice } from "@/lib/utils";
import type { ProductWithCategory, SauceOption } from "@/types";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
  available: true,
  popular: false,
  allowsSauceCustomization: false,
};

export default function AdminMenuPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [allSauces, setAllSauces] = useState<SauceOption[]>([]);
  const [selectedSauceIds, setSelectedSauceIds] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
      fetch("/api/sauces?all=true"),
    ])
      .then(([pRes, cRes, sRes]) =>
        Promise.all([pRes.json(), cRes.json(), sRes.json()])
      )
      .then(([productsData, categoriesData, saucesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setAllSauces(Array.isArray(saucesData) ? saucesData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyProduct, categoryId: categories[0]?.id || "" });
    setSelectedSauceIds([]);
    setDialogOpen(true);
  };

  const openEdit = async (product: ProductWithCategory) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      available: product.available,
      popular: product.popular,
      allowsSauceCustomization: product.allowsSauceCustomization,
    });
    const res = await fetch(`/api/products/${product.id}`);
    const data = await res.json();
    setSelectedSauceIds(data.sauceIds ?? []);
    setDialogOpen(true);
  };

  const toggleSauceId = (id: string) => {
    setSelectedSauceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      sauceIds: form.allowsSauceCustomization ? selectedSauceIds : [],
    };

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.ok) {
      toast({ title: editingId ? "Product bijgewerkt" : "Product aangemaakt" });
      setDialogOpen(false);
      fetchData();
    } else {
      const message = await getApiErrorMessage(res, "Product opslaan mislukt");
      toast({
        title: "Opslaan mislukt",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Dit product verwijderen?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Product verwijderd" });
      fetchData();
    } else {
      toast({ title: "Verwijderen mislukt", variant: "destructive" });
    }
  };

  const toggleAvailable = async (product: ProductWithCategory) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
    });
    if (res.ok) fetchData();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menubeheer</h1>
          <p className="text-muted-foreground">Menu-items toevoegen, bewerken en beheren</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Product toevoegen
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="relative h-36">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                {!product.available && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-bold text-white">
                    Niet beschikbaar
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category.name}</p>
                  </div>
                  <p className="font-bold text-verdec-yellow">{formatPrice(product.price)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.available}
                      onCheckedChange={() => toggleAvailable(product)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.available ? "Beschikbaar" : "Niet beschikbaar"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Product bewerken" : "Product toevoegen"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Naam</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschrijving (optioneel)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prijs (€)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categorie</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kies categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Afbeelding (pad of URL)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="/images/placeholder-food.svg"
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.available}
                  onCheckedChange={(v) => setForm({ ...form, available: v })}
                />
                <Label>Beschikbaar</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.popular}
                  onCheckedChange={(v) => setForm({ ...form, popular: v })}
                />
                <Label>Populair</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.allowsSauceCustomization}
                  onCheckedChange={(v) =>
                    setForm({ ...form, allowsSauceCustomization: v })
                  }
                />
                <Label>Extra&apos;s (kruiden + sauzen)</Label>
              </div>
            </div>

            {form.allowsSauceCustomization && (
              <div className="space-y-4 rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Selecteer per type. Leeg = alle beschikbare opties. Beheer onder Sauzen
                  &amp; kruiden.
                </p>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Kruiden</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {allSauces
                      .filter((s) => s.kind === "SEASONING")
                      .map((sauce) => {
                        const on = selectedSauceIds.includes(sauce.id);
                        return (
                          <button
                            key={sauce.id}
                            type="button"
                            onClick={() => toggleSauceId(sauce.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors",
                              on
                                ? "border-verdec-yellow bg-verdec-yellow/10 font-medium"
                                : "border-border hover:bg-muted"
                            )}
                          >
                            <span>{sauce.icon || "🌿"}</span>
                            <span className="min-w-0 flex-1 truncate">{sauce.name}</span>
                          </button>
                        );
                      })}
                  </div>
                  {allSauces.filter((s) => s.kind === "SEASONING").length === 0 && (
                    <p className="text-xs text-muted-foreground">Nog geen kruiden aangemaakt.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Sauzen</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {allSauces
                      .filter((s) => s.kind !== "SEASONING")
                      .map((sauce) => {
                        const on = selectedSauceIds.includes(sauce.id);
                        return (
                          <button
                            key={sauce.id}
                            type="button"
                            onClick={() => toggleSauceId(sauce.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors",
                              on
                                ? "border-verdec-yellow bg-verdec-yellow/10 font-medium"
                                : "border-border hover:bg-muted"
                            )}
                          >
                            <span>{sauce.icon || "🥫"}</span>
                            <span className="min-w-0 flex-1 truncate">{sauce.name}</span>
                          </button>
                        );
                      })}
                  </div>
                  {allSauces.filter((s) => s.kind !== "SEASONING").length === 0 && (
                    <p className="text-xs text-muted-foreground">Nog geen sauzen aangemaakt.</p>
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Opslaan..." : "Product opslaan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
