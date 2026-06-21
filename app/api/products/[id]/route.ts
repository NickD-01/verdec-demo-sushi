import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { formatZodFieldErrors } from "@/lib/api-errors";
import { productSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        sauces: { include: { sauce: true } },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...product,
      sauceIds: product.sauces.map((ps) => ps.sauceId),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { sauceIds, ...rest } = body;
    const parsed = productSchema.partial().safeParse(rest);
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

    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });

    if (sauceIds !== undefined && Array.isArray(sauceIds)) {
      await prisma.productSauce.deleteMany({ where: { productId: params.id } });
      if (sauceIds.length > 0) {
        await prisma.productSauce.createMany({
          data: sauceIds.map((sauceId: string) => ({
            productId: params.id,
            sauceId,
          })),
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        sauces: { include: { sauce: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      sauceIds: updated?.sauces.map((ps) => ps.sauceId) ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
