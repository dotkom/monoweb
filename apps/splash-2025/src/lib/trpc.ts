import type { AppRouter } from "@dotkomonline/gateway-trpc";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";

// https://trpc.io/docs/client/tanstack-react-query/setup
export const queryClient = new QueryClient();
const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "http://localhost:4444/api/trpc",
			transformer: SuperJSON,
		}),
	],
});

export const trpc: ReturnType<typeof createTRPCOptionsProxy<AppRouter>> =
	createTRPCOptionsProxy<AppRouter>({
		client: trpcClient,
		queryClient,
	});
