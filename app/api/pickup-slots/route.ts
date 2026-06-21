import { NextResponse } from "next/server";
import { getAvailablePickupSlots, getPickupSettingsFromDb } from "@/lib/pickup-slots";

export async function GET() {
  try {
    const settings = await getPickupSettingsFromDb();
    const slots = await getAvailablePickupSlots(settings);
    return NextResponse.json({
      slots,
      settings: {
        minLeadTimeMinutes: settings.minLeadTimeMinutes,
        maxOrdersPerSlot: settings.maxOrdersPerSlot,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load pickup times" }, { status: 500 });
  }
}
