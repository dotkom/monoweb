"use client"

import type { AppRouter } from "@dotkomonline/grades-backend"
import { createTRPCContext } from "@trpc/tanstack-react-query"

// React query trpc
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
