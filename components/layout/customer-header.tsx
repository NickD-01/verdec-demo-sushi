"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/cart", label: "Winkelwagen" },
];

export function CustomerHeader({ restaurantName }: { restaurantName: string }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-verdec-yellow text-verdec-black">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span className="truncate text-sm sm:text-base">{restaurantName}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-verdec-yellow",
                  pathname === link.href ? "text-verdec-yellow" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative h-9 gap-1 px-2 sm:h-10 sm:gap-2 sm:px-3">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Winkelwagen</span>
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-verdec-yellow text-xs font-bold text-verdec-black">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Navigatie openen"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Navigatie sluiten"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(280px,88vw)] flex-col bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-semibold">Navigatie</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col p-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex min-h-[48px] items-center rounded-lg px-4 text-base font-medium",
                    pathname === link.href
                      ? "bg-verdec-yellow text-verdec-black"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                  {link.href === "/cart" && itemCount > 0 && (
                    <span className="ml-auto rounded-full bg-verdec-yellow px-2 py-0.5 text-xs font-bold text-verdec-black">
                      {itemCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
