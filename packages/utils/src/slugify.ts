import slugify_ from "slugify"

/**
 * Converts a string to a URL-friendly slug.
 *
 * @param text - The string to convert to a slug.
 * @returns A URL-friendly slug version of the input string.
 */
export function slugify(text: string) {
  return slugify_(text, {
    lower: true,
    strict: true,
  })
}
