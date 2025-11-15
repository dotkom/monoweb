export function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://")
}
