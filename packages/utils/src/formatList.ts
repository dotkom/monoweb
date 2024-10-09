const DEFAULT_LOCALE = "nb-NO"
const DEFAULT_GIVE = 1
const MIN_LENGTH = 1
const MIN_GIVE = 0

const supportedLocales = {
  "nb-NO": {
    andMore: (n: number) => `og ${n} til`,
    and: "og",
  },
  "en-US": {
    andMore: (n: number) => `and ${n} more`,
    and: "and",
  },
} satisfies Record<string, { andMore: (n: number) => string; and: string }>

type SupportedLocales = keyof typeof supportedLocales

export const formatList = (
  list: Array<unknown>,
  options: { give?: number; length: number; locale?: SupportedLocales }
): string => {
  const locale = options.locale ?? DEFAULT_LOCALE
  const length = Math.max(options.length, MIN_LENGTH)
  const give = Math.max(options.give ?? DEFAULT_GIVE, MIN_GIVE)
  const length_ = list.length - length

  const andMore = supportedLocales[locale].andMore(length_)
  const and = supportedLocales[locale].and

  const clonedList = structuredClone(list)

  if (clonedList.length === 0 || clonedList.length === 1) {
    return clonedList.join("")
  }

  const comma = length_ > 2 ? ", " : " "

  if (give < length_) {
    clonedList.splice(length)
    clonedList.push(andMore)

    return clonedList.join(comma)
  }

  const lastElement = clonedList.pop()

  return `${clonedList.join(", ")}${comma} ${and} ${lastElement}`
}
