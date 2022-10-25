// utils/trpc.ts
import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../../ow-api/src/trpc"
export const trpc = createTRPCReact<AppRouter>()
