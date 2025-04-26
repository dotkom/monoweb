import _slugify from "slugify"

// Slug that is made to be as readable in URL as possible
// It's stupid that it converts æ to ae, ø to oe, and å to aa but its whatever
export function slugify(text: string) {
  return _slugify(text, {
    replacement: "_", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: false, // strip special characters except replacement, defaults to `false`
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  })
}
