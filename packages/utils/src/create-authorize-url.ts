const AUTHORIZE_ENDPOINT = "/api/auth/authorize"

/**
 * Creates an authorize URL with the given search parameters.
 *
 * @example
 * const pathname = usePathname()
 * const url = createAuthorizeUrl({ connection: "FEIDE", redirectAfter: pathname })
 */
export const createAuthorizeUrl = (...parameters: ConstructorParameters<typeof URLSearchParams>) => {
  const searchParams = new URLSearchParams(...parameters).toString()
  if (!searchParams) {
    return AUTHORIZE_ENDPOINT
  }
  return `${AUTHORIZE_ENDPOINT}?${searchParams}`
}

/**
 * Creates an authorize URL with the given search parameters.
 *
 * @example
 * const pathname = usePathname()
 * const url = createAbsoluteAuthorizeUrl(window.location.origin, { connection: "FEIDE", redirectAfter: pathname })
 */
export const createAbsoluteAuthorizeUrl = (
  origin: string,
  ...parameters: ConstructorParameters<typeof URLSearchParams>
) => {
  const url = new URL(AUTHORIZE_ENDPOINT, origin)
  url.search = new URLSearchParams(...parameters).toString()
  return url.toString()
}
