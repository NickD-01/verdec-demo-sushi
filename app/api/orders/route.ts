import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import {
  appendOptionsToDisplayName,
  buildOrderOptions,
  calculateExtrasPrice,
} from "@/lib/sauces";
import {
  catalogToExtraItems,
  getProductExtrasCatalog,
} from "@/lib/product-extras";
import { hasConflictingSeasonings } from "@/lib/seasoning-exclusive";
import {
  getPickupSettingsFromDb,
  validatePickupSlot,
} from "@/lib/pickup-slots";

type OrderLineInput = {
  productId: string;
  quantity: number;
  sauces?: string[];
  seasonings?: string[];
  unitPrice?: number;
};

async function resolveLinePrice(
  productId: string,
  sauces: string[] = [],
  seasonings: string[] = [],
  clientUnitPrice?: number
): Promise<
  | { unitPrice: number; name: string; options: string | null; unavailable?: false }
  | { unavailable: true; productName: string }
  | null
> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) return null;
  if (!product.available) {
    return { unavailable: true, productName: product.name };
  }

  const extrasCatalog = await getProductExtrasCatalog(productId);
  const catalog = catalogToExtraItems(extrasCatalog);

  const allowedSauces = extrasCatalog.sauces.map((s) => s.name);
  const allowedSeasonings = extrasCatalog.seasonings.map((s) => s.name);

  if (!sauces.every((n) => allowedSauces.includes(n))) return null;
  if (!seasonings.every((n) => allowedSeasonings.includes(n))) return null;
  if (hasConflictingSeasonings(extrasCatalog.seasonings, seasonings)) return null;

  const extrasTotal =
    calculateExtrasPrice(catalog, sauces) +
    calculateExtrasPrice(catalog, seasonings);
  const unitPrice = product.price + extrasTotal;
  const displayName = appendOptionsToDisplayName(
    product.name,
    sauces,
    seasonings
  );

  if (clientUnitPrice !== undefined && Math.abs(clientUnitPrice - unitPrice) > 0.02) {
    return null;
  }

  return {
    unitPrice,
    name: displayName,
    options: buildOrderOptions(sauces, seasonings),
  };
}

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(request, "order-create", 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Te veel bestellingen na elkaar. Probeer zo dadelijk opnieuw." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const { customer, items } = body as {
      customer: unknown;
      items: OrderLineInput[];
    };

    const parsedCustomer = checkoutSchema.safeParse(customer);
    if (!parsedCustomer.success) {
      return NextResponse.json(
        { error: parsedCustomer.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const pickupSettings = await getPickupSettingsFromDb();
    const slotCheck = await validatePickupSlot(
      parsedCustomer.data.pickupSlot,
      pickupSettings
    );
    if (!slotCheck.valid) {
      return NextResponse.json({ error: slotCheck.error }, { status: 400 });
    }

    let total = 0;
    const orderItems: {
      productId: string;
      quantity: number;
      price: number;
      name: string;
      options: string | null;
    }[] = [];

    const unavailable: string[] = [];

    for (const item of items) {
      const resolved = await resolveLinePrice(
        item.productId,
        item.sauces ?? [],
        item.seasonings ?? [],
        item.unitPrice
      );
      if (!resolved) {
        return NextResponse.json(
          { error: "Invalid cart item or extra selection" },
          { status: 400 }
        );
      }
      if ("unavailable" in resolved && resolved.unavailable) {
        unavailable.push(resolved.productName);
        continue;
      }
      const line = resolved as {
        unitPrice: number;
        name: string;
        options: string | null;
      };
      total += line.unitPrice * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: line.unitPrice,
        name: line.name,
        options: line.options,
      });
    }

    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: `Niet meer beschikbaar: ${unavailable.join(", ")}. Verwijder uit je winkelwagen en probeer opnieuw.`,
          unavailable,
        },
        { status: 400 }
      );
    }

    if (!orderItems.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: parsedCustomer.data.customerName,
        customerPhone: parsedCustomer.data.customerPhone,
        pickupTime:
          slotCheck.label ??
          parsedCustomer.data.pickupTime ??
          parsedCustomer.data.pickupSlot,
        pickupSlot: parsedCustomer.data.pickupSlot,
        notes: parsedCustomer.data.notes || null,
        total,
        paymentMethod: parsedCustomer.data.paymentMethod,
        paymentStatus: "UNPAID",
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
