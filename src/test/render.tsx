import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Renders with a fresh QueryClient, so no cache leaks between tests. Retries
// are off: a test that expects an error should see it on the first response.
//
// Through `wrapper`, not by wrapping `ui` here, so `rerender(...)` keeps the
// provider too.
export function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const user = userEvent.setup();
  const result = render(ui, {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  return { ...result, client, user };
}
