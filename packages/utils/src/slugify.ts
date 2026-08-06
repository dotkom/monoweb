import createSlug from "slugify"

export type SlugifyOptions = Exclude<Parameters<typeof createSlug>[1], string | undefined>

export function slugify(text: string, options: SlugifyOptions = {}): string {
  // https://www.npmjs.com/package/slugify
  return createSlug(text, {
    lower: true,
    strict: true,
    trim: true,
    ...options,
  })
}
