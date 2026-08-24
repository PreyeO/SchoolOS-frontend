import type { ManualPaymentMethod } from "../types";

// The four instruments a bursar can actually take money in.
//
// The backend's PaymentMethod enum has three more — card, ussd, wallet — but
// they are reserved slots for a future gateway integration. Offering them on a
// manual entry would let staff record a lie about how the money arrived, and
// there'd be no gateway reference behind it to reconcile against.
export const MANUAL_PAYMENT_METHODS: { value: ManualPaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "pos", label: "POS" },
  { value: "cheque", label: "Cheque" },
];

// Labels every method the API can return, not just the four above: a payment
// row rendered from history could carry a gateway method once that lands, and
// falling back to the raw enum value ("bank_transfer") in a table is worse than
// carrying four extra entries.
const ALL_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  pos: "POS",
  cheque: "Cheque",
  card: "Card",
  ussd: "USSD",
  wallet: "Wallet",
};

export function paymentMethodLabel(method: string): string {
  return ALL_METHOD_LABELS[method] ?? method;
}
