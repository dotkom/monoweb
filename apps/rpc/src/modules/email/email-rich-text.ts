import DOMPurify from "isomorphic-dompurify"
import mustache from "mustache"

const elementStyles: Record<string, string> = {
  a: "color: #1d4ed8; text-decoration: underline;",
  p: "margin: 0 0 12px;",
  div: "margin: 0;",
  h1: "margin: 0 0 12px; font-size: 24px; line-height: 32px; font-weight: 600;",
  h2: "margin: 0 0 12px; font-size: 22px; line-height: 30px; font-weight: 600;",
  h3: "margin: 0 0 12px; font-size: 20px; line-height: 28px; font-weight: 600;",
  h4: "margin: 0 0 12px; font-size: 18px; line-height: 26px; font-weight: 600;",
  h5: "margin: 0 0 12px; font-size: 16px; line-height: 25px; font-weight: 600;",
  h6: "margin: 0 0 12px; font-size: 16px; line-height: 25px; font-weight: 600;",
  ul: "margin: 0 0 12px; padding-left: 24px;",
  ol: "margin: 0 0 12px; padding-left: 24px;",
  li: "margin: 0 0 4px;",
  blockquote: "margin: 0 0 12px; padding-left: 16px; border-left: 3px solid #9ca3af;",
  code: "font-family: monospace;",
}

// Accept these only to turn existing content into readable text before sending.
const fallbackTags = ["pre", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption"]

export function renderEmailRichText(content: string): string {
  const startsWithRichTextBlock = /^\s*<(?:p|div|h[1-6]|ul|ol|li|blockquote|pre|table|hr|br)(?:\s[^>]*)?\/?>/i.test(
    content
  )

  if (startsWithRichTextBlock === false) {
    return mustache.escape(content).replace(/\r\n|\r|\n/g, "<br />")
  }

  const fragment = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      ...Object.keys(elementStyles),
      ...fallbackTags,
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "br",
      "sub",
      "sup",
    ],
    ALLOWED_ATTR: ["href", "title", "start"],
    ADD_URI_SAFE_ATTR: ["start"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  })

  for (const element of fragment.querySelectorAll(fallbackTags.join(","))) {
    const replacement = fragment.ownerDocument.createElement("div")

    if (element.tagName.toLowerCase() === "pre") {
      const lines = (element.textContent ?? "").split(/\r\n|\r|\n/)

      for (const [index, line] of lines.entries()) {
        if (index > 0) {
          replacement.appendChild(fragment.ownerDocument.createElement("br"))
        }

        replacement.appendChild(fragment.ownerDocument.createTextNode(line))
      }
    } else {
      replacement.append(...element.childNodes)
    }

    element.replaceWith(replacement)
  }

  for (const element of fragment.querySelectorAll("*")) {
    const tagName = element.tagName.toLowerCase()
    const style = elementStyles[tagName]

    if (tagName === "a") {
      element.setAttribute("class", "rich-text-link")
    }

    if (style !== undefined) {
      element.setAttribute("style", style)
    }
  }

  const container = fragment.ownerDocument.createElement("div")
  container.appendChild(fragment)

  const lastElement = container.lastElementChild

  if (lastElement !== null) {
    lastElement.setAttribute("style", `${lastElement.getAttribute("style") ?? ""} margin-bottom: 0;`)
  }

  return container.innerHTML
}
