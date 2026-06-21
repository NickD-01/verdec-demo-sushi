export type PaymentMethod = "CASH" | "ONLINE";
export type PaymentStatus = "UNPAID" | "PAID";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash bij afhaling",
  ONLINE: "Online (Bancontact / Payconiq / kaart)",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Niet betaald",
  PAID: "Betaald",
};

/**
 * Demo-modus: zonder echte Mollie-key wordt de online betaling gesimuleerd.
 * Zet MOLLIE_API_KEY in .env om de echte Mollie-checkout te activeren
 * (Bancontact, Payconiq, KBC/CBC, kaarten).
 */
export function isPaymentDemo(): boolean {
  return !process.env.MOLLIE_API_KEY;
}
