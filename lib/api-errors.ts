const FIELD_LABELS: Record<string, string> = {
  name: "Naam",
  description: "Beschrijving",
  price: "Prijs",
  imageUrl: "Afbeelding",
  categoryId: "Categorie",
  available: "Beschikbaar",
  popular: "Populair",
  allowsSauceCustomization: "Sauzen",
  sauceIds: "Sauzen",
  restaurantName: "Naam restaurant",
  phone: "Telefoon",
  address: "Adres",
  openingHours: "Openingsuren",
};

export function formatZodFieldErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined
): string {
  if (!fieldErrors) return "";

  return Object.entries(fieldErrors)
    .flatMap(([field, messages]) =>
      (messages ?? []).map((msg) => {
        const label = FIELD_LABELS[field] ?? field;
        return `${label}: ${msg}`;
      })
    )
    .join(" · ");
}

export async function getApiErrorMessage(
  res: Response,
  fallback = "Opslaan mislukt"
): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
    if (data.error && typeof data.error === "object") {
      const formatted = formatZodFieldErrors(
        data.error as Record<string, string[] | undefined>
      );
      if (formatted) return formatted;
    }
  } catch {
    // ignore JSON parse errors
  }
  return fallback;
}
