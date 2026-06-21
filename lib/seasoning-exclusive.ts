/**
 * Kruiden in dezelfde groep sluiten elkaar uit. Elk "Met X" / "Zonder X"-paar
 * (bv. met zout/zonder zout, met satékruiden/zonder satékruiden) vormt
 * automatisch een groep op basis van X.
 */
export function getMetZonderPolarity(name: string): "met" | "zonder" | null {
  const n = name.toLowerCase().trim();
  if (/^met\s+/.test(n)) return "met";
  if (/^zonder\s+/.test(n)) return "zonder";
  return null;
}

export function getSeasoningExclusiveGroup(item: {
  slug: string;
  name: string;
}): string | null {
  const name = item.name.toLowerCase().trim();
  const match = name.match(/^(?:met|zonder)\s+(.+)$/);
  if (match) return match[1]; // groep = het kernwoord, bv. "zout"

  const slug = item.slug.toLowerCase();
  if (slug === "met-zout" || slug === "zonder-zout") return "zout";

  return null;
}

type SeasoningItem = { id: string; slug: string; name: string };

export type SeasoningControl =
  | { kind: "toggle"; group: string; label: string; metId: string; zonderId: string }
  | { kind: "single"; item: SeasoningItem };

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Zet de kruidenlijst om in UI-controls: een binair "Met X/Zonder X"-paar wordt
 * één checkbox (toggle), de rest blijft losse checkboxes. Volgorde blijft behouden.
 */
export function buildSeasoningControls(items: SeasoningItem[]): SeasoningControl[] {
  const controls: SeasoningControl[] = [];
  const seenGroups = new Set<string>();

  for (const item of items) {
    const group = getSeasoningExclusiveGroup(item);
    const polarity = getMetZonderPolarity(item.name);

    if (group && polarity) {
      if (seenGroups.has(group)) continue;
      const members = items.filter((s) => getSeasoningExclusiveGroup(s) === group);
      const metItem = members.find((s) => getMetZonderPolarity(s.name) === "met");
      const zonderItem = members.find((s) => getMetZonderPolarity(s.name) === "zonder");

      if (metItem && zonderItem) {
        seenGroups.add(group);
        controls.push({
          kind: "toggle",
          group,
          label: capitalize(group),
          metId: metItem.id,
          zonderId: zonderItem.id,
        });
        continue;
      }
    }

    controls.push({ kind: "single", item });
  }

  return controls;
}

/** Standaardselectie: elk binair paar staat standaard op "Met X" (bv. friet mét zout). */
export function defaultSeasoningSelection(items: SeasoningItem[]): string[] {
  return buildSeasoningControls(items)
    .filter((c): c is Extract<SeasoningControl, { kind: "toggle" }> => c.kind === "toggle")
    .map((c) => c.metId);
}

/** Past een binaire toggle toe: aangevinkt → Met X, uitgevinkt → Zonder X. */
export function setBinarySeasoning(
  selectedIds: string[],
  metId: string,
  zonderId: string,
  checked: boolean
): string[] {
  const without = selectedIds.filter((id) => id !== metId && id !== zonderId);
  return [...without, checked ? metId : zonderId];
}

export function toggleSeasoningSelection(
  items: { id: string; slug: string; name: string }[],
  selectedIds: string[],
  toggledId: string
): string[] {
  const item = items.find((s) => s.id === toggledId);
  if (!item) return selectedIds;

  const group = getSeasoningExclusiveGroup(item);
  const isSelected = selectedIds.includes(toggledId);

  if (group) {
    const groupIds = items
      .filter((s) => getSeasoningExclusiveGroup(s) === group)
      .map((s) => s.id);
    if (isSelected) {
      return selectedIds.filter((id) => id !== toggledId);
    }
    return [...selectedIds.filter((id) => !groupIds.includes(id)), toggledId];
  }

  if (isSelected) {
    return selectedIds.filter((id) => id !== toggledId);
  }
  return [...selectedIds, toggledId];
}

export function hasConflictingSeasonings(
  items: { slug: string; name: string }[],
  selectedNames: string[]
): boolean {
  const selected = items.filter((i) => selectedNames.includes(i.name));
  const groupCounts = new Map<string, number>();

  for (const item of selected) {
    const group = getSeasoningExclusiveGroup(item);
    if (!group) continue;
    groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1);
    if ((groupCounts.get(group) ?? 0) > 1) return true;
  }

  return false;
}
