import { type ServiceLayerOptions, createServiceLayer } from "@dotkomonline/core"
import { type AuthorizationPrincipal, AuthorizationService } from "./authorization"

export type CreateContextOptions = {
  principal: AuthorizationPrincipal | null
} & ServiceLayerOptions

export const createContext = async ({ principal, ...opts }: CreateContextOptions) => {
  const services = await createServiceLayer(opts)
  const authorizationService = await AuthorizationService.create()
  return {
    ...services,
    principal,
    authorizationService,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
