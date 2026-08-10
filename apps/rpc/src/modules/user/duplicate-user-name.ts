import { slugify, type SlugifyOptions } from "@dotkomonline/utils"

const NAME_TOKEN_SLUGIFY_OPTIONS = {
  replacement: ".",
  strict: false,
  remove: /[^a-zA-Z0-9-\s]/g,
} as const satisfies SlugifyOptions

export function getNameTokens(name: string) {
  const slug = slugify(name, NAME_TOKEN_SLUGIFY_OPTIONS)

  return slug.split(/[.-]/).filter((token) => token.length > 0)
}

export function isOrderedSubsequence(shorterTokens: string[], longerTokens: string[]) {
  let searchFromIndex = 0

  for (const token of shorterTokens) {
    const foundIndex = longerTokens.indexOf(token, searchFromIndex)

    if (foundIndex === -1) {
      return false
    }

    searchFromIndex = foundIndex + 1
  }

  return true
}

/**
 * True when both names have at least two tokens and the shorter token list appears, in order, inside the longer one.
 *
 * @example
 * namesLookLikeSamePerson("One Two Three", "One Two Three") // true
 * namesLookLikeSamePerson("One Three", "One Two Three") // true
 * namesLookLikeSamePerson("One Two", "One Two Three") // true
 * namesLookLikeSamePerson("Two Three", "One Two Three") // true
 * namesLookLikeSamePerson("One Two", "One Three") // false
 * namesLookLikeSamePerson("One", "One Two") // false
 * namesLookLikeSamePerson("Two One", "One Two Three") // false
 *
 */
export function namesLookLikeSamePerson(leftName: string, rightName: string): boolean {
  const leftTokens = getNameTokens(leftName)
  const rightTokens = getNameTokens(rightName)

  if (leftTokens.length < 2 || rightTokens.length < 2) {
    return false
  }

  if (leftTokens.length <= rightTokens.length) {
    return isOrderedSubsequence(leftTokens, rightTokens)
  }

  return isOrderedSubsequence(rightTokens, leftTokens)
}
