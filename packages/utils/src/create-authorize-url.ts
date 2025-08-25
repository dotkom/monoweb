/**
 * Creates an authorize URL with the given search parameters.
 *
 * @example
 * const pathname = usePathname()
 * const url = createAuthorizeUrl({ connection: "FEIDE", redirectAfter: pathname })
 */
export const createAuthorizeUrl = (...parameters: ConstructorParameters<typeof URLSearchParams>) => {
  const url = new URL("/api/auth/authorize", window.location.origin)
  url.search = new URLSearchParams(...parameters).toString()
  return url.toString()
}
