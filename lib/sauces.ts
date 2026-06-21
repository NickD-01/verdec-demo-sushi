/** Default when no DB price (legacy) */
export const SAUCE_EXTRA_PRICE = 0.5;

export type SauceKind = "SAUCE" | "SEASONING";

export type ExtraItem = {
  name: string;
  extraPrice: number;
  kind?: SauceKind;
};

export function parseOrderOptions(options: string | null | undefined): {
  sauces: string[];
  seasonings: string[];
} {
  if (!options) return { sauces: [], seasonings: [] };
  try {
    const parsed = JSON.parse(options) as {
      sauces?: string[];
      seasonings?: string[];
      salt?: string;
    };
    const seasonings = parsed.seasonings ?? [];
    if (!seasonings.length && parsed.salt === "with") seasonings.push("Met zout");
    if (!seasonings.length && parsed.salt === "without") seasonings.push("Zonder zout");
    return { sauces: parsed.sauces ?? [], seasonings };
  } catch {
    return { sauces: [], seasonings: [] };
  }
}

export function buildOrderOptions(
  sauces: string[],
  seasonings: string[] = []
): string | null {
  if (!sauces.length && !seasonings.length) return null;
  return JSON.stringify({ sauces, seasonings });
}

export function appendOptionsToDisplayName(
  baseName: string,
  sauces: string[],
  seasonings: string[] = []
): string {
  const parts = [...seasonings, ...sauces];
  if (!parts.length) return baseName;
  return `${baseName} (${parts.join(", ")})`;
}

export function calculateExtrasPrice(
  items: ExtraItem[],
  selectedNames: string[]
): number {
  const byName = new Map(items.map((i) => [i.name, i.extraPrice]));
  return selectedNames.reduce((sum, name) => sum + (byName.get(name) ?? 0), 0);
}

export function getExtrasPriceBreakdown(
  basePrice: number,
  catalog: ExtraItem[],
  sauceNames: string[],
  seasoningNames: string[]
) {
  const sauceExtra = calculateExtrasPrice(
    catalog.filter((c) => c.kind !== "SEASONING"),
    sauceNames
  );
  const seasoningExtra = calculateExtrasPrice(
    catalog.filter((c) => c.kind === "SEASONING"),
    seasoningNames
  );
  return {
    basePrice,
    sauceExtra,
    seasoningExtra,
    extrasTotal: sauceExtra + seasoningExtra,
    unitPrice: basePrice + sauceExtra + seasoningExtra,
    sauceCount: sauceNames.length,
    seasoningCount: seasoningNames.length,
  };
}

/** @deprecated use getExtrasPriceBreakdown */
export function getSaucePriceBreakdown(basePrice: number, sauceCount: number) {
  const sauceExtra = sauceCount * SAUCE_EXTRA_PRICE;
  return {
    basePrice,
    sauceExtra,
    unitPrice: basePrice + sauceExtra,
    sauceCount,
  };
}

export function calculateSauceExtraFromNames(_sauces: string[]): number {
  return _sauces.length * SAUCE_EXTRA_PRICE;
}
