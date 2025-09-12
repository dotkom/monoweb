import createSlug from "slugify"

export function slugify(text: string, replacement = "-") {
  // https://www.npmjs.com/package/slugify
  return createSlug(text, {
    lower: true,
    strict: true,
    trim: true,
    replacement,
  })
}
