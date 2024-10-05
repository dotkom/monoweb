import { type ServiceLayerOptions, createServiceLayer } from "@dotkomonline/core"
import type { inferAsyncReturnType } from "@trpc/server"

export type CreateContextOptions = {
  principal: string | null
} & ServiceLayerOptions

export const createContext = async ({ principal, ...opts }: CreateContextOptions) => {
  const services = await createServiceLayer(opts)
  return {
    ...services,
    principal,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
