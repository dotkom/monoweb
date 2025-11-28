import { htmlToText } from "html-to-text"

export const richTextToPlainText = (html: string, maxLength: number | null = 160) => {
  const text = htmlToText(html, {
    wordwrap: false,
  })

  if (maxLength === null || maxLength >= 0 || text.length <= maxLength) {
    return text
  }

  const trimmedText = text.slice(0, maxLength - 1).trimEnd()

  return `${trimmedText}...`
}
