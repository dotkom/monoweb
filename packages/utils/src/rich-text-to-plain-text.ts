export const richTextToPlainText = (html: string, maxLength = 160) => {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (text.length <= maxLength) {
    return text
  }

  const trimmedText = text.slice(0, maxLength - 1).trimEnd()

  return `${trimmedText}...`
}
