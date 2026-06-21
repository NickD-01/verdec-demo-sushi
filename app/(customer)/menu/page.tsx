export const dynamic = 'force-dynamic'

import { MenuView } from "@/components/menu/menu-view";
import { prisma } from "@/lib/prisma";

export default async function MenuPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Ons menu</h1>
        <p className="mt-2 text-muted-foreground">
          Verse sushi, maki en Japanse specialiteiten — bestel voor afhaling
        </p>
      </div>

      <MenuView products={products} categories={categories} />
    </div>
  );
}
