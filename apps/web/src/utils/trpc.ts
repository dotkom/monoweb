// utils/trpc.ts
import { createTRPCReact } from "@trpc/react-query"
<<<<<<< HEAD

import { type AppRouter } from "../../../ow-api/src/trpc"

=======
import type { AppRouter } from "../../../ow-api/src/trpc"
>>>>>>> 8489c56 (test out oidc login)
export const trpc = createTRPCReact<AppRouter>()
