import getSlug from "slugify"

/**
 * Converts a string to a URL-friendly slug.
 *
 * @param text - The string to convert to a slug.
 * @returns A URL-friendly slug version of the input string.
 */
export function slugify(text: string) {
  return getSlug(text, {
    lower: true,
    strict: true,
  })
}
