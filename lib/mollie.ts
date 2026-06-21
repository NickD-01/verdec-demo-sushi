const MOLLIE_API = "https://api.mollie.com/v2";

function apiKey(): string {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error("MOLLIE_API_KEY ontbreekt");
  return key;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
}

export interface MolliePaymentRef {
  id: string;
  checkoutUrl: string;
}

/**
 * Maakt een Mollie-betaling aan en geeft de hosted checkout-URL terug.
 * Mollie toont daar Bancontact, Payconiq, KBC/CBC en kaarten.
 */
export async function createMolliePayment(
  input: CreatePaymentInput
): Promise<MolliePaymentRef> {
  const res = await fetch(`${MOLLIE_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "EUR", value: input.amount.toFixed(2) },
      description: input.description,
      redirectUrl: input.redirectUrl,
      webhookUrl: input.webhookUrl,
      metadata: { orderId: input.orderId },
    }),
  });

  if (!res.ok) {
    throw new Error(`Mollie payment aanmaken mislukt (${res.status})`);
  }

  const data = (await res.json()) as {
    id: string;
    _links: { checkout: { href: string } };
  };
  return { id: data.id, checkoutUrl: data._links.checkout.href };
}

export interface MolliePaymentStatus {
  id: string;
  status: string; // open | paid | failed | canceled | expired
  orderId: string | null;
  isPaid: boolean;
}

/**
 * Vraagt de échte status op bij Mollie. Dit is de beveiligde aanpak:
 * de webhook-body wordt nooit vertrouwd — de status komt altijd uit deze
 * geauthenticeerde API-call.
 */
export async function getMolliePayment(
  paymentId: string
): Promise<MolliePaymentStatus> {
  const res = await fetch(`${MOLLIE_API}/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!res.ok) {
    throw new Error(`Mollie status ophalen mislukt (${res.status})`);
  }
  const data = (await res.json()) as {
    id: string;
    status: string;
    metadata?: { orderId?: string };
  };
  return {
    id: data.id,
    status: data.status,
    orderId: data.metadata?.orderId ?? null,
    isPaid: data.status === "paid",
  };
}
