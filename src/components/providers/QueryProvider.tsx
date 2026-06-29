"use client";
// TanStack Query provider. Wraps the app so all client components can use useQuery / useMutation.
// TODO (Phase 2): configure devtools and default query options.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
