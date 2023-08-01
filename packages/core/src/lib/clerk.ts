import Clerk from "@clerk/clerk-sdk-node/esm/instance"
import { ClerkClient } from "@clerk/clerk-sdk-node/dist/types/types"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      CLERK_SECRET_KEY: string
    }
  }
}

export const defaultClerkClient: ClerkClient = Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
})
