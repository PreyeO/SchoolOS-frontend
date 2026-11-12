// The checkout providers SchoolOS takes money through (result-card purchases
// and SMS wallet top-ups). Mirrors payments.enums.PaymentGateway on the
// backend, where both are registered in payments/gateways/factory.py. The
// school picks one per checkout; nothing about the purchase differs after.
export type PaymentGateway = "paystack" | "flutterwave";

export const PAYMENT_GATEWAYS: { id: PaymentGateway; label: string }[] = [
  { id: "paystack", label: "Paystack" },
  { id: "flutterwave", label: "Flutterwave" },
];

export const DEFAULT_GATEWAY: PaymentGateway = "paystack";

export function isPaymentGateway(value: unknown): value is PaymentGateway {
  return PAYMENT_GATEWAYS.some((g) => g.id === value);
}

// For copy that names the provider. Unknown or missing (an old link, a
// hand-typed URL) reads as the generic phrase rather than guessing one.
export function gatewayLabel(id: string | null | undefined): string {
  return PAYMENT_GATEWAYS.find((g) => g.id === id)?.label ?? "the payment provider";
}

// The checkout reference on a return URL. Paystack appends `reference` (and
// `trxref`); Flutterwave appends `tx_ref`, with `status` and
// `transaction_id`. Both verify routes accept reference or tx_ref.
export function returnReference(params: Record<string, string>): string | null {
  return params.reference ?? params.tx_ref ?? params.trxref ?? null;
}
