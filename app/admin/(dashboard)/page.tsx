"use client";

import { useEffect, useState } from "react";
import { Euro, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "Bestellingen vandaag",
      value: stats?.ordersToday ?? 0,
      icon: ShoppingBag,
      format: (v: number) => v.toString(),
    },
    {
      title: "Omzet vandaag",
      value: stats?.revenueToday ?? 0,
      icon: Euro,
      format: formatPrice,
    },
    {
      title: "Openstaande bestellingen",
      value: stats?.pendingOrders ?? 0,
      icon: TrendingUp,
      format: (v: number) => v.toString(),
    },
    {
      title: "Afgeronde bestellingen",
      value: stats?.completedOrders ?? 0,
      icon: Package,
      format: (v: number) => v.toString(),
    },
  ];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Overzicht</h1>
      <p className="mb-8 text-muted-foreground">Welkom terug! Zo staat je restaurant er vandaag voor.</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-verdec-yellow" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">{card.format(card.value)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
