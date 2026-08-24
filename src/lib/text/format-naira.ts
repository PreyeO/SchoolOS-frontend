// Money for display. Every amount in the fees API is an integer number of
// Naira — not kobo, not a decimal string — so there is no minor unit to divide
// out and no rounding to get wrong.
//
// Grouped with en-NG separators and no decimal places: a school's fees are
// whole Naira, and "₦50,000.00" reads as false precision on a fee sheet. The
// symbol is written literally rather than through Intl's currency style, which
// renders "NGN 50,000" in several runtimes instead of the symbol Nigerian users
// expect.
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}
