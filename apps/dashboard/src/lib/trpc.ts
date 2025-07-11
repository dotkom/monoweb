"use client"

import type { AppRouter } from "@dotkomonline/rpc"
import { createTRPCContext } from "@trpc/tanstack-react-query"

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
