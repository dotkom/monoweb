export const createAuthorizeUrl = (...params: { [name: string]: string }[]) => {
  const url = new URL("/api/auth/authorize", window.location.origin)
  for (const param of params) {
    for (const [name, value] of Object.entries(param)) {
      url.searchParams.set(name, value)
    }
  }
  return url.toString()
}
