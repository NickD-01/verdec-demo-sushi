import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { authOptions } from "@/lib/auth";
import { getProductExtrasCatalog } from "@/lib/product-extras";
import { z } from "zod";

const sauceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  kind: z.enum(["SAUCE", "SEASONING"]).default("SAUCE"),
  icon: z.string().optional().nullable(),
  extraPrice: z.coerce.number().min(0).default(0.5),
  imageUrl: z.string().min(1),
  available: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      const extras = await getProductExtrasCatalog(productId);
      return NextResponse.json(extras);
    }

    const session = await getServerSession(authOptions);
    const showAll = searchParams.get("all") === "true" && !!session;
    const kindFilter = searchParams.get("kind");

    const sauces = await prisma.sauce.findMany({
      where: {
        ...(showAll ? {} : { available: true }),
        ...(kindFilter === "SAUCE" || kindFilter === "SEASONING"
          ? { kind: kindFilter }
          : {}),
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(sauces);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sauces" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = sauceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = parsed.data.slug || slugify(parsed.data.name);
    const data = {
      ...parsed.data,
      slug,
      extraPrice:
        parsed.data.kind === "SEASONING" && body.extraPrice === undefined
          ? 0
          : parsed.data.extraPrice,
    };
    const sauce = await prisma.sauce.create({ data });
    return NextResponse.json(sauce, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create sauce" }, { status: 500 });
  }
}
