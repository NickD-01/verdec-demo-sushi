import { prisma } from "@/lib/prisma";
import type { Sauce } from "@prisma/client";

export type ProductExtrasCatalog = {
  seasonings: Sauce[];
  sauces: Sauce[];
};

export async function getProductExtrasCatalog(
  productId: string
): Promise<ProductExtrasCatalog> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sauces: {
        include: { sauce: true },
        orderBy: { sauce: { sortOrder: "asc" } },
      },
    },
  });

  if (!product?.allowsSauceCustomization) {
    return { seasonings: [], sauces: [] };
  }

  const all = await prisma.sauce.findMany({
    where: { available: true },
    orderBy: { sortOrder: "asc" },
  });

  const linked = product.sauces.map((ps) => ps.sauce).filter((s) => s.available);

  const linkedSeasonings = linked.filter((s) => s.kind === "SEASONING");
  const linkedSauces = linked.filter((s) => s.kind !== "SEASONING");

  return {
    seasonings:
      linkedSeasonings.length > 0
        ? linkedSeasonings
        : all.filter((s) => s.kind === "SEASONING"),
    sauces:
      linkedSauces.length > 0 ? linkedSauces : all.filter((s) => s.kind !== "SEASONING"),
  };
}

export function catalogToExtraItems(catalog: ProductExtrasCatalog) {
  const all = [...catalog.seasonings, ...catalog.sauces];
  return all.map((s) => ({
    name: s.name,
    extraPrice: s.extraPrice,
    kind: (s.kind === "SEASONING" ? "SEASONING" : "SAUCE") as "SAUCE" | "SEASONING",
  }));
}
