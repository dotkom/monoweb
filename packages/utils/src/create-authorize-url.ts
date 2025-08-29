const AUTHORIZE_ENDPOINT = "/api/auth/authorize"
const UNAUTHORIZE_ENDPOINT = "/api/auth/logout"

/**
 * Creates an authorize URL with the given search parameters.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createAuthorizeUrl({ connection: "FEIDE", redirectAfter: fullPathname })
 */
export const createAuthorizeUrl = (...parameters: ConstructorParameters<typeof URLSearchParams>) => {
  const searchParams = new URLSearchParams(...parameters).toString()
  if (!searchParams) {
    return AUTHORIZE_ENDPOINT
  }
  return `${AUTHORIZE_ENDPOINT}?${searchParams}`
}

/**
 * Creates an unauthorize (logout) URL with the given search parameters.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createUnauthorizeUrl({ redirectAfter: fullPathname })
 */
export const createUnauthorizeUrl = (...parameters: ConstructorParameters<typeof URLSearchParams>) => {
  const searchParams = new URLSearchParams(...parameters).toString()
  if (!searchParams) {
    return UNAUTHORIZE_ENDPOINT
  }
  return `${UNAUTHORIZE_ENDPOINT}?${searchParams}`
}

/**
 * Creates an authorize URL with the given search parameters.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createAbsoluteAuthorizeUrl(window.location.origin, { connection: "FEIDE", redirectAfter: fullPathname })
 */
export const createAbsoluteAuthorizeUrl = (
  origin: string,
  ...parameters: ConstructorParameters<typeof URLSearchParams>
) => {
  const url = new URL(AUTHORIZE_ENDPOINT, origin)
  url.search = new URLSearchParams(...parameters).toString()
  return url.toString()
}

/**
 * Creates an authorize URL with the given search parameters.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createAbsoluteUnauthorizeUrl(window.location.origin, { redirectAfter: fullPathname })
 */
export const createAbsoluteUnauthorizeUrl = (
  origin: string,
  ...parameters: ConstructorParameters<typeof URLSearchParams>
) => {
  const url = new URL(UNAUTHORIZE_ENDPOINT, origin)
  url.search = new URLSearchParams(...parameters).toString()
  return url.toString()
}
