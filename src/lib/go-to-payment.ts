// Leaves the app for Paystack's checkout page. A function of its own so tests
// can stub it: jsdom's window.location can't be spied on.
export function goToPayment(url: string): void {
  window.location.assign(url);
}
