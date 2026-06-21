"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/product-image";
import { ExtrasPickerDialog } from "@/components/products/extras-picker-dialog";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { appendOptionsToDisplayName } from "@/lib/sauces";
import type { ProductWithCategory } from "@/types";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [extrasOpen, setExtrasOpen] = useState(false);

  const handleAdd = () => {
    if (!product.available) return;
    if (product.allowsSauceCustomization) {
      setExtrasOpen(true);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      price: product.price,
      imageUrl: product.imageUrl,
      sauces: [],
      seasonings: [],
    });
    toast({ title: "Toegevoegd aan winkelwagen", description: product.name });
  };

  const handleExtrasConfirm = (payload: {
    sauces: string[];
    seasonings: string[];
    unitPrice: number;
  }) => {
    const displayName = appendOptionsToDisplayName(
      product.name,
      payload.sauces,
      payload.seasonings
    );
    addItem({
      productId: product.id,
      name: displayName,
      basePrice: product.price,
      price: payload.unitPrice,
      imageUrl: product.imageUrl,
      sauces: payload.sauces,
      seasonings: payload.seasonings,
    });
    toast({ title: "Toegevoegd aan winkelwagen", description: displayName });
  };

  return (
    <>
      <Card
        className={`group flex h-full flex-col overflow-hidden transition-all ${
          product.available
            ? "hover:shadow-md hover:ring-1 hover:ring-verdec-yellow/50"
            : "opacity-75"
        }`}
      >
        <div className="flex flex-1 gap-2.5 p-2.5 md:gap-3 md:p-3">
          <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-md md:h-20 md:w-20">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              sizes="(max-width: 768px) 72px, 80px"
              className="h-full w-full object-cover"
            />
            {product.popular && (
              <span className="absolute left-0.5 top-0.5 rounded-full bg-verdec-yellow px-1 py-0.5 text-[9px] font-bold leading-none text-verdec-black md:text-[10px]">
                Top
              </span>
            )}
            {!product.available && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[9px] font-bold uppercase text-white md:text-[10px]">
                Niet besch.
              </span>
            )}
          </div>

          <CardContent className="flex min-w-0 flex-1 flex-col p-0">
            <h3 className="text-sm font-semibold leading-tight md:text-[0.9375rem]">
              {product.name}
            </h3>
            <p className="mt-0.5 min-h-[2rem] line-clamp-2 text-[11px] leading-snug text-muted-foreground md:min-h-[1.75rem] md:text-xs">
              {product.description || "\u00a0"}
            </p>
            <p className="mt-auto pt-0.5 text-sm font-bold text-verdec-yellow md:text-base">
              {formatPrice(product.price)}
              {product.allowsSauceCustomization && (
                <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                  + extra&apos;s
                </span>
              )}
            </p>
          </CardContent>
        </div>

        <CardFooter className="p-2.5 pt-0 md:p-3">
          <Button
            className="h-9 w-full gap-1.5 text-xs md:h-9 md:text-sm"
            onClick={handleAdd}
            disabled={!product.available}
            variant={product.available ? "default" : "secondary"}
          >
            <Plus className="h-3.5 w-3.5" />
            {product.available ? "In winkelwagen" : "Niet beschikbaar"}
          </Button>
        </CardFooter>
      </Card>

      <ExtrasPickerDialog
        product={product}
        open={extrasOpen}
        onOpenChange={setExtrasOpen}
        onConfirm={handleExtrasConfirm}
      />
    </>
  );
}
