// Leaves the app for the gateway's checkout page, Paystack or Flutterwave (result-card purchases, wallet
// top-ups). A function of its own so tests
// can stub it: jsdom's window.location can't be spied on.
export function goToPayment(url: string): void {
  window.location.assign(url);
}
