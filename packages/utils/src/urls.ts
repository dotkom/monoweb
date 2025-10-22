import slugify from "slugify"

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
 * Creates a logout URL with the given search parameters.
 *
 * @example
 * const fullPathname = useFullPathname()
 * const url = createLogoutUrl({ redirectAfter: fullPathname })
 */
export const createLogoutUrl = (...parameters: ConstructorParameters<typeof URLSearchParams>) => {
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
  const url = new URL(UNAUTHORIZE_ENDPOINT, origin)
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
