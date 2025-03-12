"use client"

import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { createTRPCContext } from "@trpc/tanstack-react-query"

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
