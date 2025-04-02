import { type ServiceLayerOptions, createServiceLayer } from "@dotkomonline/core"

export type CreateContextOptions = {
  principal: string | null
} & ServiceLayerOptions

export const createContext = async ({ principal, ...opts }: CreateContextOptions) => {
  const services = createServiceLayer(opts)
  return {
    ...services,
    principal,
  }
}

export type Context = ReturnType<typeof createContext>
