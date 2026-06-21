import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Naam moet minstens 2 tekens zijn"),
  customerPhone: z
    .string()
    .min(8, "Voer een geldig telefoonnummer in")
    .regex(/^[+\d\s()-]+$/, "Ongeldig telefoonnummer"),
  pickupSlot: z.string().min(1, "Selecteer een afhaaltijd"),
  pickupTime: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["CASH", "ONLINE"]).default("CASH"),
});

export const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minstens 6 tekens zijn"),
});

const imageUrlSchema = z.union([
  z.string().url("moet een geldige URL zijn (bijv. https://...)"),
  z.string().regex(/^\//, "moet een pad zijn dat begint met /"),
]);

export const productSchema = z.object({
  name: z.string().min(2, "minstens 2 tekens vereist"),
  description: z.string().optional().default(""),
  price: z.coerce.number().positive("moet groter zijn dan 0"),
  imageUrl: imageUrlSchema,
  categoryId: z.string().min(1, "selecteer een categorie"),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  allowsSauceCustomization: z.boolean().default(false),
  sauceIds: z.array(z.string()).optional(),
});

export const settingsSchema = z.object({
  restaurantName: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().min(5),
  openingHours: z.string().min(3),
  tagline: z.string().min(3).optional(),
  minLeadTimeMinutes: z.coerce.number().min(15).max(180),
  slotIntervalMinutes: z.coerce.number().min(5).max(60),
  maxOrdersPerSlot: z.coerce.number().min(1).max(100),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
