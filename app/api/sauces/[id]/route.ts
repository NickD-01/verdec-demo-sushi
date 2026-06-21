import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const sauceUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  kind: z.enum(["SAUCE", "SEASONING"]).optional(),
  icon: z.string().optional().nullable(),
  extraPrice: z.coerce.number().min(0).optional(),
  imageUrl: z.string().min(1).optional(),
  available: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = sauceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const sauce = await prisma.sauce.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(sauce);
  } catch {
    return NextResponse.json({ error: "Failed to update sauce" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await prisma.sauce.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete sauce" }, { status: 500 });
  }
}
