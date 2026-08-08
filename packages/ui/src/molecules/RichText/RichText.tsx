"use client"

import DOMPurify from "isomorphic-dompurify"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"
import { ReadMore } from "../ReadMore/ReadMore"

interface RichTextProps {
  content: string
  className?: string
  maxLines?: number
  readMoreText?: string
  readLessText?: string
  hideToggleButton?: boolean
  toggleButtonClassName?: string
}

export function RichText({
  content,
  className,
  maxLines,
  readMoreText = "Vis mer",
  readLessText = "Vis mindre",
  hideToggleButton = false,
  toggleButtonClassName,
}: RichTextProps) {
  const sanitizedHTML = wrapOverflowingElements(DOMPurify.sanitize(content))

  // Prose docs:
  // https://github.com/tailwindlabs/tailwindcss-typography
  const RichTextContent = (
    <Text
      element="div"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      className={cn(
        "prose text-base dark:prose-stone dark:prose-invert",
        "prose-a:text-blue-600 dark:prose-a:text-blue-300",
        "[&_ul>li::marker]:text-black dark:[&_ul>li::marker]:text-white",
        "[&_ol>li::marker]:text-black dark:[&_ol>li::marker]:text-white",
        "prose-pre:p-2.5 prose-code:rounded-md prose-pre:border prose-pre:border-gray-200 prose-pre:bg-gray-100 prose-pre:dark:bg-stone-800 prose-pre:dark:border-stone-700",
        "prose-code:text-black prose-code:dark:text-white",
        "[&_.table-wrapper]:overflow-x-auto",
        "[&_.image-wrapper]:overflow-x-auto",
        "prose-table:prose-sm",
        "prose-img:rounded-md prose-img:max-w-none",
        "prose-th:p-2.5 prose-th:align-top prose-th:h-fit prose-th:border prose-th:border-(--tw-prose-td-borders) ",
        "prose-td:p-2.5 prose-td:align-top prose-td:h-fit prose-td:border prose-td:border-(--tw-prose-td-borders)",
        "[&_li>p]:my-0 [&_th>p]:my-0 [&_td>p]:my-0",
        "[&_p:empty]:m-0 [&_p:empty]:before:content-[''] [&_p:empty]:before:block [&_p:empty]:before:h-3",
        className
      )}
    />
  )

  if (!maxLines) {
    return RichTextContent
  }

  return (
    <ReadMore
      maxLines={maxLines}
      readMoreText={readMoreText}
      readLessText={readLessText}
      hideToggleButton={hideToggleButton}
      toggleButtonClassName={toggleButtonClassName}
    >
      {RichTextContent}
    </ReadMore>
  )
}

/**
 * This exists so the wrapper can be assigned overflow-x-auto whilst the
 * element retains its original width
 */
const wrapOverflowingElements = (sanitizedHtml: string) => {
  return (
    sanitizedHtml
      // Wrap tables
      .replace(/<table/g, '<div class="table-wrapper"><table')
      .replace(/<\/table>/g, "</table></div>")
      // Wrap images
      // The regex is hard to read but it matches <img />, <img></img> and
      // <img> (no closing tag, which is what Tiptap generates)
      .replace(/<img\b([^>]*?)(?:\/>|>(?:\s*<\/img>)?)/g, '<div class="image-wrapper"><img$1 /></div>')
  )
}
