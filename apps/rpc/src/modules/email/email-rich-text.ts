import DOMPurify from "isomorphic-dompurify"
import mustache from "mustache"

const elementStyles: Record<string, string> = {
  a: "color: inherit; text-decoration: underline;",
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
  pre: "margin: 0 0 12px; white-space: pre-wrap; font-family: monospace;",
  code: "font-family: monospace;",
  hr: "margin: 16px 0; border: 0; border-top: 1px solid #9ca3af;",
  img: "display: block; max-width: 100%; height: auto; border: 0;",
  table: "width: 100%; margin: 0 0 12px; table-layout: fixed; border-collapse: collapse;",
  thead: "text-align: left;",
  tbody: "text-align: left;",
  tr: "vertical-align: top;",
  td: "padding: 8px; border: 1px solid #9ca3af;",
  th: "padding: 8px; border: 1px solid #9ca3af; font-weight: 600;",
}

export function renderEmailRichText(content: string): string {
  if (!/<\/?[a-z][^>]*>/i.test(content)) {
    return mustache.escape(content).replace(/\r\n|\r|\n/g, "<br />")
  }

  const fragment = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [...Object.keys(elementStyles), "strong", "b", "em", "i", "u", "s", "strike", "br", "sub", "sup"],
    ALLOWED_ATTR: ["href", "title", "start", "src", "alt", "colspan", "rowspan"],
    ADD_URI_SAFE_ATTR: ["start", "colspan", "rowspan"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  })

  for (const element of fragment.querySelectorAll("*")) {
    const tagName = element.tagName.toLowerCase()

    if (tagName === "img" && !/^https?:\/\//i.test(element.getAttribute("src") ?? "")) {
      element.remove()
      continue
    }

    const style = elementStyles[tagName]

    if (style) {
      element.setAttribute("style", style)
    }
  }

  const container = fragment.ownerDocument.createElement("div")
  container.appendChild(fragment)

  if (container.lastElementChild) {
    const lastElement = container.lastElementChild
    lastElement.setAttribute("style", `${lastElement.getAttribute("style") ?? ""} margin-bottom: 0;`)
  }

  return container.innerHTML
}
