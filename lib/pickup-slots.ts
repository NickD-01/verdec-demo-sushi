import { prisma } from "@/lib/prisma";

export interface PickupSlot {
  value: string;
  label: string;
  available: boolean;
  spotsLeft: number;
  orderCount: number;
}

export interface PickupSettings {
  minLeadTimeMinutes: number;
  slotIntervalMinutes: number;
  maxOrdersPerSlot: number;
  openTime: string;
  closeTime: string;
}

function parseTimeOnDate(date: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m ?? 0, 0, 0);
  return d;
}

function roundUpToInterval(date: Date, intervalMinutes: number): Date {
  const ms = intervalMinutes * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

export function formatSlotLabel(slotDate: Date, spotsLeft: number, max: number): string {
  const time = slotDate.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = slotDate.toLocaleDateString("nl-BE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  if (spotsLeft <= 0) return `${date} ${time} — Volzet`;
  if (spotsLeft <= 3) return `${date} ${time} — nog ${spotsLeft} plaats${spotsLeft === 1 ? "" : "en"}`;
  return `${date} ${time}`;
}

export async function getAvailablePickupSlots(
  settings: PickupSettings
): Promise<PickupSlot[]> {
  const now = new Date();
  const todayOpen = parseTimeOnDate(now, settings.openTime);
  const todayClose = parseTimeOnDate(now, settings.closeTime);

  const earliest = roundUpToInterval(
    new Date(now.getTime() + settings.minLeadTimeMinutes * 60 * 1000),
    settings.slotIntervalMinutes
  );

  let slotStart = earliest < todayOpen ? todayOpen : earliest;
  if (slotStart >= todayClose) {
    return [];
  }

  const slots: PickupSlot[] = [];
  const intervalMs = settings.slotIntervalMinutes * 60 * 1000;

  while (slotStart < todayClose) {
    const slotKey = slotStart.toISOString();
    const orderCount = await prisma.order.count({
      where: {
        pickupSlot: slotKey,
        status: { not: "CANCELLED" },
      },
    });
    const spotsLeft = settings.maxOrdersPerSlot - orderCount;
    slots.push({
      value: slotKey,
      label: formatSlotLabel(slotStart, spotsLeft, settings.maxOrdersPerSlot),
      available: spotsLeft > 0,
      spotsLeft,
      orderCount,
    });
    slotStart = new Date(slotStart.getTime() + intervalMs);
  }

  return slots;
}

export async function validatePickupSlot(
  slotKey: string,
  settings: PickupSettings
): Promise<{ valid: boolean; label?: string; error?: string }> {
  const slotDate = new Date(slotKey);
  if (isNaN(slotDate.getTime())) {
    return { valid: false, error: "Ongeldige afhaaltijd" };
  }

  const now = new Date();
  const minTime = new Date(now.getTime() + settings.minLeadTimeMinutes * 60 * 1000);
  if (slotDate < minTime) {
    return {
      valid: false,
      error: `Kies een tijd van minstens ${settings.minLeadTimeMinutes} minuten vanaf nu`,
    };
  }

  const open = parseTimeOnDate(slotDate, settings.openTime);
  const close = parseTimeOnDate(slotDate, settings.closeTime);
  if (slotDate < open || slotDate >= close) {
    return { valid: false, error: "Gekozen tijd valt buiten de openingsuren" };
  }

  const count = await prisma.order.count({
    where: { pickupSlot: slotKey, status: { not: "CANCELLED" } },
  });

  if (count >= settings.maxOrdersPerSlot) {
    return { valid: false, error: "Dit tijdslot is volzet. Kies een ander moment." };
  }

  return {
    valid: true,
    label: formatSlotLabel(slotDate, settings.maxOrdersPerSlot - count, settings.maxOrdersPerSlot),
  };
}

export async function getPickupSettingsFromDb(): Promise<PickupSettings> {
  const s = await prisma.settings.findUnique({ where: { id: "default" } });
  return {
    minLeadTimeMinutes: s?.minLeadTimeMinutes ?? 30,
    slotIntervalMinutes: s?.slotIntervalMinutes ?? 15,
    maxOrdersPerSlot: s?.maxOrdersPerSlot ?? 8,
    openTime: s?.openTime ?? "11:00",
    closeTime: s?.closeTime ?? "22:00",
  };
}
