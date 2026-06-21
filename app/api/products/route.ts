import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { formatZodFieldErrors } from "@/lib/api-errors";
import { productSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get("available") === "true";
    const popularOnly = searchParams.get("popular") === "true";
    const categorySlug = searchParams.get("category");

    const products = await prisma.product.findMany({
      where: {
        ...(availableOnly && { available: true }),
        ...(popularOnly && { popular: true }),
        ...(categorySlug && { category: { slug: categorySlug } }),
      },
      include: { category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: fieldErrors,
          message:
            formatZodFieldErrors(fieldErrors) ||
            "Controleer de ingevulde velden",
        },
        { status: 400 }
      );
    }

    const { sauceIds, ...productData } = parsed.data;
    const product = await prisma.product.create({ data: productData });

    if (sauceIds?.length) {
      await prisma.productSauce.createMany({
        data: sauceIds.map((sauceId) => ({ productId: product.id, sauceId })),
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
