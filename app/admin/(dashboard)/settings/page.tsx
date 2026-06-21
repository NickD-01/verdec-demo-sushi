"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SettingsData } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    if (res.ok) toast({ title: "Instellingen opgeslagen" });
    else toast({ title: "Opslaan mislukt", variant: "destructive" });
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Instellingen</h1>
        <p className="mt-1 text-muted-foreground">Restaurantinfo & bestelcapaciteit</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Naam</Label>
              <Input
                value={settings?.restaurantName ?? ""}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, restaurantName: e.target.value } : s))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Telefoon</Label>
              <Input
                value={settings?.phone ?? ""}
                onChange={(e) => setSettings((s) => (s ? { ...s, phone: e.target.value } : s))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adres</Label>
              <Input
                value={settings?.address ?? ""}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, address: e.target.value } : s))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Slogan</Label>
              <Input
                value={settings?.tagline ?? ""}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, tagline: e.target.value } : s))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Openingsuren (weergavetekst)</Label>
              <Input
                value={settings?.openingHours ?? ""}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, openingHours: e.target.value } : s))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pickup capacity</CardTitle>
            <CardDescription>
              Customers choose a time slot. Full slots are hidden. Minimum wait before first
              available slot.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Min. wachttijd (minuten)</Label>
              <Input
                type="number"
                min={15}
                value={settings?.minLeadTimeMinutes ?? 30}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, minLeadTimeMinutes: Number(e.target.value) || 30 } : s
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Slot every (minutes)</Label>
              <Input
                type="number"
                min={5}
                value={settings?.slotIntervalMinutes ?? 15}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, slotIntervalMinutes: Number(e.target.value) || 15 } : s
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max. bestellingen per slot</Label>
              <Input
                type="number"
                min={1}
                value={settings?.maxOrdersPerSlot ?? 8}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, maxOrdersPerSlot: Number(e.target.value) || 8 } : s
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Opens (HH:MM)</Label>
              <Input
                value={settings?.openTime ?? "11:00"}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, openTime: e.target.value } : s))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Sluit (UU:MM)</Label>
              <Input
                value={settings?.closeTime ?? "22:00"}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, closeTime: e.target.value } : s))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} size="lg">
          {saving ? "Opslaan..." : "Instellingen opslaan"}
        </Button>
      </form>
    </div>
  );
}
