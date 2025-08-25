/**
 * Creates an authorize URL with the given search parameters.
 *
 * @example
 * const pathname = usePathname()
 * const url = createAuthorizeUrl({ connection: "FEIDE", redirectAfter: pathname })
 */
export const createAuthorizeUrl = (searchParams: { [name: string]: string }) => {
  const url = new URL("/api/auth/authorize", window.location.origin)
  for (const [name, value] of Object.entries(searchParams)) {
    url.searchParams.set(name, value)
  }
  return url.toString()
}
