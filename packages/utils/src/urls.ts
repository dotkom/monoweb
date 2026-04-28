import slugify from "slugify"

// Regular authentication flows
const AUTHORIZE_ENDPOINT = "/api/auth/authorize"
const LOGOUT_ENDPOINT = "/api/auth/logout"

// This endpoint is for verifying your identity, and returning the JWT without replacing your session.
// It is used by the "link identity" flow, where the user is already authenticated, but needs to verify their identity
// to link the two accounts' identities and merge the two accounts into one.
const LINK_IDENTITY_AUTHORIZE_ENDPOINT = "/api/auth/link-identity/authorize"

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
 * Creates a logout URL with the given search parameters.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createLogoutUrl({ redirectAfter: fullPathname })
 */
export const createLogoutUrl = (...parameters: ConstructorParameters<typeof URLSearchParams>) => {
  const searchParams = new URLSearchParams(...parameters).toString()
  if (!searchParams) {
    return LOGOUT_ENDPOINT
  }
  return `${LOGOUT_ENDPOINT}?${searchParams}`
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
 * Creates a logout URL with the given search parameters.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createAbsoluteLogoutUrl(window.location.origin, { redirectAfter: fullPathname })
 */
export const createAbsoluteLogoutUrl = (
  origin: string,
  ...parameters: ConstructorParameters<typeof URLSearchParams>
) => {
  const url = new URL(LOGOUT_ENDPOINT, origin)
  url.search = new URLSearchParams(...parameters).toString()
  return url.toString()
}

export const createEventSlug = (eventTitle: string): string => {
  return slugify(eventTitle)
}

export const createEventPageUrl = (eventId: string, eventTitle?: string): `/arrangementer/${string}/${string}` => {
  const slug = eventTitle ? createEventSlug(eventTitle) : "arrangement"

  return `/arrangementer/${slug}/${eventId}`
}

export const createAbsoluteEventPageUrl = (
  origin: string,
  eventId: string,
  eventTitle?: string
): `${string}/arrangementer/${string}/${string}` => {
  const slug = eventTitle ? createEventSlug(eventTitle) : "arrangement"

  return `${origin}/arrangementer/${slug}/${eventId}`
}

export const createCloudFrontUrl = (cloudFrontUrl: string, key: string): string => {
  return new URL(key, cloudFrontUrl).toString()
}

/**
 * Creates a link identity authorize URL with the given search parameters. This will not replace the user's session,
 * and will instead put a JWT in a HTTP-only cookie that can be used to verify the user's identity.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createLinkIdentityAuthorizeUrl({
 *   connection: "FEIDE", // or "Username-Password-Authentication"
 *   redirectAfter: `${fullPathname}/link`,
 * })
 */
export const createLinkIdentityAuthorizeUrl = (...parameters: ConstructorParameters<typeof URLSearchParams>) => {
  const searchParams = new URLSearchParams(...parameters).toString()
  if (!searchParams) {
    return LINK_IDENTITY_AUTHORIZE_ENDPOINT
  }
  return `${LINK_IDENTITY_AUTHORIZE_ENDPOINT}?${searchParams}`
}

/**
 * Creates an link identity authorize URL with the given search parameters. This will not replace the user's session,
 * and will instead put a JWT in a HTTP-only cookie that can be used to verify the user's identity.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createAbsoluteLinkIdentityAuthorizeUrl(window.location.origin, {
 *   connection: "FEIDE", // or "Username-Password-Authentication"
 *   redirectAfter: `${fullPathname}/link`,
 * })
 */
export const createAbsoluteLinkIdentityAuthorizeUrl = (
  origin: string,
  ...parameters: ConstructorParameters<typeof URLSearchParams>
) => {
  const url = new URL(LINK_IDENTITY_AUTHORIZE_ENDPOINT, origin)
  url.search = new URLSearchParams(...parameters).toString()
  return url.toString()
}
