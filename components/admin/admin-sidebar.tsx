"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  Droplets,
  ChefHat,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overzicht", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Bestellingen", icon: ShoppingBag },
  { href: "/admin/kitchen", label: "Keuken", icon: ChefHat },
  { href: "/admin/menu", label: "Menu", icon: Package },
  { href: "/admin/sauces", label: "Sauzen & kruiden", icon: Droplets },
  { href: "/admin/analytics", label: "Analyse", icon: BarChart3 },
  { href: "/admin/settings", label: "Instellingen", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4 lg:h-16 lg:px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-verdec-yellow text-verdec-black">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">Verdec</p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 lg:p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-verdec-yellow text-verdec-black"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 space-y-2 border-t p-3 lg:p-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">Thema</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="h-11 w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </Button>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 font-bold">
          <UtensilsCrossed className="h-5 w-5 text-verdec-yellow" />
          Verdec Admin
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu openen"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Menu sluiten"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(280px,85vw)] flex-col bg-card shadow-xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
              <span className="font-bold">Navigatie</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <aside className="hidden h-full w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <NavContent />
      </aside>
    </>
  );
}
