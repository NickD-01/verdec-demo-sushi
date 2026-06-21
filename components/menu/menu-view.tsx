"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/types";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MenuViewProps {
  products: ProductWithCategory[];
  categories: Category[];
}

function matchesSearch(product: ProductWithCategory, query: string) {
  const q = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q) ||
    product.category.name.toLowerCase().includes(q)
  );
}

export function MenuView({ products, categories }: MenuViewProps) {
  const firstSlug = categories[0]?.slug ?? "";
  const [activeCategory, setActiveCategory] = useState(firstSlug);
  const [searchQuery, setSearchQuery] = useState("");

  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  useEffect(() => {
    if (!categories.some((c) => c.slug === activeCategory) && activeCategory !== "all") {
      setActiveCategory(firstSlug);
    }
  }, [activeCategory, categories, firstSlug]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return products.filter((p) => matchesSearch(p, trimmedQuery));
  }, [products, trimmedQuery, isSearching]);

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category.slug === activeCategory);

  const grouped = categories
    .map((cat) => ({
      category: cat,
      products: products.filter((p) => p.category.slug === cat.slug),
    }))
    .filter((g) => g.products.length > 0);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 mb-6 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:static md:mx-0 md:mb-8 md:space-y-4 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek product..."
            className="h-11 border-border bg-muted/40 pl-9 pr-10 text-base md:h-10 md:text-sm"
            aria-label="Zoek product"
            autoComplete="off"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Zoekopdracht wissen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isSearching && (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
              Categorie
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
              <CategoryButton
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
                className="hidden md:inline-flex"
              >
                Alles
              </CategoryButton>
              {categories.map((cat) => (
                <CategoryButton
                  key={cat.id}
                  active={activeCategory === cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  {cat.name}
                </CategoryButton>
              ))}
            </div>
          </>
        )}
      </div>

      {isSearching ? (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            {searchResults.length === 0
              ? `Geen resultaten voor “${trimmedQuery}”`
              : `${searchResults.length} resultaat${searchResults.length === 1 ? "" : "en"}`}
          </p>
          {searchResults.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      ) : activeCategory === "all" ? (
        <div className="hidden space-y-6 md:block lg:space-y-8">
          {grouped.map(({ category, products: catProducts }) => (
            <section key={category.id}>
              <h2 className="mb-3 text-lg font-bold md:text-xl">{category.name}</h2>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {catProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

function CategoryButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-verdec-yellow text-verdec-black" : "bg-muted hover:bg-muted/80",
        className
      )}
    >
      {children}
    </button>
  );
}
