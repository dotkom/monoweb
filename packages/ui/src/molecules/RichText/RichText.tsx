"use client"

import DOMPurify from "isomorphic-dompurify"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"
import { ReadMore } from "../ReadMore/ReadMore"
import { richTextClasses } from "./rich-text-classes"

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
      className={cn(richTextClasses, className)}
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
